"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ADMIN_EMAIL, isAdmin, requireAdmin, requireUser } from "@/lib/access";

// Access checks live in @/lib/access — they read the user fresh from the
// database instead of trusting the (up to 2h stale) session cookie.

const idSchema = z.coerce.number().int().positive();
const nameSchema = z.string().trim().min(1, "Название не может быть пустым").max(200);
const roleSchema = z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(["STUDENT", "TEACHER", "ADMIN"]));

/** Everything the admin UI needs about a user — the password hash never leaves the server. */
const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatarUrl: true,
    subscriptionPlan: true,
    subscriptionExpiresAt: true,
    createdAt: true,
} as const;

function firstIssue(error: z.ZodError): string {
    return error.issues[0]?.message || "Некорректные данные";
}

// --- Faculties ---

export async function getFaculties() {
    await requireUser();
    return await prisma.faculty.findMany({
        orderBy: { name: "asc" },
    });
}

export async function addFaculty(name: string) {
    await requireAdmin();
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const res = await prisma.faculty.create({
        data: { name: parsed.data },
    });
    revalidatePath("/");
    return res;
}

export async function updateFaculty(id: number, name: string) {
    await requireAdmin();
    const parsed = z.object({ id: idSchema, name: nameSchema }).safeParse({ id, name });
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const res = await prisma.faculty.update({
        where: { id: parsed.data.id },
        data: { name: parsed.data.name },
    });
    revalidatePath("/");
    return res;
}

export async function deleteFaculty(id: number) {
    await requireAdmin();
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) throw new Error("Неверный идентификатор");

    const subjectCount = await prisma.subject.count({ where: { faculty_id: parsed.data } });
    if (subjectCount > 0) {
        throw new Error(`Нельзя удалить факультет: к нему привязано предметов — ${subjectCount}`);
    }

    await prisma.faculty.delete({
        where: { id: parsed.data },
    });
    revalidatePath("/");
}

// --- Subjects ---

export async function getSubjects() {
    await requireUser();
    return await prisma.subject.findMany({
        include: { faculty: true },
        orderBy: { name: "asc" },
    });
}

export async function addSubject(name: string, facultyId: number) {
    await requireAdmin();
    const parsed = z.object({ name: nameSchema, facultyId: idSchema }).safeParse({ name, facultyId });
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const res = await prisma.subject.create({
        data: {
            name: parsed.data.name,
            faculty_id: parsed.data.facultyId,
        },
    });
    revalidatePath("/");
    return res;
}

export async function updateSubject(id: number, name: string, facultyId: number) {
    await requireAdmin();
    const parsed = z
        .object({ id: idSchema, name: nameSchema, facultyId: idSchema })
        .safeParse({ id, name, facultyId });
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const res = await prisma.subject.update({
        where: { id: parsed.data.id },
        data: {
            name: parsed.data.name,
            faculty_id: parsed.data.facultyId,
        },
    });
    revalidatePath("/");
    return res;
}

export async function deleteSubject(id: number) {
    await requireAdmin();
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) throw new Error("Неверный идентификатор");

    const questionCount = await prisma.question.count({ where: { subject_id: parsed.data } });
    if (questionCount > 0) {
        throw new Error(`Нельзя удалить предмет: в нём вопросов — ${questionCount}`);
    }

    await prisma.subject.delete({
        where: { id: parsed.data },
    });
    revalidatePath("/");
}

export async function getSubjectById(id: number) {
    await requireUser();
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) return null;

    return await prisma.subject.findUnique({
        where: { id: parsed.data },
        include: { faculty: true },
    });
}

/** Admin-only: includes correct answers. Students go through @/app/actions/tests. */
export async function getQuestionsBySubject(subjectId: number) {
    await requireAdmin();
    const parsed = idSchema.safeParse(subjectId);
    if (!parsed.success) throw new Error("Неверный предмет");

    return await prisma.question.findMany({
        where: { subject_id: parsed.data },
        orderBy: { createdAt: "desc" },
    });
}

// --- Users ---

export async function getUsers() {
    await requireAdmin();
    return await prisma.user.findMany({
        select: USER_SELECT,
        orderBy: { createdAt: "desc" },
    });
}

