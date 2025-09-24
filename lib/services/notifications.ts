import api from "@/lib/api";

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get("/notifications/")
    return response.data
  },

  createNotification: async (data: { title: string; message: string; type: string }) => {
    const response = await api.post("/notifications/", data)
    return response.data
  },

  deleteNotification: async (id: number) => {
    const response = await api.delete(`/notifications/${id}/`)
    return response.data
  },
}
