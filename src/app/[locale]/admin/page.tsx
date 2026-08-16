"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getFaculties,
  getSubjects,
  getQuestions,
  getUsers,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  addSubject,
  updateSubject,
  deleteSubject,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  updateSubscription,
  getAdminStats
} from "@/app/actions/admin";
import { getUserSession } from "@/app/actions/auth";
import FacultiesTable from "@/components/admin/FacultiesTable";
import SubjectsTable from "@/components/admin/SubjectsTable";
import QuestionsFolders from "@/components/admin/QuestionsFolders";
import UsersTable from "@/components/admin/UsersTable";
import SubscriptionsPanel from "@/components/admin/SubscriptionsPanel";
import EntityModal, { EMPTY_FORM, type AdminForm } from "@/components/admin/EntityModal";
import SubscriptionModal, { monthlyExpiry } from "@/components/admin/SubscriptionModal";
import {
  displayName,
  type AdminStats,
  type AdminUser,
  type EditableFields,
  type EditableItem,
  type Faculty,
  type Question,
  type Subject,
  type Tab,
} from "@/components/admin/types";
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Users,
  LayoutDashboard,
  Plus,
  Search,
  Shield,
  Crown,
  Lock
} from "lucide-react";

const EMPTY_STATS: AdminStats = {
  userCount: 0,
  facultyCount: 0,
  subjectCount: 0,
  questionCount: 0,
  estimatedIncome: 0,
};

