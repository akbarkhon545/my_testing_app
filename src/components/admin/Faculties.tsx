"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";

type Faculty = {
  id: number;
  name: string;
  created_at: string;
};

export default function FacultiesAdmin() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from("faculties")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setFaculties(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addFaculty = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("faculties")
      .insert({ name: newName.trim() });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNewName("");
    await load();
  };

  const removeFaculty = async (id: number) => {
    setError(null);
    const { error } = await supabase.from("faculties").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setFaculties((prev) => prev.filter((f) => f.id !== id));
  };

  const startEdit = (f: Faculty) => {
    setEditingId(f.id);
    setEditName(f.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setError(null);
    setSaving(true);
    const { error } = await supabase
      .from("faculties")
      .update({ name: editName.trim() })
      .eq("id", editingId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFaculties((prev) =>
      prev.map((f) => (f.id === editingId ? { ...f, name: editName.trim() } : f))
    );
    cancelEdit();
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Факультеты</h2>
        <p className="text-gray-600 text-sm">Создавайте и управляйте факультетами</p>
      </div>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название факультета"
          className="w-full max-w-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addFaculty}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "..." : "Добавить"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-600">Загрузка...</p>
      ) : faculties.length === 0 ? (
        <p className="text-sm text-gray-600">Пока нет факультетов</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {faculties.map((f) => (
            <li key={f.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                {editingId === f.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full max-w-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">ID: {f.id}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingId === f.id ? (
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
                      onClick={() => startEdit(f)}
                      className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-gray-50"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => removeFaculty(f.id)}
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
