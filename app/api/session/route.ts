import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assurez-vous que le chemin est correct

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // Récupérer la session et l'utilisateur associé
    const session = await prisma.session.findFirst({
        where: { token },
        include: {
            user: true, // Assurez-vous que la relation est bien définie dans votre modèle Prisma
        },
    });

    if (!session) {
        return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    return NextResponse.json({ session});
}
