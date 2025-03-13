import { Role } from "@prisma/client";
import { Home, User, Plus, Book, BarChart, FileText, ClipboardList } from "lucide-react";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
  badge?: number;
}

export const navigationConfig: NavItem[] = [
  // Pages communes
  {
    id: "home",
    title: "Accueil",
    href: "/",
    icon: <Home className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
  },
  {
    id: "profile",
    title: "Profil",
    href: "/profile",
    icon: <User className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.STUDENT, Role.SUPERADMIN],
  },

  // Pages pour les professeurs
  {
    id: "create-exam",
    title: "Créer un examen",
    href: "/teacher/exams/create",
    icon: <Plus className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.SUPERADMIN],
  },
  {
    id: "my-exams",
    title: "Mes examens",
    href: "/teacher/exams",
    icon: <Book className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.SUPERADMIN],
  },
  {
    id: "stats",
    title: "Statistiques",
    href: "/teacher/stats",
    icon: <BarChart className="w-5 h-5" />,
    roles: [Role.TEACHER, Role.SUPERADMIN],
    badge: 3, // Exemple de badge pour des notifications
  },

  // Pages pour les étudiants
  {
    id: "available-exams",
    title: "Examens disponibles",
    href: "/student/exams",
    icon: <FileText className="w-5 h-5" />,
    roles: [Role.STUDENT, Role.SUPERADMIN],
  },
  {
    id: "results",
    title: "Mes résultats",
    href: "/student/results",
    icon: <ClipboardList className="w-5 h-5" />,
    roles: [Role.STUDENT, Role.SUPERADMIN],
  },
];