export async function updateSubscription(
    userId: string,
    plan: "MONTHLY" | "YEARLY" | "FREE",
    expiresAt: string | null
) {
    try {
        await requireAdmin();

        const parsed = z
            .object({
                userId: z.string().min(1),
                plan: z.enum(["FREE", "MONTHLY", "YEARLY"]),
                expiresAt: z
                    .string()
                    .nullable()
                    .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Некорректная дата"),
            })
            .safeParse({ userId, plan, expiresAt });
        if (!parsed.success) throw new Error(firstIssue(parsed.error));

        await prisma.user.update({
            where: { id: parsed.data.userId },
            data: {
                subscriptionPlan: parsed.data.plan,
                subscriptionExpiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error("Update sub error:", e);
        return { success: false, error: e instanceof Error ? e.message : "Failed to update" };
    }
}

const newUserSchema = z.object({
    name: z.string().trim().min(1, "Введите имя").max(80),
    email: z.string().trim().toLowerCase().email("Некорректный email").max(254),
    password: z.string().min(8, "Пароль должен содержать минимум 8 символов").max(128),
    role: roleSchema,
});

export async function addUser(data: unknown) {
    await requireAdmin();

    const parsed = newUserSchema.safeParse(data);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));
    const { name, email, password, role } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const res = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
        select: USER_SELECT,
    });
    revalidatePath("/admin");
    return res;
}

const updateUserSchema = newUserSchema.extend({
    // Empty means "keep the current password"
    password: z.string().max(128).optional().or(z.literal("")),
});

export async function updateUser(id: string, data: unknown) {
    await requireAdmin();

    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));
    const { name, email, password, role } = parsed.data;

    if (password && password.length < 8) {
        throw new Error("Пароль должен содержать минимум 8 символов");
    }

    const res = await prisma.user.update({
        where: { id },
        data: {
            name,
            email,
            role,
            ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        },
        select: USER_SELECT,
    });
    revalidatePath("/admin");
    return res;
}

/** Loads a user, refusing to touch the bootstrap admin or the caller's own account. */
async function loadModifiableUser(id: string, currentUserId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Пользователь не найден");
    if (user.email?.toLowerCase() === ADMIN_EMAIL) {
        throw new Error("Невозможно изменить главного администратора");
    }
    if (user.id === currentUserId) {
        throw new Error("Нельзя выполнить это действие над собственной учётной записью");
    }
    return user;
}

export async function deleteUser(id: string) {
    const admin = await requireAdmin();
    await loadModifiableUser(id, admin.id);

    // Results reference the user, so they go first.
    await prisma.testResult.deleteMany({ where: { user_id: id } });
    await prisma.user.delete({
        where: { id },
    });
    revalidatePath("/admin");
}

const DEACTIVATED_PREFIX = "[ДЕАКТИВИРОВАН]";

// Deactivate user - scramble password so they can't log in
export async function deactivateUser(id: string) {
    const admin = await requireAdmin();
    const user = await loadModifiableUser(id, admin.id);

    // Set password to a random hash that can't be matched
    const blockedHash = await bcrypt.hash(`DEACTIVATED_${id}_${Math.random()}`, 10);
    const baseName = (user.name || "").replace(`${DEACTIVATED_PREFIX} `, "").trim();

    await prisma.user.update({
        where: { id },
        data: {
            password: blockedHash,
            name: baseName ? `${DEACTIVATED_PREFIX} ${baseName}` : DEACTIVATED_PREFIX,
        },
    });
    revalidatePath("/admin");
}

// Activate user - set a new temporary password
export async function activateUser(id: string, newPassword: string) {
    const admin = await requireAdmin();
    const user = await loadModifiableUser(id, admin.id);

    const parsed = z.string().min(8, "Пароль должен содержать минимум 8 символов").max(128).safeParse(newPassword);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));

    const hashedPassword = await bcrypt.hash(parsed.data, 10);
    const restoredName = (user.name || "").replace(`${DEACTIVATED_PREFIX} `, "").replace(DEACTIVATED_PREFIX, "").trim();

    await prisma.user.update({
        where: { id },
        data: {
            password: hashedPassword,
            name: restoredName || null,
        },
    });
    revalidatePath("/admin");
}

