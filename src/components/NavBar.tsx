"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  FileQuestion,
  Shield,
  LogIn,
  UserPlus,
  User,
  HelpCircle,
  LogOut,
  ChevronDown,
  Crown
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import supabase from "@/lib/supabase/client";

export default function NavBar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.email?.split("@")[0] || "User");
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.email?.split("@")[0] || "User");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    window.location.href = `/${locale}/auth/login`;
  };

  const navLinks = [
    { href: `/${locale}`, label: t("nav.home"), icon: Home },
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/tests`, label: t("nav.tests"), icon: FileQuestion },
    { href: `/${locale}/pricing`, label: t("nav.pricing"), icon: Crown },
    { href: `/${locale}/admin`, label: t("nav.admin"), icon: Shield },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

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

            {/* User menu or Auth buttons */}
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--border)] transition-all"
                >
                  <div className="avatar w-6 h-6 text-xs">
                    {userName[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">{userName}</span>
                  <ChevronDown className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] shadow-lg z-50 animate-scaleIn">
                      <div className="p-2">
                        <Link
                          href={`/${locale}/profile`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--foreground-secondary)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                        >
                          <User className="w-4 h-4" />
                          Профиль
                        </Link>
                        <Link
                          href={`/${locale}/support`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--foreground-secondary)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                        >
                          <HelpCircle className="w-4 h-4" />
                          Поддержка
                        </Link>
                        <div className="h-px bg-[var(--border)] my-2" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--danger)] hover:bg-[var(--danger-light)] w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Выйти
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href={`/${locale}/auth/login`}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--border)] transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav.login")}</span>
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav.signup")}</span>
                </Link>
              </div>
            )}

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

              {isLoggedIn ? (
                <>
                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--border)]"
                  >
                    <User className="w-5 h-5" />
                    Профиль
                  </Link>
                  <Link
                    href={`/${locale}/support`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--border)]"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Поддержка
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-light)]"
                  >
                    <LogOut className="w-5 h-5" />
                    Выйти
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
