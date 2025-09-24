// Reviews
export const reviewsAPI = {
  getReviews: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/reviews/", { params });
    return response.data.results ?? response.data;
  },
  getReview: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/reviews/${id}/`);
    return response.data;
  },
  createReview: async (data: any) => {
    const response = await api.post("/v1/inventory/reviews/", data);
    return response.data;
  },
  updateReview: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/reviews/${id}/`, data);
    return response.data;
  },
  deleteReview: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/reviews/${id}/`);
    return response.data;
  },
  approveReview: async (id: string | number) => {
    const response = await api.patch(`/v1/inventory/reviews/${id}/approve/`);
    return response.data;
  },
  getTestimonials: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/testimonials/", { params });
    return response.data.results ?? response.data;
  },
  createTestimonial: async (data: any) => {
    const response = await api.post("/v1/inventory/testimonials/", data);
    return response.data;
  },
  updateTestimonial: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/testimonials/${id}/`, data);
    return response.data;
  },
  deleteTestimonial: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/testimonials/${id}/`);
    return response.data;
  },
};


// Coupons
export const couponsAPI = {
  getCoupons: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/coupons/", { params });
    return response.data.results ?? response.data;
  },
  getCoupon: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/coupons/${id}/`);
    return response.data;
  },
  createCoupon: async (data: any) => {
    const response = await api.post("/v1/inventory/coupons/", data);
    return response.data;
  },
  updateCoupon: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/coupons/${id}/`, data);
    return response.data;
  },
  deleteCoupon: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/coupons/${id}/`);
    return response.data;
  },
};
// Shipping
export const shippingAPI = {
  getShipping: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/shipping/", { params });
    return response.data.results ?? response.data;
  },
  getShippingDetail: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/shipping/${id}/`);
    return response.data;
  },
  createShipping: async (data: any) => {
    const response = await api.post("/v1/inventory/shipping/", data);
    return response.data;
  },
  updateShipping: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/shipping/${id}/`, data);
    return response.data;
  },
  deleteShipping: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/shipping/${id}/`);
    return response.data;
  },
};
// Payments
export const paymentsAPI = {
  getPayments: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/payments/", { params });
    return response.data.results ?? response.data;
  },
  getPayment: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/payments/${id}/`);
    return response.data;
  },
  createPayment: async (data: any) => {
    const response = await api.post("/v1/inventory/payments/", data);
    return response.data;
  },
  updatePayment: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/payments/${id}/`, data);
    return response.data;
  },
  deletePayment: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/payments/${id}/`);
    return response.data;
  },
  exportPayments: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/payments/export/", { params, responseType: "blob" });
    return response.data;
  },
};
// Customers
export const customersAPI = {
  getCustomers: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/customers/", { params });
    return response.data.results ?? response.data;
  },
  getCustomer: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/customers/${id}/`);
    return response.data;
  },
  createCustomer: async (data: any) => {
    const response = await api.post("/v1/inventory/customers/", data);
    return response.data;
  },
  updateCustomer: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/customers/${id}/`, data);
    return response.data;
  },
  deleteCustomer: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/customers/${id}/`);
    return response.data;
  },
};
// Orders
export const ordersAPI = {
  getOrders: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/orders/", { params });
    return response.data.results ?? response.data;
  },
  getOrder: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/orders/${id}/`);
    return response.data;
  },
  createOrder: async (data: any) => {
    const response = await api.post("/v1/inventory/orders/", data);
    return response.data;
  },
  updateOrder: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/orders/${id}/`, data);
    return response.data;
  },
  deleteOrder: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/orders/${id}/`);
    return response.data;
  },
  updateOrderStatus: async (id: string | number, status: string) => {
    const response = await api.patch(`/v1/inventory/orders/${id}/`, { status });
    return response.data;
  },
};
// lib/services/v1/inventory.ts
import api from "@/lib/api";
import type { Coupon } from "@/types/coupon";

type CouponPayload = {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  max_uses?: number;
  is_active?: boolean;
  start_date: string;
  end_date: string;
};


type CategoryCreatePayload = {
  name: string;
  parent?: number;
  image_file?: File | null;
};

type BrandCreatePayload = {
  name: string;
  description?: string;
  website?: string;
  is_active?: boolean;
  logo?: File | null;
};

