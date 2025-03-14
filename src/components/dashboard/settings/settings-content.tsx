"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, PanelLeft, PanelTop, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useThemeStore, useThemeValue } from "@/hooks/use-theme-store"
import { useLayoutStore, useLayoutValue } from "@/hooks/use-layout-store"
import Image from "next/image"
import { useTranslations } from "next-intl"

export default function PreferencesPage() {

    const t = useTranslations("settings");

    const [notifications, setNotifications] = React.useState({
        email: true,
        security: true,
        promotional: false,
    })

    const setColorTheme = useThemeStore((state) => state.setTheme)
    const colorTheme: string = useThemeValue((state) => state.theme) as string //for color theme

    const { setTheme, theme } = useTheme(); //for dark & light

    const setLayout = useLayoutStore((state) => state.setLayout)
    const layout = useLayoutValue((state) => state.layout) as string //for layout

    return (
        <div className="dark:bg-zinc-950 px-6 md:px-8 lg:px-8 xl:px-12 space-y-8 py-10">
            <Card className="dark:bg-zinc-900 bg-zinc-100">
                <CardHeader>
                    <CardTitle>{t("appearance.title")}</CardTitle>
                    <CardDescription>{t("appearance.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="mb-3 text-lg font-medium">{t("appearance.theme.title")}</h3>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme("light")}
                                    className={theme === "light" ? "border-primary" : ""}
                                >
                                    <Sun className="h-5 w-5" />
                                    <span className="sr-only">{t("appearance.theme.light")}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme("dark")}
                                    className={theme === "dark" ? "border-primary" : ""}
                                >
                                    <Moon className="h-5 w-5" />
                                    <span className="sr-only">Dark</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme("system")}
                                    className={theme === "system" ? "border-primary" : ""}
                                >
                                    <span className="text-sm">OS</span>
                                    <span className="sr-only">System</span>
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">{t("appearance.colorTheme.title")}</h3>
                            <RadioGroup
                                defaultValue={colorTheme}
                                value={colorTheme}
                                onValueChange={setColorTheme}
                                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                            >
                                <div>
                                    <RadioGroupItem value="forest" id="forest" className="peer sr-only" />
                                    <Label
                                        htmlFor="forest"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white hover:bg-zinc-50 dark:bg-black/50 p-4 dark:hover:bg-black/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <Image width={600} height={600} src={"/theme/jade.png"} className={"w-16 h-16"} alt={"jade"} />
                                        <div className="font-medium">Jade</div>
                                    </Label>
                                </div>

                                <div>
                                    <RadioGroupItem value="obsidian" id="obsidian" className="peer sr-only" />
                                    <Label
                                        htmlFor="obsidian"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white hover:bg-zinc-50 dark:bg-black/50 p-4 dark:hover:bg-black/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <Image width={600} height={600} src={"/theme/obsidian.png"} className={"w-16 h-16"} alt={"obsidian"} />
                                        <div className="font-medium">Obsidian</div>
                                    </Label>
                                </div>

                                <div>
                                    <RadioGroupItem value="amber" id="amber" className="peer sr-only" />
                                    <Label
                                        htmlFor="amber"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white hover:bg-zinc-50 dark:bg-black/50 p-4 dark:hover:bg-black/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <Image width={600} height={600} src={"/theme/amber.png"} className={"w-16 h-16"} alt={"amber"} />
                                        <div className="font-medium">Amber</div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="dark:bg-zinc-900 bg-zinc-100">
                <CardHeader>
                    <CardTitle>{t("notifications.title")}</CardTitle>
                    <CardDescription>{t("notifications.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1 items-start">
                            <span>{t("notifications.email.title")}</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                {t("notifications.email.description")}
                            </span>
                        </Label>
                        <Switch
                            id="email-notifications"
                            checked={notifications.email}
                            onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, email: checked })}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="security-notifications" className="flex flex-col space-y-1 items-start">
                            <span>{t("notifications.security.title")}</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                {t("notifications.security.description")}
                            </span>
                        </Label>
                        <Switch
                            id="security-notifications"
                            checked={notifications.security}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="promotional-notifications" className="flex flex-col space-y-1 items-start">
                            <span>{t("notifications.promotional.title")}</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                {t("notifications.promotional.description")}
                            </span>
                        </Label>
                        <Switch
                            id="promotional-notifications"
                            checked={notifications.promotional}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, promotional: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="dark:bg-zinc-900 bg-zinc-100">
                <CardHeader>
                    <CardTitle>{t("layout.title")}</CardTitle>
                    <CardDescription>{t("layout.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue={layout}
                        value={layout}
                        onValueChange={setLayout}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        <div>
                            <RadioGroupItem value="side" id="sidebar" className="peer sr-only" />
                            <Label
                                htmlFor="sidebar"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white hover:bg-zinc-50 dark:bg-black/50 p-4 dark:hover:bg-black/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-md border-2 border-muted p-2">
                                    <PanelLeft className="h-10 w-10" />
                                </div>
                                <div className="font-medium">{t("layout.sidebar")}</div>
                            </Label>
                        </div>

                        <div>
                            <RadioGroupItem value="top" id="topnav" className="peer sr-only" />
                            <Label
                                htmlFor="topnav"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white hover:bg-zinc-50 dark:bg-black/50 p-4 dark:hover:bg-black/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-md border-2 border-muted p-2">
                                    <PanelTop className="h-10 w-10" />
                                </div>
                                <div className="font-medium">{t("layout.topnav")}</div>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    )
}

