import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface StartConversationResponse {
  conversationId: string;
  question: string;
}

interface ContinueConversationResponse {
  question: string;
  isComplete: boolean;
}

export default class extends Service<Env> {
  async startConversation(portraitId: string, userId: string): Promise<StartConversationResponse> {
    const conversationId = crypto.randomUUID();
    this.env.logger.info('Starting conversation', { conversationId, portraitId, userId });

    return {
      conversationId,
      question: 'What artists inspired you?',
    };
  }

  async continueConversation(conversationId: string, message: string): Promise<ContinueConversationResponse> {
    this.env.logger.info('Continuing conversation', { conversationId, message });

    return {
      question: 'Next question?',
      isComplete: false,
    };
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}