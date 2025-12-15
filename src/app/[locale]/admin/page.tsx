"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabase/client";
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Users,
  LayoutDashboard,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Shield,
  FileUp,
  Crown,
  CheckCircle,
  Clock,
  Calendar,
  CreditCard,
  Lock
} from "lucide-react";

type Tab = "faculties" | "subjects" | "questions" | "users" | "subscriptions";

// Admin email - only this user can access admin panel
const ADMIN_EMAIL = "akbarkhon545@gmail.com";

// Data will be loaded from database
const mockFaculties: { id: number; name: string; subjects_count: number }[] = [];

const mockSubjects: { id: number; name: string; faculty_id: number; faculty_name: string; questions_count: number }[] = [];

const mockQuestions: { id: number; question_text: string; subject_name: string }[] = [];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  subscription: { plan: "monthly" | "yearly"; expiresAt: string } | null;
}

const mockUsers: User[] = [
  { id: 1, name: "Akbarkhon", email: "akbarkhon545@gmail.com", role: "admin", active: true, subscription: null },
];

export default function AdminPage() {
  const locale = useLocale();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("faculties");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Data states - loaded from Supabase
  const [faculties, setFaculties] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("student");
  const [formFacultyId, setFormFacultyId] = useState("");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("");
  const [formAnswer2, setFormAnswer2] = useState("");
  const [formAnswer3, setFormAnswer3] = useState("");
  const [formAnswer4, setFormAnswer4] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");

  // Subscription form
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [subPlan, setSubPlan] = useState<"monthly" | "yearly">("monthly");
  const [subDuration, setSubDuration] = useState(1);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      if (session.user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        // Load all data from Supabase
        loadAllData();
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkAdmin();
  }, [locale, router]);

  // Load all data from Supabase
  const loadAllData = async () => {
    await Promise.all([
      loadFaculties(),
      loadSubjects(),
      loadQuestions(),
      loadUsersFromSupabase()
    ]);
  };

  // Load faculties
  const loadFaculties = async () => {
    const { data, error } = await supabase
      .from("faculties")
      .select("id, name")
      .order("name");

    if (!error && data) {
      setFaculties(data);
    }
  };

  // Load subjects with faculty info
  const loadSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, faculty_id")
      .order("name");

    if (!error && data) {
      setSubjects(data);
    }
  };

  // Load questions
  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("id, question_text, subject_id, correct_answer")
      .limit(100);

    if (!error && data) {
      setQuestions(data);
    }
  };

  // Load users from Supabase profiles
  const loadUsersFromSupabase = async () => {
    console.log("Loading users from Supabase...");
    try {
      // Get users from profiles table (columns: id, email, role)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role");

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Error loading profiles:", error);
        // Fallback to admin only
        setUsers(mockUsers);
      } else if (data && data.length > 0) {
        console.log("Found profiles:", data.length);
        // Convert profiles to users with subscription info from localStorage
        const allSubs = JSON.parse(localStorage.getItem('all_subscriptions') || '{}');
        const usersFromProfiles: User[] = data.map((profile: any, idx: number) => ({
          id: idx + 1,
          name: profile.email?.split('@')[0] || "User",
          email: profile.email || "",
          role: profile.email === ADMIN_EMAIL ? "admin" : (profile.role === "user" ? "student" : profile.role || "student"),
          active: true,
          subscription: allSubs[profile.email] || null
        }));
        console.log("Setting users:", usersFromProfiles);
        setUsers(usersFromProfiles);
      } else {
        console.log("No profiles found, using mock");
        setUsers(mockUsers);
      }
    } catch (e) {
      console.error("Connection error:", e);
      setUsers(mockUsers);
    }
  };

  // Show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--danger-light)] mb-6">
          <Lock className="w-10 h-10 text-[var(--danger)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Доступ запрещён
        </h2>
        <p className="text-[var(--foreground-secondary)] mb-8">
          У вас нет прав доступа к админ-панели
        </p>
        <Link href={`/${locale}/dashboard`} className="btn btn-primary">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: "faculties", label: "Факультеты", icon: GraduationCap, count: faculties.length },
    { id: "subjects", label: "Предметы", icon: BookOpen, count: subjects.length },
    { id: "questions", label: "Вопросы", icon: HelpCircle, count: questions.length },
    { id: "users", label: "Пользователи", icon: Users, count: users.length },
    { id: "subscriptions", label: "Подписки", icon: Crown, count: users.filter(u => u.subscription).length },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormEmail("");
    setFormRole("student");
    setFormFacultyId("");
    setFormQuestionText("");
    setFormCorrectAnswer("");
    setFormAnswer2("");
    setFormAnswer3("");
    setFormAnswer4("");
    setFormSubjectId("");
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormEmail(item.email || "");
    setFormRole(item.role || "student");
    setFormFacultyId(String(item.faculty_id || ""));
    setFormQuestionText(item.question_text || "");
    setFormCorrectAnswer(item.correct_answer || "");
    setFormAnswer2(item.answer2 || "");
    setFormAnswer3(item.answer3 || "");
    setFormAnswer4(item.answer4 || "");
    setFormSubjectId(String(item.subject_id || ""));
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "faculties") {
        if (editingItem) {
          // Update faculty
          await supabase.from("faculties").update({ name: formName }).eq("id", editingItem.id);
        } else {
          // Create faculty
          await supabase.from("faculties").insert({ name: formName });
        }
        await loadFaculties();
      } else if (activeTab === "subjects") {
        if (editingItem) {
          // Update subject
          await supabase.from("subjects").update({
            name: formName,
            faculty_id: parseInt(formFacultyId)
          }).eq("id", editingItem.id);
        } else {
          // Create subject
          await supabase.from("subjects").insert({
            name: formName,
            faculty_id: parseInt(formFacultyId)
          });
        }
        await loadSubjects();
      } else if (activeTab === "questions") {
        const questionData = {
          question_text: formQuestionText,
          correct_answer: formCorrectAnswer,
          answer2: formAnswer2,
          answer3: formAnswer3,
          answer4: formAnswer4,
          subject_id: parseInt(formSubjectId)
        };
        if (editingItem) {
          await supabase.from("questions").update(questionData).eq("id", editingItem.id);
        } else {
          await supabase.from("questions").insert(questionData);
        }
        await loadQuestions();
      }
      setShowModal(false);
      alert("Сохранено!");
    } catch (e) {
      console.error("Save error:", e);
      alert("Ошибка сохранения");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить?")) return;

    try {
      if (activeTab === "faculties") {
        await supabase.from("faculties").delete().eq("id", id);
        await loadFaculties();
      } else if (activeTab === "subjects") {
        await supabase.from("subjects").delete().eq("id", id);
        await loadSubjects();
      } else if (activeTab === "questions") {
        await supabase.from("questions").delete().eq("id", id);
        await loadQuestions();
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // Subscription management
  const handleAddSubscription = (user: any) => {
    setSelectedUser(user);
    setSubPlan("monthly");
    setSubDuration(1);
    setShowSubModal(true);
  };

  const handleSaveSubscription = () => {
    if (!selectedUser) return;

    const days = subPlan === "monthly" ? subDuration * 30 : subDuration * 365;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const subscriptionData = { plan: subPlan, expiresAt: expiresAt.toISOString().split('T')[0] };

    // Update state
    setUsers(users.map(u =>
      u.id === selectedUser.id
        ? { ...u, subscription: subscriptionData }
        : u
    ));

    // Save to localStorage by email (for test page to find)
    localStorage.setItem(`subscription_${selectedUser.email}`, JSON.stringify(subscriptionData));

    // Also save by a generic key for current user lookup
    // The test pages will need to check this
    const allSubs = JSON.parse(localStorage.getItem('all_subscriptions') || '{}');
    allSubs[selectedUser.email] = subscriptionData;
    localStorage.setItem('all_subscriptions', JSON.stringify(allSubs));

    setShowSubModal(false);
    setSelectedUser(null);

    alert(`Подписка активирована для ${selectedUser.email}!`);
  };

  const handleRemoveSubscription = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (confirm("Удалить подписку пользователя?")) {
      setUsers(users.map(u =>
        u.id === userId ? { ...u, subscription: null } : u
      ));

      // Remove from localStorage
      localStorage.removeItem(`subscription_${user.email}`);
      const allSubs = JSON.parse(localStorage.getItem('all_subscriptions') || '{}');
      delete allSubs[user.email];
      localStorage.setItem('all_subscriptions', JSON.stringify(allSubs));
    }
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

  const getSubBadge = (sub: any) => {
    if (!sub) return <span className="badge badge-secondary">Нет подписки</span>;
    const isExpired = new Date(sub.expiresAt) < new Date();
    if (isExpired) return <span className="badge badge-danger">Истекла</span>;
    return (
      <span className="badge badge-success flex items-center gap-1">
        <Crown className="w-3 h-3" />
        {sub.plan === "monthly" ? "Месячная" : "Годовая"}
      </span>
    );
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
          {faculties.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(faculty => (
            <tr key={faculty.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
              <td className="py-3 px-4 text-[var(--foreground-muted)]">{faculty.id}</td>
              <td className="py-3 px-4 font-medium text-[var(--foreground)]">{faculty.name}</td>
              <td className="py-3 px-4 text-center">
                <span className="badge badge-primary">{subjects.filter(s => s.faculty_id === faculty.id).length}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleEdit(faculty)} className="btn btn-sm btn-secondary mr-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(faculty.id)} className="btn btn-sm btn-danger">
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
          {subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(subject => (
            <tr key={subject.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
              <td className="py-3 px-4 font-medium text-[var(--foreground)]">{subject.name}</td>
              <td className="py-3 px-4 text-[var(--foreground-secondary)]">
                {faculties.find(f => f.id === subject.faculty_id)?.name || "-"}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="badge badge-success">{questions.filter(q => q.subject_id === subject.id).length}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleEdit(subject)} className="btn btn-sm btn-secondary mr-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(subject.id)} className="btn btn-sm btn-danger">
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
            {questions.filter(q => q.question_text?.toLowerCase().includes(searchQuery.toLowerCase())).map(question => (
              <tr key={question.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                <td className="py-3 px-4 text-[var(--foreground-muted)]">{question.id}</td>
                <td className="py-3 px-4 font-medium text-[var(--foreground)] max-w-md truncate">
                  {question.question_text}
                </td>
                <td className="py-3 px-4 text-[var(--foreground-secondary)]">
                  {subjects.find(s => s.id === question.subject_id)?.name || "-"}
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleEdit(question)} className="btn btn-sm btn-secondary mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(question.id)} className="btn btn-sm btn-danger">
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
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Пользователь</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Email</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Роль</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Подписка</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(u =>
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
              <td className="py-3 px-4 text-center">{getSubBadge(user.subscription)}</td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleAddSubscription(user)} className="btn btn-sm btn-success mr-2" title="Добавить подписку">
                  <Crown className="w-4 h-4" />
                </button>
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

  const renderSubscriptions = () => {
    const usersWithSub = users.filter(u => u.subscription);
    const usersWithoutSub = users.filter(u => !u.subscription && u.role === "student");

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[var(--success-light)] border border-[var(--success)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-[var(--success)]" />
              <span className="font-medium text-[var(--foreground)]">Активных подписок</span>
            </div>
            <p className="text-2xl font-bold text-[var(--success)]">{usersWithSub.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
              <span className="font-medium text-[var(--foreground)]">Без подписки</span>
            </div>
            <p className="text-2xl font-bold text-[var(--warning)]">{usersWithoutSub.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--primary-light)] border border-[var(--primary)]/20">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">Доход (примерно)</span>
            </div>
            <p className="text-2xl font-bold text-[var(--primary)]">
              {(usersWithSub.filter(u => u.subscription?.plan === "monthly").length * 25000 +
                usersWithSub.filter(u => u.subscription?.plan === "yearly").length * 50000).toLocaleString()} сум
            </p>
          </div>
        </div>

        {/* Active subscriptions */}
        <div>
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            Активные подписки
          </h3>
          {usersWithSub.length === 0 ? (
            <p className="text-[var(--foreground-muted)] text-center py-8">Нет активных подписок</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Пользователь</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Email</th>
                    <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Тариф</th>
                    <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">Истекает</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithSub.map(user => (
                    <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-8 h-8 text-xs bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                            {user.name[0]}
                          </div>
                          <span className="font-medium text-[var(--foreground)]">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--foreground-secondary)]">{user.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${user.subscription?.plan === "yearly" ? "badge-success" : "badge-primary"}`}>
                          {user.subscription?.plan === "monthly" ? "25 000 / мес" : "50 000 / год"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-[var(--foreground-secondary)]">
                          <Calendar className="w-4 h-4" />
                          {user.subscription?.expiresAt}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleAddSubscription(user)} className="btn btn-sm btn-primary mr-2" title="Продлить">
                          <Clock className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemoveSubscription(user.id)} className="btn btn-sm btn-danger" title="Отменить">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users without subscription */}
        <div>
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--warning)]" />
            Студенты без подписки
          </h3>
          {usersWithoutSub.length === 0 ? (
            <p className="text-[var(--foreground-muted)] text-center py-8">Все студенты имеют подписку</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Пользователь</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Email</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithoutSub.map(user => (
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
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleAddSubscription(user)} className="btn btn-sm btn-success">
                          <Crown className="w-4 h-4" />
                          Добавить подписку
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          {activeTab !== "subscriptions" && (
            <button onClick={handleAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          )}
        </div>
        <div className="card-body">
          {activeTab === "faculties" && renderFaculties()}
          {activeTab === "subjects" && renderSubjects()}
          {activeTab === "questions" && renderQuestions()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "subscriptions" && renderSubscriptions()}
        </div>
      </div>

      {/* Edit Modal */}
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
                    <input type="text" className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Имя пользователя" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="label">Роль</label>
                    <select className="input" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                      <option value="student">Студент</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Админ</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">Название</label>
                  <input type="text" className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Введите название" />
                </div>
              )}
              {activeTab === "subjects" && (
                <div>
                  <label className="label">Факультет</label>
                  <select className="input" value={formFacultyId} onChange={(e) => setFormFacultyId(e.target.value)}>
                    <option value="">Выберите факультет</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
              <button onClick={handleSave} className="btn btn-primary"><Save className="w-4 h-4" />Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-[var(--background-secondary)] rounded-xl shadow-lg w-full max-w-md mx-4 animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Добавить подписку
              </h3>
              <button onClick={() => setShowSubModal(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <p className="text-sm text-[var(--foreground-muted)]">Пользователь</p>
                <p className="font-medium text-[var(--foreground)]">{selectedUser.name}</p>
                <p className="text-sm text-[var(--foreground-secondary)]">{selectedUser.email}</p>
              </div>

              <div>
                <label className="label">Тариф</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSubPlan("monthly")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${subPlan === "monthly"
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--border)]"
                      }`}
                  >
                    <p className="font-bold text-[var(--foreground)]">25 000 сум</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">Месяц</p>
                  </button>
                  <button
                    onClick={() => setSubPlan("yearly")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${subPlan === "yearly"
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--border)]"
                      }`}
                  >
                    <p className="font-bold text-[var(--foreground)]">50 000 сум</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">Год</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Количество {subPlan === "monthly" ? "месяцев" : "лет"}</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="input"
                  value={subDuration}
                  onChange={(e) => setSubDuration(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="p-3 rounded-lg bg-[var(--success-light)] border border-[var(--success)]/20">
                <p className="text-sm text-[var(--foreground-muted)]">Итого</p>
                <p className="font-bold text-lg text-[var(--success)]">
                  {((subPlan === "monthly" ? 25000 : 50000) * subDuration).toLocaleString()} сум
                </p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  Действует до: {new Date(Date.now() + (subPlan === "monthly" ? subDuration * 30 : subDuration * 365) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
              <button onClick={() => setShowSubModal(false)} className="btn btn-secondary">Отмена</button>
              <button onClick={handleSaveSubscription} className="btn btn-success">
                <CheckCircle className="w-4 h-4" />
                Активировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