// Brands
export const brandsAPI = {
  getBrands: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/brands/", { params });
    return response.data.results ?? response.data;
  },
  getBrand: async (id: number) => {
    const response = await api.get(`/v1/inventory/brands/${id}/`);
    return response.data;
  },
  createBrand: async (data: Record<string, any> | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData()
            if (data.name) fd.append("name", data.name)
            if (data.description) fd.append("description", data.description)
            if (data.website) fd.append("website", data.website)
            if (data.is_active !== undefined) fd.append("is_active", String(data.is_active))
            if (data.logo) fd.append("logo", data.logo)
            return fd
          })()

    const response = await api.post("/v1/inventory/brands/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },
  updateBrand: async (id: number, data: Partial<Record<string, any>> | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData()
            if (data.name) fd.append("name", data.name)
            if (data.description) fd.append("description", data.description)
            if (data.website) fd.append("website", data.website)
            if (data.is_active !== undefined) fd.append("is_active", String(data.is_active))
            if ((data as any).logo) fd.append("logo", (data as any).logo)
            return fd
          })()

    const response = await api.patch(`/v1/inventory/brands/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },
  deleteBrand: async (id: number) => {
    const response = await api.delete(`/v1/inventory/brands/${id}/`);
    return response.data;
  },
};

// Categories


export const categoriesAPI = {
  // ===== Categories =====
  getCategories: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/categories/", { params });
    return response.data.results;
  },

  getCategory: async (slug: string) => {
    const response = await api.get(`/v1/inventory/categories/${slug}/`);
    return response.data;
  },

  createCategory: async (data: CategoryCreatePayload | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData();
            fd.append("name", data.name);
            if (data.parent) fd.append("parent", String(data.parent));
            if (data.image_file) fd.append("image_file", data.image_file);
            return fd;
          })();

    const response = await api.post("/v1/inventory/categories/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCategory: async (
    slug: string,
    data: Partial<CategoryCreatePayload> | FormData
  ) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData();
            if (data.name) fd.append("name", data.name);
            if (data.parent !== undefined)
              fd.append("parent", String(data.parent));
            if (data.image_file) fd.append("image_file", data.image_file);
            return fd;
          })();

    const response = await api.patch(`/v1/inventory/categories/${slug}/`, formData);
    return response.data;
  },

  deleteCategory: async (slug: string) => {
    const response = await api.delete(`/v1/inventory/categories/${slug}/`);
    return response.data;
  },
};


// Products
export const productsAPI = {
  getProducts: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/products/", { params });
    return response.data.results ?? response.data;
  },
  getProduct: async (id: number) => {
    const response = await api.get(`/v1/inventory/products/${id}/`);
    return response.data;
  },
  createProduct: async (data: any) => {
    const response = await api.post("/v1/inventory/products/", data);
    return response.data;
  },
  updateProduct: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/products/${id}/`, data);
    return response.data;
  },
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/v1/inventory/products/${id}/`);
    return response.data;
  },
};

// Certifications
export const certificationsAPI = {
  getCertifications: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/certifications/", { params });
    return response.data.results ?? response.data;
  },
  getCertification: async (id: number) => {
    const response = await api.get(`/v1/inventory/certifications/${id}/`);
    return response.data;
  },
  createCertification: async (data: any) => {
    const response = await api.post("/v1/inventory/certifications/", data);
    return response.data;
  },
  updateCertification: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/certifications/${id}/`, data);
    return response.data;
  },
  deleteCertification: async (id: number) => {
    const response = await api.delete(`/v1/inventory/certifications/${id}/`);
    return response.data;
  },
};

// HSN Codes
export const hsncodesAPI = {
  getHSNCodes: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/hscodes/", { params });
    return response.data.results ?? response.data;
  },
  getHSNCode: async (id: number) => {
    const response = await api.get(`/v1/inventory/hscodes/${id}/`);
    return response.data;
  },
  createHSNCode: async (data: any) => {
    const response = await api.post("/v1/inventory/hscodes/", data);
    return response.data;
  },
  updateHSNCode: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/hscodes/${id}/`, data);
    return response.data;
  },
  deleteHSNCode: async (id: number) => {
    const response = await api.delete(`/v1/inventory/hscodes/${id}/`);
    return response.data;
  },
};

// Purities
export const puritiesAPI = {
  getPurities: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/purities/", { params });
    return response.data.results ?? response.data;
  },
  getPurity: async (id: number) => {
    const response = await api.get(`/v1/inventory/purities/${id}/`);
    return response.data;
  },
  createPurity: async (data: any) => {
    const response = await api.post("/v1/inventory/purities/", data);
    return response.data;
  },
  updatePurity: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/purities/${id}/`, data);
    return response.data;
  },
  deletePurity: async (id: number) => {
    const response = await api.delete(`/v1/inventory/purities/${id}/`);
    return response.data;
  },
};

// Metal Types
export const metalTypesAPI = {
  getMetalTypes: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/metal-types/", { params });
    return response.data.results ?? response.data;
  },
  getMetalType: async (id: number) => {
    const response = await api.get(`/v1/inventory/metal-types/${id}/`);
    return response.data;
  },
  createMetalType: async (data: any) => {
    const response = await api.post("/v1/inventory/metal-types/", data);
    return response.data;
  },
  updateMetalType: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/metal-types/${id}/`, data);
    return response.data;
  },
  deleteMetalType: async (id: number) => {
    const response = await api.delete(`/v1/inventory/metal-types/${id}/`);
    return response.data;
  },
};

// Stone Types
export const stoneTypesAPI = {
  getStoneTypes: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/stone-types/", { params });
    return response.data.results ?? response.data;
  },
  getStoneType: async (id: number) => {
    const response = await api.get(`/v1/inventory/stone-types/${id}/`);
    return response.data;
  },
  createStoneType: async (data: any) => {
    const response = await api.post("/v1/inventory/stone-types/", data);
    return response.data;
  },
  updateStoneType: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/stone-types/${id}/`, data);
    return response.data;
  },
  deleteStoneType: async (id: number) => {
    const response = await api.delete(`/v1/inventory/stone-types/${id}/`);
    return response.data;
  },
};

// Coupons
export const inventoryAPI = {
  getCoupons: async (params?: Record<string, any>): Promise<{ results: Coupon[] }> => {
    const response = await api.get("/v1/inventory/coupons/", { params });
    return response.data;
  },

  getCoupon: async (id: number): Promise<Coupon> => {
    const response = await api.get(`/v1/inventory/coupons/${id}/`);
    return response.data;
  },

  createCoupon: async (data: CouponPayload): Promise<Coupon> => {
    const response = await api.post("/v1/inventory/coupons/", data);
    return response.data;
  },

  updateCoupon: async (id: number, data: Partial<CouponPayload>): Promise<Coupon> => {
    const response = await api.patch(`/v1/inventory/coupons/${id}/`, data);
    return response.data;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/v1/inventory/coupons/${id}/`);
  },

};
