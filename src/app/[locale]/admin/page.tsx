"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Users,
  Settings,
  LayoutDashboard,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Save,
  Shield,
  FileUp
} from "lucide-react";

type Tab = "faculties" | "subjects" | "questions" | "users";

// Mock data
const mockFaculties = [
  { id: 1, name: "Информатика", subjects_count: 3 },
  { id: 2, name: "Математика и физика", subjects_count: 2 },
  { id: 3, name: "Языки", subjects_count: 4 },
];

const mockSubjects = [
  { id: 1, name: "Python программирование", faculty_id: 1, faculty_name: "Информатика", questions_count: 50 },
  { id: 2, name: "Базы данных", faculty_id: 1, faculty_name: "Информатика", questions_count: 30 },
  { id: 3, name: "Алгебра", faculty_id: 2, faculty_name: "Математика и физика", questions_count: 45 },
];

const mockQuestions = [
  { id: 1, question_text: "Какой оператор используется для присваивания?", subject_name: "Python" },
  { id: 2, question_text: "Что такое список в Python?", subject_name: "Python" },
  { id: 3, question_text: "Как объявить функцию?", subject_name: "Python" },
];

const mockUsers = [
  { id: 1, name: "Иванов Иван", email: "ivanov@example.com", role: "student", active: true },
  { id: 2, name: "Петрова Анна", email: "petrova@example.com", role: "manager", active: true },
  { id: 3, name: "Админ", email: "admin@example.com", role: "admin", active: true },
];

export default function AdminPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>("faculties");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("student");
  const [formFacultyId, setFormFacultyId] = useState("");

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: "faculties", label: "Факультеты", icon: GraduationCap, count: mockFaculties.length },
    { id: "subjects", label: "Предметы", icon: BookOpen, count: mockSubjects.length },
    { id: "questions", label: "Вопросы", icon: HelpCircle, count: mockQuestions.length },
    { id: "users", label: "Пользователи", icon: Users, count: mockUsers.length },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormEmail("");
    setFormRole("student");
    setFormFacultyId("");
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormEmail(item.email || "");
    setFormRole(item.role || "student");
    setFormFacultyId(item.faculty_id || "");
    setShowModal(true);
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    console.log("Saving:", { formName, formEmail, formRole, formFacultyId });
    setShowModal(false);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      admin: "badge-danger",
      manager: "badge-warning",
      student: "badge-primary",
    };
    const labels: Record<string, string> = {
      admin: "Админ",
      manager: "Менеджер",
      student: "Студент",
    };
    return <span className={`badge ${badges[role] || "badge-primary"}`}>{labels[role] || role}</span>;
  };

  const renderFaculties = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">ID</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Название</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Предметов</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
          </tr>
        </thead>
        <tbody>
          {mockFaculties.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(faculty => (
            <tr key={faculty.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
              <td className="py-3 px-4 text-[var(--foreground-muted)]">{faculty.id}</td>
              <td className="py-3 px-4 font-medium text-[var(--foreground)]">{faculty.name}</td>
              <td className="py-3 px-4 text-center">
                <span className="badge badge-primary">{faculty.subjects_count}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleEdit(faculty)} className="btn btn-sm btn-secondary mr-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSubjects = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Название</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Факультет</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Вопросов</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
          </tr>
        </thead>
        <tbody>
          {mockSubjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(subject => (
            <tr key={subject.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
              <td className="py-3 px-4 font-medium text-[var(--foreground)]">{subject.name}</td>
              <td className="py-3 px-4 text-[var(--foreground-secondary)]">{subject.faculty_name}</td>
              <td className="py-3 px-4 text-center">
                <span className="badge badge-success">{subject.questions_count}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleEdit(subject)} className="btn btn-sm btn-secondary mr-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderQuestions = () => (
    <div>
      <div className="flex gap-2 mb-4">
        <Link href={`/${locale}/admin/upload`} className="btn btn-success">
          <FileUp className="w-4 h-4" />
          Загрузить из Excel
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">ID</th>
              <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Вопрос</th>
              <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Предмет</th>
              <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
            </tr>
          </thead>
          <tbody>
            {mockQuestions.filter(q => q.question_text.toLowerCase().includes(searchQuery.toLowerCase())).map(question => (
              <tr key={question.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                <td className="py-3 px-4 text-[var(--foreground-muted)]">{question.id}</td>
                <td className="py-3 px-4 font-medium text-[var(--foreground)] max-w-md truncate">
                  {question.question_text}
                </td>
                <td className="py-3 px-4 text-[var(--foreground-secondary)]">{question.subject_name}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleEdit(question)} className="btn btn-sm btn-secondary mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="btn btn-sm btn-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Имя</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Email</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Роль</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Статус</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(user => (
            <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="avatar w-8 h-8 text-xs">
                    {user.name[0]}
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{user.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-[var(--foreground-secondary)]">{user.email}</td>
              <td className="py-3 px-4 text-center">{getRoleBadge(user.role)}</td>
              <td className="py-3 px-4 text-center">
                {user.active ? (
                  <span className="badge badge-success">Активен</span>
                ) : (
                  <span className="badge badge-danger">Неактивен</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleEdit(user)} className="btn btn-sm btn-secondary mr-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Админ-панель</h1>
            <p className="text-sm text-[var(--foreground-secondary)]">Управление платформой</p>
          </div>
        </div>
        <Link href={`/${locale}/dashboard`} className="btn btn-secondary">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)]"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : "bg-[var(--border)]"
                }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Card */}
      <div className="card">
        <div className="card-header flex justify-between items-center flex-wrap gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Поиск..."
              className="input pl-10 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={handleAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        <div className="card-body">
          {activeTab === "faculties" && renderFaculties()}
          {activeTab === "subjects" && renderSubjects()}
          {activeTab === "questions" && renderQuestions()}
          {activeTab === "users" && renderUsers()}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-[var(--background-secondary)] rounded-xl shadow-lg w-full max-w-md mx-4 animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--foreground)]">
                {editingItem ? "Редактирование" : "Добавление"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {activeTab === "users" ? (
                <>
                  <div>
                    <label className="label">Имя</label>
                    <input
                      type="text"
                      className="input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Имя пользователя"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Роль</label>
                    <select
                      className="input"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                    >
                      <option value="student">Студент</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Админ</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">Название</label>
                  <input
                    type="text"
                    className="input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Введите название"
                  />
                </div>
              )}
              {activeTab === "subjects" && (
                <div>
                  <label className="label">Факультет</label>
                  <select
                    className="input"
                    value={formFacultyId}
                    onChange={(e) => setFormFacultyId(e.target.value)}
                  >
                    <option value="">Выберите факультет</option>
                    {mockFaculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Отмена
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
