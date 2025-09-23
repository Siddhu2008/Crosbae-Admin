
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"

const API_BASE_URL = "https://api.crosbae.com/api"

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Token management
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token")
  }
  return null
}

const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token")
  }
  return null
}

const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token)
  }
}

const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError & { config?: any }) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          setToken(access)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        removeToken()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login/", { username, password })
    const { access, refresh, user } = response.data
    setToken(access)
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", refresh)
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post("/auth/logout/")
    } finally {
      removeToken()
    }
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me/")
    return response.data
  },
}

// Inventory API
export const inventoryAPI = {
  getProducts: async (params?: Record<string, any>) => {
    const response = await api.get("/inventory/products/", { params })
    return response.data
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/inventory/products/${id}/`)
    return response.data
  },

  createProduct: async (data: any) => {
    const response = await api.post("/inventory/products/", data)
    return response.data
  },

  updateProduct: async (id: number, data: any) => {
    const response = await api.put(`/inventory/products/${id}/`, data)
    return response.data
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/inventory/products/${id}/`)
    return response.data
  },

  bulkUploadProducts: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post("/inventory/products/bulk-upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  exportProducts: async (params?: Record<string, any>) => {
    const response = await api.get("/inventory/products/export/", {
      params,
      responseType: "blob",
    })
    return response.data
  },

  getCategories: async () => {
    const response = await api.get("/v1/inventory/categories/")
    return response.data
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post("/v1/inventory/categories/", data)
    return response.data
  },

  getBrands: async () => {
    const response = await api.get("/inventory/brands/")
    return response.data
  },

  createBrand: async (data: FormData) => {
    const response = await api.post("/inventory/brands/", data)
    return response.data
  },

  updateBrand: async (id: number, data: FormData) => {
    const response = await api.put(`/inventory/brands/${id}/`, data)
    return response.data
  },

  getMetalTypes: async () => {
    const response = await api.get("/inventory/metal-types/")
    return response.data
  },

  createMetalType: async (data: { name: string; purity?: string }) => {
    const response = await api.post("/inventory/metal-types/", data)
    return response.data
  },

  getStoneTypes: async () => {
    const response = await api.get("/inventory/stone-types/")
    return response.data
  },

  createStoneType: async (data: { name: string; quality?: string }) => {
    const response = await api.post("/inventory/stone-types/", data)
    return response.data
  },

  getCertifications: async () => {
    const response = await api.get("/inventory/certifications/")
    return response.data
  },

  createCertification: async (data: { name: string; authority?: string }) => {
    const response = await api.post("/inventory/certifications/", data)
    return response.data
  },

  uploadProductImages: async (productId: number, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("images", file)
    })
    const response = await api.post(`/inventory/products/${productId}/upload-images/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}

// Orders API
export const ordersAPI = {
  getOrders: async (params?: Record<string, any>) => {
    const response = await api.get("/orders/", { params })
    return response.data
  },

  getOrder: async (uuid: string) => {
    const response = await api.get(`/orders/${uuid}/`)
    return response.data
  },

  updateOrderStatus: async (uuid: string, status: string) => {
    const response = await api.patch(`/orders/${uuid}/`, { status })
    return response.data
  },
}

// Customers API
export const customersAPI = {
  getCustomers: async (params?: Record<string, any>) => {
    const response = await api.get("/customers/", { params })
    return response.data
  },

  getCustomer: async (id: number) => {
    const response = await api.get(`/customers/${id}/`)
    return response.data
  },
}

// Payments API
export const paymentsAPI = {
  getPayments: async (params?: Record<string, any>) => {
    const response = await api.get("/payments/", { params })
    return response.data
  },

  exportPayments: async (params?: Record<string, any>) => {
    const response = await api.get("/payments/export/", {
      params,
      responseType: "blob",
    })

    // Create download link
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `payments-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return response.data
  },

  // Razorpay placeholder
  processRazorpayPayment: async (paymentData: any) => {
    console.log("Razorpay integration needed - replace this with actual implementation")
    throw new Error("Razorpay integration not implemented")
  },
}

// Shipping API
export const shippingAPI = {
  getShipments: async (params?: Record<string, any>) => {
    const response = await api.get("/shipping/", { params })
    return response.data
  },

  createShipment: async (data: any) => {
    const response = await api.post("/shipping/", data)
    return response.data
  },

  updateShipment: async (id: number, data: any) => {
    const response = await api.put(`/shipping/${id}/`, data)
    return response.data
  },

  // Courier integration placeholder
  createShipmentWithCourier: async (shipmentData: any) => {
    console.log("Courier integration needed - replace this with actual implementation")
    throw new Error("Courier integration not implemented")
  },

  trackShipment: async (awbNumber: string) => {
    console.log("Tracking integration needed - replace this with actual implementation")
    throw new Error("Tracking integration not implemented")
  },
}

// Reviews and Testimonials API
export const reviewsAPI = {
  getReviews: async (params?: Record<string, any>) => {
    const response = await api.get("/reviews/", { params })
    return response.data
  },

  approveReview: async (id: number) => {
    const response = await api.patch(`/reviews/${id}/`, { is_approved: true })
    return response.data
  },

  deleteReview: async (id: number) => {
    const response = await api.delete(`/reviews/${id}/`)
    return response.data
  },

  getTestimonials: async (params?: Record<string, any>) => {
    const response = await api.get("/testimonials/", { params })
    return response.data
  },

  createTestimonial: async (data: any) => {
    const response = await api.post("/testimonials/", data)
    return response.data
  },

  updateTestimonial: async (id: number, data: any) => {
    const response = await api.put(`/testimonials/${id}/`, data)
    return response.data
  },

  deleteTestimonial: async (id: number) => {
    const response = await api.delete(`/testimonials/${id}/`)
    return response.data
  },
}

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

// Coupons API
export const couponsAPI = {
  getCoupons: async (params?: Record<string, any>) => {
    const response = await api.get("/coupons/", { params })
    return response.data
  },

  createCoupon: async (data: any) => {
    const response = await api.post("/coupons/", data)
    return response.data
  },

  updateCoupon: async (id: number, data: any) => {
    const response = await api.put(`/coupons/${id}/`, data)
    return response.data
  },

  deleteCoupon: async (id: number) => {
    const response = await api.delete(`/coupons/${id}/`)
    return response.data
  },
}

export default api
