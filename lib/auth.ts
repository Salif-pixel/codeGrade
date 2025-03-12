import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string): Promise<string> => {
                const salt = await bcrypt.genSalt(10);
                return await bcrypt.hash(password, salt);
            },
            verify: async ({ password, hash }: { password: string; hash: string }): Promise<boolean> => {
                return await bcrypt.compare(password, hash);
            }
        },
        // sendResetPassword: async ({user, url}) => {
        //     await resend.emails.send({
        //         from: 'onboarding@resend.dev',
        //         to: user.email,
        //         subject: "Réinitialisation du mot de passe",
        //         text: `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${url}`,
        //     });
        // }

    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            redirectUri: process.env.GITHUB_REDIRECT_URI as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirectUri: process.env.GOOGLE_REDIRECT_URI as string,
        }
    },

});