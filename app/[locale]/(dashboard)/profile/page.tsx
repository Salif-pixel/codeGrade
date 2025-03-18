import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title";
import { User } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {get_user} from "@/lib/data";
import ProfileComponent from "@/components/profile/profile-component";

export default async function ProfilPage() {
    const header = await headers();
    const session = await auth.api.getSession({
        headers: header,
    });

    if (!session?.user) {
        redirect("/auth/login?callbackUrl=/profile");
    }

    const user = await get_user(session.user.id);
    if (!user) {
        redirect("/auth/login?callbackUrl=/profile");
    }



    return (
        <>
            <div className="px-0 md:px-4 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950">
                <SimpleHeaderTitle title="profile.title" Icon={<User className="h-5 w-5 text-primary" />} />
                
                <div className="mt-8">
                    <ProfileComponent initialUser={user}/>
                </div>
            </div>
        </>
    );
}