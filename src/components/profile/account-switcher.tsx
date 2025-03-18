'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

export function AccountSwitcher() {
  const router = useRouter()

  const handleSwitch = async () => {
    try {
      // Déconnexion avec Better Auth
      await authClient.signOut()
      const local = useLocale()
      // Rediriger vers la page de connexion sans quitter l'app
      router.push(`/${local}/auth/login`)
    } catch (error) {
      console.error('Erreur lors du changement de compte:', error)
    }
  }

  return (
    <Button 
      onClick={handleSwitch}
      variant="outline"
      className="flex items-center bg-zinc-900 "
    >
      <LogOut className="w-4 h-4" />
      Changer de compte
    </Button>
  )
} 