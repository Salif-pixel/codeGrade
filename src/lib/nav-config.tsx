import { Role } from "@prisma/client";
import { Home, User, Plus, Book, BarChart, FileText, ClipboardList, DoorClosed, Settings, Settings2, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
  badge?: number;
  isProtectedRoute?: boolean;
}

export const navigationConfig = () => {
  const t = useTranslations("nav-items");

  const config: NavItem[] = [
    // Pages communes
    {
      id: "exit",
      title: t("exit"),
      href: "/",
      icon: <ArrowLeft className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "stats",
      title: t("stats"),
      href: "/dashboard",
      icon: <BarChart className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
      // badge: 3,
    },

    // Pages pour les professeurs
    {
      id: "create-exam",
      title: t("create_exam"),
      href: "/exams/create",
      icon: <Plus className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.SUPERADMIN],
    },
    {
      id: "exams",
      title: t("my_exams"),
      href: "/exams",
      icon: <Book className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.SUPERADMIN],
    },

    // Pages pour les étudiants
    {
      id: "available-exams",
      title: t("available_exams"),
      href: "/available-exams",
      icon: <FileText className="w-5 h-5" />,
      roles: [Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "results",
      title: t("results"),
      href: "/results",
      icon: <ClipboardList className="w-5 h-5" />,
      roles: [Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "profile",
      title: t("profile"),
      href: "/profile",
      icon: <User className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "settings",
      title: t("settings"),
      href: "/settings",
      icon: <Settings2 className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
    },
  ];

  return config;
};


export const navigationConfigForMiddleware = () => {
  const config: NavItem[] = [
    // Pages communes
    {
      id: "exit",
      title: "Exit",
      href: "/",
      icon: <DoorClosed className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "settings",
      title: "Settings",
      href: "/settings",
      icon: <Settings2 className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "profile",
      title: "Profile",
      href: "/profile",
      icon: <User className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
    },

    // Pages pour les professeurs
    {
      id: "create-exam",
      title: "Create Exam",
      href: "/exams/create",
      icon: <Plus className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.SUPERADMIN],
    },

    {
      id: "exams",
      title: "My Exams",
      href: "/exams",
      icon: <Book className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.SUPERADMIN],
    },
    {
      id: "stats",
      title: "Statistics",
      href: "/stats",
      icon: <BarChart className="w-5 h-5" />,
      roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
      badge: 3, // Exemple de badge pour des notifications
    },

    // Pages pour les étudiants
    {
      id: "available-exams",
      title: "Available Exams",
      href: "/available-exams",
      icon: <FileText className="w-5 h-5" />,
      roles: [Role.STUDENT, Role.SUPERADMIN],
    },
    {
      id: "exam-take",
      title: "Take Exam",
      href: "exams/[id]",
      icon: <FileText className="w-5 h-5" />,
      roles: [Role.STUDENT, Role.SUPERADMIN],
      isProtectedRoute: true,
    },
    {
      id: "results",
      title: "Results",
      href: "/results",
      icon: <ClipboardList className="w-5 h-5" />,
      roles: [Role.STUDENT, Role.SUPERADMIN],
    },
  ];

  return config;
};