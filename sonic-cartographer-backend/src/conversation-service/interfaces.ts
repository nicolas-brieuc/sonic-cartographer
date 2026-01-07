export interface Conversation {
  conversationId: string;
  portraitId: string;
  userId: string;
  messages: Message[];
  isComplete: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
