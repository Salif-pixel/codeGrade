
import { ReactNode } from 'react';

import Header from "@/components/dashboard/header/header";


interface LayoutProps {
    children: ReactNode;
}

export default  function Layout({ children }: LayoutProps) {


    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
           <Header/>

            {/* Main content */}
            <main className="flex-1 container mx-auto p-4">
                {children}
            </main>


        </div>
    );
}