export default function AdminPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("faculties");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Data
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [form, setForm] = useState<AdminForm>(EMPTY_FORM);

  // Subscription modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [subPlan, setSubPlan] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [subExpiryDate, setSubExpiryDate] = useState(monthlyExpiry);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [facs, subs, ques, usrs, statData] = await Promise.all([
        getFaculties(),
        getSubjects(),
        getQuestions(),
        getUsers(),
        getAdminStats()
      ]);
      setFaculties(facs);
      setSubjects(subs);
      setQuestions(ques);
      setUsers(usrs as AdminUser[]);
      setStats(statData);
    } catch (error) {
      console.error("Load error:", error);
    }
    setLoading(false);
  }, []);

  // Check if user is admin (server actions re-check on every call)
  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getUserSession();

      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      if (user.isAdmin) {
        setIsAdmin(true);
        loadAllData();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    checkAdmin();
  }, [locale, router, loadAllData]);

  const updateForm = <K extends keyof AdminForm>(field: K, value: AdminForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleEdit = (item: EditableItem) => {
    const record = item as EditableFields;
    setEditingItem(item);
    setForm({
      ...EMPTY_FORM,
      name: record.name || "",
      email: record.email || "",
      role: record.role || "STUDENT",
      facultyId: record.faculty_id ? String(record.faculty_id) : "",
      subjectId: record.subject_id ? String(record.subject_id) : "",
      questionText: record.question_text || "",
      correctAnswer: record.correct_answer || "",
      answer2: record.answer2 || "",
      answer3: record.answer3 || "",
      answer4: record.answer4 || "",
      explanation: record.explanation || "",
      password: "", // Never prefill an existing password
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const editingId = (editingItem as EditableFields | null)?.id;

      if (activeTab === "faculties") {
        if (editingId !== undefined) await updateFaculty(Number(editingId), form.name);
        else await addFaculty(form.name);
      } else if (activeTab === "subjects") {
        if (editingId !== undefined) await updateSubject(Number(editingId), form.name, Number(form.facultyId));
        else await addSubject(form.name, Number(form.facultyId));
      } else if (activeTab === "questions") {
        if (editingId !== undefined) {
          await updateQuestion(Number(editingId), {
            subject_id: Number(form.subjectId),
            question_text: form.questionText,
            correct_answer: form.correctAnswer,
            answer2: form.answer2,
            answer3: form.answer3,
            answer4: form.answer4,
            explanation: form.explanation,
          });
        } else {
          await addQuestion({
            subjectId: Number(form.subjectId),
            questionText: form.questionText,
            correctAnswer: form.correctAnswer,
            answer2: form.answer2,
            answer3: form.answer3,
            answer4: form.answer4,
            explanation: form.explanation,
          });
        }
      } else if (activeTab === "users") {
        const userData = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
        if (editingId !== undefined) {
          await updateUser(String(editingId), userData);
        } else {
          if (!form.password) {
            alert("Пароль обязателен для нового пользователя");
            setSaving(false);
            return;
          }
          await addUser(userData);
        }
      }

      await loadAllData();
      setShowModal(false);
      alert("Сохранено!");
    } catch (e) {
      console.error("Save error:", e);
      alert(e instanceof Error ? e.message : "Ошибка сохранения");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Удалить?")) return;
    try {
      if (activeTab === "faculties") await deleteFaculty(Number(id));
      else if (activeTab === "subjects") await deleteSubject(Number(id));
      else if (activeTab === "questions") await deleteQuestion(Number(id));
      await loadAllData();
    } catch (e) {
      console.error("Delete error:", e);
      alert(e instanceof Error ? e.message : "Ошибка удаления");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    if (!confirm(`Вы уверены, что хотите УДАЛИТЬ пользователя ${displayName(user)} (${user.email})? Это действие необратимо!`)) return;

    try {
      await deleteUser(id);
      await loadAllData();
    } catch (e) {
      console.error("Delete user error:", e);
      alert(e instanceof Error ? e.message : "Ошибка удаления");
    }
  };

  const handleDeactivateUser = async (user: AdminUser) => {
    if (!confirm(`Деактивировать пользователя ${displayName(user)}? Он не сможет войти в систему.`)) return;
    try {
      await deactivateUser(user.id);
      await loadAllData();
      alert("Пользователь деактивирован!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка деактивации");
    }
  };

  const handleActivateUser = async (user: AdminUser) => {
    const newPass = prompt("Введите новый пароль для активации пользователя (минимум 8 символов):");
    if (!newPass) return;
    try {
      await activateUser(user.id, newPass);
      await loadAllData();
      alert("Пользователь активирован!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка активации");
    }
  };

  // Subscription management
  const handleGrantSubscription = (user: AdminUser) => {
    setSelectedUser(user);
    setSubPlan("MONTHLY");
    setSubExpiryDate(monthlyExpiry());
    setShowSubModal(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedUser) return;
    if (!subExpiryDate) {
      alert("Пожалуйста, укажите дату окончания подписки");
      return;
    }
    setSaving(true);
    try {
      const res = await updateSubscription(selectedUser.id, subPlan, subExpiryDate);
      if (res && !res.success) {
        alert("Ошибка: " + res.error);
        setSaving(false);
        return;
      }
      await loadAllData();
      setShowSubModal(false);
      setSelectedUser(null);
      alert(`Подписка обновлена для ${selectedUser.email}!`);
    } catch (error) {
      console.error("Sub error:", error);
      alert("Ошибка обновления подписки");
    }
    setSaving(false);
  };

  const handleRemoveSubscription = async (userId: string) => {
    if (!confirm("Удалить подписку пользователя?")) return;
    await updateSubscription(userId, "FREE", null);
    await loadAllData();
  };

  const tabs: { id: Tab; label: string; icon: typeof GraduationCap; count: number }[] = [
    { id: "faculties", label: t("admin.faculties"), icon: GraduationCap, count: faculties.length },
    { id: "subjects", label: t("admin.subjects"), icon: BookOpen, count: subjects.length },
    { id: "questions", label: t("admin.questions"), icon: HelpCircle, count: questions.length },
    { id: "users", label: t("admin.users"), icon: Users, count: users.length },
    {
      id: "subscriptions",
      label: t("admin.subscriptions"),
      icon: Crown,
      count: users.filter((u) => u.subscriptionPlan && u.subscriptionPlan !== "FREE").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--danger-light)] mb-6">
          <Lock className="w-10 h-10 text-[var(--danger)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Доступ запрещён</h2>
        <p className="text-[var(--foreground-secondary)] mb-8">
          Эта страница доступна только администраторам.
        </p>
        <Link href={`/${locale}/dashboard`} className="btn btn-primary">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("admin.title")}</h1>
            <p className="text-sm text-[var(--foreground-secondary)]">{t("admin.subtitle")}</p>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none z-10" />
            <input
              type="text"
              placeholder={t("admin.search")}
              className="input py-2"
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab !== "subscriptions" && (
            <button onClick={handleAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              {t("admin.add")}
            </button>
          )}
        </div>
        <div className="card-body">
          {activeTab === "faculties" && (
            <FacultiesTable
              faculties={faculties}
              subjects={subjects}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "subjects" && (
            <SubjectsTable
              subjects={subjects}
              faculties={faculties}
              questions={questions}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "questions" && (
            <QuestionsFolders
              questions={questions}
              subjects={subjects}
              faculties={faculties}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "users" && (
            <UsersTable
              users={users}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDeleteUser}
              onGrantSubscription={handleGrantSubscription}
              onDeactivate={handleDeactivateUser}
              onActivate={handleActivateUser}
            />
          )}
          {activeTab === "subscriptions" && (
            <SubscriptionsPanel
              users={users}
              stats={stats}
              onGrantSubscription={handleGrantSubscription}
              onRemoveSubscription={handleRemoveSubscription}
            />
          )}
        </div>
      </div>

      {showModal && (
        <EntityModal
          tab={activeTab}
          isEditing={!!editingItem}
          form={form}
          faculties={faculties}
          subjects={subjects}
          saving={saving}
          onChange={updateForm}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showSubModal && selectedUser && (
        <SubscriptionModal
          user={selectedUser}
          plan={subPlan}
          expiryDate={subExpiryDate}
          saving={saving}
          onPlanChange={(plan, expiry) => {
            setSubPlan(plan);
            setSubExpiryDate(expiry);
          }}
          onExpiryChange={setSubExpiryDate}
          onClose={() => setShowSubModal(false)}
          onSave={handleSaveSubscription}
        />
      )}
    </div>
  );
}
