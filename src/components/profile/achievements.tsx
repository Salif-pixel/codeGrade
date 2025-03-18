"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface Achievement {
    id: number;
    emoji: string;
    title: string;
    color: string;
    description: string;
}

const teacherAchievements = [
    {
        id: 1,
        emoji: "🏆",
        title: "Meilleur Prof",
        color: "#f9826c",
        description: "Reconnu par les étudiants comme un excellent enseignant",
    },
    {
        id: 2,
        emoji: "🚀",
        title: "Innovateur",
        color: "#8957e5",
        description: "Utilise des méthodes d'enseignement innovantes",
    },
    { id: 3, emoji: "📚", title: "Expert", color: "#79c0ff", description: "Maîtrise exceptionnelle du sujet enseigné" },
    {
        id: 4,
        emoji: "🧠",
        title: "Mentor",
        color: "#d2a8ff",
        description: "Guide et inspire les étudiants dans leur parcours",
    },
    {
        id: 5,
        emoji: "⭐",
        title: "5 étoiles",
        color: "#f9826c",
        description: "A reçu des évaluations parfaites de la part des étudiants",
    },
    {
        id: 6,
        emoji: "🔍",
        title: "Chercheur",
        color: "#79c0ff",
        description: "Contribue activement à la recherche dans son domaine",
    },
    { id: 7, emoji: "🌟", title: "Inspirant", color: "#ffa657", description: "Motive les étudiants à se dépasser" },
    { id: 8, emoji: "🎓", title: "Éducateur", color: "#d2a8ff", description: "Dévoué à l'excellence en éducation" },
]

const studentAchievements = [
    {
        id: 1,
        emoji: "🏆",
        title: "Premier de classe",
        color: "#f9826c",
        description: "A obtenu les meilleures notes de sa promotion",
    },
    { id: 2, emoji: "🚀", title: "Rapide", color: "#8957e5", description: "Termine ses devoirs avant les délais" },
    { id: 3, emoji: "💻", title: "Codeur", color: "#79c0ff", description: "Excellent en programmation" },
    {
        id: 4,
        emoji: "🧩",
        title: "Solutionneur",
        color: "#d2a8ff",
        description: "Résout des problèmes complexes avec créativité",
    },
    { id: 5, emoji: "⭐", title: "Étoile montante", color: "#f9826c", description: "Montre un potentiel exceptionnel" },
    { id: 6, emoji: "🔍", title: "Curieux", color: "#79c0ff", description: "Pose toujours des questions pertinentes" },
    { id: 7, emoji: "🌟", title: "Excellent", color: "#ffa657", description: "Maintient une moyenne exceptionnelle" },
    {
        id: 8,
        emoji: "🎯",
        title: "Précis",
        color: "#d2a8ff",
        description: "Fait preuve d'une grande attention aux détails",
    },
]

const adminAchievements = [
    { id: 1, emoji: "🛡️", title: "Protecteur", color: "#f9826c", description: "Assure la sécurité de la plateforme" },
    { id: 2, emoji: "⚙️", title: "Technicien", color: "#8957e5", description: "Maintient les systèmes en parfait état" },
    {
        id: 3,
        emoji: "📊",
        title: "Analyste",
        color: "#79c0ff",
        description: "Analyse les données pour améliorer la plateforme",
    },
    {
        id: 4,
        emoji: "🔧",
        title: "Dépanneur",
        color: "#d2a8ff",
        description: "Résout rapidement les problèmes techniques",
    },
    { id: 5, emoji: "🔐", title: "Gardien", color: "#f9826c", description: "Protège les données des utilisateurs" },
    { id: 6, emoji: "📈", title: "Optimiseur", color: "#79c0ff", description: "Améliore constamment les performances" },
    {
        id: 7,
        emoji: "🧰",
        title: "Polyvalent",
        color: "#ffa657",
        description: "Maîtrise tous les aspects de l'administration",
    },
    { id: 8, emoji: "🔔", title: "Vigilant", color: "#d2a8ff", description: "Surveille en permanence l'état du système" },
]

export function Achievements({ viewMode }: { viewMode: string }) {
    const getAchievements = () => {
        if (viewMode === "teacher") return teacherAchievements
        if (viewMode === "student") return studentAchievements
        if (viewMode === "admin") return adminAchievements
        return teacherAchievements // default
    }

    const achievements = getAchievements()
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null) 
    const isMobile = useIsMobile()

    return (
        <motion.div
            className="bg-[#161b22] rounded-lg overflow-hidden mb-6 border border-[#30363d]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            layoutId="achievements"
        >
            <div className="p-4 border-b border-[#30363d]">
                <h2 className="text-lg font-bold text-white">Achievements</h2>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-4 gap-3">
                    {achievements.map((achievement, index) => (
                        <motion.div
                            key={achievement.id}
                            className="group relative"
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                                duration: 0.3, 
                                delay: 0.05 * index,
                                type: "spring", 
                                stiffness: 300, 
                                damping: 20 
                            }}
                            onClick={() => setSelectedAchievement(achievement)}
                        >   
                            <motion.div
                                className="w-full aspect-square rounded-lg flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-105 shadow-lg"
                                style={{
                                    backgroundColor: `${achievement.color}30`,
                                    boxShadow: `0 0 15px ${achievement.color}30`,
                                    fontSize: isMobile ? "1.25rem" : "1.75rem",
                                }}
                                whileHover={{
                                    boxShadow: `0 0 20px ${achievement.color}50`,
                                }}
                            >
                                {achievement.emoji}
                            </motion.div>
                            <div className="absolute -bottom-1 left-0 right-0 bg-[#0d1117]/90 text-[10px] text-center py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {achievement.title}
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-4">
                    <motion.button
                        className="w-full py-2 px-4 rounded-md text-sm text-[#8b949e] border border-[#30363d] hover:bg-[#30363d] transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        Voir tous les achievements
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {selectedAchievement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedAchievement(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#161b22] rounded-lg p-6 max-w-md w-full border border-[#30363d]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl"
                                    style={{ backgroundColor: `${selectedAchievement.color}30` }}
                                >
                                    {selectedAchievement.emoji}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedAchievement.title}</h3>
                                    <p className="text-[#8b949e]">
                                        {viewMode === "teacher"
                                            ? "Achievement Professeur"
                                            : viewMode === "student"
                                                ? "Achievement Étudiant"
                                                : "Achievement Administrateur"}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[#c9d1d9] mb-6">{selectedAchievement.description}</p>

                            <div className="flex justify-end">
                                <motion.button
                                    className="px-4 py-2 bg-[#30363d] text-white rounded-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedAchievement(null)}
                                >
                                    Fermer
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

