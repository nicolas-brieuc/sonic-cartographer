import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface Recommendation {
  albumId: string;
  title: string;
  artist: string;
  year: string;
  reason: string;
  reviewLink?: string;
  coverImage?: string;
}

interface GenerateRecommendationsResponse {
  recommendations: Recommendation[];
}

export default class extends Service<Env> {
  async generateRecommendations(conversationId: string): Promise<GenerateRecommendationsResponse> {
    this.env.logger.info('Generating recommendations', { conversationId });

    try {
      // Retrieve conversation from KvCache
      const conversationData = await this.env.mem.get(`conversation:${conversationId}`);

      if (!conversationData) {
        throw new Error('Conversation not found');
      }

      const conversation = JSON.parse(conversationData);
      const messages = conversation.messages || [];
      const portraitId = conversation.portraitId;

      // Get the portrait to understand user's gaps
      const portrait = await this.env.PORTRAIT_SERVICE.getPortrait(portraitId);

      // Build conversation history for AI
      const conversationHistory = messages.map((m: any) =>
        `${m.role}: ${m.content}`
      ).join('\n');

      // Step 1: Use AI to extract search criteria from conversation
      const criteriaPrompt = `Based on this conversation about music discovery:

${conversationHistory}

And the user's portrait gaps: ${(portrait as any).noteworthyGaps?.join(', ') || 'various musical territories'}

Extract 3-5 specific search criteria for finding albums. For each criterion, provide:
- genre: main genre (e.g., "Latin", "Electronic", "Jazz")
- style: specific style if mentioned (e.g., "Bossa Nova", "Ambient", "Bebop")
- country: geographic region if mentioned (e.g., "Brazil", "Morocco", "Cambodia")
- yearRange: approximate era (e.g., "1960s", "1990s", "2000s")

Return as JSON array:
[
  { "genre": "Latin", "style": "Bossa Nova", "country": "Brazil", "yearRange": "1960s" },
  ...
]

Focus on the gaps and preferences they expressed. Return ONLY the JSON array.`;

      const criteriaResponse = await this.env.AI.run('llama-3.3-70b', {
        messages: [{ role: 'user', content: criteriaPrompt }],
        model: 'llama-3.3-70b',
        temperature: 0.7,
        max_tokens: 500,
      });

      let criteriaJson = ((criteriaResponse as any).response || '[]').trim();
      if (criteriaJson.startsWith('```')) {
        criteriaJson = criteriaJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const searchCriteria = JSON.parse(criteriaJson);

      // Step 2: Search Discogs for REAL albums
      const allAlbums: any[] = [];

      for (const criteria of searchCriteria.slice(0, 5)) {
        const albums = await this.env.DATA_ENRICHMENT_SERVICE.searchAlbums({
          genre: criteria.genre,
          style: criteria.style,
          country: criteria.country,
          limit: 10,
        });
        allAlbums.push(...albums);
      }

      if (allAlbums.length === 0) {
        throw new Error('No albums found on Discogs');
      }

      this.env.logger.info('Found albums from Discogs', { count: allAlbums.length });

      // Step 3: Use AI to select best 5 and write personalized reasons
      const selectionPrompt = `You are curating 5 albums from this list of REAL albums found on Discogs:

${JSON.stringify(allAlbums.slice(0, 30), null, 2)}

Based on this conversation:
${conversationHistory}

Select 5 diverse albums that best match the user's interests. For each, write a personalized 2-3 sentence reason explaining why it fits their conversation.

Return as JSON:
[
  {
    "discogsId": <number>,
    "reason": "Personalized explanation..."
  },
  ...
]

IMPORTANT: Only use albums from the list above. Return ONLY the JSON array.`;

      const selectionResponse = await this.env.AI.run('llama-3.3-70b', {
        messages: [{ role: 'user', content: selectionPrompt }],
        model: 'llama-3.3-70b',
        temperature: 0.8,
        max_tokens: 1500,
      });

      let selectionJson = ((selectionResponse as any).response || '[]').trim();
      if (selectionJson.startsWith('```')) {
        selectionJson = selectionJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const selections = JSON.parse(selectionJson);

      // Map to our format with real album data
      const recommendations: Recommendation[] = selections
        .map((sel: any) => {
          const album = allAlbums.find((a) => a.discogsId === sel.discogsId);
          if (!album) return null;

          return {
            albumId: `discogs-${album.discogsId}`,
            title: album.title,
            artist: album.artist,
            year: album.year,
            reason: sel.reason,
            reviewLink: `https://www.discogs.com/master/${album.discogsId}`,
            coverImage: undefined,
          };
        })
        .filter((r: any) => r !== null)
        .slice(0, 5);

      // Ensure we have at least some recommendations
      if (recommendations.length === 0) {
        throw new Error('Could not generate recommendations from Discogs results');
      }

      this.env.logger.info('Generated recommendations', {
        conversationId,
        count: recommendations.length,
        source: 'Discogs'
      });

      return { recommendations };
    } catch (error) {
      this.env.logger.error('Failed to generate recommendations', {
        conversationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Return fallback recommendations
      return {
        recommendations: [
          {
            albumId: crypto.randomUUID(),
            title: 'Discovery Awaits',
            artist: 'Various Artists',
            year: '2024',
            reason: 'We encountered an issue generating personalized recommendations. Please try again or start a new conversation.',
          }
        ]
      };
    }
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}