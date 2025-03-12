"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronRight, Copy, Eye, LinkIcon, LogOut, Plus, Search, Settings, Terminal, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"




import {useCustomToast} from "@/components/Alert/alert";

export function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
    const [showAssignmentDetails, setShowAssignmentDetails] = useState(false)

    // Données pour les graphiques
    const submissionData = [
        { date: "2023-03-01", count: 12 },
        { date: "2023-03-02", count: 8 },
        { date: "2023-03-03", count: 15 },
        { date: "2023-03-04", count: 10 },
        { date: "2023-03-05", count: 7 },
        { date: "2023-03-06", count: 13 },
        { date: "2023-03-07", count: 18 },
    ]

    const languageData = [
        { name: "JavaScript", students: 45 },
        { name: "Python", students: 38 },
        { name: "Java", students: 30 },
        { name: "SQL", students: 25 },
        { name: "C++", students: 15 },
    ]

    const performanceData = [
        { name: "Excellent (90-100%)", value: 25 },
        { name: "Bon (80-89%)", value: 40 },
        { name: "Moyen (70-79%)", value: 20 },
        { name: "Passable (60-69%)", value: 10 },
        { name: "Insuffisant (<60%)", value: 5 },
    ]

    // Données des devoirs
    const assignments = [
        {
            id: "js-functions",
            title: "QCM JavaScript - Fonctions et Closures",
            dueDate: "2023-03-20",
            language: "JavaScript",
            questions: 15,
            duration: 30,
            submissions: 24,
            totalStudents: 35,
            status: "active",
            description: "Ce QCM couvre les fonctions, les closures et les concepts avancés de JavaScript.",
            inviteLink: "https://codegrade.edu/join/js-functions-xyz123",
            calendarDate: new Date(2023, 2, 20), // Mars 20, 2023
        },
        {
            id: "sql-advanced",
            title: "Exercices SQL - Requêtes avancées",
            dueDate: "2023-03-25",
            language: "SQL",
            questions: 10,
            duration: 45,
            submissions: 18,
            totalStudents: 35,
            status: "active",
            description: "Exercices pratiques sur les requêtes SQL avancées, incluant les jointures et les sous-requêtes.",
            inviteLink: "https://codegrade.edu/join/sql-advanced-abc456",
            calendarDate: new Date(2023, 2, 25), // Mars 25, 2023
        },
        {
            id: "java-oop",
            title: "Programmation Java - POO",
            dueDate: "2023-04-01",
            language: "Java",
            questions: 8,
            duration: 60,
            submissions: 12,
            totalStudents: 35,
            status: "active",
            description: "Exercices sur la programmation orientée objet en Java, incluant l'héritage et le polymorphisme.",
            inviteLink: "https://codegrade.edu/join/java-oop-def789",
            calendarDate: new Date(2023, 3, 1), // Avril 1, 2023
        },
        {
            id: "python-basics",
            title: "Algorithmes Python - Bases",
            dueDate: "2023-03-15",
            language: "Python",
            questions: 12,
            duration: 40,
            submissions: 35,
            totalStudents: 35,
            status: "completed",
            description: "Introduction aux algorithmes fondamentaux en Python.",
            inviteLink: "https://codegrade.edu/join/python-basics-ghi012",
            calendarDate: new Date(2023, 2, 15), // Mars 15, 2023
        },
    ]

    // Données des étudiants pour un devoir spécifique
    const studentResults = [
        {
            id: 1,
            name: "Marie Dupont",
            email: "marie.d@student.edu",
            score: 92,
            submissionDate: "2023-03-15 14:30",
            status: "completed",
        },
        {
            id: 2,
            name: "Thomas Martin",
            email: "thomas.m@student.edu",
            score: 78,
            submissionDate: "2023-03-10 09:15",
            status: "completed",
        },
        {
            id: 3,
            name: "Sophie Petit",
            email: "sophie.p@student.edu",
            score: null,
            submissionDate: null,
            status: "pending",
        },
        {
            id: 4,
            name: "Lucas Bernard",
            email: "lucas.b@student.edu",
            score: 85,
            submissionDate: "2023-03-15 10:22",
            status: "completed",
        },
        { id: 5, name: "Emma Leroy", email: "emma.l@student.edu", score: null, submissionDate: null, status: "pending" },
        {
            id: 6,
            name: "Hugo Moreau",
            email: "hugo.m@student.edu",
            score: 65,
            submissionDate: "2023-03-14 16:45",
            status: "completed",
        },
        {
            id: 7,
            name: "Léa Dubois",
            email: "lea.d@student.edu",
            score: 88,
            submissionDate: "2023-03-12 11:30",
            status: "completed",
        },
        {
            id: 8,
            name: "Nathan Rousseau",
            email: "nathan.r@student.edu",
            score: 72,
            submissionDate: "2023-03-13 14:20",
            status: "completed",
        },
        {
            id: 9,
            name: "Camille Fournier",
            email: "camille.f@student.edu",
            score: 95,
            submissionDate: "2023-03-11 09:45",
            status: "completed",
        },
        {
            id: 10,
            name: "Maxime Girard",
            email: "maxime.g@student.edu",
            score: null,
            submissionDate: null,
            status: "pending",
        },
    ]
    const { showToast } = useCustomToast();

    // Fonction pour copier le lien d'invitation
    const copyInviteLink = (link: string) => {
        navigator.clipboard.writeText(link)
       showToast("Lien copié dans le presse-papiers", "success")
    }

    return (
        <div className="flex flex-col w-full bg-background">
            {/* Top Navigation */}
            <div className="border-b">
                <div className="flex h-16 items-center px-4 md:px-6">
                    {/* Logo and Platform Name */}
                    <div className="flex items-center mr-4">
                        <Terminal className="h-6 w-6 text-primary mr-2" />
                        <span className="text-xl font-bold">CodeGrade</span>
                    </div>

                    {/* Breadcrumb Navigation */}
                    <div className="hidden md:flex items-center space-x-2 text-muted-foreground">
                        <Link href="#" className="hover:text-foreground">
                            Projets
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="#" className="hover:text-foreground">
                            Web Dev
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground">Évaluation</span>
                    </div>

                    {/* Search */}
                    <div className="ml-auto flex-1 md:flex-initial md:w-80 lg:w-96 px-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Rechercher..." className="w-full bg-background pl-8 rounded-full" />
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 md:gap-4 ml-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>

                        {/* User Profile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                        <AvatarFallback>PR</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Prof. Martin</p>
                                        <p className="text-xs leading-none text-muted-foreground">martin@codegrade.edu</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Paramètres</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Se déconnecter</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation - Now at the top */}
            <div className="border-b bg-background">
                <nav className="flex w-full">
                    <div className="w-full max-w-screen-xl mx-auto px-4">
                        <div className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={`text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "dashboard"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <rect width="7" height="9" x="3" y="3" rx="1" />
                                    <rect width="7" height="5" x="14" y="3" rx="1" />
                                    <rect width="7" height="9" x="14" y="12" rx="1" />
                                    <rect width="7" height="5" x="3" y="16" rx="1" />
                                </svg>
                                <span>Tableau de bord</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab("assignments")
                                    setShowAssignmentDetails(false)
                                }}
                                className={`text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "assignments"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                                    <path d="m9 14 2 2 4-4" />
                                </svg>
                                <span>Devoirs</span>
                                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">3</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("submissions")}
                                className={`text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "submissions"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <path d="M12 18v-6" />
                                    <path d="m9 15 3 3 3-3" />
                                </svg>
                                <span>Soumissions</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("analytics")}
                                className={`text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "analytics"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M3 3v18h18" />
                                    <path d="m19 9-5 5-4-4-3 3" />
                                </svg>
                                <span>Statistiques</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("settings")}
                                className={`text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "settings"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>Paramètres</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 flex flex-col">
                {activeTab === "dashboard" && (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Tableau de bord du professeur</h1>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Soumissions à évaluer</CardTitle>
                                    <CardDescription>Devoirs en attente de correction</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">24</div>
                                    <p className="text-xs text-muted-foreground mt-1">+8 depuis hier</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Taux de réussite moyen</CardTitle>
                                    <CardDescription>Tous devoirs confondus</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">76%</div>
                                    <p className="text-xs text-muted-foreground mt-1">+2.5% ce mois-ci</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Étudiants actifs</CardTitle>
                                    <CardDescription>Dernières 24 heures</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">153</div>
                                    <p className="text-xs text-muted-foreground mt-1">85% du total</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Soumissions récentes</CardTitle>
                                    <CardDescription>Derniers 7 jours</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ChartContainer
                                            config={{
                                                count: {
                                                    label: "Soumissions",
                                                    color: "hsl(var(--chart-1))",
                                                },
                                            }}
                                        >
                                            <LineChart data={submissionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => {
                                                        return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
                                                    }}
                                                />
                                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="var(--color-count)"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent
                                                            labelFormatter={(value) => {
                                                                return new Date(value).toLocaleDateString("fr-FR", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                })
                                                            }}
                                                        />
                                                    }
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition des étudiants par langage</CardTitle>
                                    <CardDescription>Inscriptions aux cours</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ChartContainer
                                            config={{
                                                students: {
                                                    label: "Étudiants",
                                                    color: "hsl(var(--chart-1))",
                                                },
                                            }}
                                        >
                                            <BarChart
                                                data={languageData}
                                                layout="vertical"
                                                margin={{ top: 20, right: 20, bottom: 20, left: 80 }}
                                            >
                                                <XAxis type="number" tickLine={false} axisLine={false} />
                                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                                                <Bar dataKey="students" fill="var(--color-students)" radius={[0, 4, 4, 0]} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Répartition des performances</CardTitle>
                                <CardDescription>Résultats des étudiants</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                    <ChartContainer
                                        config={{
                                            value: {
                                                label: "Étudiants",
                                                color: "hsl(var(--chart-1))",
                                            },
                                        }}
                                        className="w-full max-w-md"
                                    >
                                        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <Pie
                                                data={performanceData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="var(--color-value)"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "assignments" && !showAssignmentDetails && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Devoirs</h1>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Nouveau devoir
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[525px]">
                                    <DialogHeader>
                                        <DialogTitle>Créer un nouveau devoir</DialogTitle>
                                        <DialogDescription>
                                            Remplissez les informations pour créer un nouveau devoir. Les étudiants pourront y accéder via un
                                            lien d'invitation.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="title" className="text-right">
                                                Titre
                                            </Label>
                                            <Input id="title" placeholder="Titre du devoir" className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="language" className="text-right">
                                                Langage
                                            </Label>
                                            <Select>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Sélectionner un langage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                    <SelectItem value="python">Python</SelectItem>
                                                    <SelectItem value="java">Java</SelectItem>
                                                    <SelectItem value="sql">SQL</SelectItem>
                                                    <SelectItem value="cpp">C++</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="dueDate" className="text-right">
                                                Date limite
                                            </Label>
                                            <Input id="dueDate" type="date" className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="questions" className="text-right">
                                                Questions
                                            </Label>
                                            <Input
                                                id="questions"
                                                type="number"
                                                min="1"
                                                placeholder="Nombre de questions"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="duration" className="text-right">
                                                Durée (min)
                                            </Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                min="5"
                                                placeholder="Durée en minutes"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">
                                                Description
                                            </Label>
                                            <Textarea id="description" placeholder="Description du devoir" className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Créer le devoir</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Tabs defaultValue="list" className="mb-6">
                            <TabsList>
                                <TabsTrigger value="list">Liste</TabsTrigger>
                                <TabsTrigger value="calendar">Calendrier</TabsTrigger>
                            </TabsList>
                            <TabsContent value="list" className="space-y-4">
                                {assignments.map((assignment) => (
                                    <Card key={assignment.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{assignment.title}</CardTitle>
                                                    <CardDescription>Date limite: {assignment.dueDate}</CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedAssignment(assignment.id)
                                                            setShowAssignmentDetails(true)
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Voir les détails
                                                    </Button>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <LinkIcon className="mr-2 h-4 w-4" />
                                                                Inviter
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80">
                                                            <div className="space-y-4">
                                                                <h4 className="font-medium">Lien d'invitation</h4>
                                                                <div className="flex items-center space-x-2">
                                                                    <Input value={assignment.inviteLink} readOnly />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => copyInviteLink(assignment.inviteLink)}
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Partagez ce lien avec vos étudiants pour qu'ils puissent rejoindre ce devoir.
                                                                </p>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {assignment.language}
                        </span>
                                                <span className="text-xs">{assignment.questions} questions</span>
                                                <span className="text-xs">{assignment.duration} minutes</span>
                                                <span className="text-xs ml-auto">
                          {assignment.submissions} soumissions / {assignment.totalStudents} étudiants
                        </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>
                            <TabsContent value="calendar">
                                {/* Dans la section du calendrier (activeTab === "assignments"), remplacer le contenu existant par : */}
                                <div className="flex flex-col h-[calc(100vh-12rem)]">

                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}

                {activeTab === "assignments" && showAssignmentDetails && selectedAssignment && (
                    <>
                        <div className="flex items-center mb-6">
                            <Button variant="ghost" size="sm" onClick={() => setShowAssignmentDetails(false)} className="mr-4">
                                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                                Retour
                            </Button>
                            <h1 className="text-2xl font-bold">Détails du devoir</h1>
                        </div>

                        {(() => {
                            const assignment = assignments.find((a) => a.id === selectedAssignment)
                            if (!assignment) return null

                            return (
                                <>
                                    <Card className="mb-6">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{assignment.title}</CardTitle>
                                                    <CardDescription>Date limite: {assignment.dueDate}</CardDescription>
                                                </div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <LinkIcon className="mr-2 h-4 w-4" />
                                                            Lien d'invitation
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80">
                                                        <div className="space-y-4">
                                                            <h4 className="font-medium">Lien d'invitation</h4>
                                                            <div className="flex items-center space-x-2">
                                                                <Input value={assignment.inviteLink} readOnly />
                                                                <Button size="sm" variant="ghost" onClick={() => copyInviteLink(assignment.inviteLink)}>
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Partagez ce lien avec vos étudiants pour qu'ils puissent rejoindre ce devoir.
                                                            </p>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <h3 className="font-medium mb-2">Informations</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Langage:</span>
                                                            <span className="text-sm font-medium">{assignment.language}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Questions:</span>
                                                            <span className="text-sm font-medium">{assignment.questions}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Durée:</span>
                                                            <span className="text-sm font-medium">{assignment.duration} minutes</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Statut:</span>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    assignment.status === "active"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-blue-100 text-blue-800"
                                                                }
                                                            >
                                                                {assignment.status === "active" ? "Actif" : "Terminé"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium mb-2">Description</h3>
                                                    <p className="text-sm">{assignment.description}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Résultats des étudiants</CardTitle>
                                                <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {assignment.submissions} soumissions / {assignment.totalStudents} étudiants
                          </span>
                                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                                        {Math.round((assignment.submissions / assignment.totalStudents) * 100)}% de participation
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Étudiant</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Statut</TableHead>
                                                        <TableHead>Date de soumission</TableHead>
                                                        <TableHead className="text-right">Score</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {studentResults.map((student) => (
                                                        <TableRow key={student.id}>
                                                            <TableCell className="font-medium">{student.name}</TableCell>
                                                            <TableCell>{student.email}</TableCell>
                                                            <TableCell>
                                                                {student.status === "completed" ? (
                                                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                                                        Complété
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                                        En attente
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{student.submissionDate || "-"}</TableCell>
                                                            <TableCell className="text-right">
                                                                {student.score !== null ? (
                                                                    <span
                                                                        className={`font-medium ${
                                                                            student.score >= 80
                                                                                ? "text-green-600"
                                                                                : student.score >= 60
                                                                                    ? "text-yellow-600"
                                                                                    : "text-red-600"
                                                                        }`}
                                                                    >
                                    {student.score}%
                                  </span>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Affichage de {studentResults.length} étudiants
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">Score moyen:</span>
                                                <span className="font-medium text-green-600">
                          {Math.round(
                              studentResults.filter((s) => s.score !== null).reduce((acc, s) => acc + (s.score || 0), 0) /
                              studentResults.filter((s) => s.score !== null).length,
                          )}
                                                    %
                        </span>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </>
                            )
                        })()}
                    </>
                )}

                {activeTab === "submissions" && (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Soumissions</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Soumissions récentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    <div className="py-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">Marie Dupont</h4>
                                            <p className="text-sm text-muted-foreground">QCM JavaScript - Soumis le 15/03/2023 à 14:30</p>
                                        </div>
                                        <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mr-2">
                        Corrigé par IA
                      </span>
                                            <span className="font-medium">92%</span>
                                            <Button variant="ghost" size="sm" className="ml-2">
                                                Réviser
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="py-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">Thomas Martin</h4>
                                            <p className="text-sm text-muted-foreground">Exercices SQL - Soumis le 10/03/2023 à 09:15</p>
                                        </div>
                                        <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mr-2">
                        Corrigé par IA
                      </span>
                                            <span className="font-medium">78%</span>
                                            <Button variant="ghost" size="sm" className="ml-2">
                                                Réviser
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="py-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">Sophie Petit</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Programmation Python - Soumis le 05/03/2023 à 16:45
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 mr-2">
                        En attente
                      </span>
                                            <Button variant="outline" size="sm">
                                                Corriger
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="py-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">Lucas Bernard</h4>
                                            <p className="text-sm text-muted-foreground">QCM JavaScript - Soumis le 15/03/2023 à 10:22</p>
                                        </div>
                                        <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mr-2">
                        Corrigé par IA
                      </span>
                                            <span className="font-medium">85%</span>
                                            <Button variant="ghost" size="sm" className="ml-2">
                                                Réviser
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="py-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">Emma Leroy</h4>
                                            <p className="text-sm text-muted-foreground">Programmation Java - Soumis le 14/03/2023 à 18:05</p>
                                        </div>
                                        <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 mr-2">
                        En attente
                      </span>
                                            <Button variant="outline" size="sm">
                                                Corriger
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "analytics" && (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Statistiques</h1>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance par langage</CardTitle>
                                    <CardDescription>Moyenne des notes par langage</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">JavaScript</span>
                                                <span className="text-sm font-medium">85%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">SQL</span>
                                                <span className="text-sm font-medium">78%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: "78%" }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">Java</span>
                                                <span className="text-sm font-medium">92%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: "92%" }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">Python</span>
                                                <span className="text-sm font-medium">90%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: "90%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Taux de complétion des devoirs</CardTitle>
                                    <CardDescription>Pourcentage d'étudiants ayant soumis leurs devoirs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ChartContainer
                                            config={{
                                                value: {
                                                    label: "Taux de complétion",
                                                    color: "hsl(var(--chart-1))",
                                                },
                                            }}
                                        >
                                            <BarChart
                                                data={[
                                                    { name: "QCM JavaScript", value: 68 },
                                                    { name: "Exercices SQL", value: 51 },
                                                    { name: "Prog. Java", value: 34 },
                                                    { name: "Algo. Python", value: 85 },
                                                    { name: "Bases C++", value: 42 },
                                                ]}
                                                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === "settings" && (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres de l'IA</CardTitle>
                                <CardDescription>Configuration de la correction automatique</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Correction automatique</h4>
                                            <p className="text-sm text-muted-foreground">Activer la correction automatique par IA</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                                            <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Commentaires détaillés</h4>
                                            <p className="text-sm text-muted-foreground">L'IA fournit des explications détaillées</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                                            <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Suggestions d'amélioration</h4>
                                            <p className="text-sm text-muted-foreground">L'IA propose des pistes d'amélioration</p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-muted relative cursor-pointer">
                                            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Détection de plagiat</h4>
                                            <p className="text-sm text-muted-foreground">
                                                L'IA détecte les similitudes entre les soumissions
                                            </p>
                                        </div>
                                        <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                                            <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button>Enregistrer les modifications</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}

