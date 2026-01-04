"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
    Mail,
    Phone,
    Send,
    MessageCircle,
    Clock,
    Zap,
    HelpCircle,
    ChevronDown,
    CheckCircle
} from "lucide-react";

export default function SupportPage() {
    const locale = useLocale();
    const t = useTranslations();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { q: t("support.faq1q"), a: t("support.faq1a") },
        { q: t("support.faq2q"), a: t("support.faq2a") },
        { q: t("support.faq3q"), a: t("support.faq3a") },
        { q: t("support.faq4q"), a: t("support.faq4a") },
        { q: t("support.faq5q"), a: t("support.faq5a") },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary-light)] mb-4">
                    <HelpCircle className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{t("support.title")}</h1>
                <p className="text-[var(--foreground-secondary)]">
                    {t("support.subtitle")}
                </p>
            </div>

            {/* Badges */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
                <div className="badge badge-success flex items-center gap-2 px-4 py-2">
                    <Clock className="w-4 h-4" />
                    {t("support.support247")}
                </div>
                <div className="badge badge-primary flex items-center gap-2 px-4 py-2">
                    <Zap className="w-4 h-4" />
                    {t("support.fastResponse")}
                </div>
            </div>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <a
                    href="mailto:akbarkhon545@gmail.com"
                    className="card p-6 text-center hover:scale-105 transition-transform group"
                >
                    <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--primary)] transition-colors">
                        <Mail className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Email</h3>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-2">akbarkhon545@gmail.com</p>
                    <span className="text-xs text-[var(--primary)]">{t("support.write")}</span>
                </a>

                <a
                    href="https://t.me/akbarkhonfakhriddinov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card p-6 text-center hover:scale-105 transition-transform group"
                >
                    <div className="w-14 h-14 rounded-full bg-[#229ED9]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#229ED9] transition-colors">
                        <Send className="w-6 h-6 text-[#229ED9] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Telegram</h3>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-2">@akbarkhonfakhriddinov</p>
                    <span className="text-xs text-[#229ED9]">{t("support.openChat")}</span>
                </a>

                <a
                    href="tel:+998931674959"
                    className="card p-6 text-center hover:scale-105 transition-transform group"
                >
                    <div className="w-14 h-14 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--success)] transition-colors">
                        <Phone className="w-6 h-6 text-[var(--success)] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{t("support.phone")}</h3>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-2">+998 93 167 49 59</p>
                    <span className="text-xs text-[var(--success)]">{t("support.call")}</span>
                </a>
            </div>

            {/* FAQ Section */}
            <div className="card">
                <div className="card-header">
                    <h2 className="font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        {t("support.faq")}
                    </h2>
                </div>
                <div className="card-body p-0">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border-b border-[var(--border)] last:border-0">
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--border)]/30 transition-colors"
                            >
                                <span className="font-medium text-[var(--foreground)]">{faq.q}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${openFaq === idx ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {openFaq === idx && (
                                <div className="px-4 pb-4 text-[var(--foreground-secondary)] animate-fadeIn">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Back link */}
            <div className="text-center mt-8">
                <Link href={`/${locale}/dashboard`} className="btn btn-secondary">
                    {t("support.backToMain")}
                </Link>
            </div>
        </div>
    );
}
