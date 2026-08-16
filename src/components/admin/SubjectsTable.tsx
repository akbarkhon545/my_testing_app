"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2 } from "lucide-react";
import type { Faculty, Question, Subject } from "./types";

interface SubjectsTableProps {
    subjects: Subject[];
    faculties: Faculty[];
    questions: Question[];
    searchQuery: string;
    onEdit: (subject: Subject) => void;
    onDelete: (id: number) => void;
}

export default function SubjectsTable({
    subjects,
    faculties,
    questions,
    searchQuery,
    onEdit,
    onDelete,
}: SubjectsTableProps) {
    const t = useTranslations();
    const query = searchQuery.toLowerCase();

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.name")}</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.faculty")}</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.questionsCount")}</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects
                        .filter((s) => (s.name || "").toLowerCase().includes(query))
                        .map((subject) => (
                            <tr key={subject.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                                <td className="py-3 px-4 font-medium text-[var(--foreground)]">{subject.name}</td>
                                <td className="py-3 px-4 text-[var(--foreground-secondary)]">
                                    {faculties.find((f) => f.id === subject.faculty_id)?.name || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className="badge badge-success">
                                        {questions.filter((q) => q.subject_id === subject.id).length}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button onClick={() => onEdit(subject)} className="btn btn-sm btn-secondary mr-2">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(subject.id)} className="btn btn-sm btn-danger">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
