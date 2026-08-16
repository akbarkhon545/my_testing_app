import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * Bootstrap admin. Kept configurable so the address is not baked into the code
 * (and never into the client bundle). Everything else relies on Role.ADMIN.
 */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "akbarkhon545@gmail.com").toLowerCase();

export interface AccessUser {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    subscriptionPlan: "FREE" | "MONTHLY" | "YEARLY";
    subscriptionExpiresAt: Date | null;
}

const ACCESS_USER_SELECT = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    role: true,
    subscriptionPlan: true,
    subscriptionExpiresAt: true,
} as const;

export function isAdmin(user: Pick<AccessUser, "role" | "email"> | null | undefined): boolean {
    if (!user) return false;
    return user.role === "ADMIN" || user.email?.toLowerCase() === ADMIN_EMAIL;
}

export function hasActiveSubscription(
    user: Pick<AccessUser, "subscriptionPlan" | "subscriptionExpiresAt"> | null | undefined
): boolean {
    if (!user) return false;
    if (user.subscriptionPlan === "FREE") return false;
    if (!user.subscriptionExpiresAt) return false;
    return new Date(user.subscriptionExpiresAt).getTime() > Date.now();
}

/** Admins always get in; everyone else needs a non-expired paid plan. */
export function hasTestAccess(user: AccessUser | null | undefined): boolean {
    return isAdmin(user) || hasActiveSubscription(user);
}

/**
 * Current user, read fresh from the database on every call.
 * The JWT payload is deliberately not trusted for role/subscription, since it
 * can be up to 2 hours stale (revoked admin, expired plan, deleted account).
 */
export async function getCurrentUser(): Promise<AccessUser | null> {
    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: ACCESS_USER_SELECT,
    });

    return (user as AccessUser) || null;
}

export async function requireUser(): Promise<AccessUser> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Не авторизован");
    return user;
}

export async function requireAdmin(): Promise<AccessUser> {
    const user = await requireUser();
    if (!isAdmin(user)) {
        throw new Error("Доступ запрещён. Требуется роль администратора.");
    }
    return user;
}

/** Gate for paid content: test questions, grading, results. */
export async function requireTestAccess(): Promise<AccessUser> {
    const user = await requireUser();
    if (!hasTestAccess(user)) {
        throw new Error("Требуется активная подписка");
    }
    return user;
}
