import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60; // 2 hours

function resolveSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (secret && secret.length >= 32) return secret;

    if (process.env.NODE_ENV === "production") {
        // Fail closed: without a strong secret anyone could forge an admin session.
        throw new Error(
            "JWT_SECRET is missing or too short (min 32 chars). Set it in the environment before starting the app."
        );
    }

    console.warn(
        "[auth] JWT_SECRET is missing or shorter than 32 chars — using an insecure development fallback."
    );
    return "insecure_dev_only_secret_do_not_use_in_production";
}

const key = new TextEncoder().encode(resolveSecret());

/** Shared HMAC key for other short-lived, server-issued tokens (see lib/testTicket). */
export function getSigningKey(): Uint8Array {
    return key;
}

export interface SessionUser {
    id: string;
    email: string;
    role: string;
    /** Optional display name; may be absent on sessions created before it was stored. */
    name?: string | null;
}

export interface SessionPayload {
    user: SessionUser;
    expires: string | Date;
}

export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
        .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
}

function cookieOptions(expires: Date) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        expires,
    };
}

export async function login(user: SessionUser) {
    // Create the session
    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const session = await encrypt({ user, expires });

    // Save the session in a cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session, cookieOptions(expires));
}

export async function logout() {
    // Destroy the session
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (!session) return null;

    try {
        return await decrypt(session);
    } catch {
        // Expired or tampered token — treat as signed out.
        return null;
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire while the user is active
    const parsed = await decrypt(session);
    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: SESSION_COOKIE,
        value: await encrypt({ user: parsed.user, expires }),
        ...cookieOptions(expires),
    });
    return res;
}
