"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, ChevronDown, Edit, FileUp, Trash2 } from "lucide-react";
import type { Faculty, Question, Subject } from "./types";

interface QuestionsFoldersProps {
    questions: Question[];
    subjects: Subject[];
    faculties: Faculty[];
    searchQuery: string;
    onEdit: (question: Question) => void;
    onDelete: (id: number) => void;
}

export default function QuestionsFolders({
    questions,
    subjects,
    faculties,
    searchQuery,
    onEdit,
    onDelete,
}: QuestionsFoldersProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({});

    const toggleSubjectFolder = (subjectId: number) => {
        setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
    };

    const query = searchQuery.toLowerCase();

    // Group questions by subject
    const questionsBySubject: Record<number, Question[]> = {};
    questions.forEach((q) => {
        (questionsBySubject[q.subject_id] ||= []).push(q);
    });

    // Keep subjects that either have matching questions or match by name
    const filteredSubjects = subjects.filter((subject) => {
        const subjectQuestions = questionsBySubject[subject.id] || [];
        if (!searchQuery) return subjectQuestions.length > 0;
        return (
            subjectQuestions.some((q) => q.question_text?.toLowerCase().includes(query)) ||
            (subject.name || "").toLowerCase().includes(query)
        );
    });

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <Link href={`/${locale}/admin/upload`} className="btn btn-success">
                    <FileUp className="w-4 h-4" />
                    {t("admin.uploadExcel")}
                </Link>
            </div>

            {/* Folder view */}
            <div className="space-y-3">
                {filteredSubjects.length === 0 ? (
                    <div className="text-center py-8 text-[var(--foreground-muted)]">
                        {t("admin.noQuestionsFound") || "Вопросы не найдены"}
                    </div>
                ) : (
                    filteredSubjects.map((subject) => {
                        const subjectQuestions = (questionsBySubject[subject.id] || []).filter(
                            (q) => !searchQuery || q.question_text?.toLowerCase().includes(query)
                        );
                        const isExpanded = expandedSubjects[subject.id];
                        const faculty = faculties.find((f) => f.id === subject.faculty_id);

                        return (
                            <div key={subject.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
                                {/* Folder Header */}
                                <button
                                    onClick={() => toggleSubjectFolder(subject.id)}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--background-secondary)] hover:bg-[var(--border)]/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? "bg-[var(--primary)]" : "bg-[var(--primary-light)]"}`}
                                        >
                                            <BookOpen
                                                className={`w-5 h-5 ${isExpanded ? "text-white" : "text-[var(--primary)]"}`}
                                            />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-[var(--foreground)]">{subject.name}</h3>
                                            <p className="text-sm text-[var(--foreground-muted)]">
                                                {faculty?.name || "-"} • {subjectQuestions.length}{" "}
                                                {t("admin.questionsCount") || "вопросов"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-primary">{subjectQuestions.length}</span>
                                        <ChevronDown
                                            className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </button>

                                {/* Folder Content - Questions List */}
                                {isExpanded && (
                                    <div className="border-t border-[var(--border)]">
                                        {subjectQuestions.length === 0 ? (
                                            <div className="p-4 text-center text-[var(--foreground-muted)]">
                                                Нет вопросов в этом предмете
                                            </div>
                                        ) : (
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                                        <th className="text-left py-2 px-4 font-medium text-[var(--foreground-muted)] text-sm">
                                                            {t("admin.id")}
                                                        </th>
                                                        <th className="text-left py-2 px-4 font-medium text-[var(--foreground-muted)] text-sm">
                                                            {t("admin.question")}
                                                        </th>
                                                        <th className="text-right py-2 px-4 font-medium text-[var(--foreground-muted)] text-sm">
                                                            {t("admin.actions")}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjectQuestions.map((question, idx) => (
                                                        <tr
                                                            key={question.id}
                                                            className={`border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 ${idx % 2 === 0 ? "" : "bg-[var(--background-secondary)]/30"}`}
                                                        >
                                                            <td className="py-2 px-4 text-[var(--foreground-muted)] text-sm">
                                                                {question.id}
                                                            </td>
                                                            <td className="py-2 px-4 text-[var(--foreground)] text-sm max-w-lg">
                                                                <span className="line-clamp-2">{question.question_text}</span>
                                                            </td>
                                                            <td className="py-2 px-4 text-right">
                                                                <button
                                                                    onClick={() => onEdit(question)}
                                                                    className="btn btn-sm btn-secondary mr-1"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => onDelete(question.id)}
                                                                    className="btn btn-sm btn-danger"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
