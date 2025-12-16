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
  Globe,
  Crown,
  Star,
  Check
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
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a3a4a] via-[#3a4a5a] to-[#4a5a6a] p-8 md:p-12 mb-12">
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#4fc8e8]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#5a7a94]/30 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
            <Sparkles className="w-4 h-4 text-[#4fc8e8]" />
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-[#3a4a5a] font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t("cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/tests`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#4fc8e8]/20 font-semibold hover:bg-[#4fc8e8]/30 transition-all border border-[#4fc8e8]/50"
              style={{ color: '#ffffff' }}
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

      {/* Pricing Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-sm font-medium mb-4">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-[var(--foreground)]">Доступные тарифы</span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Выберите подписку
          </h2>
          <p className="text-[var(--foreground-secondary)]">
            Получите полный доступ ко всем тестам и возможностям
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div className="card p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
                <Star className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Месячная</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Гибкий выбор</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-[var(--foreground)]">24 990</span>
              <span className="text-[var(--foreground-secondary)]"> сум/месяц</span>
            </div>
            <ul className="space-y-2 mb-6">
              {["Неограниченные тесты", "Полная статистика", "Приоритетная поддержка"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                  <Check className="w-4 h-4 text-[var(--success)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/pricing`} className="btn btn-outline w-full">
              Выбрать
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="card p-6 border-2 border-[var(--primary)] hover:scale-[1.02] transition-transform relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-medium">
                Выгодно!
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Годовая</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Лучший выбор</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-[var(--foreground)]">44 990</span>
              <span className="text-[var(--foreground-secondary)]"> сум/год</span>
            </div>
            <ul className="space-y-2 mb-6">
              {["Все преимущества месячной", "Эксклюзивные материалы", "Приоритетная поддержка 24/7"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                  <Check className="w-4 h-4 text-[var(--success)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/pricing`} className="btn btn-primary w-full">
              <Crown className="w-4 h-4" />
              Выбрать
            </Link>
          </div>
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
