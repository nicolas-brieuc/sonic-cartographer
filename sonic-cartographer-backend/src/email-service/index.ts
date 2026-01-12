import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface Recommendation {
  title: string;
  artist: string;
  year: string;
  reason: string;
  spotifyLink?: string;
  coverImage?: string;
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
      <div style="margin-bottom: 20px; padding: 24px; background-color: #202020; border: 2px solid #ffffff;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td valign="top" style="width: 192px; padding-right: 24px;">
              <!-- Album Cover with Number Badge using background-image approach -->
              <table cellpadding="0" cellspacing="0" border="0" width="192" height="192" style="width: 192px; height: 192px; ${rec.coverImage ? `background-image: url('${rec.coverImage}'); background-size: cover; background-position: center;` : 'background-color: #303030;'} border: 2px solid #ffffff;">
                <tr>
                  <td valign="top" align="left" style="padding: 0;">
                    <!-- Number Badge -->
                    <table cellpadding="0" cellspacing="0" border="0" width="40" height="40" style="width: 40px; height: 40px; background-color: #ffffff; border: 2px solid #ffffff;">
                      <tr>
                        <td align="center" valign="middle" style="color: #000000; font-size: 24px; font-weight: bold; line-height: 40px;">
                          ${index + 1}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${!rec.coverImage ? `
                <tr>
                  <td align="center" valign="middle" style="height: 152px;">
                    <span style="color: #666666; font-size: 48px;">♪</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
            <td valign="top">
              <!-- Text Content -->
              <div style="padding-top: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${rec.title}
                </h3>
                <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 14px;">
                  ${rec.artist}
                </p>
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px;">
                  ${rec.year}
                </p>
                <p style="margin: 0 0 12px 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                  ${rec.reason}
                </p>
                ${rec.spotifyLink ? `
                  <a href="${rec.spotifyLink}" style="display: inline-flex; align-items: center; color: #ff0055; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Listen on Spotify →
                  </a>
                ` : ''}
              </div>
            </td>
          </tr>
        </table>
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
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #1a1a1a;">
  <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 4px solid #ff0055; padding-bottom: 20px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">
        Sonic Cartographer
      </h1>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        Your Personalized Music Recommendations
      </p>
    </div>

    <!-- Greeting -->
    <div style="margin-bottom: 30px;">
      <p style="margin: 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
        Hi ${userName},
      </p>
      <p style="margin: 15px 0 0 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
        Based on our conversation about your music tastes, here are ${recommendations.length} album recommendations curated just for you:
      </p>
    </div>

    <!-- Recommendations -->
    ${recommendationsList}

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #303030; text-align: center;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        Happy listening! 🎵
      </p>
      <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
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