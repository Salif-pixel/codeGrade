import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { FileText, BarChart3, ChevronDown, PlusCircle } from "lucide-react"
import MetricCard from "./metric-card"

const teacherExams = [
    {
        id: 1,
        title: "SQL Basics",
        type: "Multiple Choice",
        deadline: "Oct 15, 2023",
        status: "Published",
    },
    {
        id: 2,
        title: "Database Normalization",
        type: "Practical",
        deadline: "Oct 20, 2023",
        status: "Published",
    },
    {
        id: 3,
        title: "Advanced Joins",
        type: "Practical",
        deadline: "Oct 25, 2023",
        status: "Draft",
    },
    {
        id: 4,
        title: "Database Design",
        type: "Project",
        deadline: "Nov 5, 2023",
        status: "Draft",
    },
    {
        id: 5,
        title: "Query Optimization",
        type: "Practical",
        deadline: "Nov 10, 2023",
        status: "Published",
    },
]

export default function DashboardPageTeacher({ }) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here's an overview of your teaching activities.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Exams Created"
                    value="24"
                    description="12% increase from last month"
                    icon={<FileText className="h-5 w-5 text-primary" />}
                    progress={75}
                />
                <MetricCard
                    title="Exams in Progress"
                    value="8"
                    description="3 exams ending this week"
                    icon={<BarChart3 className="h-5 w-5 text-yellow-500" />}
                    progress={40}
                />
                <MetricCard
                    title="Exams Graded"
                    value="16"
                    description="All submissions graded"
                    icon={<FileText className="h-5 w-5 text-green-500" />}
                    progress={100}
                />
                <MetricCard
                    title="Average Student Score"
                    value="78%"
                    description="5% higher than previous exams"
                    icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
                    progress={78}
                />
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Recent Exams</h3>
                    <Button variant="outline" size="sm">
                        View All
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">Type</TableHead>
                                <TableHead className="hidden sm:table-cell">Deadline</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teacherExams.map((exam) => (
                                <TableRow key={exam.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{exam.type}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{exam.deadline}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${exam.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {exam.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <FileText className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <BarChart3 className="h-4 w-4" />
                                                <span className="sr-only">View Results</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Actions</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <Button className="h-auto flex-col items-start gap-1 p-4 justify-start">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5" />
                            <span className="font-medium">Create New Exam</span>
                        </div>
                        <span className="text-xs text-black dark:text-accent">Create a new database exercise exam</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 justify-start">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <span className="font-medium">View All Exams</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Browse all your created exams</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 justify-start">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            <span className="font-medium">View Statistics</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Analyze student performance data</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}