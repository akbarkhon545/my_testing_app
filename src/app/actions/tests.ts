"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { requireTestAccess } from "@/lib/access";
import { signTicket, verifyTicket, type TestMode } from "@/lib/testTicket";

const TRAINING_QUESTION_COUNT = 25;
const MAX_TEST_SECONDS = 6 * 60 * 60;

/** What the browser is allowed to see: the question and its four options, shuffled. */
export interface SafeQuestion {
    id: number;
    question_text: string;
    options: string[];
}

export interface TestPayload {
    ticket: string;
    questions: SafeQuestion[];
}

export interface TestSummary {
    correct: number;
    total: number;
    score: number;
    timeSpent: number;
    saved: boolean;
}

function shuffle<T>(input: T[]): T[] {
    const arr = input.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function normalizeMode(mode: string | undefined): TestMode {
    return mode === "training" ? "training" : "full";
}

const subjectIdSchema = z.coerce.number().int().positive();

/**
 * Hand out a test. Requires an active subscription (or admin), never returns
 * `correct_answer`, and returns a signed ticket listing the issued question ids.
 */
export async function getTestQuestions(subjectIdInput: number | string, modeInput?: string): Promise<TestPayload> {
    const user = await requireTestAccess();

    const parsedSubjectId = subjectIdSchema.safeParse(subjectIdInput);
    if (!parsedSubjectId.success) throw new Error("Неверный предмет");
    const subjectId = parsedSubjectId.data;

    const mode = normalizeMode(modeInput);

    const rows = await prisma.question.findMany({
        where: { subject_id: subjectId },
        select: {
            id: true,
            question_text: true,
            correct_answer: true,
            answer2: true,
            answer3: true,
            answer4: true,
        },
    });

    const picked = mode === "training" ? shuffle(rows).slice(0, TRAINING_QUESTION_COUNT) : shuffle(rows);

    const questions: SafeQuestion[] = picked.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        options: shuffle([q.correct_answer, q.answer2, q.answer3, q.answer4]),
    }));

    const ticket = await signTicket({
        userId: user.id,
        subjectId,
        mode,
        questionIds: questions.map((q) => q.id),
    });

    return { ticket, questions };
}

/**
 * Reveal the correct answer for a single question — used by the "full" practice
 * mode, which shows feedback right after the user commits to an answer.
 */
export async function revealAnswer(questionId: number): Promise<{ correctAnswer: string; explanation: string | null }> {
    await requireTestAccess();

    const parsed = z.coerce.number().int().positive().safeParse(questionId);
    if (!parsed.success) throw new Error("Неверный вопрос");

    const question = await prisma.question.findUnique({
        where: { id: parsed.data },
        select: { correct_answer: true, explanation: true },
    });

    if (!question) throw new Error("Вопрос не найден");

    return { correctAnswer: question.correct_answer, explanation: question.explanation };
}

const submitSchema = z.object({
    ticket: z.string().min(1),
    // questionId -> the option text the user selected
    answers: z.record(z.string(), z.string()),
    totalTime: z.coerce.number().int().min(0).max(MAX_TEST_SECONDS).default(0),
});

/**
 * Grade a finished test. The score is computed here against the database:
 * the client only says which option it picked for each question.
 */
export async function submitTest(input: unknown): Promise<TestSummary> {
    const user = await requireTestAccess();

    const parsed = submitSchema.safeParse(input);
    if (!parsed.success) throw new Error("Некорректные данные теста");
    const { ticket, answers, totalTime } = parsed.data;

    const issued = await verifyTicket(ticket);
    if (issued.userId !== user.id) throw new Error("Билет теста принадлежит другому пользователю");

    const questions = await prisma.question.findMany({
        where: { id: { in: issued.questionIds }, subject_id: issued.subjectId },
        select: { id: true, correct_answer: true },
    });

    let correct = 0;
    for (const question of questions) {
        if (answers[String(question.id)] === question.correct_answer) correct++;
    }

    // Total comes from the ticket, not the submitted answer sheet: skipped
    // questions still count against the score.
    const total = issued.questionIds.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    let saved = false;
    if (issued.mode === "training" && total > 0) {
        await prisma.testResult.create({
            data: {
                user_id: user.id,
                subject_id: issued.subjectId,
                score,
                total_questions: total,
                correct_count: correct,
                total_time: totalTime,
                mode: "TRAINING",
            },
        });
        saved = true;
    }

    return { correct, total, score, timeSpent: totalTime, saved };
}
