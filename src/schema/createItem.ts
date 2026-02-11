import {z} from 'zod'

export const createItemSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Item name must be at least 3 characters long').max(100, 'Item name must be at most 100 characters long'),
        category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional(),
        description: z.string().max(500, 'Description must be at most 500 characters long').optional(),
        price: z.number().min(0, 'Price must be at least 0'),
        stock: z.number().min(0, 'Stock must be at least 0').optional(),
        status: z.enum(['active', 'inactive']).optional(),
    }),
})

export type CreateItemInput = z.infer<typeof createItemSchema>['body']