import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    experimental: {
        viewTransition: true,
        nodeMiddleware: true,
    },
};

const withNextIntl = createNextIntlPlugin(
    './src/i18n/request.ts'
);
export default withNextIntl(nextConfig);

