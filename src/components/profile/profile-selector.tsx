"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, User, Check } from "lucide-react"
import Image from "next/image"

export function ProfileSelector({ profiles, activeProfile, onProfileChange, isOpen, setIsOpen }: { profiles: any, activeProfile: any, onProfileChange: (profile: any) => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
    const ref = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [setIsOpen])

    return (
        <div className="relative w-full md:w-auto" ref={ref}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] w-full md:w-auto"
                whileHover={{ backgroundColor: "rgba(48, 54, 61, 0.5)" }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[#30363d]">
                        <Image
                            src={activeProfile.avatar || "/placeholder.svg"}
                            alt={activeProfile.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium truncate">{activeProfile.name}</p>
                        <p className="text-xs text-[#8b949e] truncate">@{activeProfile.username}</p>
                    </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-[#8b949e]" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 mt-2 z-50 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="p-1">
                            {profiles.map((profile: any) => (
                                <motion.button
                                    key={profile.id}
                                    onClick={() => {
                                        onProfileChange(profile)
                                        setIsOpen(false)
                                    }}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md ${
                                        activeProfile.id === profile.id ? "bg-[#30363d]/50" : "hover:bg-[#30363d]/30"
                                    } transition-colors duration-150 text-left`}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[#30363d]">
                                        <Image
                                            src={profile.avatar || "/placeholder.svg"}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{profile.name}</p>
                                        <p className="text-xs text-[#8b949e]">{profile.role === "teacher" ? "Professeur" : "Étudiant"}</p>
                                    </div>
                                    {activeProfile.id === profile.id && <Check className="h-4 w-4 text-[#7ee787]" />}
                                </motion.button>
                            ))}
                        </div>
                        <div className="p-1 border-t border-[#30363d]">
                            <motion.button
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-[#30363d]/30 transition-colors duration-150"
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <User className="h-4 w-4 text-[#8b949e]" />
                                <span className="text-sm">Gérer les profils</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

