"use client"

import {Terminal, Brain, Clock, Code2, Server, TestTube2, GitBranch, Database} from "lucide-react"
import { motion } from "framer-motion"

const features = [
    {
        name: 'Déploiement instantané des exercices.',
        description: 'Publiez vos sujets de devoir en un clic. Les étudiants y ont accès immédiatement dans leur environnement de développement intégré.',
        icon: GitBranch,
    },
    {
        name: 'Correction automatisée sécurisée.',
        description: 'Notre système exécute les tests dans un environnement  isolé avec vérification anti-triche et analyse de similarité du code.',
        icon: TestTube2,
    },
    {
        name: 'Gestion des délais et des retards.',
        description: 'Définissez des dates limites pour la remise des devoirs et automatisez la gestion des retards et des pénalités.',
        icon: Clock,
    },
    {
        name: 'Sauvegarde automatique',
        description: 'Toutes les soumissions et évaluations sont automatiquement sauvegardées et accessibles à tout moment,\n' +
            '                sans perte de données.',
        icon: Database ,
    },
    {
        name: 'Feedback intelligent par IA.',
        description: 'Notre intelligence artificielle analyse le code et fournit des commentaires personnalisés sur la qualité, les bonnes pratiques et les optimisations possibles.',
        icon: Brain,
    },
]

export function WorkflowSection() {
    return (
        <section className="overflow-hidden bg-gray-50 dark:bg-gray-950 py-24 sm:py-32">
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
                                Workflow pédagogique
                            </motion.h2>
                            <motion.p
                                className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white sm:text-5xl"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Un processus d&apos;évaluation complet
                            </motion.p>
                            <motion.p
                                className="mt-6 text-lg/8 text-gray-600 dark:text-gray-400"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                De la création des exercices à la remise des notes, automatisez toutes les étapes tout en gardant le contrôle pédagogique.
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
                        className="relative w-[48rem] max-w-none rounded-xl shadow-2xl"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Code2 className="h-6 w-6 text-primary" />
                                <span className="text-lg font-semibold">Environnement étudiant</span>
                            </div>

                            <div className="space-y-6">
                                {/* Éditeur de code */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>solution.js</span>
                                        <span className="text-primary">En cours</span>
                                    </div>
                                    <pre className="text-sm font-mono text-gray-800 dark:text-gray-300">
                    {`function factorial(n) {\n  // Votre code ici\n}`}
                  </pre>
                                </div>

                                {/* Console de test */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Terminal className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Résultats des tests</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="text-red-500">× Test 1: Échec (0/1)</div>
                                        <div className="text-gray-500">✓ Test 2: Réussi (1/1)</div>
                                    </div>
                                </div>

                                {/* Feedback IA */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm">Suggestions de l&apos;IA</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pensez à gérer le cas n=0 et à ajouter une condition d&apos;arrêt pour la récursivité.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}