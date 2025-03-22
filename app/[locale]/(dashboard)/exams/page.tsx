import ExamsComponent from "@/components/dashboard/exams/exams-component";
import { auth } from "@/lib/auth";
import { get_user, getExams } from "@/lib/data";
import { headers } from "next/headers";

export default async function ExamsPage() {
    const headersValue = await headers();
    const sessionPromise = await auth.api.getSession({ headers: headersValue });
    const user = await get_user(sessionPromise?.user?.id ?? "")
    const exams = await getExams();

    if (!user) {
        return null;
    }

    return <ExamsComponent user={user} exams={exams as never} />
}
