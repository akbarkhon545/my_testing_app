"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
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

const faqs = [
    {
        q: "Как начать тестирование?",
        a: "Перейдите в раздел «Тесты», выберите предмет и режим тестирования. После ознакомления с инструкциями нажмите «Начать тест»."
    },
    {
        q: "Чем отличаются режимы тестирования?",
        a: "Тренировочный режим: 25 вопросов за 25 минут, результаты сохраняются. Полный тест: все вопросы без ограничения времени."
    },
    {
        q: "Как изменить свои данные?",
        a: "Перейдите в раздел «Профиль» через меню. Там вы можете изменить имя, телефон, дату рождения и пароль."
    },
    {
        q: "Что делать, если забыл пароль?",
        a: "Свяжитесь с администратором через любой удобный канал связи (Telegram, email или телефон), указанный на этой странице."
    },
    {
        q: "Как связаться с поддержкой?",
        a: "Используйте контакты ниже: Telegram для быстрого ответа, email для подробных вопросов, или позвоните по телефону."
    },
];

export default function SupportPage() {
    const locale = useLocale();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary-light)] mb-4">
                    <HelpCircle className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Поддержка</h1>
                <p className="text-[var(--foreground-secondary)]">
                    Мы готовы помочь вам с любыми вопросами
                </p>
            </div>

            {/* Badges */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
                <div className="badge badge-success flex items-center gap-2 px-4 py-2">
                    <Clock className="w-4 h-4" />
                    24/7 поддержка
                </div>
                <div className="badge badge-primary flex items-center gap-2 px-4 py-2">
                    <Zap className="w-4 h-4" />
                    Быстрый ответ
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
                    <span className="text-xs text-[var(--primary)]">Написать →</span>
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
                    <span className="text-xs text-[#229ED9]">Открыть чат →</span>
                </a>

                <a
                    href="tel:+998931674959"
                    className="card p-6 text-center hover:scale-105 transition-transform group"
                >
                    <div className="w-14 h-14 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--success)] transition-colors">
                        <Phone className="w-6 h-6 text-[var(--success)] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Телефон</h3>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-2">+998 93 167 49 59</p>
                    <span className="text-xs text-[var(--success)]">Позвонить →</span>
                </a>
            </div>

            {/* FAQ Section */}
            <div className="card">
                <div className="card-header">
                    <h2 className="font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Часто задаваемые вопросы
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
                    Вернуться на главную
                </Link>
            </div>
        </div>
    );
}
