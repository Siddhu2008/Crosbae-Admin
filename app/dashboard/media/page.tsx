"use client"

import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDropzone } from "react-dropzone"
import { Upload, Image, File, MoreHorizontal, Copy, Trash2, Download, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MediaFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([
    {
      id: "1",
      name: "hero-banner.jpg",
      url: "/jewelry-banner.jpg",
      size: 245760,
      type: "image/jpeg",
      uploadedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "product-catalog.pdf",
      url: "#",
      size: 1048576,
      type: "application/pdf",
      uploadedAt: "2024-01-14T14:20:00Z",
    },
    {
      id: "3",
      name: "testimonial-bg.png",
      url: "/testimonial-background.jpg",
      size: 512000,
      type: "image/png",
      uploadedAt: "2024-01-13T09:15:00Z",
    },
  ])
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const newFiles: MediaFile[] = acceptedFiles.map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }))

        setFiles((prev) => [...newFiles, ...prev])
        toast({
          title: "Success",
          description: `${acceptedFiles.length} file(s) uploaded successfully`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload files",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".csv"],
    },
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied",
      description: "File URL copied to clipboard",
    })
  }

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
    toast({
      title: "Success",
      description: "File deleted successfully",
    })
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalFiles = files.length
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const imageFiles = files.filter((file) => file.type.startsWith("image/")).length
  const documentFiles = files.filter((file) => !file.type.startsWith("image/")).length

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader title="Media Management" description="Upload and manage your media files" />

        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Media Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFiles}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Images</CardTitle>
                <Image className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{imageFiles}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <File className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{documentFiles}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Upload className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatFileSize(totalSize)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Drag and drop files or click to browse</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {uploading ? (
                  <div>
                    <p className="text-lg font-medium">Uploading files...</p>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                ) : isDragActive ? (
                  <p className="text-lg font-medium">Drop the files here...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">Click to upload or drag and drop</p>
                    <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                      Supports: Images (JPG, PNG, GIF, WebP), Documents (PDF, TXT, CSV)
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Browser */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>Browse and manage your uploaded files</CardDescription>
                </div>
                <div className="w-full sm:w-64 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <File className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {file.type.split("/")[1].toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyUrl(file.url)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(file.url, "_blank")}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteFile(file.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredFiles.length === 0 && (
                <div className="text-center py-12">
                  <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No files found</p>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "Upload some files to get started"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
