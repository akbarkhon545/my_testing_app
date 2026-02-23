"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Faculties ---

export async function getFaculties() {
    return await (prisma as any).faculty.findMany({
        orderBy: { name: "asc" },
    });
}

export async function addFaculty(name: string) {
    const res = await (prisma as any).faculty.create({
        data: { name },
    });
    revalidatePath("/");
    return res;
}

export async function updateFaculty(id: number, name: string) {
    const res = await (prisma as any).faculty.update({
        where: { id },
        data: { name },
    });
    revalidatePath("/");
    return res;
}

export async function deleteFaculty(id: number) {
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
    return await (prisma as any).user.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function updateSubscription(userId: string, plan: "MONTHLY" | "YEARLY" | "FREE", expiresAt: string | null) {
    await (prisma as any).user.update({
        where: { id: userId },
        data: {
            subscriptionPlan: plan,
            subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
        },
    });
    revalidatePath("/admin");
}

export async function getAdminStats() {
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
