import {z} from 'zod'

export const createSaleSchema = z.object({
    body: z.object({
        item: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid item ID'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        totalPrice: z.number().min(0, 'Total price must be at least 0'),
        saleDate: z.preprocess((arg) => {
            if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
        }, z.date()).optional(),
        description: z.string().max(500, 'Description must be at most 500 characters long').optional(),
        status: z.enum(['active', 'inactive']).optional(),
    }),
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>['body']