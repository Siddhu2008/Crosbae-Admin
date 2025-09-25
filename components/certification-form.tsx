"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CertificationFormProps {
  certification?: any
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

export function CertificationForm({ certification, onSubmit, onCancel }: CertificationFormProps) {
  const [name, setName] = useState(certification?.name || "")
  const [description, setDescription] = useState(certification?.description || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      if (description) formData.append("description", description)
      if (imageFile) formData.append("image_file", imageFile)
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{certification ? "Edit Certification" : "Add Certification"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel>Image</FormLabel>
            <FormControl>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </FormControl>
            <FormMessage />
          </FormItem>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : certification ? "Update" : "Add"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
