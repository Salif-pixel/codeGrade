'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';
import {cn} from "@/lib/utils";

const LanguageSwitcher = ({className }: { className?: string }) => {
    const pathname = usePathname();

    // Langues disponibles avec leurs drapeaux et noms
    const locales = [
        { code: 'fr', flag: '🇫🇷', name: 'Français' },
        { code: 'en', flag: '🇺🇸', name: 'English' },
    ];

    // Détermine la langue actuelle à partir de l'URL
    const currentLocale = pathname.startsWith('/en') ? 'en' : 'fr';
    const currentLanguage = locales.find(lang => lang.code === currentLocale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn(" cursor-pointer flex items-center gap-2",className)}>
                    <span>{currentLanguage?.flag}</span>
                    <span>{currentLanguage?.name}</span>
                    <ChevronDown size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((lang) => (
                    <DropdownMenuItem key={lang.code} asChild>
                        <Link
                            href={`/${lang.code}${pathname.substring(3)}`}
                            className="flex items-center gap-2"
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;