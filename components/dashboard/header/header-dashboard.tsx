'use client';

import {Bell, LogOut, Search, Settings, Terminal, User2, Menu, X, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useState, useEffect} from "react";
import {Link} from "@/src/i18n/navigation";
import SearchDialog from "../search/search-dialog";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "@prisma/client";
import {ModeToggle} from "@/components/theme/button-theme";
import LanguageSwitcher from "@/components/internalization/language-switcher";



export default function HeaderDashboard({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchOpen, setSearchOpen] = useState(false);
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen(true);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);
    return (
        <>
            <div className="border-b">
                <div className="flex h-16 items-center px-4 md:px-6">
                    {/* Logo and Platform Name */}
                    <div className="flex items-center mr-4">
                        <Terminal className="h-6 w-6 text-primary mr-2"/>
                        <span className="text-xl font-bold">CodeGrade</span>
                    </div>

                    {/* Breadcrumb Navigation */}
                    <div className="hidden md:flex items-center space-x-2 text-muted-foreground">
                        <Link href="#" className="hover:text-foreground">
                            Projets
                        </Link>
                        <ChevronRight className="h-4 w-4"/>
                        <Link href="#" className="hover:text-foreground">
                            Web Dev
                        </Link>
                        <ChevronRight className="h-4 w-4"/>
                        <span className="text-foreground">Évaluation</span>
                    </div>

                    {/* Search */}
                    <div className="ml-auto flex-1 md:flex-initial md:w-80 lg:w-96 px-4">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                        >
                            <Search className="h-4 w-4" />
                            <span className="flex-1 text-left">Rechercher...</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 md:gap-4 ml-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5"/>
                            <span
                                className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
                        </Button>
                        <ModeToggle/>
                        <LanguageSwitcher/>

                        {/* User Profile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8 cursor-pointer">
                                        <AvatarImage src={user?.image ?? ""} alt="User"/>
                                        <AvatarFallback>{user?.email[0]}{user?.email[1]}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>
                                    <User2 className="mr-2 h-4 w-4"/>
                                    <span>Profil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4"/>
                                    <span>Paramètres</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4"/>
                                    <span>Se déconnecter</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button and Sheet */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden fixed right-4 top-4 z-50"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] pt-16">
                    <nav className="flex flex-col space-y-4">
                        <Link href="#" className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <rect width="7" height="9" x="3" y="3" rx="1"/>
                                <rect width="7" height="5" x="14" y="3" rx="1"/>
                                <rect width="7" height="9" x="14" y="12" rx="1"/>
                                <rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                            <span>Tableau de bord</span>
                        </Link>
                        <Link href="#" className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/>
                                <path d="m9 14 2 2 4-4"/>
                            </svg>
                            <span>Devoirs</span>
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">3</span>
                        </Link>
                        <Link href="#" className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <path d="M12 18v-6"/>
                                <path d="m9 15 3 3 3-3"/>
                            </svg>
                            <span>Soumissions</span>
                        </Link>
                        <Link href="#" className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M3 3v18h18"/>
                                <path d="m19 9-5 5-4-4-3 3"/>
                            </svg>
                            <span>Statistiques</span>
                        </Link>
                        <Link href="#" className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            <span>Paramètres</span>
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Tabs Navigation - Now at the top */}
            <div className="border-b bg-background hidden md:block">
                <nav className="flex w-full">
                    <div className="w-full max-w-screen-xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row -mb-px">
                            <Link className={"cursor-pointer"} href={"#"}>
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={`cursor-pointer text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "dashboard"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <rect width="7" height="9" x="3" y="3" rx="1"/>
                                    <rect width="7" height="5" x="14" y="3" rx="1"/>
                                    <rect width="7" height="9" x="14" y="12" rx="1"/>
                                    <rect width="7" height="5" x="3" y="16" rx="1"/>
                                </svg>
                                <span>Tableau de bord</span>
                            </button>
                            </Link>
                        <Link className={"cursor-pointer"} href={"#"}>
                            <button
                                onClick={() => {
                                    setActiveTab("assignments")
                                }}
                                className={`cursor-pointer text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "assignments"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/>
                                    <path d="m9 14 2 2 4-4"/>
                                </svg>
                                <span>Devoirs</span>
                                <span
                                    className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">3</span>
                            </button>
                        </Link>
                            <Link className={"cursor-pointer"} href={"#"}>
                            <button
                                onClick={() => setActiveTab("submissions")}
                                className={`cursor-pointer text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "submissions"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <path d="M12 18v-6"/>
                                    <path d="m9 15 3 3 3-3"/>
                                </svg>
                                <span>Soumissions</span>
                            </button>
                            </Link>
                            <Link className={"cursor-pointer"} href={"#"}>
                            <button
                                onClick={() => setActiveTab("analytics")}
                                className={`cursor-pointer text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "analytics"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M3 3v18h18"/>
                                    <path d="m19 9-5 5-4-4-3 3"/>
                                </svg>
                                <span>Statistiques</span>
                            </button>
                            </Link>
                            <Link className={"cursor-pointer"} href={"#"}>
                            <button
                                onClick={() => setActiveTab("settings")}
                                className={`cursor-pointer text-sm py-4 px-6 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                                    activeTab === "settings"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path
                                        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <span>Paramètres</span>
                            </button>
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
            {/* Search Dialog */}
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}