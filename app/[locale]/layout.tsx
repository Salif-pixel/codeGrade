import "./globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/src/i18n/routing';
import {Geist, Geist_Mono} from "next/font/google";
import {Metadata} from "next";
import {ThemeProvider} from "@src/components/theme-provider";
import {Locale} from "@/src/i18n/routing";
import {Toaster} from "@src/components/ui/sonner";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CodeGrade",
    description: "CodeGrade est une plateforme d'évaluation  en ligne.",
};

export default async function LocaleLayout({
                                               children,
                                               params
                                           }: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}) {
    // Ensure that the incoming `locale` is valid
    const {locale} = await params;
    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning={true}>
        <body>
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
            </ThemeProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}