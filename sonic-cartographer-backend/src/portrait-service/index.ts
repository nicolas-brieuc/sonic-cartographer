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
  "noteworthyGaps": ["[Genre/Region/Era] - [Explanation of absence]", "[Genre/Region/Era] - [Explanation of absence]", ...],
  "summary": "A 2-3 sentence personalized summary synthesizing the portrait findings and highlighting opportunities for exploration"
}

Be specific and insightful. For gaps, use the format "[Category] - [Explanation]" where the category is the missing genre, region, or era, and the explanation describes why it's notable.

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

      const portrait: Portrait = {
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

      // Store portrait in database
      await this.storePortrait(portrait);

      return portrait;
    } catch (error) {
      this.env.logger.error('Failed to analyze portrait with AI', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback to basic analysis if AI fails
      const fallbackPortrait: Portrait = {
        portraitId,
        userId: data.userId,
        genres: ['Various Genres'],
        eras: ['Mixed Eras'],
        primaryGenres: ['Unable to analyze - AI error'],
        geographicCenters: ['Unable to analyze - AI error'],
        keyEras: ['Unable to analyze - AI error'],
        noteworthyGaps: ['AI analysis failed - please try again'],
      };

      // Store fallback portrait
      await this.storePortrait(fallbackPortrait);

      return fallbackPortrait;
    }
  }

  private async storePortrait(portrait: Portrait): Promise<void> {
    try {
      // Create portraits table if it doesn't exist
      await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: `
          CREATE TABLE IF NOT EXISTS portraits (
            portrait_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            primary_genres TEXT,
            geographic_centers TEXT,
            key_eras TEXT,
            noteworthy_gaps TEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });

      // Insert portrait using parameterized query
      const insertQuery = `
        INSERT INTO portraits (portrait_id, user_id, primary_genres, geographic_centers, key_eras, noteworthy_gaps, summary)
        VALUES (
          '${portrait.portraitId}',
          '${portrait.userId || ''}',
          '${JSON.stringify(portrait.primaryGenres || []).replace(/'/g, "''")}',
          '${JSON.stringify(portrait.geographicCenters || []).replace(/'/g, "''")}',
          '${JSON.stringify(portrait.keyEras || []).replace(/'/g, "''")}',
          '${JSON.stringify(portrait.noteworthyGaps || []).replace(/'/g, "''")}',
          ${portrait.summary ? `'${portrait.summary.replace(/'/g, "''")}'` : 'NULL'}
        )
      `;

      await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: insertQuery
      });

      this.env.logger.info('Portrait stored successfully', { portraitId: portrait.portraitId });
    } catch (error) {
      this.env.logger.error('Failed to store portrait', {
        portraitId: portrait.portraitId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getPortrait(portraitId: string): Promise<Portrait> {
    this.env.logger.info('Getting portrait', { portraitId });

    try {
      // Query portrait from database
      const result = await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: `SELECT portrait_id, user_id, primary_genres, geographic_centers, key_eras, noteworthy_gaps, summary
                   FROM portraits
                   WHERE portrait_id = '${portraitId}'`,
        format: 'json'
      });

      if (result.status !== 200 || !result.results) {
        throw new Error('Portrait not found');
      }

      // Parse the JSON results
      const rows = JSON.parse(result.results);

      if (!rows || rows.length === 0) {
        throw new Error('Portrait not found');
      }

      const row = rows[0];

      // Parse JSON fields
      const primaryGenres = row.primary_genres ? JSON.parse(row.primary_genres) : [];
      const geographicCenters = row.geographic_centers ? JSON.parse(row.geographic_centers) : [];
      const keyEras = row.key_eras ? JSON.parse(row.key_eras) : [];
      const noteworthyGaps = row.noteworthy_gaps ? JSON.parse(row.noteworthy_gaps) : [];

      return {
        portraitId: row.portrait_id,
        userId: row.user_id,
        // Old format for backward compatibility
        genres: primaryGenres,
        eras: keyEras,
        // New format
        primaryGenres,
        geographicCenters,
        keyEras,
        noteworthyGaps,
        summary: row.summary || undefined,
      };
    } catch (error) {
      this.env.logger.error('Failed to get portrait', {
        portraitId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async listPortraits(userId: string): Promise<Portrait[]> {
    this.env.logger.info('Listing portraits', { userId });

    try {
      // Query portraits from database
      const result = await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: `SELECT portrait_id, user_id, primary_genres, geographic_centers, key_eras, noteworthy_gaps, summary
                   FROM portraits
                   WHERE user_id = '${userId}'
                   ORDER BY created_at DESC`,
        format: 'json'
      });

      if (result.status !== 200 || !result.results) {
        return [];
      }

      // Parse the JSON results
      const rows = JSON.parse(result.results);

      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((row: any) => {
        const primaryGenres = row.primary_genres ? JSON.parse(row.primary_genres) : [];
        const geographicCenters = row.geographic_centers ? JSON.parse(row.geographic_centers) : [];
        const keyEras = row.key_eras ? JSON.parse(row.key_eras) : [];
        const noteworthyGaps = row.noteworthy_gaps ? JSON.parse(row.noteworthy_gaps) : [];

        return {
          portraitId: row.portrait_id,
          userId: row.user_id,
          genres: primaryGenres,
          eras: keyEras,
          primaryGenres,
          geographicCenters,
          keyEras,
          noteworthyGaps,
          summary: row.summary || undefined,
        };
      });
    } catch (error) {
      this.env.logger.error('Failed to list portraits', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}