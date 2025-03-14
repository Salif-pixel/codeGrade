"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCustomToast } from "@/components/alert/alert"

interface CalendarDialogProps {
  isOpen: boolean
  onClose: () => void
  event?: {
    id: string
    title: string
    date: Date
    description?: string
  } | null
  onSave: (event: {
    id: string
    title: string
    date: Date
    description?: string
  }) => void
}

export function CalendarDialog({
  isOpen,
  onClose,
  event,
  onSave,
}: CalendarDialogProps) {
  const { showToast } = useCustomToast()
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")

  const handleSave = () => {
    if (!title.trim()) {
      showToast("Erreur", "Le titre est requis", "error")
      return
    }

    onSave({
      id: event?.id || Math.random().toString(36).substr(2, 9),
      title,
      date: event?.date || new Date(),
      description: description.trim() || undefined,
    })

    showToast("Succès", "L'événement a été enregistré", "success")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Détails de l'événement</DialogTitle>
          <DialogDescription>
            Modifiez les détails de l'événement ici. Cliquez sur enregistrer une
            fois terminé.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titre
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}