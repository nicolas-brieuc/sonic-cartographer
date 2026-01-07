import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface GenerateRecommendationsResponse {
  recommendationId: string;
  albums: unknown[];
}

export default class extends Service<Env> {
  async generateRecommendations(conversationId: string): Promise<GenerateRecommendationsResponse> {
    const recommendationId = crypto.randomUUID();
    this.env.logger.info('Generating recommendations', { recommendationId, conversationId });

    return {
      recommendationId,
      albums: [],
    };
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}