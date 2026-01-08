import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface AlbumFeedback {
  albumId: string;
  albumTitle: string;
  artist: string;
  rating: number;
  rationale?: string;
  resonantElement?: string;
}

interface SubmitFeedbackRequest {
  userId: string;
  sessionId: string;
  feedback: AlbumFeedback[];
}

interface SubmitFeedbackResponse {
  success: boolean;
  message: string;
  feedbackId: string;
}

interface AnalysisResponse {
  reinforcedThemes: string;
  strategicPivot: string;
  feedbackCount: number;
}

export default class extends Service<Env> {
  async submitFeedback(request: SubmitFeedbackRequest): Promise<SubmitFeedbackResponse> {
    const feedbackId = crypto.randomUUID();

    this.env.logger.info('Submitting listening feedback', {
      feedbackId,
      userId: request.userId,
      sessionId: request.sessionId,
      feedbackCount: request.feedback.length
    });

    try {
      // Create feedback table if it doesn't exist
      await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: `
          CREATE TABLE IF NOT EXISTS listening_feedback (
            feedback_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            session_id TEXT,
            feedback_data TEXT NOT NULL,
            reinforced_themes TEXT,
            strategic_pivot TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });

      // Generate AI analysis
      const analysis = await this.generateAnalysis(request.feedback);

      // Store feedback with analysis
      const insertQuery = `
        INSERT INTO listening_feedback (feedback_id, user_id, session_id, feedback_data, reinforced_themes, strategic_pivot)
        VALUES (
          '${feedbackId}',
          '${request.userId}',
          ${request.sessionId ? `'${request.sessionId}'` : 'NULL'},
          '${JSON.stringify(request.feedback).replace(/'/g, "''")}',
          '${analysis.reinforcedThemes.replace(/'/g, "''")}',
          '${analysis.strategicPivot.replace(/'/g, "''")}'
        )
      `;

      await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: insertQuery
      });

      this.env.logger.info('Feedback stored successfully', { feedbackId });

      return {
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId
      };
    } catch (error) {
      this.env.logger.error('Failed to submit feedback', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getAnalysis(feedbackId: string): Promise<AnalysisResponse> {
    this.env.logger.info('Getting feedback analysis', { feedbackId });

    try {
      const result = await this.env.MAIN_DATABASE.executeQuery({
        sqlQuery: `
          SELECT reinforced_themes, strategic_pivot, feedback_data
          FROM listening_feedback
          WHERE feedback_id = '${feedbackId}'
        `,
        format: 'json'
      });

      if (result.status !== 200 || !result.results) {
        throw new Error('Feedback not found');
      }

      const rows = JSON.parse(result.results);
      if (!rows || rows.length === 0) {
        throw new Error('Feedback not found');
      }

      const row = rows[0];
      const feedbackData = JSON.parse(row.feedback_data);

      return {
        reinforcedThemes: row.reinforced_themes,
        strategicPivot: row.strategic_pivot,
        feedbackCount: feedbackData.length
      };
    } catch (error) {
      this.env.logger.error('Failed to get analysis', {
        feedbackId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async generateAnalysis(feedback: AlbumFeedback[]): Promise<{ reinforcedThemes: string; strategicPivot: string }> {
    this.env.logger.info('Generating AI analysis', { feedbackCount: feedback.length });

    if (feedback.length < 3) {
      return {
        reinforcedThemes: 'Not enough feedback yet - please review at least 3 albums for meaningful analysis.',
        strategicPivot: 'Not enough feedback yet - please review at least 3 albums for meaningful analysis.'
      };
    }

    // Separate positive and negative feedback
    const positiveRatings = feedback.filter(f => f.rating >= 4);
    const negativeRatings = feedback.filter(f => f.rating <= 2);

    // Build prompt for AI analysis
    const prompt = `You are a music curator analyzing listener feedback. Based on the following album ratings and comments, provide insights:

Feedback Summary:
${feedback.map((f, i) => `
${i + 1}. "${f.albumTitle}" by ${f.artist}
   Rating: ${f.rating}/5 stars
   ${f.rationale ? `Rationale: ${f.rationale}` : ''}
   ${f.resonantElement ? `What resonated: ${f.resonantElement}` : ''}
`).join('\n')}

Positive Ratings (4-5 stars): ${positiveRatings.length}
Negative Ratings (1-2 stars): ${negativeRatings.length}

Please provide:

1. **Reinforced Themes** (2-3 sentences): Analyze the highly-rated albums. What patterns emerge? What musical elements, genres, or approaches does this listener clearly enjoy? Be specific about production styles, instrumentation, lyrical themes, or sonic characteristics they gravitate toward.

2. **Strategic Pivot** (2-3 sentences): Based on lukewarm or negative responses, suggest alternative approaches. What might serve as better entry points? Consider adjacent genres, different eras, or alternative presentation styles that might resonate better.

Return as JSON:
{
  "reinforcedThemes": "Your analysis of what worked...",
  "strategicPivot": "Your suggested alternative approach..."
}

Be specific, insightful, and actionable. Use the actual album names and artists in your analysis.`;

    try {
      const response = await this.env.AI.run('llama-3.3-70b', {
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b',
        temperature: 0.7,
        max_tokens: 800,
      });

      let jsonText = ((response as any).response || '').trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(jsonText);

      return {
        reinforcedThemes: analysis.reinforcedThemes || 'Unable to generate analysis',
        strategicPivot: analysis.strategicPivot || 'Unable to generate analysis'
      };
    } catch (error) {
      this.env.logger.error('Failed to generate AI analysis', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback to basic analysis
      return {
        reinforcedThemes: positiveRatings.length > 0
          ? `You gave high ratings to ${positiveRatings.map(f => f.albumTitle).join(', ')}. These albums share common elements worth exploring further.`
          : 'Unable to identify clear themes from your ratings.',
        strategicPivot: negativeRatings.length > 0
          ? `Your lower ratings for ${negativeRatings.map(f => f.albumTitle).join(', ')} suggest trying alternative approaches or entry points.`
          : 'Your positive responses indicate you\'re on the right track. Continue exploring similar territory.'
      };
    }
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}