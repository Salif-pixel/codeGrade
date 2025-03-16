import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const examParticipant = await prisma.examParticipant.create({
      data: {
        examId: params.id,
        userId: session.user.id,
        status: "accepted",
      },
    })

    return NextResponse.json(examParticipant)
  } catch (error) {
    console.error("[EXAM_JOIN]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 