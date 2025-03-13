"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";

export async function SignOut() {
    // Déconnecter via l'API auth
    await auth.api.signOut({
        headers: await headers()
    });

    // Supprimer tous les cookies potentiellement liés à l'authentification
    const cookieStore = await cookies();

    // Obtenir tous les cookies
    const allCookies = cookieStore.getAll();

    // Supprimer tous les cookies qui semblent liés à l'authentification
    for (const cookie of allCookies) {
        if (cookie.name.toLowerCase().includes('auth') ||
            cookie.name.toLowerCase().includes('session') ||
            cookie.name.toLowerCase().includes('token')) {
            cookieStore.delete(cookie.name);
        }
    }

    redirect("/");
}