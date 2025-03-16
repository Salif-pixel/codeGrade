"use client"

import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { FileText, BarChart3, ChevronDown } from "lucide-react"
import MetricCard from "./metric-card"
import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

interface StudentDashboardData {
    metrics: {
        completedExams: number;
        pendingExams: number;
        averageScore: number;
        nextDeadline: {
            date: Date;
            title: string;
        } | null;
    };
    upcomingExams: {
        id: string;
        title: string;
        type: string;
        deadline: Date | null;
        attemptsLeft: string;
    }[];
}

interface DashboardPageStudentProps {
    data: StudentDashboardData | null;
}

export default function DashboardPageStudent({ data }: DashboardPageStudentProps) {
    if (!data) return null;

    const t = useTranslations()

    const { metrics, upcomingExams } = data;

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="px-4 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t('dashboard.student.title')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('dashboard.student.description')}</p>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title={t('dashboard.student.metrics.completed_exams')}
                    value={metrics.completedExams.toString()}
                    description={t('dashboard.student.metrics.completed_exams_description')}
                    icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                    progress={75}
                />
                <MetricCard
                    title={t('dashboard.student.metrics.pending_exams')}
                    value={metrics.pendingExams.toString()}
                    description={metrics.nextDeadline ? `${t('exam.deadline')}: ${metrics.nextDeadline.title}` : t('exams-component.duration.undefined')}
                    icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />}
                    progress={30}
                />
                <MetricCard
                    title={t('dashboard.student.metrics.average_score')}
                    value={`${metrics.averageScore}%`}
                    description={t('dashboard.student.metrics.average_score_description')}
                    icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
                    progress={metrics.averageScore}
                />
                <MetricCard
                    title={t('dashboard.student.metrics.next_deadline')}
                    value={metrics.nextDeadline ? format(new Date(metrics.nextDeadline.date), 'dd MMM') : t('exams-component.duration.undefined')}
                    description={metrics.nextDeadline?.title ?? t('exams-component.duration.undefined')}
                    icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                    progress={65}
                />
            </div>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 px-4 sm:px-0">
                    <h3 className="text-base sm:text-lg font-medium">{t('dashboard.student.upcoming_exams.title')}</h3>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        {t('dashboard.student.upcoming_exams.view_all')}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="rounded-lg border shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">{t('exam.form.title')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('exam.form.format')}</TableHead>
                                <TableHead className="hidden sm:table-cell">{t('exam.deadline')}</TableHead>
                                <TableHead className="w-[100px]">{t('exam.form.max_attempts')}</TableHead>
                                <TableHead className="text-right w-[100px]">{t('exams-component.details.title')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {upcomingExams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        {t('dashboard.student.upcoming_exams.no_exams')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                upcomingExams.map((exam) => (
                                    <TableRow key={exam.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{exam.title}</span>
                                                <span className="text-sm text-muted-foreground md:hidden">{exam.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{exam.type}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {exam.deadline ? format(new Date(exam.deadline), 'dd MMM yyyy') : t('exams-component.duration.undefined')}
                                        </TableCell>
                                        <TableCell>{exam.attemptsLeft}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" className="w-full sm:w-auto">
                                                {t('dashboard.student.upcoming_exams.submit')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="space-y-4 px-4 sm:px-0">
                <h3 className="text-base sm:text-lg font-medium">{t('dashboard.student.quick_actions.title')}</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <Link href="/available-exams" className="w-full h-24">
                        <Button variant="default" className="w-full cursor-pointer h-full flex-col items-start gap-1 p-4 justify-start">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-medium text-sm sm:text-base">{t('dashboard.student.quick_actions.view_available')}</span>
                            </div>
                            <span className="text-xs text-black dark:text-accent text-wrap text-left">{t('dashboard.student.quick_actions.view_available_description')}</span>
                        </Button>
                    </Link>
                    <Link href="/results" className="w-full h-24">
                        <Button variant="outline" className="w-full cursor-pointer h-full flex-col items-start gap-1 p-4 justify-start">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-medium text-sm sm:text-base">{t('dashboard.student.quick_actions.view_results')}</span>
                            </div>
                            <span className="text-xs text-muted-foreground text-wrap text-left">{t('dashboard.student.quick_actions.view_results_description')}</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

