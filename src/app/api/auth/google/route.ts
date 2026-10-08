import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/google
 *
 * Redirects the user to Google's OAuth 2.0 consent screen.
 * Accepts an optional `locale` query parameter so we can redirect
 * back to the correct locale after authentication.
 */
export async function GET(request: NextRequest) {
    const locale = request.nextUrl.searchParams.get("locale") || "ru";

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

    // Удаляем слэш в конце, если есть
    baseUrl = baseUrl.replace(/\/+$/, "");

    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: "GOOGLE_CLIENT_ID не настроен в Environment Variables на Vercel" },
            { status: 500 }
        );
    }

    // Build the state payload (carries the locale through the OAuth flow)
    const state = JSON.stringify({ locale });

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
        state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    return NextResponse.redirect(googleAuthUrl);
}
