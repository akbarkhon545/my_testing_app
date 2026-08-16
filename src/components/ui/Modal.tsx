"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialog } from "./useDialog";

export interface ModalProps {
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    /** Icon shown next to the title. */
    icon?: ReactNode;
    /** Clicking the dimmed background closes the dialog. */
    closeOnBackdrop?: boolean;
    size?: "sm" | "md";
    /** Rendered as role="alertdialog" — for destructive confirmations. */
    urgent?: boolean;
}

/**
 * Standard dialog shell: accessible behaviour from useDialog plus the usual
 * header / body / footer layout.
 */
export default function Modal({
    title,
    children,
    footer,
    onClose,
    icon,
    closeOnBackdrop = true,
    size = "md",
    urgent = false,
}: ModalProps) {
    const { titleId, dialogProps, backdropProps } = useDialog({ onClose, closeOnBackdrop, urgent });

    // Dialogs only ever mount after a user interaction, so the document exists.
    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn p-4" {...backdropProps}>
            <div
                {...dialogProps}
                className={`bg-[var(--background-secondary)] rounded-xl shadow-lg w-full ${size === "sm" ? "max-w-sm" : "max-w-md"} animate-scaleIn max-h-[90vh] overflow-y-auto outline-none`}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h2 id={titleId} className="font-semibold text-[var(--foreground)] flex items-center gap-2 text-base">
                        {icon}
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">{children}</div>

                {footer && <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}
