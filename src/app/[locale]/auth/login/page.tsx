"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, MessageCircle, Phone, Send } from "lucide-react";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-center">
            {/* Decorations */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">EduPlatform</h1>
              <p className="text-white/80 text-sm">Платформа для тестирования знаний</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 text-center">
              {t("signin")}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none z-10" />
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="name@example.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-[var(--danger)] mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t("password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-[var(--danger)] mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="alert alert-danger">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <span>Загрузка...</span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t("signin")}
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--foreground-secondary)]">
              {t("noAccount")}{" "}
              <Link href={`/${locale}/auth/signup`} className="text-[var(--primary)] hover:underline font-medium">
                {t("signup")}
              </Link>
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-6 p-6 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
          <p className="text-center text-sm text-[var(--foreground-secondary)] mb-4">
            Возникли проблемы со входом? Наша поддержка готова помочь
          </p>

          <div className="grid grid-cols-3 gap-3">
            <a
              href="mailto:akbarkhon545@gmail.com"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <Mail className="w-5 h-5 text-[var(--primary)] mb-2" />
              <span className="text-xs text-[var(--foreground-secondary)]">Email</span>
            </a>

            <a
              href="https://t.me/akbarkhonfakhriddinov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <Send className="w-5 h-5 text-[#0088cc] mb-2" />
              <span className="text-xs text-[var(--foreground-secondary)]">Telegram</span>
            </a>

            <a
              href="tel:+998931674959"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <Phone className="w-5 h-5 text-[var(--success)] mb-2" />
              <span className="text-xs text-[var(--foreground-secondary)]">Телефон</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
