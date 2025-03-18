"use client"

import { useState, MouseEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Link2, Edit2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Role, User } from "@prisma/client"
import { AccountSwitcher } from "./account-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
interface ProfileHeaderProps {
    user: User;
    onEditProfile: () => void;
}

export function ProfileHeader({ user, onEditProfile }: ProfileHeaderProps) {
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false)

    return (
        <div className=" bg-[#161b22] rounded-lg overflow-hidden mb-6 border dark:border-[#30363d]">
            <div className="p-6 relative">
                <div className="flex flex-col items-start">
                    <div className="relative mb-4 z-10">
                        <div
                            className="relative"
                            onMouseEnter={() => setIsHoveringAvatar(true)}
                            onMouseLeave={() => setIsHoveringAvatar(false)}
                        >
                             <Avatar className="h-20 w-20 cursor-pointer ring-2 ring-background">
                                            <AvatarImage src={user?.image ?? ""} alt="User" />
                                            <AvatarFallback className="bg-primary/10 text-2xl text-primary font-medium">
                                                {user?.email?.[0]}
                                                {user?.email?.[1]}
                                            </AvatarFallback>
                                        </Avatar>
                            <AnimatePresence>
                                {isHoveringAvatar && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full mb-4">
                        <h1 className="text-2xl font-bold text-white">
                            {user.name}
                        </h1>
                        <div className="flex gap-2">
                            <AccountSwitcher />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEditProfile}
                                className="text-[#8b949e] bg-zinc-900 border-[#30363d] hover:bg-[#30363d]"
                            >
                                <Edit2 className="h-8 w-8 " />
                                Éditer
                            </Button>
                        </div>
                    </div>

                    <p className="text-[#c9d1d9] mb-4">
                        {user.background || "Aucune bio"}
                    </p>

                    {user.technologies && user.technologies.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-[#8b949e] mb-2">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.technologies.map((tech, index) => (
                                    <Badge
                                        key={index}
                                        className="bg-[#238636] hover:bg-[#238636]/90"
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {user.passions && user.passions.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-[#8b949e] mb-2">Passions</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.passions.map((passion, index) => (
                                    <Badge
                                        key={index}
                                        className="bg-[#58a6ff] hover:bg-[#58a6ff]/90"
                                    >
                                        {passion}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {user.website && (
                        <div className="flex items-center text-[#8b949e]">
                            <Link2 className="h-4 w-4 mr-1" />
                            <Link 
                                href={user.website} 
                                target="_blank"
                                className="text-[#58a6ff] hover:underline"
                            >
                                {user.website}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

