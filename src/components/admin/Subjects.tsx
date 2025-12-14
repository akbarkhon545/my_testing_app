"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";

type Faculty = {
  id: number;
  name: string;
};

type Subject = {
  id: number;
  name: string;
  faculty_id: number;
  created_at: string;
};

export default function SubjectsAdmin() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newFacultyId, setNewFacultyId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editFacultyId, setEditFacultyId] = useState<number | "">("");

  const load = async () => {
    setError(null);
    setLoading(true);
    const [facRes, subjRes] = await Promise.all([
      supabase.from("faculties").select("id, name").order("name"),
      supabase
        .from("subjects")
        .select("id, name, faculty_id, created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (facRes.error) setError(facRes.error.message);
    if (subjRes.error) setError(subjRes.error.message);
    setFaculties(facRes.data ?? []);
    setSubjects(subjRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addSubject = async () => {
    if (!newName.trim() || !newFacultyId) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("subjects")
      .insert({ name: newName.trim(), faculty_id: Number(newFacultyId) });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNewName("");
    setNewFacultyId("");
    await load();
  };

  const removeSubject = async (id: number) => {
    setError(null);
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const startEdit = (s: Subject) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditFacultyId(s.faculty_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditFacultyId("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editFacultyId) return;
    setError(null);
    setSaving(true);
    const { error } = await supabase
      .from("subjects")
      .update({ name: editName.trim(), faculty_id: Number(editFacultyId) })
      .eq("id", editingId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === editingId
          ? { ...s, name: editName.trim(), faculty_id: Number(editFacultyId) }
          : s
      )
    );
    cancelEdit();
  };

  const facName = (id: number) => faculties.find((f) => f.id === id)?.name || "-";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Предметы</h2>
        <p className="text-gray-600 text-sm">Создавайте и управляйте предметами</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название предмета"
          className="w-full max-w-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={newFacultyId as any}
          onChange={(e) => setNewFacultyId(e.target.value ? Number(e.target.value) : "")}
          className="w-full max-w-xs rounded-md border px-3 py-2"
        >
          <option value="">Выберите факультет</option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <button
          onClick={addSubject}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "..." : "Добавить"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-600">Загрузка...</p>
      ) : subjects.length === 0 ? (
        <p className="text-sm text-gray-600">Пока нет предметов</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {subjects.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                {editingId === s.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Название предмета"
                      className="w-full max-w-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={editFacultyId as any}
                      onChange={(e) =>
                        setEditFacultyId(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full max-w-xs rounded-md border px-3 py-2"
                    >
                      <option value="">Выберите факультет</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">Факультет: {facName(s.faculty_id)}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingId === s.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
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
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(s)}
                      className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-gray-50"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => removeSubject(s.id)}
                      className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-gray-50"
                    >
                      Удалить
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
