import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {get_user} from "@/lib/data";
import CreateExamPage from "@/components/dashboard/exams/create/main";

export default async function CreateExamsPage() {

    const headersValue = await headers();
    const sessionPromise = await auth.api.getSession({headers: headersValue});
    const user = await get_user(sessionPromise?.user?.id ?? "")

    if (!user) {
        return null;
    }

    return (
        <div className="px-0 md:px-4 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950">
            <CreateExamPage userId={user.id}/>
        </div>
    )
}
