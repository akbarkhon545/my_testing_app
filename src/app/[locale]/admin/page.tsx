"use client";

import { useState, useEffect } from "react";
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
  updateSubscription,
  getAdminStats
} from "@/app/actions/admin";
import { getUserSession } from "@/app/actions/auth";
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
  Lock,
  ChevronDown
} from "lucide-react";

type Tab = "faculties" | "subjects" | "questions" | "users" | "subscriptions";

// Admin email - only this user can access admin panel
const ADMIN_EMAIL = "akbarkhon545@gmail.com";

export default function AdminPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("faculties");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>({
    userCount: 0,
    facultyCount: 0,
    subjectCount: 0,
    questionCount: 0,
    estimatedIncome: 0
  });

  // Data states
  const [faculties, setFaculties] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("STUDENT");
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
  const [subPlan, setSubPlan] = useState<"MONTHLY" | "YEARLY" | "FREE">("MONTHLY");
  const [subExpiryDate, setSubExpiryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  // State for expanded folders (subjects) in questions view
  const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({});

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getUserSession();

      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      if (user.email === ADMIN_EMAIL || user.role === "ADMIN") {
        setIsAdmin(true);
        loadAllData();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    checkAdmin();
  }, [locale, router]);

  // Load all data
  const loadAllData = async () => {
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
      setUsers(usrs);
      setStats(statData);
    } catch (error) {
      console.error("Load error:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "faculties") {
        if (editingItem) {
          await updateFaculty(editingItem.id, formName);
        } else {
          await addFaculty(formName);
        }
      } else if (activeTab === "subjects") {
        if (editingItem) {
          await updateSubject(editingItem.id, formName, parseInt(formFacultyId));
        } else {
          await addSubject(formName, parseInt(formFacultyId));
        }
      } else if (activeTab === "questions") {
        const questionData = {
          questionText: formQuestionText,
          correctAnswer: formCorrectAnswer,
          answer2: formAnswer2,
          answer3: formAnswer3,
          answer4: formAnswer4,
          subjectId: parseInt(formSubjectId)
        };
        if (editingItem) {
          await updateQuestion(editingItem.id, questionData);
        } else {
          await addQuestion(questionData);
        }
      }
      await loadAllData();
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
      if (activeTab === "faculties") await deleteFaculty(id);
      else if (activeTab === "subjects") await deleteSubject(id);
      else if (activeTab === "questions") await deleteQuestion(id);
      await loadAllData();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: "faculties", label: t("admin.faculties"), icon: GraduationCap, count: faculties.length },
    { id: "subjects", label: t("admin.subjects"), icon: BookOpen, count: subjects.length },
    { id: "questions", label: t("admin.questions"), icon: HelpCircle, count: questions.length },
    { id: "users", label: t("admin.users"), icon: Users, count: users.length },
    { id: "subscriptions", label: t("admin.subscriptions"), icon: Crown, count: users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== "FREE").length },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormEmail("");
    setFormRole("STUDENT");
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
    setFormRole(item.role || "STUDENT");
    setFormFacultyId(String(item.faculty_id || ""));
    setFormQuestionText(item.question_text || "");
    setFormCorrectAnswer(item.correct_answer || "");
    setFormAnswer2(item.answer2 || "");
    setFormAnswer3(item.answer3 || "");
    setFormAnswer4(item.answer4 || "");
    setFormSubjectId(String(item.subject_id || ""));
    setShowModal(true);
  };

  // Subscription management
  const handleAddSubscription = (user: any) => {
    setSelectedUser(user);
    setSubPlan("MONTHLY");
    // Default to 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setSubExpiryDate(date.toISOString().split('T')[0]);
    setShowSubModal(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateSubscription(selectedUser.id, subPlan, subExpiryDate);
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
    if (confirm("Удалить подписку пользователя?")) {
      await updateSubscription(userId, "FREE", null);
      await loadAllData();
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      ADMIN: "badge-danger",
      STUDENT: "badge-primary",
    };
    const labels: Record<string, string> = {
      ADMIN: t("admin.adminRole"),
      STUDENT: t("admin.studentRole"),
    };
    return <span className={`badge ${badges[role] || "badge-primary"}`}>{labels[role] || role}</span>;
  };

  const getSubBadge = (user: any) => {
    if (!user.subscriptionPlan || user.subscriptionPlan === "FREE") return <span className="badge badge-secondary">{t("admin.noSubscription")}</span>;
    const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();
    if (isExpired) return <span className="badge badge-danger">{t("admin.expired")}</span>;
    return (
      <span className="badge badge-success flex items-center gap-1">
        <Crown className="w-3 h-3" />
        {user.subscriptionPlan === "MONTHLY" ? t("admin.monthlyPlan") : t("admin.yearlyPlan")}
      </span>
    );
  };

  const renderFaculties = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.id")}</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.name")}</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.subjectsCount")}</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
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
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.name")}</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.faculty")}</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.questionsCount")}</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
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

  const toggleSubjectFolder = (subjectId: number) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const renderQuestions = () => {
    // Group questions by subject
    const questionsBySubject: Record<number, any[]> = {};
    questions.forEach(q => {
      if (!questionsBySubject[q.subject_id]) {
        questionsBySubject[q.subject_id] = [];
      }
      questionsBySubject[q.subject_id].push(q);
    });

    // Filter subjects that have questions matching search
    const filteredSubjects = subjects.filter(subject => {
      const subjectQuestions = questionsBySubject[subject.id] || [];
      if (!searchQuery) return subjectQuestions.length > 0;
      return subjectQuestions.some(q =>
        q.question_text?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || subject.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <div>
        <div className="flex gap-2 mb-4">
          <Link href={`/${locale}/admin/upload`} className="btn btn-success">
            <FileUp className="w-4 h-4" />
            {t("admin.uploadExcel")}
          </Link>
        </div>

        {/* Folder view */}
        <div className="space-y-3">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              {t("admin.noQuestionsFound") || "Вопросы не найдены"}
            </div>
          ) : (
            filteredSubjects.map(subject => {
              const subjectQuestions = (questionsBySubject[subject.id] || []).filter(q =>
                !searchQuery || q.question_text?.toLowerCase().includes(searchQuery.toLowerCase())
              );
              const isExpanded = expandedSubjects[subject.id];
              const faculty = faculties.find(f => f.id === subject.faculty_id);

              return (
                <div key={subject.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
                  {/* Folder Header */}
                  <button
                    onClick={() => toggleSubjectFolder(subject.id)}
                    className="w-full flex items-center justify-between p-4 bg-[var(--background-secondary)] hover:bg-[var(--border)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-[var(--primary)]' : 'bg-[var(--primary-light)]'}`}>
                        <BookOpen className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-[var(--primary)]'}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-[var(--foreground)]">{subject.name}</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {faculty?.name || "-"} • {subjectQuestions.length} {t("admin.questionsCount") || "вопросов"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary">{subjectQuestions.length}</span>
                      <ChevronDown className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Folder Content - Questions List */}
                  {isExpanded && (
                    <div className="border-t border-[var(--border)]">
                      {subjectQuestions.length === 0 ? (
                        <div className="p-4 text-center text-[var(--foreground-muted)]">
                          Нет вопросов в этом предмете
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                              <th className="text-left py-2 px-4 font-medium text-[var(--foreground-muted)] text-sm">{t("admin.id")}</th>
                              <th className="text-left py-2 px-4 font-medium text-[var(--foreground-muted)] text-sm">{t("admin.question")}</th>
                              <th className="text-right py-2 px-4 font-medium text-[var(--foreground-muted)] text-sm">{t("admin.actions")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subjectQuestions.map((question, idx) => (
                              <tr key={question.id} className={`border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 ${idx % 2 === 0 ? '' : 'bg-[var(--background-secondary)]/30'}`}>
                                <td className="py-2 px-4 text-[var(--foreground-muted)] text-sm">{question.id}</td>
                                <td className="py-2 px-4 text-[var(--foreground)] text-sm max-w-lg">
                                  <span className="line-clamp-2">{question.question_text}</span>
                                </td>
                                <td className="py-2 px-4 text-right">
                                  <button onClick={() => handleEdit(question)} className="btn btn-sm btn-secondary mr-1">
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => handleDelete(question.id)} className="btn btn-sm btn-danger">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.users")}</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.email")}</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.role")}</th>
            <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.subscription")}</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
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
              <td className="py-3 px-4 text-center">{getSubBadge(user)}</td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => handleAddSubscription(user)} className="btn btn-sm btn-success mr-2" title={t("admin.addSubscription")}>
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
    const usersWithSub = users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== "FREE");
    const usersWithoutSub = users.filter(u => (!u.subscriptionPlan || u.subscriptionPlan === "FREE") && u.role === "STUDENT");

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[var(--success-light)] border border-[var(--success)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-[var(--success)]" />
              <span className="font-medium text-[var(--foreground)]">{t("admin.activeSubscriptions")}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--success)]">{usersWithSub.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
              <span className="font-medium text-[var(--foreground)]">{t("admin.withoutSubscription")}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--warning)]">{usersWithoutSub.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--primary-light)] border border-[var(--primary)]/20">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">{t("admin.incomeApprox")}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--primary)] text-sm">
              {stats.estimatedIncome.toLocaleString()} {t("pricing.sum")}
            </p>
          </div>
        </div>

        {/* Active subscriptions */}
        <div>
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            {t("admin.activeSubscriptionsTitle")}
          </h3>
          {usersWithSub.length === 0 ? (
            <p className="text-[var(--foreground-muted)] text-center py-8">{t("admin.noActiveSubscriptions")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.users")}</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.email")}</th>
                    <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.plan")}</th>
                    <th className="text-center py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.expiresAt")}</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
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
                        <span className={`badge ${user.subscriptionPlan === "YEARLY" ? "badge-success" : "badge-primary"}`}>
                          {user.subscriptionPlan === "MONTHLY" ? `25 000 ${t("admin.perMonth")}` : `50 000 ${t("admin.perYear")}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-[var(--foreground-secondary)]">
                          <Calendar className="w-4 h-4" />
                          {user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleAddSubscription(user)} className="btn btn-sm btn-primary mr-2" title={t("admin.extend")}>
                          <Clock className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemoveSubscription(user.id)} className="btn btn-sm btn-danger" title={t("admin.cancelSub")}>
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
            {t("admin.studentsWithoutSub")}
          </h3>
          {usersWithoutSub.length === 0 ? (
            <p className="text-[var(--foreground-muted)] text-center py-8">{t("admin.allStudentsHaveSub")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.users")}</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.email")}</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">{t("admin.actions")}</th>
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
                          {t("admin.addSubscription")}
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
                {editingItem ? t("admin.edit") : t("admin.add")}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {activeTab === "users" ? (
                <>
                  <div>
                    <label className="label">{t("admin.name")}</label>
                    <input type="text" className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t("admin.name")} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="label">{t("admin.role")}</label>
                    <select className="input" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                      <option value="student">{t("admin.studentRole")}</option>
                      <option value="manager">{t("admin.managerRole")}</option>
                      <option value="admin">{t("admin.adminRole")}</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">{t("admin.name")}</label>
                  <input type="text" className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t("admin.name")} />
                </div>
              )}
              {activeTab === "subjects" && (
                <div>
                  <label className="label">{t("admin.faculty")}</label>
                  <select className="input" value={formFacultyId} onChange={(e) => setFormFacultyId(e.target.value)}>
                    <option value="">{t("admin.selectFaculty")}</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">{t("admin.cancel")}</button>
              <button onClick={handleSave} className="btn btn-primary"><Save className="w-4 h-4" />{t("admin.save")}</button>
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
                {t("admin.addSubscription")}
              </h3>
              <button onClick={() => setShowSubModal(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <p className="text-sm text-[var(--foreground-muted)]">{t("admin.users")}</p>
                <p className="font-medium text-[var(--foreground)]">{selectedUser.name}</p>
                <p className="text-sm text-[var(--foreground-secondary)]">{selectedUser.email}</p>
              </div>

              <div>
                <label className="label">{t("admin.plan")}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSubPlan("MONTHLY")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${subPlan === "MONTHLY"
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--border)]"
                      }`}
                  >
                    <p className="font-bold text-[var(--foreground)]">25 000 {t("pricing.sum")}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{t("admin.perMonth")}</p>
                  </button>
                  <button
                    onClick={() => setSubPlan("YEARLY")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${subPlan === "YEARLY"
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--border)]"
                      }`}
                  >
                    <p className="font-bold text-[var(--foreground)]">50 000 {t("pricing.sum")}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{t("admin.perYear")}</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">{t("admin.expiryDate") || "Дата окончания"}</label>
                <input
                  type="date"
                  className="input"
                  value={subExpiryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSubExpiryDate(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-lg bg-[var(--success-light)] border border-[var(--success)]/20">
                <p className="text-sm text-[var(--foreground-muted)]">Тариф</p>
                <p className="font-bold text-lg text-[var(--success)]">
                  {subPlan === "MONTHLY" ? "25 000" : "50 000"} {t("pricing.sum")}
                </p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  {t("common.validUntil") || "Действует до"}: {new Date(subExpiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)]">
              <button onClick={() => setShowSubModal(false)} className="btn btn-secondary">{t("admin.cancel")}</button>
              <button onClick={handleSaveSubscription} className="btn btn-success" disabled={saving}>
                <CheckCircle className="w-4 h-4" />
                {t("admin.activateSubscription")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
