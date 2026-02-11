import {z} from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Category name must be at least 3 characters long').max(50, 'Category name must be at most 50 characters long'),
        description: z.string().max(200, 'Description must be at most 200 characters long').optional(),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];