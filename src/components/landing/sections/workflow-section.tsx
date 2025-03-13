'use client'

import { useTranslations } from 'next-intl'
import { Terminal, Brain, Clock, Code2, Server, TestTube2, GitBranch, Database, BookOpen, CheckCircle, XCircle, RotateCcw, Play, Info } from 'lucide-react'
import { motion } from 'framer-motion'



export function WorkflowSection() {
    const t = useTranslations('workflow-section')
    const features = [
        {
            name: t('features.list.instantDeployment.name'),
            description: t('features.list.instantDeployment.description'),
            icon: GitBranch,
        },
        {
            name: t('features.list.automatedGrading.name'),
            description: t('features.list.automatedGrading.description'),
            icon: TestTube2,
        },
        {
            name: t('features.list.deadlineManagement.name'),
            description:  t('features.list.deadlineManagement.description'),
            icon: Clock,
        },
        {
            name: t('features.list.automaticBackup.name'),
            description: t('features.list.automaticBackup.description'),
            icon: Database,
        },
        {
            name: t('features.list.aiFeedback.name'),
            description: t('features.list.aiFeedback.description'),
            icon: Brain,
        },
    ]
    return (
        <section className="overflow-hidden bg-gray-50 dark:bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div className="lg:pt-4 lg:pr-8">
                        <div className="lg:max-w-lg">
                            <motion.h2
                                className="text-base/7 font-semibold text-primary"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                {t('title')}
                            </motion.h2>
                            <motion.p
                                className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white sm:text-5xl"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                {t('description')}
                            </motion.p>

                            <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 dark:text-gray-400 lg:max-w-none">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={feature.name}
                                        className="relative pl-9"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <dt className="inline font-semibold text-gray-900 dark:text-white">
                                            <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-primary" />
                                            {feature.name}
                                        </dt>{' '}
                                        <dd className="inline">{feature.description}</dd>
                                    </motion.div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <motion.div
                        className="relative w-[40rem] max-w-none rounded-xl "
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-background  p-6 rounded-xl border border-gray-200 dark:border-muted">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Code2 className="h-6 w-6 text-primary" />
                                    <span className="text-lg font-semibold">{t('exercise.title')}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>{t('exercise.deadline')}</span>
                                </div>
                            </div>

                            {/* Description de l'exercice */}
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">{t('exercise.description')}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {t('exercise.description')}
                                </p>
                                <div className="bg-gray-100 dark:bg-zinc-600 p-2 rounded text-xs font-mono">
                                     <pre className="pl-10 text-sm font-mono text-gray-800 dark:text-gray-300">
{`function factorial(n) {
  if (n === 0) {
    return 1;
  }
  // Complete the function
}`}
                                    </pre>
                                </div>
                            </div>

                            {/* Navigation des fichiers */}
                            <div className="flex border-b dark:border-zinc-400 mb-4">
                            <div className="px-4 py-2 bg-gray-50 dark:bg-muted text-primary border-b-2 border-primary text-sm font-medium rounded-t-md">
                                    {t('exercise.file')}
                                </div>
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    {t('exercise.testFile')}
                                </div>
                            </div>

                            {/* Éditeur de code */}
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg mb-4">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <div className="flex space-x-2">
                                        <span className="px-2 py-1 bg-gray-200 dark:bg-zinc-400 rounded text-xs">{t('exercise.language')}</span>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">{t('exercise.autosaved')}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-400">
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button className="p-1 bg-primary text-white rounded">
                                            <Play className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-100 dark:bg-gray-800 flex flex-col items-center text-xs text-gray-500 pt-1">
                                        <div>1</div>
                                        <div>2</div>
                                        <div>3</div>
                                        <div>4</div>
                                        <div>5</div>
                                    </div>
                                    <pre className="pl-10 text-sm font-mono text-gray-800 dark:text-gray-300">
{`function factorial(n) {
  if (n === 0) {
    return 1;
  }
  // Complete the function
}`}
                                    </pre>
                                </div>
                            </div>

                            {/* Console de test */}
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">{t('exercise.tests.testResult')}</span>
                                    </div>
                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">{t('exercise.tests.result')}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">{t('exercise.tests.test1.name')}</div>
                                            <div className="text-xs text-gray-500">{t('exercise.tests.test1.description')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">{t('exercise.tests.test2.name')}</div>
                                            <div className="text-xs text-gray-500">{t('exercise.tests.test2.description')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">{t('exercise.tests.test3.name')}</div>
                                            <div className="text-xs text-red-500">{t('exercise.tests.test3.description')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">{t('exercise.tests.test4.name')}</div>
                                            <div className="text-xs text-red-500">{t('exercise.tests.test4.description')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback IA */}
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm font-medium">{t('exercise.aiFeedback.title')}</span>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                    <p>{t('exercise.aiFeedback.content.first')}</p>
                                    <p>{t('exercise.aiFeedback.content.second')}</p>
                                    <p>{t('exercise.aiFeedback.content.third')}</p>
                                    <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded mt-2 text-xs">
                                        <div className="font-medium">{t('exercise.aiFeedback.hint')}</div>
                                        <div>{t('exercise.aiFeedback.hintDescription')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Barre de progression */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-medium">{t('progress.title')}</div>
                                    <div className="text-sm text-primary">50%</div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-zinc-400 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
