import { z } from 'zod';

// Request schemas
export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const ValidateTokenSchema = z.object({
  token: z.string(),
});

// Types
export type RegisterUserRequest = z.infer<typeof RegisterUserSchema>;
export type LoginUserRequest = z.infer<typeof LoginUserSchema>;
export type ValidateTokenRequest = z.infer<typeof ValidateTokenSchema>;

export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
}

export interface AuthResponse {
  userId: string;
  token: string;
  email: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
