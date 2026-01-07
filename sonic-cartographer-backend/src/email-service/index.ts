import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface Recommendation {
  title: string;
  artist: string;
  year: string;
  reason: string;
}

interface SendRecommendationsRequest {
  userEmail: string;
  userName: string;
  recommendations: Recommendation[];
}

interface SendRecommendationsResponse {
  success: boolean;
  message: string;
}

export default class extends Service<Env> {
  async sendRecommendations(data: SendRecommendationsRequest): Promise<SendRecommendationsResponse> {
    this.env.logger.info('Sending recommendations email', {
      userEmail: data.userEmail,
      recommendationCount: data.recommendations.length
    });

    try {
      // Build HTML email content
      const htmlContent = this.buildRecommendationEmailHtml(data.userName, data.recommendations);

      // Send email using Resend API (or configured email provider)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.env.EMAIL_FROM_ADDRESS,
          to: data.userEmail,
          subject: 'Your Sonic Cartographer Music Recommendations',
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email API error: ${error}`);
      }

      this.env.logger.info('Email sent successfully', { userEmail: data.userEmail });

      return {
        success: true,
        message: 'Recommendations sent to your email!',
      };
    } catch (error) {
      this.env.logger.error('Failed to send email', {
        userEmail: data.userEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to send email. Please try again later.',
      };
    }
  }

  private buildRecommendationEmailHtml(userName: string, recommendations: Recommendation[]): string {
    const recommendationsList = recommendations.map((rec, index) => `
      <div style="margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #ff0055;">
        <h3 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 18px;">
          ${index + 1}. ${rec.title}
        </h3>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          <strong>Artist:</strong> ${rec.artist}
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          <strong>Year:</strong> ${rec.year}
        </p>
        <p style="margin: 15px 0 0 0; color: #333; font-size: 14px; line-height: 1.6;">
          ${rec.reason}
        </p>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Music Recommendations</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 4px solid #ff0055; padding-bottom: 20px;">
      <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">
        Sonic Cartographer
      </h1>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        Your Personalized Music Recommendations
      </p>
    </div>

    <!-- Greeting -->
    <div style="margin-bottom: 30px;">
      <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${userName},
      </p>
      <p style="margin: 15px 0 0 0; color: #333; font-size: 16px; line-height: 1.6;">
        Based on our conversation about your music tastes, here are ${recommendations.length} album recommendations curated just for you:
      </p>
    </div>

    <!-- Recommendations -->
    ${recommendationsList}

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
      <p style="margin: 0; color: #999; font-size: 12px;">
        Happy listening! 🎵
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
        - The Sonic Cartographer Team
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}