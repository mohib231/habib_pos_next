import {z} from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        username: z.string().min(3, 'Username must be at least 3 characters long').max(30, 'Username must be at most 30 characters long'),
        password: z.string().min(8, 'Password must be at least 8 characters long').max(100, 'Password must be at most 100 characters long'),
        role: z.enum(['admin', 'user']).optional(),
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];