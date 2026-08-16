"use client";

import { useTranslations } from "next-intl";
import { Save, X } from "lucide-react";
import type { Faculty, Subject, Tab } from "./types";

export interface AdminForm {
    name: string;
    email: string;
    role: string;
    password: string;
    facultyId: string;
    subjectId: string;
    questionText: string;
    correctAnswer: string;
    answer2: string;
    answer3: string;
    answer4: string;
    explanation: string;
}

export const EMPTY_FORM: AdminForm = {
    name: "",
    email: "",
    role: "STUDENT",
    password: "",
    facultyId: "",
    subjectId: "",
    questionText: "",
    correctAnswer: "",
    answer2: "",
    answer3: "",
    answer4: "",
    explanation: "",
};

interface EntityModalProps {
    tab: Tab;
    isEditing: boolean;
    form: AdminForm;
    faculties: Faculty[];
    subjects: Subject[];
    saving: boolean;
    onChange: <K extends keyof AdminForm>(field: K, value: AdminForm[K]) => void;
    onClose: () => void;
    onSave: () => void;
}

export default function EntityModal({
    tab,
    isEditing,
    form,
    faculties,
    subjects,
    saving,
    onChange,
    onClose,
    onSave,
}: EntityModalProps) {
    const t = useTranslations();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
            <div className="bg-[var(--background-secondary)] rounded-xl shadow-lg w-full max-w-md mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--foreground)]">
                        {isEditing ? t("admin.edit") : t("admin.add")}
                    </h3>
                    <button onClick={onClose} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {tab === "users" && (
                        <>
                            <div>
                                <label className="label">{t("admin.name")}</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.name}
                                    onChange={(e) => onChange("name", e.target.value)}
                                    placeholder={t("admin.name")}
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={form.email}
                                    onChange={(e) => onChange("email", e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="label">{t("admin.role")}</label>
                                <select
                                    className="input"
                                    value={form.role}
                                    onChange={(e) => onChange("role", e.target.value)}
                                >
                                    <option value="STUDENT">{t("admin.studentRole")}</option>
                                    <option value="ADMIN">{t("admin.adminRole")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">
                                    {isEditing ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"}
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    value={form.password}
                                    onChange={(e) => onChange("password", e.target.value)}
                                    placeholder="******"
                                />
                            </div>
                        </>
                    )}

                    {(tab === "faculties" || tab === "subjects") && (
                        <div>
                            <label className="label">{t("admin.name")}</label>
                            <input
                                type="text"
                                className="input"
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                placeholder={t("admin.name")}
                            />
                        </div>
                    )}

                    {tab === "subjects" && (
                        <div>
                            <label className="label">{t("admin.faculty")}</label>
                            <select
                                className="input"
                                value={form.facultyId}
                                onChange={(e) => onChange("facultyId", e.target.value)}
                            >
                                <option value="">{t("admin.selectFaculty")}</option>
                                {faculties.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {tab === "questions" && (
                        <>
                            <div>
                                <label className="label">{t("admin.subjects")}</label>
                                <select
                                    className="input"
                                    value={form.subjectId}
                                    onChange={(e) => onChange("subjectId", e.target.value)}
                                >
                                    <option value="">—</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">{t("admin.question")}</label>
                                <textarea
                                    className="input min-h-24"
                                    value={form.questionText}
                                    onChange={(e) => onChange("questionText", e.target.value)}
                                    placeholder={t("admin.question")}
                                />
                            </div>
                            <div>
                                <label className="label">Правильный ответ</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.correctAnswer}
                                    onChange={(e) => onChange("correctAnswer", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">Вариант 2</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.answer2}
                                    onChange={(e) => onChange("answer2", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">Вариант 3</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.answer3}
                                    onChange={(e) => onChange("answer3", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">Вариант 4</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.answer4}
                                    onChange={(e) => onChange("answer4", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">Пояснение (необязательно)</label>
                                <textarea
                                    className="input"
                                    value={form.explanation}
                                    onChange={(e) => onChange("explanation", e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
                    <button onClick={onClose} className="btn btn-secondary">
                        {t("admin.cancel")}
                    </button>
                    <button onClick={onSave} className="btn btn-primary" disabled={saving}>
                        <Save className="w-4 h-4" />
                        {t("admin.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
