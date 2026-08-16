"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";
import { getSubjectById } from "@/app/actions/admin";
import { getTestQuestions, submitTest, type SafeQuestion, type TestSummary } from "@/app/actions/tests";

type Subject = {
  id: number;
  name: string;
};

export default function SubjectTestPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();

  const subjectIdStr = (params?.subjectId as string) || "";
  const subjectId = useMemo(() => Number(subjectIdStr), [subjectIdStr]);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<SafeQuestion[]>([]);
  const [ticket, setTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"training" | "full">("training");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // questionId -> selected option text
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!subjectId || Number.isNaN(subjectId)) {
        setError("Неверный предмет");
        setLoading(false);
        return;
      }

      // Require auth and an active subscription (also enforced server-side)
      const profile = await getUserProfile();
      if (!profile) {
        router.replace(`/${locale}/auth/login`);
        return;
      }
      if (!profile.hasTestAccess) {
        router.replace(`/${locale}/pricing`);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const [subjData, test] = await Promise.all([
          getSubjectById(subjectId),
          getTestQuestions(subjectId, mode),
        ]);

        if (!subjData) {
          setError("Предмет не найден");
          setLoading(false);
          return;
        }
        setSubject(subjData);
        setQuestions(test.questions);
        setTicket(test.ticket);
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки");
      }
      setLoading(false);
    })();
  }, [subjectId, router, locale, mode]);

  const total = questions.length;
  const current = questions[currentIndex];

  const selectAnswer = (option: string) => {
    if (!current) return;
    setAnswersMap((prev) => ({ ...prev, [current.id]: option }));
  };

  const startTest = () => {
    setStarted(true);
    startedAt.current = Date.now();
  };

  const next = () => {
    if (!current) return;
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    if (finished || !ticket) return;
    setFinished(true);

    const seconds = (() => {
      const start = startedAt.current;
      if (!start) return 0;
      return Math.max(0, Math.round((Date.now() - start) / 1000));
    })();

    try {
      // The server grades the test and stores the result for the session user.
      const result = await submitTest({
        ticket,
        answers: answersMap,
        totalTime: seconds,
      });
      setSummary(result);
    } catch (err: any) {
      console.error("Error submitting test:", err);
      setError(err.message || "Не удалось сохранить результат");
    }
  };

  if (loading) return <div className="text-sm text-[var(--foreground-secondary)]">Загрузка...</div>;
  if (error) return <div className="text-sm text-[var(--danger-strong)]">{error}</div>;
  if (!subject) return <div className="text-sm text-[var(--foreground-secondary)]">Предмет не найден</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Тест: {subject.name}</h1>
        {!started && (
          <p className="text-[var(--foreground-secondary)] mt-1">Выберите режим и начните тест</p>
        )}
      </div>

      {!started ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === "training"}
                onChange={() => setMode("training")}
              />
              Тренировка
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === "full"}
                onChange={() => setMode("full")}
              />
              Экзамен
            </label>
          </div>
          <button
            onClick={startTest}
            disabled={total === 0}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            Начать
          </button>
          {total === 0 && (
            <p className="text-sm text-[var(--foreground-secondary)]">Для этого предмета нет вопросов</p>
          )}
        </div>
      ) : !finished ? (
        <div className="space-y-4">
          <div className="text-sm text-[var(--foreground-secondary)]">
            Вопрос {currentIndex + 1} из {total}
          </div>
          <div className="text-base font-medium">{current?.question_text}</div>
          <div className="space-y-2">
            {current?.options.map((ans, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={answersMap[current.id] === ans}
                  onChange={() => selectAnswer(ans)}
                />
                {ans}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={next}
              disabled={!current || answersMap[current.id] === undefined}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {currentIndex === total - 1 ? "Завершить" : "Далее"}
            </button>
          </div>
        </div>
      ) : (
        <ResultsView
          summary={summary}
          onExit={() => router.push(`/${locale}/tests`)}
        />
      )}
    </div>
  );
}

function ResultsView({
  summary,
  onExit,
}: {
  summary: TestSummary | null;
  onExit: () => void;
}) {
  if (!summary) {
    return <div className="text-sm text-[var(--foreground-secondary)]">Подсчёт результата...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Результат</h2>
        <p className="text-sm text-[var(--foreground-secondary)]">
          Верных ответов: {summary.correct} из {summary.total} ({summary.score}%)
        </p>
      </div>
      <button
        onClick={onExit}
        className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-[var(--border)]/40"
      >
        Вернуться к выбору предмета
      </button>
    </div>
  );
}
