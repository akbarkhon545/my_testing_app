import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { login as setAuthCookie } from "@/lib/auth";

/**
 * GET /api/auth/google/callback
 *
 * Google перенаправляет сюда после согласия пользователя.
 * Обменивает code на токены, извлекает профиль,
 * создаёт/обновляет пользователя и устанавливает сессию.
 */
export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const stateRaw = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    // Парсим locale из state (поддерживаем как обычную строку, так и JSON)
    let locale = "ru";
    if (stateRaw) {
        try {
            const parsed = JSON.parse(stateRaw);
            if (parsed.locale) locale = parsed.locale;
            else locale = stateRaw;
        } catch {
            locale = stateRaw === "uz" ? "uz" : "ru";
        }
    }

    // Определяем базовый URL приложения
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
        const rawHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
        const rawProto = request.headers.get("x-forwarded-proto");

        const host = rawHost ? rawHost.split(",")[0].trim() : null;
        const proto = rawProto ? rawProto.split(",")[0].trim() : (request.url.startsWith("https") ? "https" : "http");

        if (host) {
            baseUrl = `${proto}://${host}`;
        } else {
            baseUrl = request.nextUrl.origin;
        }
    }

    // Удаляем слэш и кавычки в конце
    baseUrl = baseUrl.replace(/\/+$/, "").replace(/^["']|["']$/g, "").trim();

    // Пользователь отменил авторизацию
    if (error || !code) {
        return NextResponse.redirect(
            `${baseUrl}/${locale}/auth/login?error=google_cancelled`
        );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.replace(/^["']|["']$/g, "").trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^["']|["']$/g, "").trim();
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(
            `${baseUrl}/${locale}/auth/login?error=google_not_configured`
        );
    }

    try {
        // 1. Обмениваем code на access_token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenRes.ok) {
            return NextResponse.redirect(
                `${baseUrl}/${locale}/auth/login?error=google_token_error`
            );
        }

        const tokenData = await tokenRes.json();

        // 2. Получаем профиль пользователя
        const userInfoRes = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            }
        );

        if (!userInfoRes.ok) {
            return NextResponse.redirect(
                `${baseUrl}/${locale}/auth/login?error=google_profile_error`
            );
        }

        const googleUser = await userInfoRes.json();
        const email = googleUser.email?.toLowerCase();
        const googleId = googleUser.id;
        const name = googleUser.name || email?.split("@")[0];
        const avatarUrl = googleUser.picture || null;

        if (!email || !googleId) {
            return NextResponse.redirect(
                `${baseUrl}/${locale}/auth/login?error=google_no_email`
            );
        }

        // 3. Ищем или создаём пользователя
        let user = await prisma.user.findFirst({
            where: {
                OR: [{ googleId }, { email }],
            },
        });

        if (user) {
            // Обновляем Google ID и аватар, если ещё не привязан
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: user.googleId || googleId,
                    authProvider: user.authProvider === "credentials" && !user.googleId
                        ? "both"
                        : user.authProvider === "credentials"
                            ? "both"
                            : user.authProvider,
                    avatarUrl: user.avatarUrl || avatarUrl,
                    name: user.name || name,
                },
            });
        } else {
            // Новый пользователь через Google
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    name,
                    avatarUrl,
                    authProvider: "google",
                    role: "STUDENT",
                },
            });
        }

        // 4. Устанавливаем JWT-сессию
        await setAuthCookie({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        // 5. Редирект на дашборд
        return NextResponse.redirect(`${baseUrl}/${locale}/dashboard`);
    } catch (err) {
        console.error("[Google OAuth] Ошибка:", err);
        return NextResponse.redirect(
            `${baseUrl}/${locale}/auth/login?error=google_unknown`
        );
    }
}
