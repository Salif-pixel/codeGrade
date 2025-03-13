import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { log } from "console";

// Middleware pour gérer l'authentification et l'internationalisation
export default async function middleware(request: NextRequest) {

       // Obtenir le chemin sans le préfixe de langue
       const pathname = request.nextUrl.pathname;

       // Vérifier si c'est une racine localisée (/fr/ ou /en/)
       const isLocalizedRoot = pathname === '/fr/' || pathname === '/en/' || pathname === '/fr' || pathname === '/en';
   
       // Permettre l'accès à la racine principale et aux racines localisées sans redirection
       if (pathname === '/' || isLocalizedRoot) {
           // Gestion de l'internationalisation
           const intlMiddleware = createMiddleware(routing);
           return intlMiddleware(request);
       }
   
       // Extraire le chemin sans le préfixe de langue pour les autres routes
       const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)/, '');
    // Récupérer la session
    const session = getSessionCookie(request);
   
    if (session) {
        console.log("session",session);
        const response = await fetch(`${request.nextUrl.origin}/api/session?token=${session.split(".")[0]}`);
        if (response.ok) {
            const existingSession = await response.json();
            
            // Vérifier si l'utilisateur a vérifié son email
            const user = existingSession.session?.user;
            if (user && !user.emailVerified) {
                const locale = pathname.startsWith('/fr') ? '/fr' : '/en';
                // Si l'utilisateur n'est pas sur la page onboarding, le rediriger
                if (pathnameWithoutLocale !== '/onboarding') {
                    return NextResponse.redirect(new URL(`${locale}/onboarding`, request.url));
                }
            }
        }
    }

 

    // Définir les routes publiques
    const publicRoutes = ['/login', '/404', '/onboarding'];
    const isPublicRoute = publicRoutes.some(route => pathnameWithoutLocale === route);

    // Si l'utilisateur est sur la page de login mais est déjà connecté, rediriger vers le dashboard
    if (pathnameWithoutLocale === '/login' && session) {
        const locale = pathname.startsWith('/fr') ? '/fr' : '/en';
        return NextResponse.redirect(new URL(`${locale}/dashboard`, request.url));
    }

    // Si ce n'est pas une route publique et que l'utilisateur n'est pas connecté, rediriger vers login
    if (!isPublicRoute && !session) {
        const locale = pathname.startsWith('/fr') ? '/fr' : '/en';
        return NextResponse.redirect(new URL(`${locale}/login`, request.url));
    }

    // Gestion de l'internationalisation pour les autres routes
    const intlMiddleware = createMiddleware(routing);
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/', '/(fr|en)/:path*'],
};