"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getDashboardStats() {
    const session = await getSession();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    // Get all test results for this user
    const results = await (prisma as any).testResult.findMany({
        where: { user_id: userId },
        include: { subject: true },
    });

    // Group by subject
    const statsMap = new Map();

    results.forEach((r: any) => {
        const subjectId = r.subject_id;
        if (!statsMap.has(subjectId)) {
            statsMap.set(subjectId, {
                subject: { id: r.subject.id, name: r.subject.name },
                attempts: 0,
                totalScore: 0,
            });
        }
        const stat = statsMap.get(subjectId);
        stat.attempts += 1;
        stat.totalScore += r.score;
    });

    return Array.from(statsMap.values()).map(s => ({
        subject: s.subject,
        attempts: s.attempts,
        avgScore: Math.round(s.totalScore / s.attempts),
    }));
}
