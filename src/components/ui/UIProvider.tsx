"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import Modal from "./Modal";

/* ────────────────────────────── toasts ────────────────────────────── */

type ToastKind = "success" | "error" | "info";

interface Toast {
    id: number;
    kind: ToastKind;
    message: string;
}

const TOAST_TIMEOUT = 5000;

const TOAST_STYLE: Record<ToastKind, { className: string; icon: ReactNode }> = {
    success: {
        className: "border-[var(--success)] bg-[var(--success-light)] text-[var(--success-strong)]",
        icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
        className: "border-[var(--danger)] bg-[var(--danger-light)] text-[var(--danger-strong)]",
        icon: <XCircle className="w-5 h-5" />,
    },
    info: {
        className: "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--foreground)]",
        icon: <Info className="w-5 h-5" />,
    },
};

/* ───────────────────────── confirm / prompt ───────────────────────── */

interface ConfirmOptions {
    title: string;
    message?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Styles the confirm button as destructive. */
    destructive?: boolean;
}

interface PromptOptions {
    title: string;
    message?: ReactNode;
    label: string;
    confirmLabel?: string;
    type?: "text" | "password";
    placeholder?: string;
    /** Return an error message to keep the dialog open. */
    validate?: (value: string) => string | null;
}

interface ConfirmState extends ConfirmOptions {
    kind: "confirm";
    resolve: (value: boolean) => void;
}

interface PromptState extends PromptOptions {
    kind: "prompt";
    resolve: (value: string | null) => void;
}

interface UIContextValue {
    toast: (message: string, kind?: ToastKind) => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    prompt: (options: PromptOptions) => Promise<string | null>;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
    return ctx;
}

export default function UIProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [dialog, setDialog] = useState<ConfirmState | PromptState | null>(null);
    const [promptValue, setPromptValue] = useState("");
    const [promptError, setPromptError] = useState<string | null>(null);
    const nextId = useRef(1);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (message: string, kind: ToastKind = "success") => {
            const id = nextId.current++;
            setToasts((prev) => [...prev, { id, kind, message }]);
            setTimeout(() => dismiss(id), TOAST_TIMEOUT);
        },
        [dismiss]
    );

    const confirm = useCallback(
        (options: ConfirmOptions) =>
            new Promise<boolean>((resolve) => {
                setDialog({ kind: "confirm", ...options, resolve });
            }),
        []
    );

    const prompt = useCallback(
        (options: PromptOptions) =>
            new Promise<string | null>((resolve) => {
                setPromptValue("");
                setPromptError(null);
                setDialog({ kind: "prompt", ...options, resolve });
            }),
        []
    );

    const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

    const closeDialog = (result: boolean | string | null) => {
        if (!dialog) return;
        if (dialog.kind === "confirm") dialog.resolve(result === true);
        else dialog.resolve(typeof result === "string" ? result : null);
        setDialog(null);
    };

    const submitPrompt = () => {
        if (!dialog || dialog.kind !== "prompt") return;
        const error = dialog.validate?.(promptValue) ?? null;
        if (error) {
            setPromptError(error);
            return;
        }
        closeDialog(promptValue);
    };

    return (
        <UIContext.Provider value={value}>
            {children}

            {/* Toasts — announced politely, never steal focus */}
            <div
                className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))] pointer-events-none"
                role="status"
                aria-live="polite"
            >
                {toasts.map((item) => (
                    <div
                        key={item.id}
                        className={`pointer-events-auto flex items-start gap-3 p-3 pr-2 rounded-lg border shadow-md animate-slideIn ${TOAST_STYLE[item.kind].className}`}
                    >
                        <span className="mt-0.5">{TOAST_STYLE[item.kind].icon}</span>
                        <p className="text-sm flex-1 text-current">{item.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(item.id)}
                            aria-label="Закрыть уведомление"
                            className="opacity-70 hover:opacity-100 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {dialog?.kind === "confirm" && (
                <Modal
                    title={dialog.title}
                    size="sm"
                    urgent={dialog.destructive}
                    icon={
                        dialog.destructive ? (
                            <AlertTriangle className="w-5 h-5 text-[var(--danger-strong)]" />
                        ) : undefined
                    }
                    onClose={() => closeDialog(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => closeDialog(false)}>
                                {dialog.cancelLabel || "Отмена"}
                            </button>
                            <button
                                type="button"
                                className={`btn ${dialog.destructive ? "btn-danger" : "btn-primary"}`}
                                onClick={() => closeDialog(true)}
                            >
                                {dialog.confirmLabel || "Подтвердить"}
                            </button>
                        </>
                    }
                >
                    <p className="text-[var(--foreground-secondary)] text-sm">{dialog.message}</p>
                </Modal>
            )}

            {dialog?.kind === "prompt" && (
                <Modal
                    title={dialog.title}
                    size="sm"
                    onClose={() => closeDialog(null)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => closeDialog(null)}>
                                Отмена
                            </button>
                            <button type="button" className="btn btn-primary" onClick={submitPrompt}>
                                {dialog.confirmLabel || "Готово"}
                            </button>
                        </>
                    }
                >
                    {dialog.message && (
                        <p className="text-[var(--foreground-secondary)] text-sm">{dialog.message}</p>
                    )}
                    <div>
                        <label className="label" htmlFor="ui-prompt-field">
                            {dialog.label}
                        </label>
                        <input
                            id="ui-prompt-field"
                            className="input"
                            type={dialog.type || "text"}
                            value={promptValue}
                            placeholder={dialog.placeholder}
                            aria-invalid={!!promptError}
                            aria-describedby={promptError ? "ui-prompt-error" : undefined}
                            onChange={(e) => {
                                setPromptValue(e.target.value);
                                setPromptError(null);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitPrompt();
                            }}
                        />
                        {promptError && (
                            <p id="ui-prompt-error" className="text-sm text-[var(--danger-strong)] mt-1">
                                {promptError}
                            </p>
                        )}
                    </div>
                </Modal>
            )}
        </UIContext.Provider>
    );
}
