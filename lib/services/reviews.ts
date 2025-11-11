
import api from "@/lib/api";

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

  getTestimonial: async (id: number) => {
    const response = await api.get(`/testimonials/${id}/`)
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