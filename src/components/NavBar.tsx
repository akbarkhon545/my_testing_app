"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Home, LayoutDashboard, FileQuestion, Shield, LogIn, UserPlus } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t("nav.home"), icon: Home },
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/tests`, label: t("nav.tests"), icon: FileQuestion },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 bg-[var(--background-secondary)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-bold text-xl text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline">{t("brand")}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--foreground-secondary)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Auth buttons - desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={`/${locale}/auth/login`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--border)] transition-all"
              >
                <LogIn className="w-4 h-4" />
                {t("nav.login")}
              </Link>
              <Link
                href={`/${locale}/auth/signup`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all"
              >
                <UserPlus className="w-4 h-4" />
                {t("nav.signup")}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--border)] transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-[var(--foreground)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--foreground)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border)] animate-fadeIn">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                        ? "bg-[var(--primary-light)] text-[var(--primary)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--border)]"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="h-px bg-[var(--border)] my-2" />

              <Link
                href={`/${locale}/auth/login`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--border)]"
              >
                <LogIn className="w-5 h-5" />
                {t("nav.login")}
              </Link>
              <Link
                href={`/${locale}/auth/signup`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
              >
                <UserPlus className="w-5 h-5" />
                {t("nav.signup")}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
