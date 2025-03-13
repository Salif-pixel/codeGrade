import { BookOpen, Brain, CheckCircle, Clock, Code2 } from "lucide-react";
import { FloatingElement } from "../items/floating-element";
import { useTranslations } from "next-intl";

export default function FloatingUi() {

    const t = useTranslations('LandingPage')
    return (
        <div className="container mx-auto px-4">
            <div className="relative h-[400px] md:h-[500px]">
                {/* Code Editor Preview */}
                <FloatingElement delay={0.6}
                    className="absolute left-0 md:left-10 top-0 max-w-[280px] md:max-w-sm">
                    <div
                        className="bg-white dark:bg-background rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Code2 className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">{t('floating.fileName')}</span>
                        </div>
                        <pre
                            className="bg-gray-50 dark:bg-background/50 p-3 rounded text-sm font-mono overflow-x-auto">
                            <code className="text-gray-800 dark:text-gray-300">
                                {`def fibonacci(n):
  if n <= 1:
    return n
  return fibonacci(n-1) + fibonacci(n-2)

# Test cases
assert fibonacci(0) == 0
assert fibonacci(1) == 1
assert fibonacci(5) == 5`}
                            </code>
                        </pre>
                    </div>
                </FloatingElement>

                {/* AI Feedback */}
                <FloatingElement delay={0.8}
                    className="absolute right-0 md:right-10 top-10 max-w-[280px] md:max-w-sm">
                    <div
                        className="bg-white dark:bg-background rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium">{t('floating.aiAnalysis')}</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                <span
                                    className="text-sm text-gray-600 dark:text-gray-400">{t('floating.testsPassed')}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                <span
                                    className="text-sm text-gray-600 dark:text-gray-400">{t('floating.complexity')}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('floating.suggestion')}
                                </span>
                            </div>
                        </div>
                    </div>
                </FloatingElement>

                {/* Statistics */}
                <FloatingElement delay={1} className="absolute left-1/4 bottom-0 max-w-[280px] md:max-w-sm">
                    <div
                        className="bg-white dark:bg-background rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{t('floating.satisfactionRate')}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {t('stats.satisfaction')}
                            </div>
                        </div>
                    </div>
                </FloatingElement>

                {/* Assignment Card */}
                <FloatingElement delay={1.2} className="absolute right-1/4 bottom-10 max-w-[280px] md:max-w-sm">
                    <div
                        className="bg-white dark:bg-background rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-medium">{t('floating.assignment')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{t('floating.deadline')}</span>
                            </div>
                            <div>{t('floating.studentsCount')}</div>
                        </div>
                    </div>
                </FloatingElement>
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-3xl opacity-50" />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50" />
                </div>
            </div>
        </div>
    );
}