'use client';

import {Terminal, Loader} from "lucide-react";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {useState, useCallback} from "react";

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({open, onOpenChange}: SearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback((value: string) => {
        setIsSearching(true);
        setSearchQuery(value);
        setTimeout(() => {
            setIsSearching(false);
        }, 1000);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 shadow-lg">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    <CommandInput
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            <CommandItem>
                                <Terminal className="mr-2 h-4 w-4" />
                                <span>Rechercher des devoirs</span>
                            </CommandItem>
                            <CommandItem>
                                <Terminal className="mr-2 h-4 w-4" />
                                <span>Parcourir les soumissions</span>
                            </CommandItem>
                            <CommandItem>
                                <Terminal className="mr-2 h-4 w-4" />
                                <span>Voir les statistiques</span>
                            </CommandItem>
                        </CommandGroup>
                        {searchQuery && !isSearching && (
                            <CommandGroup heading="Résultats">
                                <CommandItem>
                                    <Terminal className="mr-2 h-4 w-4" />
                                    <span>Résultats pour "{searchQuery}"</span>
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                    {isSearching && (
                        <div className="py-6 text-center text-sm">
                            <Loader className="h-4 w-4 animate-spin mx-auto my-3" />
                            Recherche en cours...
                        </div>
                    )}
                </Command>
            </DialogContent>
        </Dialog>
    );
}