"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { FileQuestion, Mail, Send, Phone, Heart } from "lucide-react";
import { getUserSession } from "@/app/actions/auth";

export default function Footer() {
    const locale = useLocale();
    const t = useTranslations();
    const currentYear = new Date().getFullYear();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUserSession();
            setIsLoggedIn(!!user);
        };
        checkAuth();
    }, []);

    return (
        <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background-secondary)]">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link href={isLoggedIn ? `/${locale}/dashboard` : `/${locale}`} className="flex items-center gap-2 mb-4">
                            <Image src="/logo.png" alt="EduPlatform" width={32} height={32} className="w-8 h-8 rounded-lg object-contain" />
                            <span className="font-bold text-lg text-[var(--foreground)]">EduPlatform</span>
                        </Link>
                        <p className="text-sm text-[var(--foreground-secondary)]">
                            {t("footer.description")}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-4">{t("footer.quickLinks")}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href={`/${locale}/tests`} className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    {t("nav.tests")}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/dashboard`} className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    {t("nav.dashboard")}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/support`} className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    {t("nav.support")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-4">{t("footer.contacts")}</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:akbarkhon545@gmail.com" className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    <Mail className="w-4 h-4" />
                                    akbarkhon545@gmail.com
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/akbarkhonfakhriddinov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    <Send className="w-4 h-4" />
                                    Telegram
                                </a>
                            </li>
                            <li>
                                <a href="tel:+998931674959" className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    <Phone className="w-4 h-4" />
                                    +998 93 167 49 59
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-4">{t("footer.information")}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href={`/${locale}/support`} className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)]">
                                    {t("footer.faq")}
                                </Link>
                            </li>
                            <li>
                                <span className="text-sm text-[var(--foreground-muted)]">
                                    {t("footer.version")} 1.0.0
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--foreground-muted)]">
                        © {currentYear} EduPlatform. {t("footer.allRights")}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                        {t("footer.madeWith")} <Heart className="w-4 h-4 text-red-500" /> {t("footer.inUzbekistan")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
