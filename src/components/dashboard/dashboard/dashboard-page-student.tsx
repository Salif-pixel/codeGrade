import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { FileText, BarChart3, ChevronDown } from "lucide-react"
import MetricCard from "./metric-card"

const studentExams = [
    {
        id: 1,
        title: "SQL Basics",
        type: "Multiple Choice",
        deadline: "Oct 15, 2023",
        attemptsLeft: "2/3",
    },
    {
        id: 2,
        title: "Database Normalization",
        type: "Practical",
        deadline: "Oct 20, 2023",
        attemptsLeft: "1/1",
    },
    {
        id: 3,
        title: "Advanced Joins",
        type: "Practical",
        deadline: "Oct 25, 2023",
        attemptsLeft: "3/3",
    },
    {
        id: 4,
        title: "Database Design",
        type: "Project",
        deadline: "Nov 5, 2023",
        attemptsLeft: "1/1",
    },
    {
        id: 5,
        title: "Query Optimization",
        type: "Practical",
        deadline: "Nov 10, 2023",
        attemptsLeft: "2/2",
    },
]

export default function DashboardPageStudent({ }) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Student Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here's an overview of your exams and progress.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Exams Completed"
                    value="12"
                    description="2 completed this month"
                    icon={<FileText className="h-5 w-5 text-green-500" />}
                    progress={80}
                />
                <MetricCard
                    title="Exams Pending"
                    value="3"
                    description="Next deadline in 2 days"
                    icon={<FileText className="h-5 w-5 text-yellow-500" />}
                    progress={30}
                />
                <MetricCard
                    title="Average Score"
                    value="82%"
                    description="8% higher than class average"
                    icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
                    progress={82}
                />
                <MetricCard
                    title="Next Exam Deadline"
                    value="Oct 15"
                    description="Database Normalization"
                    icon={<FileText className="h-5 w-5 text-primary" />}
                    progress={65}
                />
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Upcoming Exams</h3>
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
                                <TableHead>Attempts Left</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentExams.map((exam) => (
                                <TableRow key={exam.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{exam.type}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{exam.deadline}</TableCell>
                                    <TableCell>{exam.attemptsLeft}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm">Start Exam</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Actions</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Button className="h-auto flex-col items-start gap-1 p-4 justify-start">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <span className="font-medium">View All Exams</span>
                        </div>
                        <span className="text-xs text-black dark:text-accent">Browse all available exams</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 justify-start">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            <span className="font-medium">View Results</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Check your exam results and feedback</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

