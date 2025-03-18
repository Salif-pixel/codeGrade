import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title";
import { User } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileComponent from "@/components/profile/profile-component";

export default async function ProfilPage() {
    const header = await headers();
    const session = await auth.api.getSession({
        headers: header,
    });

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/profile");
    }

    // Récupérer l'utilisateur avec toutes ses données depuis Prisma
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            background: true,
            website: true,
            preferredLanguage: true,
            technologies: true,
            passions: true,
            profileCompleted: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    if (!user) {
        redirect("/auth/login");
    }

    // S'assurer que les tableaux existent
    const userData = {
        ...user,
        technologies: Array.isArray(user.technologies) ? user.technologies : [],
        passions: Array.isArray(user.passions) ? user.passions : []
    };

    return (
        <div className="px-0 md:px-4 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950">
            <SimpleHeaderTitle title="profile.title" Icon={<User className="h-5 w-5 text-primary" />} />
            
            <div className="mt-8">
                <ProfileComponent initialUser={userData} />
            </div>
        </div>
    );
} 