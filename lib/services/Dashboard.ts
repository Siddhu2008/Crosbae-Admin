import api from "@/lib/api";


// Dashboard API
export const dashboardAPI = {
  getMetrics: async () => {
    const response = await api.get("/dashboard/metrics/")
    return response.data
  },

  getSalesChart: async (period = "30d") => {
    const response = await api.get(`/dashboard/sales-chart/?period=${period}`)
    return response.data
  },

  getTopProducts: async () => {
    const response = await api.get("/dashboard/top-products/")
    return response.data
  },
}