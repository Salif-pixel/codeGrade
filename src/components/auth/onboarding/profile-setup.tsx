"use client"

import type React from "react"

import { useState } from "react"

import { useRef } from "react"
import { User, X, Camera } from "lucide-react"
import { Input } from "@src/components/ui/input"
import { Label } from "@src/components/ui/label"
import { Textarea } from "@src/components/ui/textarea"
import { Button } from "@src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@src/components/ui/avatar"
import { useTranslations } from "next-intl"

interface ProfileSetupProps {
  data: {
    name: string
    email: string
    image: File | null
    background: string
  }
  onChange: (data: Partial<ProfileSetupProps["data"]>) => void
  errors: Record<string, string>
  onErrorChange: (field: string) => void
}

export default function ProfileSetup({ data, onChange, errors, onErrorChange }: ProfileSetupProps) {
  const t = useTranslations("profile")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange({ image: file })
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    onChange({ image: null })
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-6">
          <Avatar className="w-32 h-32 border-4 border-background">
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
            <div className="absolute -bottom-2 -right-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="rounded-full h-10 w-10 shadow-md"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            {previewUrl && (
              <div className="absolute -top-2 -right-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="rounded-full h-6 w-6 shadow-md"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </Avatar>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
        <h3 className="text-lg font-medium">{t("profilePicture.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("profilePicture.description")}</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            {t("name.label")}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => {
              onChange({ name: e.target.value })
              onErrorChange("name")
            }}
            placeholder={t("name.placeholder")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            {t("email.label")}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => {
              onChange({ email: e.target.value })
              onErrorChange("email")
            }}
            placeholder={t("email.placeholder")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="background">{t("background.label")}</Label>
          <Textarea
            id="background"
            value={data.background}
            onChange={(e) => onChange({ background: e.target.value })}
            placeholder={t("background.placeholder")}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">{t("background.counter", { length: data.background.length })}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border text-sm">
        <p className="font-medium mb-1">{t("privacy.title")}</p>
        <p className="text-muted-foreground">{t("privacy.description")}</p>
      </div>
    </div>
  )
}

