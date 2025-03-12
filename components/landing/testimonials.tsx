"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Testimonials() {
    const t = useTranslations('testimonials')
    const sectionRef = useRef<HTMLDivElement>(null)
    const headingRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    const nextTestimonial = () => {
        setActiveIndex((prev) => (prev + 1) % t.raw('testimonials').length)
    }

    const prevTestimonial = () => {
        setActiveIndex((prev) => (prev - 1 + t.raw('testimonials').length) % t.raw('testimonials').length)
    }

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
            // Animation du titre
            gsap.from(headingRef.current?.children ?? [], {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: headingRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none",
                },
            })

            // Animation des cartes
            gsap.from(cardsRef.current?.children ?? [], {
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: cardsRef.current,
                    start: "top 70%",
                    toggleActions: "play none none none",
                },
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                        {t('title')}
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        {t('description')}
                    </p>
                </div>

                <div ref={cardsRef} className="relative max-w-4xl mx-auto">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {t.raw('testimonials').map((testimonial: any, index: number) => (
                                <div key={index} className="w-full flex-shrink-0 px-4">
                                    <Card className="bg-background dark:bg-zinc-900 border border-slate-200 dark:border-slate-700 shadow-lg">
                                        <CardContent className="p-8">
                                            <Quote className="h-12 w-12 text-primary/20 mb-4" />
                                            <p className="text-xl italic text-slate-700 dark:text-slate-300 mb-6">&#34;{testimonial.quote}&#34;</p>
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                                    <img
                                                        src={testimonial.image || "/assets/placeholder.svg"}
                                                        alt={testimonial.author}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevTestimonial}
                            disabled={activeIndex === 0}
                            className="rounded-full"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex gap-2">
                            {t.raw('testimonials').map((_: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-3 h-3 rounded-full ${
                                        index === activeIndex ? "bg-primary" : "bg-slate-300 dark:bg-zinc-900"
                                    }`}
                                    aria-label={t('go-to-testimonial', { index: index + 1 })}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextTestimonial}
                            disabled={activeIndex === t.raw('testimonials').length - 1}
                            className="rounded-full"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}