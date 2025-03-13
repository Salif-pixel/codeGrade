"use client"

import { navigationConfig } from "@src/lib/nav-config";
import { cn } from "@src/lib/utils";
import { Link } from "@src/i18n/navigation";
import { Role } from "@prisma/client";
import { Badge } from "../ui/badge";
import { usePathname } from "next/navigation";
import { log } from "console";

const Navigation = ({ userRole }: { userRole: Role }) => {
    const filteredNavigation = navigationConfig().filter((item) =>
        item.roles.includes(userRole)
    );

    const pathname = usePathname();
    console.log("pathname",pathname);

    return (
        <div className="flex flex-col md:flex-row w-full  justify-center -mb-px">
            {filteredNavigation.map((item) => (
                <Link key={item.id} className="cursor-pointer" href={item.href}>
                    <button
                        className={cn(
                            "relative text-sm py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-all",
                            pathname.endsWith(item.href)
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20",
                        )}
                    >
                        {item.icon}
                        <span>{item.title}</span>
                        {item.badge && (
                            <Badge
                                variant={ pathname.endsWith(item.href) ? "default" : "secondary"}
                                className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center"
                            >
                                {item.badge}
                            </Badge>
                        )}

                        {/* Active indicator dot */}
                        { pathname.endsWith(item.href) && (
                            <span className="absolute -bottom-[1.5px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                    </button>
                </Link>
            ))}
        </div>
    );
};

export default Navigation;