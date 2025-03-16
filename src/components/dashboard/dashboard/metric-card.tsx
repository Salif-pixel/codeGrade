import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function MetricCard({
    title,
    value,
    description,
    icon,
    progress,
}: {
    title: string
    value: string
    description: string
    icon: React.ReactNode
    progress: number
}) {
    return (
        <Card className="transition-all hover:shadow-md cursor-pointer hover:bg-zinc-50 hover:border-primary dark:bg-zinc-900 dark:hover:bg-zinc-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                <Progress value={progress} className="mt-3 h-2" />
            </CardContent>
        </Card>
    )
}