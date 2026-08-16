"use client";

import { useCallback, useEffect, useId, useRef, type KeyboardEvent, type MouseEvent } from "react";

const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseDialogOptions {
    onClose: () => void;
    /** Clicking the dimmed backdrop closes the dialog. */
    closeOnBackdrop?: boolean;
    /** Use role="alertdialog" for destructive confirmations. */
    urgent?: boolean;
}

/**
 * Dialog behaviour without any markup: focus moves in and stays trapped,
 * Escape closes, the page behind stops scrolling and focus is restored on
 * unmount. Spread `dialogProps` on the dialog box and `backdropProps` on the
 * dimmed overlay; put `titleId` on the heading.
 */
export function useDialog({ onClose, closeOnBackdrop = true, urgent = false }: UseDialogOptions) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const node = dialogRef.current;

        const firstField = node?.querySelector<HTMLElement>(FOCUSABLE);
        (firstField || node)?.focus();

        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = overflow;
            previouslyFocused?.focus?.();
        };
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onClose();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) || []).filter(
                (el) => el.offsetParent !== null
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === dialogRef.current)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        },
        [onClose]
    );

    const handleBackdropMouseDown = useCallback(
        (event: MouseEvent) => {
            if (closeOnBackdrop && event.target === event.currentTarget) onClose();
        },
        [closeOnBackdrop, onClose]
    );

    return {
        titleId,
        dialogRef,
        backdropProps: { onMouseDown: handleBackdropMouseDown },
        dialogProps: {
            ref: dialogRef,
            role: urgent ? ("alertdialog" as const) : ("dialog" as const),
            "aria-modal": true as const,
            "aria-labelledby": titleId,
            tabIndex: -1,
            onKeyDown: handleKeyDown,
        },
    };
}
