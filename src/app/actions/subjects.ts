"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
    try {
        return await prisma.subject.findMany({
            include: {
                faculty: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (error) {
        console.error("Failed to fetch subjects:", error);
        throw new Error("Failed to fetch subjects");
    }
}

export async function addSubject(name: string, facultyId: number) {
    try {
        const subject = await prisma.subject.create({
            data: {
                name,
                faculty_id: facultyId,
            },
        });
        revalidatePath("/");
        return subject;
    } catch (error) {
        console.error("Failed to add subject:", error);
        throw new Error("Failed to add subject");
    }
}

export async function getFaculties() {
    try {
        return await prisma.faculty.findMany({
            orderBy: {
                name: "asc",
            },
        });
    } catch (error) {
        console.error("Failed to fetch faculties:", error);
        throw new Error("Failed to fetch faculties");
    }
}
