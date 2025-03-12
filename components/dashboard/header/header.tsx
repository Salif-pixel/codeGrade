import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {get_user} from "@/lib/data";
import HeaderDashboard from "@/components/dashboard/header/header-dashboard";

export default async function Header (){
    const headersValue = await headers();
    const sessionPromise = await auth.api.getSession({ headers: headersValue });
    const user = await get_user(sessionPromise?.user?.id ?? "")
    if(!user ) {
        return null;
    }
    return (
        <HeaderDashboard user={user}/>
    );
}