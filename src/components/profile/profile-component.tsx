"use client"

import { useState } from "react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Achievements } from "@/components/profile/achievements"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { ModeToggle } from "@/components/theme/button-theme"
import { Calendar } from "@/components/profile/calendar-profile"
import { User } from "@prisma/client"
import { updateUser } from "@/actions/userActions"

interface ProfileComponentProps {
    initialUser: User
}

export default function ProfileComponent({ initialUser }: ProfileComponentProps) {
    const [user, setUser] = useState<User>(initialUser)
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdateProfile = async (updatedData: Partial<User>) => {
        setIsLoading(true)
        try {
            const result = await updateUser({
                id: user.id,
                name: updatedData.name || undefined,
                website: updatedData.website || undefined,
                preferredLanguage: updatedData.preferredLanguage || undefined,
                technologies: updatedData.technologies || [],
                passions: updatedData.passions || [],
                background: updatedData.background || undefined,
            })

            if (result.success && result.user) {
                setUser(result.user as User)
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error)
        } finally {
            setIsLoading(false)
            setIsEditProfileOpen(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-[#0a0c10] text-[#c9d1d9] overflow-x-hidden rounded-lg">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        className="fixed inset-0 flex items-center justify-center bg-[#0a0c10] z-50"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#30363d] border-t-[#58a6ff] rounded-full animate-spin"></div>
                            <p className="mt-4 text-[#8b949e]">Chargement du profil...</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="container mx-auto px-4 py-6 max-w-7xl">


                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <ProfileHeader
                                    user={user}
                                    onEditProfile={() => setIsEditProfileOpen(true)}
                                />
                                <Achievements viewMode={user.role} />
                            </div>
                            <div className="lg:col-span-2">
                                <Calendar viewMode={user.role} />
                            </div>
                        </div>

                        <EditProfileDialog
                            isOpen={isEditProfileOpen}
                            onClose={() => setIsEditProfileOpen(false)}
                            user={user}
                            onUpdate={handleUpdateProfile}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

