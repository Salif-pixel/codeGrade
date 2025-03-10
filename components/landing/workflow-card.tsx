export function WorkflowCard({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                {number}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground ">{description}</p>
        </div>
    )
}