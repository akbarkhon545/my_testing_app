"use server";

import prisma from "@/lib/db";
import { login as setAuthCookie, logout as clearAuthCookie, getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerUser(values: any) {
    const { email, password, name } = values;

    // Check if user exists
    const existingUser = await (prisma as any).user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await (prisma as any).user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: "STUDENT",
        },
    });

    // Log in the user
    await setAuthCookie({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    revalidatePath("/");
    return { success: true };
}

export async function loginUser(values: any) {
    const { email, password } = values;

    // Find user
    const user = await (prisma as any).user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Пользователь не найден");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Неверный пароль");
    }

    // Log in the user
    await setAuthCookie({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    revalidatePath("/");
    return { success: true };
}

export async function signOutUser() {
    await clearAuthCookie();
    revalidatePath("/");
}

export async function getUserSession() {
    const session = await getSession();
    return session?.user || null;
}

export async function updateUserPassword(values: any) {
    const { currentPassword, newPassword } = values;
    const session = await getSession();

    if (!session?.user?.id) {
        throw new Error("Не авторизован");
    }

    const userId = session.user.id;

    // Find user
    const user = await (prisma as any).user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("Пользователь не найден");
    }

    // Check old password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        throw new Error("Текущий пароль неверен");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await (prisma as any).user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    return { success: true };
}

export async function getUserProfile() {
    const session = await getSession();
    if (!session?.user?.id) return null;

    return await (prisma as any).user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            subscriptionPlan: true,
            subscriptionExpiresAt: true,
        },
    });
}
