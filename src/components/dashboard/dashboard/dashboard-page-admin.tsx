"use client"

import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { FileText, BarChart3, ChevronDown, PlusCircle, Settings } from "lucide-react"
import MetricCard from "./metric-card"
import { format } from "date-fns"
import { ExamStatus } from "@prisma/client"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

interface AdminDashboardData {
    metrics: {
        totalExams: number;
        examsInProgress: number;
        gradedExams: number;
        averageScore: number;
    };
    recentExams: {
        id: string;
        title: string;
        type: string;
        deadline: Date | null;
        status: ExamStatus;
    }[];
}

interface DashboardPageAdminProps {
    data: AdminDashboardData | null;
}

export default function DashboardPageAdmin({ data }: DashboardPageAdminProps) {

    const t = useTranslations()

    if (!data) return null;


    const { metrics, recentExams } = data;

    const getStatusText = (status: ExamStatus) => {
        switch (status) {
            case 'COMPLETED':
                return t('calendar.details.status.COMPLETED');
            case 'ACTIVE':
                return t('calendar.details.status.ACTIVE');
            case 'PENDING':
                return t('calendar.details.status.PENDING');
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="px-4 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t('dashboard.teacher.title')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('dashboard.teacher.description')}</p>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title={t('dashboard.teacher.metrics.total_exams')}
                    value={metrics.totalExams.toString()}
                    description={t('dashboard.teacher.metrics.total_exams_description')}
                    icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                    progress={100}
                />
                <MetricCard
                    title={t('dashboard.teacher.metrics.exams_in_progress')}
                    value={metrics.examsInProgress.toString()}
                    description={t('dashboard.teacher.metrics.exams_in_progress_description')}
                    icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />}
                    progress={(metrics.examsInProgress / metrics.totalExams) * 100}
                />
                <MetricCard
                    title={t('dashboard.teacher.metrics.graded_exams')}
                    value={metrics.gradedExams.toString()}
                    description={t('dashboard.teacher.metrics.graded_exams_description')}
                    icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                    progress={(metrics.gradedExams / metrics.totalExams) * 100}
                />
                <MetricCard
                    title={t('dashboard.teacher.metrics.average_score')}
                    value={`${metrics.averageScore}%`}
                    description={t('dashboard.teacher.metrics.average_score_description')}
                    icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
                    progress={metrics.averageScore}
                />
            </div>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 px-4 sm:px-0">
                    <h3 className="text-base sm:text-lg font-medium">{t('dashboard.teacher.recent_exams.title')}</h3>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        {t('dashboard.teacher.recent_exams.view_all')}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="rounded-lg border shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">{t('exam.form.title')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('exam.form.format')}</TableHead>
                                <TableHead className="hidden sm:table-cell">{t('exam.form.deadline')}</TableHead>
                                <TableHead className="w-[100px]">{t('exams-component.details.information.status')}</TableHead>
                                <TableHead className="text-right w-[100px]">{t('exams-component.details.title')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentExams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        {t('dashboard.teacher.recent_exams.no_exams')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentExams.map((exam) => (
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
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${exam.status === 'COMPLETED'
                                                    ? "bg-green-100 text-green-800"
                                                    : exam.status === 'ACTIVE'
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {getStatusText(exam.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="sr-only">{t('exams.edit')}</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <BarChart3 className="h-4 w-4" />
                                                    <span className="sr-only">{t('exams-component.details.results.title')}</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="space-y-4 px-4 sm:px-0">
                <h3 className="text-base sm:text-lg font-medium">{t('dashboard.teacher.quick_actions.title')}</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <Link href="/exams/create" className="w-full h-24">
                        <Button variant="default" className="w-full cursor-pointer h-full flex-col items-start gap-1 p-4 justify-start">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-medium text-sm sm:text-base">{t('dashboard.teacher.quick_actions.create_exam')}</span>
                            </div>
                            <span className="text-xs text-black dark:text-accent text-wrap text-left">{t('dashboard.teacher.quick_actions.create_exam_description')}</span>
                        </Button>
                    </Link>
                    <Link href="/exams" className="w-full h-24">
                        <Button variant="outline" className="w-full cursor-pointer h-full flex-col items-start gap-1 p-4 justify-start">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-medium text-sm sm:text-base">{t('dashboard.teacher.quick_actions.view_exams')}</span>
                            </div>
                            <span className="text-xs text-muted-foreground text-wrap text-left">{t('dashboard.teacher.quick_actions.view_exams_description')}</span>
                        </Button>
                    </Link>
                    <Link href="/settings" className="w-full h-24">
                        <Button variant="outline" className="w-full cursor-pointer h-full flex-col items-start gap-1 p-4 justify-start">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-medium text-sm sm:text-base">{t('dashboard.teacher.quick_actions.view_settings')}</span>
                            </div>
                            <span className="text-xs text-muted-foreground text-wrap text-left">{t('dashboard.teacher.quick_actions.view_settings_description')}</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
