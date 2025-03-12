import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import {useTranslations} from "next-intl";


export default function Hero() {
    const  t  = useTranslations("hero-section")
    const heroRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.from(titleRef.current, { y: 50, opacity: 0, duration: 0.8, ease: "power3.out" })
                .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
                .from(ctaRef.current?.children ?? [], { y: 20, opacity: 0, stagger: 0.2, duration: 0.6, ease: "power3.out" }, "-=0.4")
                .from(imageRef.current, { scale: 0.9, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.6")
        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={heroRef} className="bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px] relative min-h-screen p-10 flex items-center bg-background overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/30 bg-[length:30px_30px] z-0"></div>

            <div className="container mx-auto px-4 py-20 md:py-32 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div
                            className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                            {t('tagline')}
                        </div>

                        <h1 ref={titleRef}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t('headline')}
                        </h1>

                        <p ref={subtitleRef} className="text-xl text-slate-600 dark:text-slate-300 max-w-xl">
                            {t('description')}
                        </p>

                        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button size="lg" className="group">
                                {t('cta.learnMore')}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
                            </Button>
                            <Button size="lg" variant="outline">
                                {t('cta.tryFree')}
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle className="mr-2 h-4 w-4 text-primary"/>
                                {t('features.0')}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle className="mr-2 h-4 w-4 text-primary"/>
                                {t('features.1')}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle className="mr-2 h-4 w-4 text-primary"/>
                                {t('features.2')}
                            </div>
                        </div>

                    </div>

                    <div ref={imageRef} className="relative">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl">
                            <div
                                className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10"></div>
                            <img src="/assets/placeholder.svg?height=600&width=800" alt="AI Grading Platform Dashboard"
                                 className="w-full h-auto"/>
                        </div>

                        <div
                            className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg z-20 max-w-[200px]">
                        <div className="text-sm font-medium">{t('instantFeedback.title')}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {t('instantFeedback.description')}
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg z-20 max-w-[200px]">
                            <div className="text-sm font-medium">{t('timeSaved.title')}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {t('timeSaved.description')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
