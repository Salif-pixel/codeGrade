"use client"

import { Code2, FileText, ListChecks, UploadCloud, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {useState } from "react"
import { useTranslations } from "next-intl"

export function WorkflowGrade() {
    const t = useTranslations('workflow-grade')
    const assignmentTypes = [
        {
            id: 'coding',
            title: t('assignment-types.coding.title'),
            icon: Code2,
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-muted p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                            <span>{t('assignment-types.coding.file')}</span>
                            <span className="text-primary">{t('assignment-types.coding.status')}</span>
                        </div>
                        <pre className="text-sm font-mono text-gray-800 dark:text-gray-300">
            {`function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}`}
          </pre>
                    </div>
                </div>
            )
        },
        {
            id: 'qcm',
            title: t('assignment-types.qcm.title'),
            icon: ListChecks,
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-muted p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                            <span>{t('assignment-types.qcm.question')}</span>
                            <span className="text-green-500">{t('assignment-types.qcm.status')}</span>
                        </div>
                        <p className="text-sm mb-3">{t('assignment-types.qcm.prompt')}</p>
                        <div className="space-y-2">
                            {['GET', 'POST', 'PUT', 'DELETE'].map((method, i) => (
                                <div key={method} className="flex items-center gap-2 p-2 bg-white dark:bg-muted rounded">
                                    <div className={`h-3 w-3 rounded-full border ${i === 1 ? 'border-primary bg-primary' : 'border-gray-300'}`} />
                                    <span className="text-sm">{method}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'pdf',
            title: t('assignment-types.pdf.title'),
            icon: UploadCloud,
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-muted p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                            <span>{t('assignment-types.pdf.file')}</span>
                            <span className="text-primary">{t('assignment-types.pdf.status')}</span>
                        </div>
                        <div className="border-2 border-dashed border-muted dark:border-gray-400 rounded-lg p-6 text-center">
                            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-muted">{t('assignment-types.pdf.placeholder')}</p>
                            <p className="text-xs text-muted mt-2">{t('assignment-types.pdf.date')}</p>
                        </div>
                    </div>
                </div>
            )
        }
    ]

    const [activeType, setActiveType] = useState(assignmentTypes[0])

    const handleTypeChange = (type: typeof assignmentTypes[number]) => {
        setActiveType(type)
    }

    return (
        <section className="overflow-hidden flex justify-center z-2 bg-gray-50 dark:bg-background py-24 sm:py-32">
            <div className="w-full px-4 lg:px-6">
                <div className="flex flex-col lg:flex-row items-center justify-center lg:gap-16">
                    {/* Preview section */}
                    <motion.div
                        className="w-full lg:w-1/2 max-w-2xl rounded-xl shadow-2xl order-2 lg:order-1"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white dark:bg-background p-6 rounded-xl border border-gray-200 dark:border-muted h-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeType.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-end items-center gap-2 mb-4">
                                        <activeType.icon className="h-6 w-6 text-primary" />
                                        <span className="text-lg font-semibold">{activeType.title}</span>
                                    </div>
                                    {activeType.content}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Controls section */}
                    <div className="w-full lg:w-fit px-8 order-1 lg:order-2">
                        <div className="max-w-lg mx-auto lg:mx-0">
                            <motion.h2 className="text-base/7 font-semibold text-primary">
                                {t('title')}
                            </motion.h2>

                            <motion.p className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
                                {t('heading')}
                            </motion.p>

                            <motion.p className="mt-6 text-base lg:text-lg text-gray-600 dark:text-gray-400">
                                {t('description')}
                            </motion.p>

                            <div className="mt-10 space-y-4">
                                {assignmentTypes.map((type) => (
                                    <motion.div
                                        key={type.id}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-xl cursor-pointer transition-colors ${
                                            activeType.id === type.id
                                                ? 'bg-white dark:bg-background shadow-lg border border-primary'
                                                : 'bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-muted'
                                        }`}
                                        onClick={() => handleTypeChange(type)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <ChevronLeft className="h-5 w-5 text-gray-400 cursor-pointer" />
                                            <div>
                                                <h3 className={`font-semibold ${
                                                    activeType.id === type.id
                                                        ? 'text-primary'
                                                        : 'text-gray-900 dark:text-white'
                                                }`}>
                                                    {type.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {activeType.id === type.id ? t('details') : t('click-to-show')}
                                                </p>
                                            </div>
                                            <type.icon className={`ml-auto h-6 w-6 ${
                                                activeType.id === type.id ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                                            }`} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}