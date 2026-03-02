"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const ADMIN_EMAIL = "akbarkhon545@gmail.com";

// --- Security: Server-side admin check ---

async function requireAdmin() {
    const session = await getSession();
    if (!session?.user) {
        throw new Error("Не авторизован");
    }
    const { role, email } = session.user;
    if (role !== "ADMIN" && email !== ADMIN_EMAIL) {
        throw new Error("Доступ запрещён. Требуется роль администратора.");
    }
    return session.user;
}

// --- Faculties ---

export async function getFaculties() {
    return await (prisma as any).faculty.findMany({
        orderBy: { name: "asc" },
    });
}

export async function addFaculty(name: string) {
    await requireAdmin();
    const res = await (prisma as any).faculty.create({
        data: { name },
    });
    revalidatePath("/");
    return res;
}

export async function updateFaculty(id: number, name: string) {
    await requireAdmin();
    const res = await (prisma as any).faculty.update({
        where: { id },
        data: { name },
    });
    revalidatePath("/");
    return res;
}

export async function deleteFaculty(id: number) {
    await requireAdmin();
    await (prisma as any).faculty.delete({
        where: { id },
    });
    revalidatePath("/");
}

// --- Subjects ---

export async function getSubjects() {
    return await (prisma as any).subject.findMany({
        include: { faculty: true },
        orderBy: { name: "asc" },
    });
}

export async function addSubject(name: string, facultyId: number) {
    await requireAdmin();
    const res = await (prisma as any).subject.create({
        data: {
            name,
            faculty_id: facultyId,
        },
    });
    revalidatePath("/");
    return res;
}

export async function updateSubject(id: number, name: string, facultyId: number) {
    await requireAdmin();
    const res = await (prisma as any).subject.update({
        where: { id },
        data: {
            name,
            faculty_id: facultyId,
        },
    });
    revalidatePath("/");
    return res;
}

export async function deleteSubject(id: number) {
    await requireAdmin();
    await (prisma as any).subject.delete({
        where: { id },
    });
    revalidatePath("/");
}

export async function getSubjectById(id: number) {
    return await (prisma as any).subject.findUnique({
        where: { id },
        include: { faculty: true },
    });
}

export async function getQuestionsBySubject(subjectId: number) {
    return await (prisma as any).question.findMany({
        where: { subject_id: subjectId },
        orderBy: { createdAt: "desc" },
    });
}

export async function saveTestResult(data: {
    userId: string;
    subjectId: number;
    score: number;
    totalQuestions: number;
    correctCount: number;
    totalTime: number;
    mode: "TRAINING" | "EXAM";
}) {
    return await (prisma as any).testResult.create({
        data: {
            user_id: data.userId,
            subject_id: data.subjectId,
            score: data.score,
            total_questions: data.totalQuestions,
            correct_count: data.correctCount,
            total_time: data.totalTime,
            mode: data.mode,
        },
    });
}

// --- Users ---

export async function getUsers() {
    await requireAdmin();
    return await (prisma as any).user.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function updateSubscription(userId: string, plan: "MONTHLY" | "YEARLY" | "FREE", expiresAt: string | null) {
    await requireAdmin();
    await (prisma as any).user.update({
        where: { id: userId },
        data: {
            subscriptionPlan: plan,
            subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
        },
    });
    revalidatePath("/admin");
}

export async function addUser(data: any) {
    await requireAdmin();
    const { name, email, password, role } = data;

    // Check if user exists
    const existingUser = await (prisma as any).user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const res = await (prisma as any).user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role.toUpperCase(),
        },
    });
    revalidatePath("/admin");
    return res;
}

export async function updateUser(id: string, data: any) {
    await requireAdmin();
    const { name, email, password, role } = data;
    const updateData: any = {
        name,
        email,
        role: role.toUpperCase(),
    };

    if (password) {
        const bcrypt = require("bcryptjs");
        updateData.password = await bcrypt.hash(password, 10);
    }

    const res = await (prisma as any).user.update({
        where: { id },
        data: updateData,
    });
    revalidatePath("/admin");
    return res;
}

