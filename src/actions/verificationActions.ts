'use server'

import { prisma } from "@/lib/prisma"

export async function updateUserVerification(userId: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileCompleted: true }
    })
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user verification:', error)
    return { success: false, error: 'Failed to update user verification status' }
  }
}