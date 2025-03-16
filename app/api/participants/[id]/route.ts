import { prisma } from "@/lib/prisma"
import { ParticipantStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    
    const updatedParticipant = await prisma.examParticipant.update({
      where: { id: params.id },
      data: { status: status as ParticipantStatus },
    })

    return NextResponse.json(updatedParticipant)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update participant status" },
      { status: 500 }
    )
  }
} 