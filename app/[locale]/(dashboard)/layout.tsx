
import { ReactNode } from 'react';
import {headers} from "next/headers";
import {auth} from "@src/lib/auth";
import {get_user} from "@src/lib/data";
import NavigationLayout from "@src/components/dashboard/header/navigationlayout";


interface LayoutProps {
    children: ReactNode;
}

export default  async function Layout({ children }: LayoutProps) {

    const headersValue = await headers();
    const sessionPromise = await auth.api.getSession({ headers: headersValue });
    const user = await get_user(sessionPromise?.user?.id ?? "")
    if(!user ) {
        return null;
    }
    return (

    <NavigationLayout user={user}>
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 container mx-auto p-4">
                {children}
            </main>
        </div>
    </NavigationLayout>

    );
}