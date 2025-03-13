import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function FooterCta() {

    const t = useTranslations('LandingPage')
    
    return (
        <>
            <section className="bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px] relative bg-gray-100 dark:bg-zinc-900 py-16">
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
        </>
    );
}