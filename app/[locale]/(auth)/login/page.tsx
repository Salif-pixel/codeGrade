"use client";

import {Loader2, LockIcon, Terminal} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/theme/button-theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RiGithubFill, RiGoogleFill } from "react-icons/ri";
import {useLocale, useTranslations} from "next-intl";
import LanguageSwitcher from "@/components/internalization/language-switcher";
import {authClient} from "@/lib/auth-client";
import {useState} from "react";
import { useCustomToast } from "@/components/Alert/alert";

// Schéma de validation pour la connexion

export function SignInView  ()  {
    const t = useTranslations('authentication');
    const { showToast } = useCustomToast();
    const LoginSchema = z.object({
        email: z.string().email(t("invalid-email")),
        password: z.string().min(6, t("password-min-length")),
    });
    const locale = useLocale();

// Schéma de validation pour l'inscription
    const SignupSchema = z.object({
        name: z.string().min(1, t("name-required")),
        email: z.string().email(t("invalid-email")),
        password: z.string().min(6, t("password-min-length")),
    });

    // Gestion du formulaire de connexion
    const loginForm = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Gestion du formulaire d'inscription
    const signupForm = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });
    const [isPending, setIsPending] = useState(false);

    const onLoginSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setIsPending(true);
        const { email, password } = values;


        await authClient.signIn.email(
                {
                    email: email,
                    password: password,
                    callbackURL: `/${locale}/dashboard`,
                },
                {
                    onRequest: () => {
                        showToast(
                            t('login-auth.pending'),
                            t('login-auth.pendingDescription'),
                            "info"
                        );
                    },
                    onSuccess: () => {
                        loginForm.reset();
                        showToast(
                            t('login-auth.success'),
                            t('login-auth.successDescription'),
                            "success"
                        );
                    },
                    onError: (ctx) => {
                        const errorMap = {
                            "Invalid email or password": t("login-auth.invalidCredentials"),
                            "Server error": t("login-auth.error"),
                            "Network request failed": t("login-auth.networkError"),
                        };
                        console.log(errorMap, ctx.error.message)
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const errorMessage = errorMap[ctx.error.message] || t("login-auth.unknownError");
                        showToast(
                            t('login-auth.error'),
                            errorMessage || t('login-auth.unknownError'),
                            "error"
                        );
                    },
                }
            );


        setIsPending(false);
    };

    // Soumission du formulaire d'inscription
    const onSignupSubmit = async (values: z.infer<typeof SignupSchema>) => {
        setIsPending(true);
        const { name, email, password } = values;

        try {
            await authClient.signUp.email(
                {
                    email: email,
                    password: password,
                    name: name,
                    callbackURL: `/${locale}/dashboard`,
                },
                {
                    onRequest: () => {
                        showToast(
                            t('signup-auth.pending'),
                            t('signup-auth.pendingDescription'),
                            "info"
                        );
                    },
                    onSuccess: () => {
                        signupForm.reset();
                        showToast(
                            t('signup-auth.success'),
                            t('signup-auth.successDescription'),
                            "celebration"
                        );
                    },
                    onError: (ctx) => {
                        const errorMap = {
                            "Password too short": t("signup-auth.passwordTooShort"),
                            "Email already in use": t("signup-auth.emailInUse"),
                            "Server error": t("signup-auth.error"),
                            "Network request failed": t("signup-auth.networkError"),
                        };

                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const errorMessage = errorMap[ctx.error.message] || t("signup-auth.unknownError");
                        showToast(
                            t('signup-auth.error'),
                            errorMessage,
                            "error"
                        );
                    },
                }
            );
        } catch (error) {
            console.error("Signup error:", error);
            showToast(
                t('signup-auth.error'),
                t('signup-auth.unknownError'),
                "error"
            );
        }

        setIsPending(false);
    };

    return (
        <div className="h-screen relative flex items-center justify-center">
            <div className="w-full h-full grid lg:grid-cols-2 p-4 relative">
                <ModeToggle className={"absolute top-6 right-6 cursor-pointer z-999"} />
                <LanguageSwitcher className={"absolute top-6 right-26 cursor-pointer z-999"}/>
                <div className="h-full flex flex-col justify-center items-center lg:items-start">
                    <div className="max-w-xs m-auto w-full flex flex-col items-center px-3">
                        <div className={"flex flex-row gap-2"}>
                            <Terminal className={"text-primary"} /> codeGrade
                        </div>

                        <Tabs defaultValue="signin" className="w-full mt-4">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger className={"cursor-pointer"} value="signin">
                                    {t("login")}
                                </TabsTrigger>
                                <TabsTrigger className={"cursor-pointer"} value="signup">
                                    {t("signup")}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin">
                                <div className="flex flex-col items-center">
                                    <div className="my-7 w-full flex items-center justify-center overflow-hidden">
                                        <Separator />
                                        <span className="text-sm px-2">{t("or")}</span>
                                        <Separator />
                                    </div>

                                    <Form {...loginForm}>
                                        <form
                                            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                                            className="w-full space-y-4"
                                        >
                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("email")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder={t("email-placeholder")}
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {loginForm.formState.errors.email?.message
                                                                ? loginForm.formState.errors.email.message // Traduire le message d'erreur
                                                                : ""}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("password")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder={t("password-placeholder")}
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {loginForm.formState.errors.email?.message
                                                                ? loginForm.formState.errors.email.message // Traduire le message d'erreur
                                                                : ""}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                            {isPending ? (
                                                <Button className="self-end capitalize w-full" disabled>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t("login")}...
                                                </Button>
                                            ) : (
                                                <Button className=" cursor-pointer self-end capitalize w-full " type="submit">
                                                    <LockIcon className="h-5 w-5 mr-2" />
                                                    {t("login")}
                                                </Button>
                                            )}
                                        </form>
                                    </Form>
                                    <div className="flex flex-col gap-2 w-full space-y-2 mt-4">
                                        <Button
                                            className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90 cursor-pointer">
                      <span className="pointer-events-none me-2 flex-1">
                        <RiGoogleFill className="opacity-60" size={16} aria-hidden="true"/>
                      </span>
                                            {t("login-with-google")}
                                        </Button>

                                        <Button
                                            className="bg-[#333333] text-white after:flex-1 hover:bg-[#333333]/90 cursor-pointer">
                      <span className="pointer-events-none me-2 flex-1">
                        <RiGithubFill className="opacity-60" size={16} aria-hidden="true"/>
                      </span>
                                            {t("login-with-github")}
                                        </Button>

                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="signup">
                                <div className="flex flex-col items-center">
                                    <div className="my-7 w-full flex items-center justify-center overflow-hidden">
                                        <Separator />
                                        <span className="text-sm px-2">{t("or")}</span>
                                        <Separator />
                                    </div>

                                    <Form {...signupForm}>
                                        <form
                                            onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                                            className="w-full space-y-4"
                                        >
                                            <FormField
                                                control={signupForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("name")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                placeholder={t("name-placeholder")}
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {signupForm.formState.errors.email?.message
                                                                ? signupForm.formState.errors.email.message // Traduire le message d'erreur
                                                                : ""}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signupForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("email")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder={t("email-placeholder")}
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {signupForm.formState.errors.email?.message
                                                                ? signupForm.formState.errors.email.message // Traduire le message d'erreur
                                                                : ""}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signupForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("password")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder={t("password-placeholder")}
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {signupForm.formState.errors.email?.message
                                                                ? signupForm.formState.errors.email.message // Traduire le message d'erreur
                                                                : ""}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                            {isPending ? (
                                                <Button className="self-end capitalize w-full" disabled>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t("signup")}...
                                                </Button>
                                            ) : (
                                                <Button className=" cursor-pointer self-end capitalize w-full " type="submit">
                                                    <LockIcon className="h-5 w-5 mr-2" />
                                                    {t("signup")}
                                                </Button>
                                            )}
                                        </form>
                                    </Form>
                                    <div className="flex flex-col gap-2 w-full space-y-2 mt-4">
                                        <Button className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90 cursor-pointer">
                      <span className="pointer-events-none me-2 flex-1">
                        <RiGoogleFill className="opacity-60" size={16} aria-hidden="true" />
                      </span>
                                            {t("signup-with-google")}
                                        </Button>

                                        <Button className="bg-[#333333] text-white after:flex-1 hover:bg-[#333333]/90 cursor-pointer">
                      <span className="pointer-events-none me-2 flex-1">
                        <RiGithubFill className="opacity-60" size={16} aria-hidden="true" />
                      </span>
                                            {t("signup-with-github")}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div
                    className=" bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] relative hidden h-full flex-col bg-zinc-800 dark:bg-zinc-900 p-10 rounded-md text-white relative dark:border-r lg:flex"
                >
                    <div className="relative z-20 flex flex-row items-center text-lg w-fit font-medium">
                        <Terminal className="text-primary" />
                        codeGrade
                    </div>

                    <div className="relative z-20 flex items-center justify-center w-full h-full">
                        <img src="/assets/auth.svg" alt={t("auth-image-alt")} className="w-3/5 h-auto" />
                    </div>

                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">{t("auth-message")}</p>
                            <footer className="text-sm"></footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInView;