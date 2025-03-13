import LanguageSwitcher from "@/components/internalization/language-switcher";
import { ModeToggle } from "@/components/theme/button-theme";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Menu, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function LandingNavigation() {
    const [open, setOpen] = useState(false)
    const t = useTranslations('LandingPage')

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-background bg-white/80 dark:bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Terminal className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">{t('nav.brand')}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="hidden md:inline-block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            {t('nav.login')}
                        </Link>
                        <Button
                            className="hidden md:inline-block bg-primary cursor-pointer text-white px-6 py-2 rounded-full transition-colors">
                            {t('nav.start')}
                        </Button>
                        <LanguageSwitcher />
                        <ModeToggle />
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="flex justify-center gap-2">
                                        <Terminal className="h-6 w-6 text-primary" />
                                        <span className="text-xl font-bold">{t('nav.brand')}</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col items-center space-y-4 px-4 mt-8">
                                    <Link
                                        className="w-full"
                                        href="/login"
                                        onClick={() => setOpen(false)}
                                    >
                                        <Button
                                            variant={'ghost'}
                                            className="w-full"
                                            onClick={() => {
                                                setOpen(false)
                                            }}
                                        >
                                            {t('nav.login')}
                                        </Button>
                                    </Link>
                                    <Link
                                        className="w-full"
                                        href="/login"
                                    >
                                        <Button
                                            variant={'default'}
                                            onClick={() => {
                                                setOpen(false)
                                            }}
                                            className="w-full"
                                        >
                                            {t('nav.start')}
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}