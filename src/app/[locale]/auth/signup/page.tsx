"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Mail, Lock, UserPlus, Eye, EyeOff, Sparkles, Check } from "lucide-react";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string().min(8, "Минимум 8 символов"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  const passwordChecks = [
    { label: "Минимум 8 символов", valid: password.length >= 8 },
    { label: "Содержит цифру", valid: /\d/.test(password) },
    { label: "Содержит букву", valid: /[a-zA-Z]/.test(password) },
  ];

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
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
              <p className="text-white/80 text-sm">Создайте аккаунт для начала</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 text-center">
              {t("signup")}
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

                {/* Password strength indicators */}
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3 h-3 ${check.valid ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"}`} />
                      <span className={check.valid ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>

                {errors.password && (
                  <p className="text-sm text-[var(--danger)] mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">Подтверждение пароля</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-[var(--danger)] mt-1">{errors.confirmPassword.message}</p>
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
                  <span>Создание аккаунта...</span>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    {t("signup")}
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--foreground-secondary)]">
              {t("haveAccount")}{" "}
              <Link href={`/${locale}/auth/login`} className="text-[var(--primary)] hover:underline font-medium">
                {t("signin")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
