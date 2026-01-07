export interface Session {
  sessionId: string;
  userId: string;
  type: 'portrait' | 'conversation' | 'recommendation';
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
