"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Terminal, CheckCircle, Code2, Brain, BookOpen, Clock, Award, Menu, X } from "lucide-react"
import { FloatingElement } from "./floating-element"
import {FeatureCard} from "@/components/landing/feature-card";
import {StatCard} from "@/components/landing/sat-card";
import {WorkflowSection} from "@/components/landing/workflow-section";
import {ModeToggle} from "@/components/theme/button-theme";
import {Button} from "@/components/ui/button";
import {WorkflowGrade} from "@/components/landing/workflow-grade";
import {Testimonials} from "@/components/landing/testimonials";
import Link from "next/link";

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div
            className="min-h-screen  bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 ">
            {/* Navigation */}
            <nav
                className="relative sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Terminal className="h-6 w-6 text-primary"/>
                            <span className="text-xl font-bold">CodeGrade</span>
                        </div>

                        {/*<div className="hidden md:flex space-x-8">*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                        {/*    >*/}
                        {/*        À propos*/}
                        {/*    </a>*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                        {/*    >*/}
                        {/*        Fonctionnalités*/}
                        {/*    </a>*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                        {/*    >*/}
                        {/*        Tarifs*/}
                        {/*    </a>*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                        {/*    >*/}
                        {/*        Contact*/}
                        {/*    </a>*/}
                        {/*</div>*/}

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="hidden md:inline-block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                Se connecter
                            </Link>
                            <Button
                                className="bg-primary text-white px-6 py-2 rounded-full  transition-colors">
                                Commencer
                            </Button>
                            <ModeToggle/>
                            <button
                                className="md:hidden text-gray-600 dark:text-gray-400"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X/> : <Menu/>}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {/*{mobileMenuOpen && (*/}
                    {/*    <div className="md:hidden mt-4 pb-2">*/}
                    {/*    <div className="flex flex-col space-y-3">*/}
                    {/*            <a*/}
                    {/*                href="#"*/}
                    {/*                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                    {/*            >*/}
                    {/*                À propos*/}
                    {/*            </a>*/}
                    {/*            <a*/}
                    {/*                href="#"*/}
                    {/*                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                    {/*            >*/}
                    {/*                Fonctionnalités*/}
                    {/*            </a>*/}
                    {/*            <a*/}
                    {/*                href="#"*/}
                    {/*                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                    {/*            >*/}
                    {/*                Tarifs*/}
                    {/*            </a>*/}
                    {/*            <a*/}
                    {/*                href="#"*/}
                    {/*                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                    {/*            >*/}
                    {/*                Contact*/}
                    {/*            </a>*/}
                    {/*            <a*/}
                    {/*                href="#"*/}
                    {/*                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"*/}
                    {/*            >*/}
                    {/*                Se connecter*/}
                    {/*            </a>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center relative z-10 mb-20">
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text "
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8}}
                        >
                            Planifiez. Évaluez. Automatisez
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.2}}
                        >
                            Créez, distribuez et corrigez automatiquement des évaluations de programmation avec QCM,
                            éditeur de code intégré ou soumission de PDF, le tout analysé par IA.
                        </motion.p>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.4}}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <button className="bg-primary text-white px-8 py-3 rounded-full  transition-colors">
                                Essayer gratuitement
                            </button>
                            <button
                                className="bg-white text-gray-900 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
                                Voir la démo
                            </button>
                        </motion.div>
                    </div>

                    {/* Floating Elements */}
                    <div className="relative h-[400px] md:h-[500px]">
                        {/* Code Editor Preview */}
                        <FloatingElement delay={0.6}
                                         className="absolute left-0 md:left-10 top-0 max-w-[280px] md:max-w-sm">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Code2 className="h-5 w-5 text-primary"/>
                                    <span className="text-sm font-medium">test.py</span>
                                </div>
                                <pre
                                    className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm font-mono overflow-x-auto">
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
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="h-5 w-5 text-purple-600"/>
                                    <span className="text-sm font-medium">Analyse IA</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5"/>
                                        <span
                                            className="text-sm text-gray-600 dark:text-gray-400">Tests réussis: 5/5</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5"/>
                                        <span
                                            className="text-sm text-gray-600 dark:text-gray-400">Complexité: O(2^n)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5"/>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                      Suggestion: Utiliser la mémoïsation pour améliorer les performances
                    </span>
                                    </div>
                                </div>
                            </div>
                        </FloatingElement>

                        {/* Statistics */}
                        <FloatingElement delay={1} className="absolute left-1/4 bottom-0 max-w-[280px] md:max-w-sm">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">98%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Gain de temps sur la
                                        correction
                                    </div>
                                </div>
                            </div>
                        </FloatingElement>

                        {/* Assignment Card */}
                        <FloatingElement delay={1.2} className="absolute right-1/4 bottom-10 max-w-[280px] md:max-w-sm">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="h-5 w-5 text-orange-500"/>
                                    <span className="text-sm font-medium">Devoir: Algorithmes récursifs</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4"/>
                                        <span>Échéance: 15 juin</span>
                                    </div>
                                    <div>25 étudiants</div>
                                </div>
                            </div>
                        </FloatingElement>
                        <div className="absolute inset-0 z-0">
                            <div
                                className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary  rounded-full filter blur-3xl opacity-50"/>
                            <div
                                className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50"/>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="container mx-auto px-4 mt-20">
                    <motion.h2
                        className="text-3xl font-bold text-center mb-12"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8}}
                    >
                        Pourquoi choisir CodeGrade?
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="h-8 w-8 text-purple-600"/>}
                            title="Correction IA"
                            description="Notre IA analyse le code des étudiants, vérifie la syntaxe, exécute les tests et fournit des commentaires personnalisés."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Clock className="h-8 w-8 text-primary"/>}
                            title="Gain de temps"
                            description="Automatisez les tâches répétitives et concentrez-vous sur l'accompagnement pédagogique de vos étudiants."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<Award className="h-8 w-8 text-primary"/>}
                            title="Évaluation équitable"
                            description="Des critères d'évaluation cohérents pour tous les étudiants, avec des rapports détaillés et transparents."
                            delay={0.6}
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="container mx-auto px-4 mt-20">
                    <div className="bg-muted dark:bg-gray-800 rounded-2xl p-8 md:p-12 mb-4">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <StatCard number="10,000+" label="Étudiants évalués" delay={0.2}/>
                            <StatCard number="500+" label="Établissements" delay={0.4}/>
                            <StatCard number="98%" label="Satisfaction" delay={0.6}/>
                        </div>
                    </div>
                </div>

                {/* Ajouter la nouvelle section Workflow */}
                <WorkflowSection/>

                <WorkflowGrade/>
                {/*<div className={"w-full p-10 px-50"}>*/}
                {/*    <DashboardSlider/>*/}
                {/*</div>*/}
                <Testimonials/>

            </section>


            {/* CTA Section */}
            <section className="bg-gray-100 dark:bg-gray-800 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Prêt à transformer vos examens de programmation?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            Rejoignez des centaines d&apos;établissements qui font confiance à CodeGrade pour leurs
                            évaluations.
                        </p>
                        <Button className="bg-primary text-white  rounded-full hover:bg-primary transition-colors">
                            Commencer gratuitement
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Terminal className="h-6 w-6 text-primary"/>
                                <span className="text-xl font-bold">CodeGrade</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                La plateforme d&apos;évaluation de code qui simplifie la vie des enseignants.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Produit</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Fonctionnalités
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Tarifs
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Témoignages
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Guide d&apos;utilisation
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Entreprise</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        À propos
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Carrières
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Légal</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Confidentialité
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Conditions d&apos;utilisation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        Cookies
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div
                        className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
                        © {new Date().getFullYear()} CodeGrade. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    )
}










