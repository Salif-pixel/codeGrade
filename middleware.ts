import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Middleware pour gérer l'authentification et l'internationalisation
export default function middleware(request: NextRequest) {
    // Récupérer la session
    const session = getSessionCookie(request);

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

    // Définir les routes publiques
    const publicRoutes = ['/login', '/404'];
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