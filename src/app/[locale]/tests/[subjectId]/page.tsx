"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { getUserSession } from "@/app/actions/auth";
import { getSubjectById, getQuestionsBySubject, saveTestResult } from "@/app/actions/admin";

type Subject = {
  id: number;
  name: string;
};

type QuestionRow = {
  id: number;
  subject_id: number;
  question_text: string;
  correct_answer: string;
  answer2: string;
  answer3: string;
  answer4: string;
  explanation: string | null;
  created_at: string;
};

type PreparedQuestion = {
  id: number;
  text: string;
  answers: string[];
  correctIndex: number;
  explanation: string | null;
};

function shuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SubjectTestPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();

  const subjectIdStr = (params?.subjectId as string) || "";
  const subjectId = useMemo(() => Number(subjectIdStr), [subjectIdStr]);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"training" | "exam">("training");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<number, number>>({});
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!subjectId || Number.isNaN(subjectId)) {
        setError("Неверный предмет");
        setLoading(false);
        return;
      }

      // Require auth
      const user = await getUserSession();
      if (!user) {
        router.replace(`/${locale}/auth/login`);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const [subjData, questionsData] = await Promise.all([
          getSubjectById(subjectId),
          getQuestionsBySubject(subjectId)
        ]);

        if (!subjData) {
          setError("Предмет не найден");
          setLoading(false);
          return;
        }
        setSubject(subjData);

        const prepared: PreparedQuestion[] = questionsData.map((row: any) => {
          const options = [
            { text: row.correct_answer, correct: true },
            { text: row.answer2, correct: false },
            { text: row.answer3, correct: false },
            { text: row.answer4, correct: false },
          ];
          const shuffled = shuffle(options);
          const correctIndex = shuffled.findIndex((o) => o.correct);
          return {
            id: row.id,
            text: row.question_text,
            answers: shuffled.map((o) => o.text),
            correctIndex,
            explanation: row.explanation,
          };
        });

        setQuestions(shuffle(prepared));
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки");
      }
      setLoading(false);
    })();
  }, [subjectId, router, locale]);

  const total = questions.length;
  const current = questions[currentIndex];

  const selectAnswer = (idx: number) => {
    if (!current) return;
    setAnswersMap((prev) => ({ ...prev, [current.id]: idx }));
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
    if (finished) return;
    setFinished(true);

    console.log("=== FINISHING TEST ===");

    const correctCount = questions.reduce((acc, q) => {
      const chosen = answersMap[q.id];
      return acc + (chosen === q.correctIndex ? 1 : 0);
    }, 0);

    const seconds = (() => {
      const start = startedAt.current;
      if (!start) return 0;
      return Math.max(0, Math.round((Date.now() - start) / 1000));
    })();

    console.log("Correct count:", correctCount);
    console.log("Total questions:", total);
    console.log("Subject ID:", subjectId);
    console.log("Mode:", mode);
    console.log("Time:", seconds);

    const user = await getUserSession();

    if (!user) {
      console.error("No user! Cannot save result.");
      return;
    }

    const resultData = {
      userId: user.id,
      subjectId: subjectId,
      score: correctCount,
      totalQuestions: total,
      correctCount: correctCount,
      totalTime: seconds,
      mode: mode.toUpperCase() as "TRAINING" | "EXAM",
    };

    try {
      await saveTestResult(resultData);
      console.log("✅ Test result saved successfully!");
    } catch (err: any) {
      console.error("Error saving test result:", err);
      setError(err.message);
    }
  };

  if (loading) return <div className="text-sm text-gray-600">Загрузка...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!subject) return <div className="text-sm text-gray-600">Предмет не найден</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Тест: {subject.name}</h1>
        {!started && (
          <p className="text-gray-600 mt-1">Выберите режим и начните тест</p>
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
                checked={mode === "exam"}
                onChange={() => setMode("exam")}
              />
              Экзамен
            </label>
          </div>
          <button
            onClick={startTest}
            disabled={total === 0}
            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Начать
          </button>
          {total === 0 && (
            <p className="text-sm text-gray-600">Для этого предмета нет вопросов</p>
          )}
        </div>
      ) : !finished ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Вопрос {currentIndex + 1} из {total}
          </div>
          <div className="text-base font-medium">{current?.text}</div>
          <div className="space-y-2">
            {current?.answers.map((ans, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={answersMap[current.id] === i}
                  onChange={() => selectAnswer(i)}
                />
                {ans}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={next}
              disabled={answersMap[current.id] === undefined}
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {currentIndex === total - 1 ? "Завершить" : "Далее"}
            </button>
          </div>
        </div>
      ) : (
        <ResultsView
          questions={questions}
          answersMap={answersMap}
          onExit={() => router.push(`/${locale}/tests`)}
        />
      )}
    </div>
  );
}

function ResultsView({
  questions,
  answersMap,
  onExit,
}: {
  questions: PreparedQuestion[];
  answersMap: Record<number, number>;
  onExit: () => void;
}) {
  const total = questions.length;
  const correct = questions.reduce((acc, q) => acc + (answersMap[q.id] === q.correctIndex ? 1 : 0), 0);
  const percent = total ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Результат</h2>
        <p className="text-sm text-gray-600">
          Верных ответов: {correct} из {total} ({percent}%)
        </p>
      </div>
      <button
        onClick={onExit}
        className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-gray-50"
      >
        Вернуться к выбору предмета
      </button>
    </div>
  );
}
