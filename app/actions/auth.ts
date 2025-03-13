'use server'

import { authClient } from "@/lib/auth-client";

export async function logout() {
    try {
        await authClient.signOut(
            // {
            //     fetchOptions: {
            //         onSuccess: () => {
            //             router.push("/login"); // redirect to login page
            //         },
            //     },
            // }
        );
        return { success: true }
    } catch (error) {
        console.error('Logout error:', error)
        return { success: false, error: 'Failed to logout' }
    }
}