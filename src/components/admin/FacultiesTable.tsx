"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2 } from "lucide-react";
import type { Faculty, Subject } from "./types";

interface FacultiesTableProps {
    faculties: Faculty[];
    subjects: Subject[];
    searchQuery: string;
    onEdit: (faculty: Faculty) => void;
    onDelete: (id: number) => void;
}

export default function FacultiesTable({ faculties, subjects, searchQuery, onEdit, onDelete }: FacultiesTableProps) {
    const t = useTranslations();
    const query = searchQuery.toLowerCase();

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.id")}</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.name")}</th>
                        <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.subjectsCount")}</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    {faculties
                        .filter((f) => (f.name || "").toLowerCase().includes(query))
                        .map((faculty) => (
                            <tr key={faculty.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                                <td className="py-3 px-4 text-[var(--foreground-muted)]">{faculty.id}</td>
                                <td className="py-3 px-4 font-medium text-[var(--foreground)]">{faculty.name}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="badge badge-primary">
                                        {subjects.filter((s) => s.faculty_id === faculty.id).length}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button onClick={() => onEdit(faculty)} className="btn btn-sm btn-secondary mr-2">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(faculty.id)} className="btn btn-sm btn-danger">
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
