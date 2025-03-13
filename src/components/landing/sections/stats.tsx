import { useTranslations } from "next-intl"
import { StatCard } from "../items/sat-card";

export default function Stats() {
    const t = useTranslations('LandingPage')
    return (
        <div className="container mx-auto px-16 sm:px-24 md:px-36 mt-24 mb-8">
            <div className="bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px] relative bg-background border border-primary rounded-2xl p-8 md:p-12 mb-4">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <StatCard number="10,000+" label={t('stats.studentsEvaluated')} delay={0.2} />
                    <StatCard number="500+" label={t('stats.institutions')} delay={0.4} />
                    <StatCard number="98%" label={t('stats.satisfaction')} delay={0.6} />
                </div>
            </div>
        </div>
    );

}