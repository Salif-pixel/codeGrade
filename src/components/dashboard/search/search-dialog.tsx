'use client';

import { Terminal, Loader, FileText, Code, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

import { Link } from '@/i18n/navigation';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Définir les routes de navigation
const NAVIGATION_ITEMS = [
  {
    titleKey: "navigation.available-exams",
    icon: FileText,
    url: "/available-exams"
  },
  {
    titleKey: "navigation.my-exams",
    icon: Code,
    url: "/my-exams"
  },
  {
    titleKey: "navigation.results",
    icon: GraduationCap,
    url: "/results"
  },
  {
    titleKey: "navigation.dashboard",
    icon: Terminal,
    url: "/dashboard"
  }
];

export default function SearchDialog({open, onOpenChange}: SearchDialogProps) {
    const t = useTranslations("common");
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback((value: string) => {
        setIsSearching(true);
        setSearchQuery(value);
        setTimeout(() => {
            setIsSearching(false);
        }, 500);
    }, []);

    const handleSelect = (url: string) => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 shadow-lg">
                <DialogTitle className="px-4 pt-4">
                    {t("search.title")}
                </DialogTitle>
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    <CommandInput
                        placeholder={t("search.placeholder")}
                        value={searchQuery}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        <CommandEmpty>{t("search.noResults")}</CommandEmpty>
                        <CommandGroup heading={t("search.navigation")}>
                            {NAVIGATION_ITEMS.map((item) => (
                                <CommandItem
                                    key={item.url}
                                    onSelect={() => handleSelect(item.url)}
                                >
                                    <Link href={item.url} >
                                        
                                            <item.icon className="mr-2 h-4 w-4" />
                                            <span>{t(item.titleKey)}</span>
                                        
                                    </Link>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {searchQuery && !isSearching && (
                            <CommandGroup heading={t("search.results")}>
                                {NAVIGATION_ITEMS.filter(item => 
                                    t(item.titleKey).toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((item) => (
                                    <CommandItem
                                        key={`search-${item.url}`}
                                        onSelect={() => handleSelect(item.url)}
                                    >
                                        <Link href={item.url}>
                                                <item.icon className="mr-2 h-4 w-4" />
                                                <span>{t(item.titleKey)}</span>

                                        </Link>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                    {isSearching && (
                        <div className="py-6 text-center text-sm">
                            <Loader className="h-4 w-4 animate-spin mx-auto my-3" />
                            {t("search.searching")}
                        </div>
                    )}
                </Command>
            </DialogContent>
        </Dialog>
    );
}