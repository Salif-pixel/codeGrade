"use client"

import { useState, useEffect, ChangeEventHandler } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import {User} from "@prisma/client";

interface EditProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdate: (formData: Partial<User>) => void;
}

export function EditProfileDialog({ isOpen, onClose, user, onUpdate }: EditProfileDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        background: "",
        website: "",
        preferredLanguage: "",
        technologies: [] as string[],
        passions: [] as string[],
    })
    const [isUploading, setIsUploading] = useState(false)
    const [previewAvatar, setPreviewAvatar] = useState("")

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                background: user.background || "",
                website: user.website || "",
                preferredLanguage: user.preferredLanguage || "",
                technologies: user.technologies || [],
                passions: user.passions || [],
            })
            setPreviewAvatar(user.image || "")
        }
    }, [user, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onUpdate(formData)
    }

    const handleAvatarUpload = () => {
        setIsUploading(true)
        // Simulate upload delay
        setTimeout(() => {
            setPreviewAvatar("/placeholder.svg?height=200&width=200")
            setFormData((prev) => ({
                ...prev,
                avatar: "/placeholder.svg?height=200&width=200",
            }))
            setIsUploading(false)
        }, 1500)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">Modifier votre profil</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#30363d]">
                                <Image
                                    src={previewAvatar || "/placeholder.svg"}
                                    alt="Avatar preview"
                                    width={96}
                                    height={96}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <motion.button
                                type="button"
                                className="absolute bottom-0 right-0 bg-[#238636] text-white p-1.5 rounded-full border-2 border-[#161b22]"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAvatarUpload}
                            >
                                {isUploading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                                    >
                                        <Upload className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </motion.button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#8b949e]">
                            Nom complet
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="background" className="text-[#8b949e]">
                            Bio
                        </Label>
                        <Textarea
                            id="background"
                            name="background"
                            value={formData.background}
                            onChange={handleChange}
                            rows={4}
                            className="bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]/10 resize-none"
                            placeholder="Parlez-nous de vous..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-[#8b949e]">
                            Site web
                        </Label>
                        <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="bg-[#0d1117] border-[#30363d] text-white focus:border-[#58a6ff] focus:ring-[#58a6ff]/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferredLanguage">Langage de programmation préféré</Label>
                        <Input
                            id="preferredLanguage"
                            name="preferredLanguage"
                            value={formData.preferredLanguage}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="technologies">Technologies préférées</Label>
                        <Input
                            id="technologies"
                            name="technologies"
                            value={formData.technologies.join(", ")}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                }))
                            }}
                            placeholder="React, Node.js, TypeScript..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="passions">Passions</Label>
                        <Input
                            id="passions"
                            name="passions"
                            value={formData.passions.join(", ")}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    passions: e.target.value.split(",").map(p => p.trim()).filter(Boolean)
                                }))
                            }}
                            placeholder="Développement web, IA, Cybersécurité..."
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="bg-[#238636] hover:bg-[#2ea043] text-white">
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

