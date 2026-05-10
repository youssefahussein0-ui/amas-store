import { z } from 'zod';
import { insertProductSchema, insertOrderSchema, insertCategorySchema, products, orders, orderItems, categories } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const productResponseSchema = z.custom<typeof products.$inferSelect>();
const orderResponseSchema = z.custom<typeof orders.$inferSelect>();
const categoryResponseSchema = z.custom<typeof categories.$inferSelect>();

export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: {
        200: z.array(productResponseSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: productResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema.extend({ 
        price: z.union([z.string(), z.number()]), 
        stock: z.coerce.number(),
        discountPrice: z.union([z.string(), z.number()]).optional().nullable(),
      }),
      responses: {
        201: productResponseSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial().extend({ 
        price: z.union([z.string(), z.number()]).optional(), 
        stock: z.coerce.number().optional(),
        discountPrice: z.union([z.string(), z.number()]).optional().nullable(),
      }),
      responses: {
        200: productResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(categoryResponseSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/categories/:id' as const,
      responses: {
        200: categoryResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: {
        201: categoryResponseSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id' as const,
      input: insertCategorySchema.partial(),
      responses: {
        200: categoryResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.any()), 
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema.extend({
        customerEmail: z.string().email().optional().nullable(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.union([z.string(), z.number()]),
          size: z.string().optional().nullable(),
          color: z.string().optional().nullable(),
        })),
        totalAmount: z.union([z.string(), z.number()]),
      }),
      responses: {
        201: orderResponseSchema,
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: orderResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalOrders: z.number(),
          totalRevenue: z.number(),
          totalProducts: z.number(),
        }),
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/admin/login' as const,
      input: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/admin/logout' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    checkAuth: {
      method: 'GET' as const,
      path: '/api/admin/check-auth' as const,
      responses: {
        200: z.object({ authenticated: z.boolean() }),
      },
    },
    leads: {
      method: 'GET' as const,
      path: '/api/admin/leads' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
  },
  leads: {
    create: {
      method: 'POST' as const,
      path: '/api/leads' as const,
      input: z.object({
        email: z.string().email(),
        phone: z.string(),
        prize: z.string(),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
