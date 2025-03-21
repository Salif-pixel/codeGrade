"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Terminal, CheckCircle, Code2, Brain, BookOpen, Clock, Award, Menu, X } from "lucide-react"
import { FloatingElement } from "./items/floating-element"
import { FeatureCard } from "@/components/landing/items/feature-card"
import { StatCard } from "@/components/landing/items/sat-card"
import { WorkflowSection } from "@/components/landing/sections/workflow-section"
import { ModeToggle } from "@/components/utilities/theme/button-theme"
import { Button } from "@/components/ui/button"
import { WorkflowGrade } from "@/components/landing/sections/workflow-grade"
import { Link } from '@/i18n/navigation';
import Hero from "@/components/landing/sections/hero"
import ForTeachers from "@/components/landing/sections/for-teacher"
import ForStudents from "@/components/landing/sections/for-student"
import Testimonials from "@/components/landing/sections/testimonials"
import { useTranslations } from 'next-intl';
import LandingNavigation from "./sections/landing-navigation"
import FooterCta from "./sections/footer-cta"
import FloatingUi from "./sections/floating-ui"
import Stats from "./sections/stats"
export default function LandingPage() {

    const t = useTranslations('LandingPage')

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background">

            <LandingNavigation />

            <Hero />

            <section className="relative pt-20 pb-32 overflow-hidden">
                <FloatingUi />
                <Stats />
                <WorkflowSection />
                <WorkflowGrade />
                <ForTeachers />
                <ForStudents />
                <Testimonials />
            </section>

            <FooterCta />

        </div>
    )
}
