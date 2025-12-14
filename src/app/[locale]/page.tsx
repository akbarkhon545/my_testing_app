"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  BookOpen,
  Award,
  BarChart3,
  Users,
  Globe
} from "lucide-react";

export default function HomePage() {
  const t = useTranslations("hero");
  const locale = useLocale();

  const features = [
    {
      icon: BookOpen,
      title: "Разнообразные предметы",
      description: "Широкий выбор тестов по различным дисциплинам",
    },
    {
      icon: Award,
      title: "Два режима тестирования",
      description: "Тренировка с таймером или полный тест без ограничений",
    },
    {
      icon: BarChart3,
      title: "Отслеживание прогресса",
      description: "Детальная статистика ваших результатов",
    },
    {
      icon: Globe,
      title: "Мультиязычность",
      description: "Поддержка русского и узбекского языков",
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)] via-indigo-600 to-[var(--secondary)] p-8 md:p-12 mb-12">
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Платформа для тестирования знаний
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t("title")}
          </h1>

          <p className="text-lg text-white/80 mb-8">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-[var(--primary)] font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t("cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/tests`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-all border border-white/30"
            >
              Начать тестирование
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          Возможности платформы
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="card p-6 text-center hover:scale-105 transition-transform"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary-light)] mb-4">
                  <Icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          Как это работает
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Выберите предмет", desc: "Найдите нужную дисциплину в каталоге" },
            { step: "2", title: "Пройдите тест", desc: "Ответьте на вопросы в удобном режиме" },
            { step: "3", title: "Анализируйте результаты", desc: "Отслеживайте свой прогресс" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border)]"
            >
              <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2 mt-2">{item.title}</h3>
              <p className="text-sm text-[var(--foreground-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center p-8 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border)]">
        <Users className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Присоединяйтесь к платформе
        </h2>
        <p className="text-[var(--foreground-secondary)] mb-6 max-w-md mx-auto">
          Начните отслеживать свой прогресс и улучшать свои знания уже сегодня
        </p>
        <Link
          href={`/${locale}/auth/signup`}
          className="btn btn-primary btn-lg inline-flex"
        >
          Зарегистрироваться
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
