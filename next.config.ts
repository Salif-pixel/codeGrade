import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    experimental: {
        viewTransition: true,
        nodeMiddleware: true,
        turbo: {
            resolveAlias: {
                canvas: './empty-module.ts',
            },
        },
        serverActions: {
            bodySizeLimit: '20mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
        ],
    },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