export async function getAdminStats() {
    await requireAdmin();
    const [userCount, facultyCount, subjectCount, questionCount, monthlySubs, yearlySubs] = await Promise.all([
        prisma.user.count(),
        prisma.faculty.count(),
        prisma.subject.count(),
        prisma.question.count(),
        prisma.user.count({ where: { subscriptionPlan: "MONTHLY" } }),
        prisma.user.count({ where: { subscriptionPlan: "YEARLY" } }),
    ]);

    // Simple income approximation
    const estimatedIncome = monthlySubs * 25000 + yearlySubs * 50000;

    return {
        userCount,
        facultyCount,
        subjectCount,
        questionCount,
        estimatedIncome,
    };
}

// --- Questions ---

/** Admin-only: includes correct answers. */
export async function getQuestions() {
    await requireAdmin();
    return await prisma.question.findMany({
        include: { subject: true },
        orderBy: { createdAt: "desc" },
    });
}

const questionTextSchema = z.string().trim().min(1, "Заполните все поля вопроса").max(2000);

const bulkQuestionSchema = z.object({
    subject_id: idSchema,
    question_text: questionTextSchema,
    correct_answer: questionTextSchema,
    answer2: questionTextSchema,
    answer3: questionTextSchema,
    answer4: questionTextSchema,
});

export async function addQuestions(questions: unknown[]) {
    await requireAdmin();

    const parsed = z.array(bulkQuestionSchema).min(1, "Нет вопросов для импорта").max(5000).safeParse(questions);
    if (!parsed.success) {
        // Point at the offending row so a bad spreadsheet cell is easy to find.
        const issue = parsed.error.issues[0];
        const rowIndex = typeof issue?.path[0] === "number" ? issue.path[0] + 1 : null;
        const field = issue?.path[1];
        throw new Error(
            rowIndex
                ? `Строка ${rowIndex}${field ? ` (${String(field)})` : ""}: ${issue.message}`
                : firstIssue(parsed.error)
        );
    }

    await prisma.question.createMany({
        data: parsed.data,
    });
    revalidatePath("/admin");
}

const newQuestionSchema = z.object({
    subjectId: idSchema,
    questionText: questionTextSchema,
    correctAnswer: questionTextSchema,
    answer2: questionTextSchema,
    answer3: questionTextSchema,
    answer4: questionTextSchema,
    explanation: z.string().trim().max(2000).nullish(),
});

export async function addQuestion(data: unknown) {
    await requireAdmin();

    const parsed = newQuestionSchema.safeParse(data);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));
    const q = parsed.data;

    const res = await prisma.question.create({
        data: {
            subject_id: q.subjectId,
            question_text: q.questionText,
            correct_answer: q.correctAnswer,
            answer2: q.answer2,
            answer3: q.answer3,
            answer4: q.answer4,
            explanation: q.explanation || null,
        },
    });
    revalidatePath("/admin");
    return res;
}

const editQuestionSchema = bulkQuestionSchema.extend({
    explanation: z.string().trim().max(2000).nullish(),
});

export async function updateQuestion(id: number, data: unknown) {
    await requireAdmin();

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new Error("Неверный идентификатор");

    const parsed = editQuestionSchema.safeParse(data);
    if (!parsed.success) throw new Error(firstIssue(parsed.error));
    const q = parsed.data;

    const res = await prisma.question.update({
        where: { id: parsedId.data },
        data: {
            subject_id: q.subject_id,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            answer2: q.answer2,
            answer3: q.answer3,
            answer4: q.answer4,
            explanation: q.explanation || null,
        },
    });
    revalidatePath("/");
    return res;
}

export async function deleteQuestion(id: number) {
    await requireAdmin();
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) throw new Error("Неверный идентификатор");

    await prisma.question.delete({
        where: { id: parsed.data },
    });
    revalidatePath("/");
}

export async function getUserResults(userId?: string) {
    const current = await requireUser();

    // Students may only read their own history; admins may read anyone's.
    const targetId = !userId || userId === current.id ? current.id : userId;
    if (targetId !== current.id && !isAdmin(current)) {
        throw new Error("Доступ запрещён");
    }

    return await prisma.testResult.findMany({
        where: { user_id: targetId },
        include: { subject: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}
