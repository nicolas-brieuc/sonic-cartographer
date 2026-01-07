import { z } from 'zod';

// Request schemas
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const GeneratePortraitRequestSchema = z.object({
  artistData: z.string(), // CSV or JSON string
  format: z.enum(['csv', 'json']),
});

export const StartConversationRequestSchema = z.object({
  portraitId: z.string(),
});

export const ContinueConversationRequestSchema = z.object({
  message: z.string(),
});

export const GenerateRecommendationsRequestSchema = z.object({
  conversationId: z.string(),
});

export const CreateListeningExperienceRequestSchema = z.object({
  recommendationId: z.string(),
  albumId: z.string(),
  rating: z.number().min(1).max(5).optional(),
  resonanceNotes: z.string().optional(),
});

export const CreateSessionRequestSchema = z.object({
  type: z.enum(['portrait', 'conversation', 'recommendation']),
});

export const UpdateSessionStatusRequestSchema = z.object({
  status: z.enum(['active', 'completed', 'archived']),
});

export const CreateSpotifyPlaylistRequestSchema = z.object({
  recommendationId: z.string(),
  playlistName: z.string(),
});

export const SendEmailRequestSchema = z.object({
  recommendationId: z.string(),
  recipientEmail: z.string().email(),
});

// Response types
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type GeneratePortraitRequest = z.infer<typeof GeneratePortraitRequestSchema>;
export type StartConversationRequest = z.infer<typeof StartConversationRequestSchema>;
export type ContinueConversationRequest = z.infer<typeof ContinueConversationRequestSchema>;
export type GenerateRecommendationsRequest = z.infer<typeof GenerateRecommendationsRequestSchema>;
export type CreateListeningExperienceRequest = z.infer<typeof CreateListeningExperienceRequestSchema>;
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
export type UpdateSessionStatusRequest = z.infer<typeof UpdateSessionStatusRequestSchema>;
export type CreateSpotifyPlaylistRequest = z.infer<typeof CreateSpotifyPlaylistRequestSchema>;
export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
