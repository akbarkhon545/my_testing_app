"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
    FileUp,
    ArrowLeft,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle,
    Download,
    X,
    Upload
} from "lucide-react";

export default function UploadPage() {
    const locale = useLocale();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const subjects = [
        { id: 1, name: "Python программирование" },
        { id: 2, name: "Базы данных" },
        { id: 3, name: "Алгебра" },
        { id: 4, name: "Английский язык" },
    ];

    const handleFileSelect = (file: File | null) => {
        if (file) {
            if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                setSelectedFile(file);
                setResult(null);
            } else {
                setResult({ type: "error", message: "Пожалуйста, выберите файл Excel (.xlsx или .xls)" });
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedSubject) {
            setResult({ type: "error", message: "Выберите файл и предмет" });
            return;
        }

        setUploading(true);
        setResult(null);

        // Simulated upload
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulated success
        setResult({
            type: "success",
            message: `Успешно загружено 25 вопросов из файла "${selectedFile.name}"`
        });
        setSelectedFile(null);
        setUploading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/${locale}/admin`} className="btn btn-secondary">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Загрузка вопросов</h1>
                    <p className="text-[var(--foreground-secondary)]">Импорт вопросов из Excel файла</p>
                </div>
            </div>

            {/* Result message */}
            {result && (
                <div className={`alert ${result.type === "success" ? "alert-success" : "alert-danger"} mb-6`}>
                    {result.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{result.message}</span>
                </div>
            )}

            {/* Upload Card */}
            <div className="card">
                <div className="card-header">
                    <h2 className="font-semibold flex items-center gap-2">
                        <FileUp className="w-5 h-5" />
                        Загрузка файла
                    </h2>
                </div>
                <div className="card-body space-y-6">
                    {/* Subject select */}
                    <div>
                        <label className="label">Выберите предмет</label>
                        <select
                            className="input"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">-- Выберите предмет --</option>
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Drop zone */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver
                                ? "border-[var(--primary)] bg-[var(--primary-light)]"
                                : "border-[var(--border)] hover:border-[var(--primary)]"
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                        />

                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-[var(--foreground)]">{selectedFile.name}</p>
                                        <p className="text-sm text-[var(--foreground-muted)]">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="ml-2 text-[var(--foreground-muted)] hover:text-[var(--danger)]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                                <p className="text-[var(--foreground)] font-medium mb-1">
                                    Перетащите файл сюда
                                </p>
                                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                                    или нажмите для выбора
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-outline"
                                >
                                    Выбрать файл
                                </button>
                            </>
                        )}
                    </div>

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || !selectedSubject || uploading}
                        className="btn btn-primary btn-lg w-full"
                    >
                        {uploading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Загрузка...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Загрузить вопросы
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Format Info */}
            <div className="card mt-6">
                <div className="card-header">
                    <h3 className="font-semibold">Формат файла</h3>
                </div>
                <div className="card-body">
                    <p className="text-[var(--foreground-secondary)] mb-4">
                        Excel файл должен содержать следующие столбцы:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    <th className="py-2 px-3 text-left text-[var(--foreground)]">A</th>
                                    <th className="py-2 px-3 text-left text-[var(--foreground)]">B</th>
                                    <th className="py-2 px-3 text-left text-[var(--foreground)]">C</th>
                                    <th className="py-2 px-3 text-left text-[var(--foreground)]">D</th>
                                    <th className="py-2 px-3 text-left text-[var(--foreground)]">E</th>
                                    <th className="py-2 px-3 text-left text-[var(--foreground)]">F</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[var(--border)]">
                                    <td className="py-2 px-3 text-[var(--foreground-secondary)]">Вопрос</td>
                                    <td className="py-2 px-3 text-[var(--foreground-secondary)]">Ответ 1</td>
                                    <td className="py-2 px-3 text-[var(--foreground-secondary)]">Ответ 2</td>
                                    <td className="py-2 px-3 text-[var(--foreground-secondary)]">Ответ 3</td>
                                    <td className="py-2 px-3 text-[var(--foreground-secondary)]">Ответ 4</td>
                                    <td className="py-2 px-3 text-[var(--foreground-secondary)]">Правильный (1-4)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 text-[var(--foreground-muted)]">Что такое...?</td>
                                    <td className="py-2 px-3 text-[var(--foreground-muted)]">Вар. А</td>
                                    <td className="py-2 px-3 text-[var(--foreground-muted)]">Вар. Б</td>
                                    <td className="py-2 px-3 text-[var(--foreground-muted)]">Вар. В</td>
                                    <td className="py-2 px-3 text-[var(--foreground-muted)]">Вар. Г</td>
                                    <td className="py-2 px-3 text-[var(--foreground-muted)]">1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mt-4">
                        Первая строка должна быть заголовком. Данные начинаются со второй строки.
                    </p>
                </div>
            </div>
        </div>
    );
}
