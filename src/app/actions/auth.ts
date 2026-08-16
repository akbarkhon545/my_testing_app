"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { login as setAuthCookie, logout as clearAuthCookie, getSession } from "@/lib/auth";
import { getCurrentUser, hasActiveSubscription, hasTestAccess, isAdmin, requireUser } from "@/lib/access";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const emailSchema = z.string().trim().toLowerCase().email("Некорректный email").max(254);
const passwordSchema = z.string().min(8, "Пароль должен содержать минимум 8 символов").max(128);
const nameSchema = z.string().trim().min(1, "Введите имя").max(80).optional();

const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
});

const loginSchema = z.object({
    email: emailSchema,
    // Existing accounts may have shorter passwords — only the length cap matters here.
    password: z.string().min(1, "Введите пароль").max(128),
});

export async function registerUser(values: unknown) {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Некорректные данные");
    }
    const { email, password, name } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user — the role is never taken from client input
    const user = await prisma.user.create({
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

export async function loginUser(values: unknown) {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, error: "Неверный логин или пароль" };
    }
    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { success: false, error: "Неверный логин или пароль" };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { success: false, error: "Неверный логин или пароль" };
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

/**
 * Lightweight session info for the UI (no database round-trip).
 * `isAdmin` is computed on the server so the admin address never ships to the client.
 * Anything security-relevant is re-checked server-side on each action.
 */
export async function getUserSession() {
    const session = await getSession();
    if (!session?.user) return null;

    return {
        ...session.user,
        isAdmin: isAdmin(session.user),
    };
}

export async function updateUserPassword(values: unknown) {
    const schema = z.object({
        currentPassword: z.string().min(1, "Введите текущий пароль").max(128),
        newPassword: passwordSchema,
    });

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Некорректные данные");
    }
    const { currentPassword, newPassword } = parsed.data;

    const current = await requireUser();

    const user = await prisma.user.findUnique({
        where: { id: current.id },
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
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
    });

    return { success: true };
}

/** Profile plus the access flags the UI needs, all decided on the server. */
export async function getUserProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isAdmin: isAdmin(user),
        hasActiveSubscription: hasActiveSubscription(user),
        hasTestAccess: hasTestAccess(user),
    };
}

export async function updateUserProfile(values: unknown) {
    const parsed = z.object({ name: z.string().trim().min(1, "Введите имя").max(80) }).safeParse(values);
    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Некорректные данные");
    }

    const user = await requireUser();

    await prisma.user.update({
        where: { id: user.id },
        data: { name: parsed.data.name },
    });

    revalidatePath("/profile");
    return { success: true };
}

// ~2MB file -> ~2.8MB of base64; leave a little headroom.
const MAX_AVATAR_CHARS = 3_000_000;

export async function updateAvatar(avatarUrl: string) {
    const user = await requireUser();

    if (typeof avatarUrl !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(avatarUrl)) {
        throw new Error("Неподдерживаемый формат изображения");
    }
    if (avatarUrl.length > MAX_AVATAR_CHARS) {
        throw new Error("Размер файла не должен превышать 2МБ");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
    });

    revalidatePath("/profile");
    return { success: true };
}
