import ExamsComponent from "@/components/dashboard/exams/items/exams-component";
import { auth } from "@/lib/auth";
import {get_user, getExams} from "@/lib/data";
import {headers} from "next/headers";

export default async function ExamsPage() {
  const headersValue = await headers();
  const sessionPromise = await auth.api.getSession({ headers: headersValue });
  const user = await get_user(sessionPromise?.user?.id ?? "")
  const exams = await getExams();

  if(!user ) {
    return null;
  }

  return (
      <div className="container mx-auto py-6">
        <ExamsComponent user={user} exams={exams}/>
      </div>
  )
}
