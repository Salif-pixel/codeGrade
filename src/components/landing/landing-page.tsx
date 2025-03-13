"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Terminal, CheckCircle, Code2, Brain, BookOpen, Clock, Award, Menu, X } from "lucide-react"
import { FloatingElement } from "./floating-element"
import { FeatureCard } from "@src/components/landing/feature-card"
import { StatCard } from "@src/components/landing/sat-card"
import { WorkflowSection } from "@src/components/landing/workflow-section"
import { ModeToggle } from "@src/components/theme/button-theme"
import { Button } from "@src/components/ui/button"
import { WorkflowGrade } from "@src/components/landing/workflow-grade"
import {Link} from '@src/i18n/navigation';
import Hero from "@src/components/landing/hero"
import ForTeachers from "@src/components/landing/for-teacher"
import ForStudents from "@src/components/landing/for-student"
import Testimonials from "@src/components/landing/testimonials"
import {useTranslations} from 'next-intl';
import LanguageSwitcher from "@src/components/internalization/language-switcher";
export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const  t  = useTranslations('LandingPage')


    return (
        <div
            className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background">
            {/* Navigation */}
            <nav
                className="relative sticky top-0 z-50 border-b border-gray-200 dark:border-background bg-white/80 dark:bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Terminal className="h-6 w-6 text-primary"/>
                            <span className="text-xl font-bold">{t('nav.brand')}</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="hidden  md:inline-block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                {t('nav.login')}
                            </Link>
                            <Button
                                className="hidden  md:inline-block bg-primary cursor-pointer text-white px-6 py-2 rounded-full transition-colors">
                                {t('nav.start')}
                            </Button>
                            <LanguageSwitcher/>
                            <ModeToggle/>
                            <button
                                className="md:hidden text-gray-600 dark:text-gray-400"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X/> : <Menu/>}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <Hero />
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4">

                    {/* Floating Elements */}
                    <div className="relative h-[400px] md:h-[500px]">
                        {/* Code Editor Preview */}
                        <FloatingElement delay={0.6}
                                         className="absolute left-0 md:left-10 top-0 max-w-[280px] md:max-w-sm">
                            <div
                                className="bg-white dark:bg-background rounded-lg shadow-xl p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Code2 className="h-5 w-5 text-primary"/>
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
                                    <Brain className="h-5 w-5 text-purple-600"/>
                                    <span className="text-sm font-medium">{t('floating.aiAnalysis')}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5"/>
                                        <span
                                            className="text-sm text-gray-600 dark:text-gray-400">{t('floating.testsPassed')}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5"/>
                                        <span
                                            className="text-sm text-gray-600 dark:text-gray-400">{t('floating.complexity')}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5"/>
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
                                    <BookOpen className="h-5 w-5 text-orange-500"/>
                                    <span className="text-sm font-medium">{t('floating.assignment')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4"/>
                                        <span>{t('floating.deadline')}</span>
                                    </div>
                                    <div>{t('floating.studentsCount')}</div>
                                </div>
                            </div>
                        </FloatingElement>
                        <div className="absolute inset-0 z-0">
                            <div
                                className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-3xl opacity-50"/>
                            <div
                                className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50"/>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="container mx-auto px-10 mt-20">
                    <motion.h2
                        className="text-3xl font-bold text-center mb-12"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8}}
                    >
                        {t('features.title')}
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="h-8 w-8 text-purple-600"/>}
                            title={t('features.aiGrading.title')}
                            description={t('features.aiGrading.description')}
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Clock className="h-8 w-8 text-primary"/>}
                            title={t('features.timeSaving.title')}
                            description={t('features.timeSaving.description')}
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<Award className="h-8 w-8 text-primary"/>}
                            title={t('features.fairEvaluation.title')}
                            description={t('features.fairEvaluation.description')}
                            delay={0.6}
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="container mx-auto px-4 mt-20">
                    <div className="bg-muted dark:bg-zinc-900 rounded-2xl p-8 md:p-12 mb-4">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <StatCard number="10,000+" label={t('stats.studentsEvaluated')} delay={0.2}/>
                            <StatCard number="500+" label={t('stats.institutions')} delay={0.4}/>
                            <StatCard number="98%" label={t('stats.satisfaction')} delay={0.6}/>
                        </div>
                    </div>
                </div>

                {/* Ajouter la nouvelle section Workflow */}
                <WorkflowSection/>

                <WorkflowGrade/>
                <ForTeachers/>
                <ForStudents/>
                <Testimonials/>

            </section>


            {/* CTA Section */}
            <section className="bg-gray-100 dark:bg-zinc-900 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            {t('cta.subtitle')}
                        </p>
                        <Button className="bg-primary text-white rounded-full hover:bg-primary transition-colors">
                            {t('cta.button')}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-background py-12 border-t border-gray-200 dark:border-muted">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Terminal className="h-6 w-6 text-primary"/>
                                <span className="text-xl font-bold">{t('nav.brand')}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {t('footer.description')}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">{t('footer.product.title')}</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.product.features')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.product.pricing')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.product.testimonials')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.product.guide')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">{t('footer.company.title')}</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.company.about')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.company.blog')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.company.careers')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.company.contact')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">{t('footer.legal.title')}</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.legal.privacy')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.legal.terms')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary dark:hover:text-primary">
                                        {t('footer.legal.cookies')}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('footer.copyright', { year: new Date().getFullYear() })}
                    </div>
                </div>
            </footer>
        </div>
    )
}