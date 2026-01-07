import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface GeneratePortraitRequest {
  userId: string;
  artistList?: string;
  artistData?: string;
  format?: string;
}

interface Portrait {
  portraitId: string;
  userId?: string;
  genres?: string[];
  eras?: string[];
  primaryGenres?: string[];
  geographicCenters?: string[];
  keyEras?: string[];
  noteworthyGaps?: string[];
  summary?: string;
}

export default class extends Service<Env> {
  async generatePortrait(data: GeneratePortraitRequest): Promise<Portrait> {
    const portraitId = crypto.randomUUID();
    this.env.logger.info('Generating portrait', {
      portraitId,
      userId: data.userId,
      hasArtistList: !!data.artistList
    });

    // Parse the artist data - could be JSON string or plain text
    let artistData = data.artistList || data.artistData || '';

    if (!artistData || artistData.trim().length === 0) {
      throw new Error('No artist data provided');
    }

    // Use SmartInference to analyze the listening data
    const prompt = `You are a music analyst expert. Analyze the following Spotify listening history data and create a comprehensive listener portrait.

Listening Data:
${artistData.substring(0, 15000)} ${artistData.length > 15000 ? '... (truncated)' : ''}

Generate a detailed portrait with:

1. **Primary Genres** (5-7 genres): Identify the main genres in their listening habits
2. **Geographic Centers** (3-5 locations): Identify the primary geographic origins of the artists (cities, regions, countries)
3. **Key Eras** (3-5 time periods): Identify the main time periods or decades represented
4. **Noteworthy Gaps** (4-6 gaps): Identify significant genres, regions, or eras that are notably absent or underrepresented

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "primaryGenres": ["genre1", "genre2", ...],
  "geographicCenters": ["location1", "location2", ...],
  "keyEras": ["era1", "era2", ...],
  "noteworthyGaps": ["gap1 - description", "gap2 - description", ...],
  "summary": "A 2-3 sentence personalized summary synthesizing the portrait findings and highlighting opportunities for exploration"
}

Be specific and insightful. For gaps, include explanations after a dash (e.g., "Latin American Music - No artists from South/Central America despite global dominance").

The summary should be conversational and encouraging, mentioning specific genres/regions from the portrait data and exciting opportunities ahead.`;

    try {
      const analysis = await this.env.AI.run('llama-3.3-70b', {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b',
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Parse the AI response
      const responseText = (analysis as any).response || '';
      this.env.logger.info('AI analysis response', { responseLength: responseText.length });

      // Extract JSON from response (handle potential markdown code blocks)
      let jsonText = responseText.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const portraitData = JSON.parse(jsonText);

      return {
        portraitId,
        userId: data.userId,
        // Old format for backward compatibility
        genres: portraitData.primaryGenres || [],
        eras: portraitData.keyEras || [],
        // New format
        primaryGenres: portraitData.primaryGenres || [],
        geographicCenters: portraitData.geographicCenters || [],
        keyEras: portraitData.keyEras || [],
        noteworthyGaps: portraitData.noteworthyGaps || [],
        summary: portraitData.summary || undefined,
      };
    } catch (error) {
      this.env.logger.error('Failed to analyze portrait with AI', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback to basic analysis if AI fails
      return {
        portraitId,
        userId: data.userId,
        genres: ['Various Genres'],
        eras: ['Mixed Eras'],
        primaryGenres: ['Unable to analyze - AI error'],
        geographicCenters: ['Unable to analyze - AI error'],
        keyEras: ['Unable to analyze - AI error'],
        noteworthyGaps: ['AI analysis failed - please try again'],
      };
    }
  }

  async getPortrait(portraitId: string): Promise<Portrait> {
    this.env.logger.info('Getting portrait', { portraitId });

    return {
      portraitId,
      userId: 'user-123',
      genres: ['Rock'],
    };
  }

  async listPortraits(userId: string): Promise<Portrait[]> {
    this.env.logger.info('Listing portraits', { userId });

    return [
      { portraitId: 'p1' },
      { portraitId: 'p2' },
    ];
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}