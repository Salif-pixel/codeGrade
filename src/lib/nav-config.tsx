import { Role } from "@prisma/client";
import { Home, User, Plus, Book, BarChart, FileText, ClipboardList, DoorClosed, Settings, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
  badge?: number;
}

export const navigationConfig = () => {
  const t = useTranslations("nav-items");

  const config: NavItem[] = [
  // Pages communes
  {
    id: "exit",
    title: t("exit"),
    href: "/",
    icon: <DoorClosed className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
  },
  {
    id: "settings",
    title: t("settings"),
    href: "/settings",
    icon: <Settings2 className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
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
    id: "my-exams",
    title: t("my_exams"),
    href: "/my-exams",
    icon: <Book className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.SUPERADMIN],
  },
  {
    id: "stats",
    title: t("stats"),
    href: "/stats",
    icon: <BarChart className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.SUPERADMIN],
    badge: 3, // Exemple de badge pour des notifications
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
];

  return config;
};