export async function deleteUser(id: string) {
    await requireAdmin();

    // Prevent deleting the main admin
    const user = await (prisma as any).user.findUnique({ where: { id } });
    if (user?.email === ADMIN_EMAIL) {
        throw new Error("Невозможно удалить главного администратора");
    }

    await (prisma as any).user.delete({
        where: { id },
    });
    revalidatePath("/admin");
}

// Deactivate user - scramble password so they can't log in
export async function deactivateUser(id: string) {
    await requireAdmin();

    const user = await (prisma as any).user.findUnique({ where: { id } });
    if (user?.email === ADMIN_EMAIL) {
        throw new Error("Невозможно деактивировать главного администратора");
    }

    const bcrypt = require("bcryptjs");
    // Set password to a random hash that can't be matched
    const blockedHash = await bcrypt.hash("DEACTIVATED_" + Date.now() + Math.random(), 10);

    await (prisma as any).user.update({
        where: { id },
        data: {
            password: blockedHash,
            name: user.name ? `[ДЕАКТИВИРОВАН] ${user.name.replace("[ДЕАКТИВИРОВАН] ", "")}` : "[ДЕАКТИВИРОВАН]",
        },
    });
    revalidatePath("/admin");
}

// Activate user - set a new temporary password
export async function activateUser(id: string, newPassword: string) {
    await requireAdmin();

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await (prisma as any).user.findUnique({ where: { id } });

    await (prisma as any).user.update({
        where: { id },
        data: {
            password: hashedPassword,
            name: user?.name?.replace("[ДЕАКТИВИРОВАН] ", "") || user?.name,
        },
    });
    revalidatePath("/admin");
}


export async function getAdminStats() {
    await requireAdmin();
    const [userCount, facultyCount, subjectCount, questionCount] = await Promise.all([
        (prisma as any).user.count(),
        (prisma as any).faculty.count(),
        (prisma as any).subject.count(),
        (prisma as any).question.count(),
    ]);

    // Simple income approximation
    const monthlySubs = await (prisma as any).user.count({ where: { subscriptionPlan: "MONTHLY" } });
    const yearlySubs = await (prisma as any).user.count({ where: { subscriptionPlan: "YEARLY" } });
    const estimatedIncome = (monthlySubs * 25000) + (yearlySubs * 50000);

    return {
        userCount,
        facultyCount,
        subjectCount,
        questionCount,
        estimatedIncome,
    };
}

export async function getQuestions() {
    return await (prisma as any).question.findMany({
        include: { subject: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function addQuestions(questions: any[]) {
    await requireAdmin();
    await (prisma as any).question.createMany({
        data: questions.map(q => ({
            subject_id: q.subject_id,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            answer2: q.answer2,
            answer3: q.answer3,
            answer4: q.answer4,
        }))
    });
    revalidatePath("/admin");
}

export async function addQuestion(data: any) {
    await requireAdmin();
    const res = await (prisma as any).question.create({
        data: {
            subject_id: data.subjectId,
            question_text: data.questionText,
            correct_answer: data.correctAnswer,
            answer2: data.answer2,
            answer3: data.answer3,
            answer4: data.answer4,
            explanation: data.explanation || null,
        },
    });
    revalidatePath("/admin");
    return res;
}

export async function updateQuestion(id: number, data: any) {
    await requireAdmin();
    const res = await (prisma as any).question.update({
        where: { id },
        data: {
            subject_id: data.subject_id,
            question_text: data.question_text,
            correct_answer: data.correct_answer,
            answer2: data.answer2,
            answer3: data.answer3,
            answer4: data.answer4,
            explanation: data.explanation || null,
        },
    });
    revalidatePath("/");
    return res;
}

export async function deleteQuestion(id: number) {
    await requireAdmin();
    await (prisma as any).question.delete({
        where: { id },
    });
    revalidatePath("/");
}

export async function getUserResults(userId: string) {
    return await (prisma as any).testResult.findMany({
        where: { user_id: userId },
        include: { subject: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}
