"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import supabase from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";

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
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        router.replace(`/${locale}/auth/login`);
        return;
      }

      setError(null);
      setLoading(true);
      const [subjRes, qRes] = await Promise.all([
        supabase.from("subjects").select("id, name").eq("id", subjectId).single(),
        supabase
          .from("questions")
          .select(
            "id, subject_id, question_text, correct_answer, answer2, answer3, answer4, explanation, created_at"
          )
          .eq("subject_id", subjectId),
      ]);

      if (subjRes.error) {
        setError(subjRes.error.message);
        setLoading(false);
        return;
      }
      setSubject(subjRes.data);

      if (qRes.error) {
        setError(qRes.error.message);
        setLoading(false);
        return;
      }

      const prepared: PreparedQuestion[] = (qRes.data as QuestionRow[]).map((row) => {
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

      // Optionally limit number of questions for exam mode later
      setQuestions(shuffle(prepared));
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

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    console.log("Session:", session ? "exists" : "null");

    if (!session) {
      console.error("No session! Cannot save result.");
      return;
    }

    console.log("User ID:", session.user.id);

    const insertData = {
      user_id: session.user.id,
      subject_id: subjectId,
      mode,
      score: correctCount,
      total_questions: total,
      correct_count: correctCount,
      total_time: seconds,
    };

    console.log("Inserting data:", insertData);

    // Save result
    const { data, error: insertErr } = await supabase
      .from("test_results")
      .insert(insertData)
      .select();

    console.log("Insert response:", { data, error: insertErr });

    if (insertErr) {
      console.error("Error saving test result:", insertErr);
      setError(insertErr.message);
    } else {
      console.log("✅ Test result saved successfully!", data);
    }

    // Save history (best-effort)
    try {
      const qIds = questions.map((q) => ({ user_id: session.user.id, question_id: q.id }));
      await supabase.from("user_question_history").insert(qIds);
    } catch (_) {
      // ignore
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
