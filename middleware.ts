import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Middleware pour gérer l'authentification et l'internationalisation
export default function middleware(request: NextRequest) {
    // Gestion de l'internationalisation
    const intlMiddleware = createMiddleware(routing);
    const intlResponse = intlMiddleware(request);

    // Récupérer la session
    const session = getSessionCookie(request);

    // Obtenir le chemin sans le préfixe de langue
    const pathname = request.nextUrl.pathname;
    const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)/, '');

    // Définir les routes publiques
    const publicRoutes = ['/', '/login', '/404'];
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

    return intlResponse;
}

export const config = {
    matcher: ['/', '/(fr|en)/:path*'],
};