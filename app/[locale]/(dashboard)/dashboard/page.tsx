"use server"

import DashboardPageStudent from "@/components/dashboard/dashboard/dashboard-page-student"
import DashboardPageTeacher from "@/components/dashboard/dashboard/dashboard-page-teacher"
// import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title"
import { auth } from "@/lib/auth"
import { get_user, getTeacherDashboardData, getStudentDashboardData } from "@/lib/data"
import { Role } from "@prisma/client"
import { headers } from "next/headers"
// import { RiDashboard2Fill } from "react-icons/ri"

export default async function DashboardPage() {
  const headersValue = await headers();
  const sessionPromise = await auth.api.getSession({ headers: headersValue });
  const user = await get_user(sessionPromise?.user?.id ?? "")
  if(!user) {
    return null;
  }

  let dashboardData = null;
  if (user.role === Role.TEACHER || user.role === Role.SUPERADMIN) {
    dashboardData = await getTeacherDashboardData(user.id);
  } else if (user.role === Role.STUDENT) {
    dashboardData = await getStudentDashboardData(user.id);
  }

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950">
        {/* <SimpleHeaderTitle title="dashboard.title" Icon={<RiDashboard2Fill className="h-5 w-5 text-primary" />} /> */}
        {(user.role === Role.TEACHER || user.role === Role.SUPERADMIN) && 
          <DashboardPageTeacher data={dashboardData as never} />
        }
        {user.role === Role.STUDENT && 
          <DashboardPageStudent data={dashboardData as never} />
        }
      </div>
    </>
  )
}