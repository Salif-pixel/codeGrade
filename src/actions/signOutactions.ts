"use server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function SignOut() {
    // Déconnecter via l'API auth
    await auth.api.signOut({
        headers: await headers()
    });

    redirect("/[locale]/login");
}