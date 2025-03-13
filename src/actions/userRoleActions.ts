"use server"

import { prisma } from "@/lib/prisma"

export async function updateUserRole(userId: string, role: "TEACHER" | "STUDENT") {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}