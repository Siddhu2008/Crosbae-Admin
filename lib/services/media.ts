import api from "@/lib/api";
// Media Management API
export const mediaAPI = {
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (folder) formData.append("folder", folder)

    const response = await api.post("/media/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  getFiles: async (params?: Record<string, any>) => {
    const response = await api.get("/media/", { params })
    return response.data
  },

  deleteFile: async (id: number) => {
    const response = await api.delete(`/media/${id}/`)
    return response.data
  },

  getPresignedUrl: async (fileName: string, fileType: string) => {
    const response = await api.post("/media/presigned-url/", {
      file_name: fileName,
      file_type: fileType,
    })
    return response.data
  },
}