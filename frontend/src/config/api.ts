/**
 * API Configuration for Sonic Cartographer Frontend
 *
 * Configure the backend API endpoint here.
 * In production, set VITE_API_URL environment variable.
 */

// Get API URL from environment or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://svc-01kec55hc6kk97ea5dvjkfp634.01kavf4tgmmw025x22v6x0m5db.lmapp.run';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  register: `${API_BASE_URL}/v1/auth/register`,
  login: `${API_BASE_URL}/v1/auth/login`,

  // Portraits
  generatePortrait: `${API_BASE_URL}/v1/portraits/generate`,
  getPortrait: (portraitId: string) => `${API_BASE_URL}/v1/portraits/${portraitId}`,
  listPortraits: `${API_BASE_URL}/v1/portraits/list`,

  // Conversations
  startConversation: `${API_BASE_URL}/v1/conversations`,
  sendMessage: (conversationId: string) => `${API_BASE_URL}/v1/conversations/${conversationId}/messages`,

  // Recommendations
  generateRecommendations: (conversationId: string) => `${API_BASE_URL}/v1/conversations/${conversationId}/recommendations`,
  emailRecommendations: `${API_BASE_URL}/v1/recommendations/email`,

  // Listening Experience
  submitFeedback: `${API_BASE_URL}/v1/listening-experience/feedback`,
  getAnalysis: (feedbackId: string) => `${API_BASE_URL}/v1/listening-experience/analysis/${feedbackId}`,

  // Health check
  health: `${API_BASE_URL}/health`,
} as const;

/**
 * Helper function to get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Helper function to set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Helper function to clear auth token from localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('userData');
};

/**
 * Helper function to create headers with auth token
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};
