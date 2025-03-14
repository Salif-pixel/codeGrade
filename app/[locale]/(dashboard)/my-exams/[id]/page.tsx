'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ExamFormData {
  title: string
  description: string
  type: string
  submissionType: string
  language?: string
  maxAttempts: number
  duration: number
  fileUrl?: string
  deadline: string
}

export default function ExamPage() {
  const params = useParams()
  const isNewExam = params.id === 'new'
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    description: '',
    type: 'devoir',
    submissionType: 'code',
    language: 'python',
    maxAttempts: 1,
    duration: 60,
    fileUrl: '',
    deadline: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!isNewExam) {
      // Fetch exam data if editing existing exam
      // TODO: Implement fetch exam data
    }
  }, [isNewExam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isNewExam) {
        // TODO: Implement create exam
        toast.success('Devoir créé avec succès')
      } else {
        // TODO: Implement update exam
        toast.success('Devoir mis à jour avec succès')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const handleDelete = async () => {
    if (!isNewExam && window.confirm('Êtes-vous sûr de vouloir supprimer ce devoir ?')) {
      try {
        // TODO: Implement delete exam
        toast.success('Devoir supprimé avec succès')
      } catch (error) {
        toast.error('Une erreur est survenue')
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{isNewExam ? 'Créer un nouveau devoir' : 'Modifier le devoir'}</CardTitle>
          <CardDescription>
            {isNewExam ? 'Créez un nouveau devoir pour vos étudiants' : 'Modifiez les détails du devoir'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devoir">Devoir</SelectItem>
                    <SelectItem value="examen">Examen</SelectItem>
                    <SelectItem value="tp">TP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionType">Type de soumission</Label>
                <Select
                  value={formData.submissionType}
                  onValueChange={(value) => setFormData({ ...formData, submissionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de soumission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="file">Fichier</SelectItem>
                    <SelectItem value="text">Texte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.submissionType === 'code' && (
              <div className="space-y-2">
                <Label htmlFor="language">Langage de programmation</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un langage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Nombre maximum de tentatives</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            {formData.submissionType === 'file' && (
              <div className="space-y-2">
                <Label htmlFor="fileUrl">URL du fichier</Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-between">
              <Button type="submit" className="w-32">
                {isNewExam ? 'Créer' : 'Mettre à jour'}
              </Button>
              {!isNewExam && (
                <Button type="button" variant="destructive" className="w-32" onClick={handleDelete}>
                  Supprimer
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}