"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";

type Subject = {
  id: number;
  name: string;
};

type Question = {
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

export default function QuestionsAdmin() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subjectId, setSubjectId] = useState<number | "">("");
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [answer4, setAnswer4] = useState("");
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSubjectId, setEditSubjectId] = useState<number | "">("");
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editAnswer2, setEditAnswer2] = useState("");
  const [editAnswer3, setEditAnswer3] = useState("");
  const [editAnswer4, setEditAnswer4] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    const [subjRes, qRes] = await Promise.all([
      supabase.from("subjects").select("id, name").order("name"),
      supabase
        .from("questions")
        .select(
          "id, subject_id, question_text, correct_answer, answer2, answer3, answer4, explanation, created_at"
        )
        .order("created_at", { ascending: false }),
    ]);
    if (subjRes.error) setError(subjRes.error.message);
    if (qRes.error) setError(qRes.error.message);
    setSubjects(subjRes.data ?? []);
    setQuestions(qRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addQuestion = async () => {
    if (
      !subjectId ||
      !questionText.trim() ||
      !correctAnswer.trim() ||
      !answer2.trim() ||
      !answer3.trim() ||
      !answer4.trim()
    )
      return;

    setSaving(true);
    setError(null);
    const { error } = await supabase.from("questions").insert({
      subject_id: Number(subjectId),
      question_text: questionText.trim(),
      correct_answer: correctAnswer.trim(),
      answer2: answer2.trim(),
      answer3: answer3.trim(),
      answer4: answer4.trim(),
      explanation: explanation.trim() || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    // reset
    setSubjectId("");
    setQuestionText("");
    setCorrectAnswer("");
    setAnswer2("");
    setAnswer3("");
    setAnswer4("");
    setExplanation("");
    await load();
  };

  const removeQuestion = async (id: number) => {
    setError(null);
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditSubjectId(q.subject_id);
    setEditQuestionText(q.question_text);
    setEditCorrectAnswer(q.correct_answer);
    setEditAnswer2(q.answer2);
    setEditAnswer3(q.answer3);
    setEditAnswer4(q.answer4);
    setEditExplanation(q.explanation || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSubjectId("");
    setEditQuestionText("");
    setEditCorrectAnswer("");
    setEditAnswer2("");
    setEditAnswer3("");
    setEditAnswer4("");
    setEditExplanation("");
  };

  const saveEdit = async () => {
    if (
      !editingId ||
      !editSubjectId ||
      !editQuestionText.trim() ||
      !editCorrectAnswer.trim() ||
      !editAnswer2.trim() ||
      !editAnswer3.trim() ||
      !editAnswer4.trim()
    )
      return;

    setError(null);
    setSavingEdit(true);
    const { error } = await supabase
      .from("questions")
      .update({
        subject_id: Number(editSubjectId),
        question_text: editQuestionText.trim(),
        correct_answer: editCorrectAnswer.trim(),
        answer2: editAnswer2.trim(),
        answer3: editAnswer3.trim(),
        answer4: editAnswer4.trim(),
        explanation: editExplanation.trim() || null,
      })
      .eq("id", editingId);
    setSavingEdit(false);
    if (error) {
      setError(error.message);
      return;
    }
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingId
          ? {
              ...q,
              subject_id: Number(editSubjectId),
              question_text: editQuestionText.trim(),
              correct_answer: editCorrectAnswer.trim(),
              answer2: editAnswer2.trim(),
              answer3: editAnswer3.trim(),
              answer4: editAnswer4.trim(),
              explanation: editExplanation.trim() || null,
            }
          : q
      )
    );
    cancelEdit();
  };

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name || "-";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Вопросы</h2>
        <p className="text-gray-600 text-sm">Добавляйте вопросы для предметов</p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-2">
          <select
            value={subjectId as any}
            onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">Выберите предмет</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Текст вопроса"
            className="w-full min-h-[90px] rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="Правильный ответ"
            className="w-full rounded-md border px-3 py-2"
          />
          <input
            value={answer2}
            onChange={(e) => setAnswer2(e.target.value)}
            placeholder="Вариант ответа 2"
            className="w-full rounded-md border px-3 py-2"
          />
          <input
            value={answer3}
            onChange={(e) => setAnswer3(e.target.value)}
            placeholder="Вариант ответа 3"
            className="w-full rounded-md border px-3 py-2"
          />
          <input
            value={answer4}
            onChange={(e) => setAnswer4(e.target.value)}
            placeholder="Вариант ответа 4"
            className="w-full rounded-md border px-3 py-2"
          />

          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Пояснение (необязательно)"
            className="w-full min-h-[70px] rounded-md border px-3 py-2"
          />

          <button
            onClick={addQuestion}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "..." : "Добавить вопрос"}
          </button>
        </div>

        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="text-sm text-gray-600">Загрузка...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-600">Пока нет вопросов</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {questions.map((q) => (
                <li key={q.id} className="px-4 py-3 space-y-2">
                  {editingId === q.id ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={editSubjectId as any}
                          onChange={(e) =>
                            setEditSubjectId(e.target.value ? Number(e.target.value) : "")
                          }
                          className="w-full max-w-xs rounded-md border px-3 py-2"
                        >
                          <option value="">Выберите предмет</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={editQuestionText}
                          onChange={(e) => setEditQuestionText(e.target.value)}
                          placeholder="Текст вопроса"
                          className="w-full min-h-[90px] rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          value={editCorrectAnswer}
                          onChange={(e) => setEditCorrectAnswer(e.target.value)}
                          placeholder="Правильный ответ"
                          className="w-full rounded-md border px-3 py-2"
                        />
                        <input
                          value={editAnswer2}
                          onChange={(e) => setEditAnswer2(e.target.value)}
                          placeholder="Вариант ответа 2"
                          className="w-full rounded-md border px-3 py-2"
                        />
                        <input
                          value={editAnswer3}
                          onChange={(e) => setEditAnswer3(e.target.value)}
                          placeholder="Вариант ответа 3"
                          className="w-full rounded-md border px-3 py-2"
                        />
                        <input
                          value={editAnswer4}
                          onChange={(e) => setEditAnswer4(e.target.value)}
                          placeholder="Вариант ответа 4"
                          className="w-full rounded-md border px-3 py-2"
                        />
                        <textarea
                          value={editExplanation}
                          onChange={(e) => setEditExplanation(e.target.value)}
                          placeholder="Пояснение (необязательно)"
                          className="w-full min-h-[70px] rounded-md border px-3 py-2"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={savingEdit}
                          className="inline-flex h-8 items-center justify-center rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-gray-50"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Предмет: <span className="font-medium">{subjectName(q.subject_id)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(q)}
                            className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-gray-50"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-gray-50"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                      <p className="font-medium">{q.question_text}</p>
                      <div className="text-xs text-gray-600">
                        <div>Правильный: {q.correct_answer}</div>
                        <div>Вар. 2: {q.answer2}</div>
                        <div>Вар. 3: {q.answer3}</div>
                        <div>Вар. 4: {q.answer4}</div>
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-gray-500">Пояснение: {q.explanation}</p>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
