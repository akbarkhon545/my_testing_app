"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { CheckCircle, Copy, CreditCard, MessageCircle, Phone, Send } from "lucide-react";
import { useDialog } from "@/components/ui/useDialog";

export const CARD_NUMBER = "9860 1604 1780 2420";
export const CARD_HOLDER = "AKBARKHON FAKHRIDDINOV";
export const TELEGRAM_USERNAME = "@akbarkhonfakhriddinov";
export const PHONE_NUMBER = "+998 93 167 49 59";

interface PaymentModalProps {
    planName: string;
    price: number;
    onClose: () => void;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat("ru-RU").format(price);
}

export default function PaymentModal({ planName, price, onClose }: PaymentModalProps) {
    const t = useTranslations();
    const [copied, setCopied] = useState(false);
    const { titleId, dialogProps, backdropProps } = useDialog({ onClose });

    const handleCopyCard = async () => {
        await navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn p-2 sm:p-4"
            {...backdropProps}
        >
            <div
                {...dialogProps}
                className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn outline-none"
            >
                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-[var(--border)] text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-3 sm:mb-4">
                        <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h2 id={titleId} className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                        {t("pricing.paymentTitle")}
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">{planName}</p>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Amount */}
                    <div className="text-center p-4 rounded-lg bg-[var(--primary-light)]">
                        <p className="text-sm text-[var(--foreground-secondary)] mb-1">{t("pricing.amountToPay")}</p>
                        <p className="text-3xl font-bold text-[var(--primary)]">
                            {formatPrice(price)} {t("pricing.sum")}
                        </p>
                    </div>

                    {/* Card Number */}
                    <div>
                        <label className="label" htmlFor="payment-card-number">
                            {t("pricing.cardNumber")}
                        </label>
                        <div className="flex items-center gap-2">
                            <div
                                id="payment-card-number"
                                className="flex-1 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)] font-mono text-lg text-[var(--foreground)] text-center tracking-wider"
                            >
                                {CARD_NUMBER}
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyCard}
                                className="btn btn-secondary"
                                title={copied ? t("pricing.copied") : t("pricing.copy")}
                                aria-label={copied ? t("pricing.copied") : t("pricing.copy")}
                            >
                                {copied ? (
                                    <CheckCircle className="w-5 h-5 text-[var(--success-strong)]" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-[var(--foreground-muted)] mt-2 text-center">{CARD_HOLDER}</p>
                        {/* Announced to screen readers when the number is copied */}
                        <span className="sr-only" role="status" aria-live="polite">
                            {copied ? t("pricing.copied") : ""}
                        </span>
                    </div>

                    {/* Telegram Contact */}
                    <div className="p-4 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/20">
                        <div className="flex items-center gap-3 mb-3">
                            <Send className="w-5 h-5 text-[#229ED9]" />
                            <span className="font-medium text-[var(--foreground)]">Отправьте скриншот чека:</span>
                        </div>
                        <a
                            href={`https://t.me/${TELEGRAM_USERNAME.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-lg w-full"
                            style={{ backgroundColor: "#229ED9", color: "white" }}
                        >
                            <MessageCircle className="w-5 h-5" />
                            Открыть Telegram
                        </a>
                        <p className="text-sm text-[var(--foreground-muted)] mt-2 text-center">{TELEGRAM_USERNAME}</p>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
                        <p className="text-sm text-[var(--foreground)]">
                            <strong>Важно!</strong> При отправке скриншота укажите:
                        </p>
                        <ul className="text-sm text-[var(--foreground-secondary)] mt-2 space-y-1">
                            <li>• Ваш email аккаунта</li>
                            <li>• Выбранный тариф ({planName})</li>
                        </ul>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-6 border-t border-[var(--border)] flex gap-2 sm:gap-3">
                    <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                        Закрыть
                    </button>
                    <a href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`} className="btn btn-outline flex-1">
                        <Phone className="w-4 h-4" />
                        Позвонить
                    </a>
                </div>
            </div>
        </div>,
        document.body
    );
}
