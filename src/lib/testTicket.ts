import { SignJWT, jwtVerify } from "jose";
import { getSigningKey } from "@/lib/auth";

/**
 * A test ticket is a short-lived signed token issued when a test is handed out.
 * It records *which* questions the server actually gave the user, so grading
 * cannot be gamed by submitting a made-up (e.g. one-question) answer sheet.
 */
export interface TestTicket {
    userId: string;
    subjectId: number;
    mode: TestMode;
    questionIds: number[];
}

export type TestMode = "training" | "full";

const AUDIENCE = "edu-platform:test-ticket";
const TICKET_TTL = "6h";

// Reuse the app secret; the audience claim keeps tickets and sessions distinct.
function getKey(): Uint8Array {
    return getSigningKey();
}

export async function signTicket(ticket: TestTicket): Promise<string> {
    const key = getKey();
    return await new SignJWT({ ...ticket })
        .setProtectedHeader({ alg: "HS256" })
        .setAudience(AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(TICKET_TTL)
        .sign(key);
}

export async function verifyTicket(token: string): Promise<TestTicket> {
    const key = getKey();
    const { payload } = await jwtVerify(token, key, {
        algorithms: ["HS256"],
        audience: AUDIENCE,
    });

    const { userId, subjectId, mode, questionIds } = payload as unknown as TestTicket;

    if (
        typeof userId !== "string" ||
        typeof subjectId !== "number" ||
        (mode !== "training" && mode !== "full") ||
        !Array.isArray(questionIds)
    ) {
        throw new Error("Некорректный билет теста");
    }

    return { userId, subjectId, mode, questionIds };
}
