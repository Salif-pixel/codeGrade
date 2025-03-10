"use client"

import {Code2, FileText, ListChecks, UploadCloud, ChevronRight, LucideProps, ChevronLeft} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ForwardRefExoticComponent, JSX, RefAttributes, useState } from "react"

const assignmentTypes = [
    {
        id: 'coding',
        title: 'Devoirs de programmation',
        icon: Code2,
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                        <span>solution.js</span>
                        <span className="text-primary">En cours</span>
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
        title: 'Questionnaires automatisés',
        icon: ListChecks,
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Question 1/5</span>
                        <span className="text-green-500">✓ Répondu</span>
                    </div>
                    <p className="text-sm mb-3">Quelle méthode HTTP utilise-t-on pour créer une ressource ?</p>
                    <div className="space-y-2">
                        {['GET', 'POST', 'PUT', 'DELETE'].map((method, i) => (
                            <div key={method} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded">
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
        title: 'Dépôt de documents',
        icon: UploadCloud,
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Devoir de java.pdf</span>
                        <span className="text-primary">Déposé</span>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Dissertation_JeanDupont.pdf</p>
                        <p className="text-xs text-gray-400 mt-2">Déposé le 12/06 à 14:30</p>
                    </div>
                </div>
            </div>
        )
    }
]

export function WorkflowGrade() {
    const [activeType, setActiveType] = useState(assignmentTypes[0])

    const handleTypeChange = (type: { id: string, title: string, icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>, content: JSX.Element }) => {
        console.log(type)
        setActiveType(type)
    }

    return (
        <section className="overflow-hidden z-2 bg-gray-50 dark:bg-gray-950 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    {/* Section du cadre (maintenant à gauche) */}
                    <motion.div
                        className="relative w-[48rem] max-w-none rounded-xl shadow-2xl"
                        initial={{ opacity: 0, x: 0 }} // Animation venant de la gauche
                        whileInView={{ opacity: 1, x: -180 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 h-full">
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

                    {/* Section des boutons (maintenant à droite) */}
                    <div className="lg:pt-4 lg:pl-8"> {/* Changement de lg:pr-8 à lg:pl-8 */}
                        <div className="lg:max-w-lg">
                            <motion.h2 className="text-base/7 font-semibold text-primary">
                                Flexibilité pédagogique
                            </motion.h2>

                            <motion.p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white sm:text-5xl">
                                Tous types de devoirs supportés
                            </motion.p>

                            <motion.p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-400">
                                Adaptez vos modalités d&apos;évaluation à chaque matière et type d&apos;exercice.
                            </motion.p>

                            <div className="mt-10 space-y-6">
                                {assignmentTypes.map((type) => (
                                    <motion.div
                                        key={type.id}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-xl cursor-pointer transition-colors ${
                                            activeType.id === type.id
                                                ? 'bg-white dark:bg-gray-900 shadow-lg border border-primary'
                                                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleTypeChange(type)}
                                    >
                                        <div className="flex  items-center gap-4">
                                            <ChevronLeft className=" h-5 w-5 text-gray-400 cursor-pointer"/>
                                            <div>
                                                <h3 className={`font-semibold ${
                                                    activeType.id === type.id
                                                        ? 'text-primary'
                                                        : 'text-gray-900 dark:text-white'
                                                }`}>
                                                    {type.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {type.content === activeType.content ? 'Voir les détails' : 'Cliquez pour afficher'}
                                                </p>
                                            </div>
                                            <type.icon className={`ml-auto h-6 w-6 ${
                                                activeType.id === type.id ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                                            }`}/>


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