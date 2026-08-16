export type Tab = "faculties" | "subjects" | "questions" | "users" | "subscriptions";

export interface Faculty {
    id: number;
    name: string;
}

export interface Subject {
    id: number;
    name: string;
    faculty_id: number;
    faculty?: Faculty | null;
}

export interface Question {
    id: number;
    subject_id: number;
    question_text: string;
    correct_answer: string;
    answer2: string;
    answer3: string;
    answer4: string;
    explanation?: string | null;
}

export type SubscriptionPlan = "FREE" | "MONTHLY" | "YEARLY";

export interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatarUrl?: string | null;
    subscriptionPlan: SubscriptionPlan;
    subscriptionExpiresAt: Date | string | null;
    createdAt?: Date | string;
}

/** Anything the edit modal can open: a faculty, subject, question or user. */
export type EditableItem = Faculty | Subject | Question | AdminUser;

/** Union of the fields the edit modal reads, so the form can be filled generically. */
export interface EditableFields {
    id?: number | string;
    name?: string | null;
    email?: string;
    role?: string;
    faculty_id?: number;
    subject_id?: number;
    question_text?: string;
    correct_answer?: string;
    answer2?: string;
    answer3?: string;
    answer4?: string;
    explanation?: string | null;
}

export interface AdminStats {
    userCount: number;
    facultyCount: number;
    subjectCount: number;
    questionCount: number;
    estimatedIncome: number;
}

/** Users may have no name; never index into it blindly. */
export function displayName(user: Pick<AdminUser, "name" | "email">): string {
    return user.name?.trim() || user.email.split("@")[0] || "—";
}

export function initial(user: Pick<AdminUser, "name" | "email">): string {
    return displayName(user).charAt(0).toUpperCase();
}

export function hasActivePlan(user: Pick<AdminUser, "subscriptionPlan" | "subscriptionExpiresAt">): boolean {
    if (!user.subscriptionPlan || user.subscriptionPlan === "FREE") return false;
    if (!user.subscriptionExpiresAt) return false;
    return new Date(user.subscriptionExpiresAt) > new Date();
}
