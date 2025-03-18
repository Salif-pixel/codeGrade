'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateUserData {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  website?: string
  preferredLanguage?: string
  technologies?: string[]
  passions?: string[]
  background?: string
}

export async function updateUser(data: UpdateUserData) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        website: data.website,
        preferredLanguage: data.preferredLanguage,
        technologies: data.technologies,
        passions: data.passions,
        background: data.background,
        profileCompleted: true,
      }
    })

    revalidatePath('/profile')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
} 