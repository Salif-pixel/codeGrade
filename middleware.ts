import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { navigationConfigForMiddleware } from "./src/lib/nav-config";
import { Role, User } from "@prisma/client";

export default async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Vérifier si c'est une racine localisée
    const isLocalizedRoot = pathname === '/fr/' || pathname === '/en/' || pathname === '/es/' || pathname === '/de/' || pathname === '/ar/' || pathname === '/ja/' ||
        pathname === '/fr' || pathname === '/en' || pathname === '/es' || pathname === '/de' || pathname === '/ar' || pathname === '/ja';

    // Permettre l'accès à la racine principale et aux racines localisées sans redirection
    if (pathname === '/' || isLocalizedRoot) {
        const intlMiddleware = createMiddleware(routing);
        return intlMiddleware(request);
    }

    // Extraire le chemin sans le préfixe de langue
    const pathnameWithoutLocale = pathname.replace(/^\/(fr|en|es|de|ar|ja)/, '');

    // Récupérer la session
    const session = getSessionCookie(request);

    // Récupérer la locale actuelle
    const locale = pathname.startsWith('/fr') ? '/fr' :
        pathname.startsWith('/en') ? '/en' :
            pathname.startsWith('/es') ? '/es' :
                pathname.startsWith('/de') ? '/de' :
                    pathname.startsWith('/ar') ? '/ar' :
                        pathname.startsWith('/ja') ? '/ja' : '/fr'; // Par défaut, utiliser 'en'

    if (session) {
        const response = await fetch(`${request.nextUrl.origin}/api/session?token=${session.split(".")[0]}`);
        if (response.ok) {
            const existingSession = await response.json();
            const user = existingSession.session?.user as User;

            // Vérifier si l'utilisateur a vérifié son email
            if (user && !user.profileCompleted) {
                if (pathnameWithoutLocale !== '/onboarding') {
                    return NextResponse.redirect(new URL(`${locale}/onboarding`, request.url));
                }
            }

            // Vérifier les permissions basées sur le rôle
            if (user && user.role) {
                const navItems = navigationConfigForMiddleware();
                const pathSegments = pathnameWithoutLocale.split('/').filter(Boolean);
                const currentPathPattern = pathSegments.map(segment => {
                    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
                        ? '[id]'
                        : segment;
                }).join('/');

                const matchingRoute = navItems.find(item => {
                    const routePath = item.href.startsWith('/') ? item.href.slice(1) : item.href;

                    if (routePath.includes('[id]')) {
                        const routePattern = routePath.split('/');
                        const currentPattern = currentPathPattern.split('/');

                        if (routePattern.length !== currentPattern.length) return false;

                        return routePattern.every((segment, index) => {
                            return segment === '[id]' || segment === currentPattern[index];
                        });
                    }

                    return routePath === currentPathPattern;
                });

                if (matchingRoute && !matchingRoute.roles.includes(user.role as Role)) {
                    return NextResponse.redirect(new URL(`${locale}/not-found`, request.url));
                }
            }
        }
    }

    // Définir les routes publiques
    const publicRoutes = ['/login', '/404', '/'];
    const isPublicRoute = publicRoutes.some(route => pathnameWithoutLocale === route);

    // Si l'utilisateur est sur la page de login mais est déjà connecté, rediriger vers le dashboard
    if (pathnameWithoutLocale === '/login' && session) {
        return NextResponse.redirect(new URL(`${locale}/dashboard`, request.url));
    }

    // Si ce n'est pas une route publique et que l'utilisateur n'est pas connecté, rediriger vers login
    if (!isPublicRoute && !session) {
        return NextResponse.redirect(new URL(`${locale}/login`, request.url));
    }

    // Protection de la route onboarding
    if (pathnameWithoutLocale === '/onboarding') {
        if (!session) {
            return NextResponse.redirect(new URL(`${locale}/login`, request.url));
        }

        const response = await fetch(`${request.nextUrl.origin}/api/session?token=${session.split(".")[0]}`);
        if (response.ok) {
            const existingSession = await response.json();
            const user = existingSession.session?.user as User;

            if (user?.profileCompleted) {
                return NextResponse.redirect(new URL(`${locale}/dashboard`, request.url));
            }
        }
    }

    // Gestion de l'internationalisation pour les autres routes
    const intlMiddleware = createMiddleware(routing);
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/', '/(fr|en|es|de|ar|ja)/:path*'],
};