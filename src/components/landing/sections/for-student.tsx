"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image";
import feedbackDark from "../../../../public/assets/feedback-dark.png"
export default function ForStudents() {
    const t = useTranslations('for-students')
    const sectionRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const benefitsRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
            // Animation de l'image
            gsap.from(imageRef.current, {
                x: -50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: imageRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none",
                },
            })

            // Animation du contenu
            gsap.from(contentRef.current?.children ?? [], {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: contentRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none",
                },
            })

            // Animation des avantages
            gsap.from(benefitsRef.current?.children ?? [], {
                x: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: benefitsRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="py-20 lg:px-16 md:px-12 px-6 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div ref={imageRef} className="relative order-2 lg:order-1">
                        <div className="relative rounded-xl overflow-hidden shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10"></div>
                            <Image
                                src={feedbackDark}
                                alt={t('image-alt')}
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="absolute -top-8 -right-8 bg-background dark:bg-zinc-900 p-4 rounded-lg shadow-lg z-20 max-w-[180px]">
                            <div className="font-medium">{t('stats.feedback-time.label')}</div>
                            <div className="text-3xl font-bold text-primary">{t('stats.feedback-time.value')}</div>
                        </div>

                        <div className="absolute -bottom-8 -left-8 bg-background dark:bg-zinc-900 p-4 rounded-lg shadow-lg z-20 max-w-[180px]">
                            <div className="font-medium">{t('stats.improvement.label')}</div>
                            <div className="text-3xl font-bold text-primary">{t('stats.improvement.value')}</div>
                        </div>
                    </div>

                    <div ref={contentRef} className="space-y-6 order-1 lg:order-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {t('badge')}
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            {t('title')}
                        </h2>

                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            {t('description')}
                        </p>

                        <ul ref={benefitsRef} className="space-y-3">
                            {t.raw('benefits').map((benefit: string, index: number) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 dark:text-slate-200">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <Button size="lg" className="mt-4">
                            {t('cta')}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}