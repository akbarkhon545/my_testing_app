"use client";

import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
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
        <Modal
            title={isEditing ? t("admin.edit") : t("admin.add")}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        {t("admin.cancel")}
                    </button>
                    <button type="button" onClick={onSave} className="btn btn-primary" disabled={saving}>
                        <Save className="w-4 h-4" />
                        {t("admin.save")}
                    </button>
                </>
            }
        >
            {tab === "users" && (
                <>
                    <div>
                        <label className="label" htmlFor="admin-user-name">
                            {t("admin.name")}
                        </label>
                        <input
                            id="admin-user-name"
                            type="text"
                            className="input"
                            value={form.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            placeholder={t("admin.name")}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-user-email">
                            Email
                        </label>
                        <input
                            id="admin-user-email"
                            type="email"
                            className="input"
                            value={form.email}
                            onChange={(e) => onChange("email", e.target.value)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-user-role">
                            {t("admin.role")}
                        </label>
                        <select
                            id="admin-user-role"
                            className="input"
                            value={form.role}
                            onChange={(e) => onChange("role", e.target.value)}
                        >
                            <option value="STUDENT">{t("admin.studentRole")}</option>
                            <option value="ADMIN">{t("admin.adminRole")}</option>
                        </select>
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-user-password">
                            {isEditing ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"}
                        </label>
                        <input
                            id="admin-user-password"
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
                    <label className="label" htmlFor="admin-entity-name">
                        {t("admin.name")}
                    </label>
                    <input
                        id="admin-entity-name"
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
                    <label className="label" htmlFor="admin-subject-faculty">
                        {t("admin.faculty")}
                    </label>
                    <select
                        id="admin-subject-faculty"
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
                        <label className="label" htmlFor="admin-question-subject">
                            {t("admin.subjects")}
                        </label>
                        <select
                            id="admin-question-subject"
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
                        <label className="label" htmlFor="admin-question-text">
                            {t("admin.question")}
                        </label>
                        <textarea
                            id="admin-question-text"
                            className="input min-h-24"
                            value={form.questionText}
                            onChange={(e) => onChange("questionText", e.target.value)}
                            placeholder={t("admin.question")}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-question-correct">
                            Правильный ответ
                        </label>
                        <input
                            id="admin-question-correct"
                            type="text"
                            className="input"
                            value={form.correctAnswer}
                            onChange={(e) => onChange("correctAnswer", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-question-answer2">
                            Вариант 2
                        </label>
                        <input
                            id="admin-question-answer2"
                            type="text"
                            className="input"
                            value={form.answer2}
                            onChange={(e) => onChange("answer2", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-question-answer3">
                            Вариант 3
                        </label>
                        <input
                            id="admin-question-answer3"
                            type="text"
                            className="input"
                            value={form.answer3}
                            onChange={(e) => onChange("answer3", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-question-answer4">
                            Вариант 4
                        </label>
                        <input
                            id="admin-question-answer4"
                            type="text"
                            className="input"
                            value={form.answer4}
                            onChange={(e) => onChange("answer4", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="admin-question-explanation">
                            Пояснение (необязательно)
                        </label>
                        <textarea
                            id="admin-question-explanation"
                            className="input"
                            value={form.explanation}
                            onChange={(e) => onChange("explanation", e.target.value)}
                        />
                    </div>
                </>
            )}
        </Modal>
    );
}
