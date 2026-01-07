globalThis.__RAINDROP_GIT_COMMIT_SHA = "76a1265a2c11c398689e9e59afade729210a3e5b"; 

// node_modules/@liquidmetal-ai/raindrop-framework/dist/core/cors.js
var matchOrigin = (request, env, config) => {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) {
    return null;
  }
  const { origin } = config;
  if (origin === "*") {
    return "*";
  }
  if (typeof origin === "function") {
    return origin(request, env);
  }
  if (typeof origin === "string") {
    return requestOrigin === origin ? origin : null;
  }
  if (Array.isArray(origin)) {
    return origin.includes(requestOrigin) ? requestOrigin : null;
  }
  return null;
};
var addCorsHeaders = (response, request, env, config) => {
  const allowedOrigin = matchOrigin(request, env, config);
  if (!allowedOrigin) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  if (config.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  if (config.exposeHeaders && config.exposeHeaders.length > 0) {
    headers.set("Access-Control-Expose-Headers", config.exposeHeaders.join(", "));
  }
  const vary = headers.get("Vary");
  if (vary) {
    if (!vary.includes("Origin")) {
      headers.set("Vary", `${vary}, Origin`);
    }
  } else {
    headers.set("Vary", "Origin");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
var handlePreflight = (request, env, config) => {
  const allowedOrigin = matchOrigin(request, env, config);
  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  if (config.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  const allowMethods = config.allowMethods || ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
  headers.set("Access-Control-Allow-Methods", allowMethods.join(", "));
  const allowHeaders = config.allowHeaders || ["Content-Type", "Authorization"];
  headers.set("Access-Control-Allow-Headers", allowHeaders.join(", "));
  const maxAge = config.maxAge ?? 86400;
  headers.set("Access-Control-Max-Age", maxAge.toString());
  headers.set("Vary", "Origin");
  return new Response(null, {
    status: 204,
    headers
  });
};
var createCorsHandler = (config) => {
  return (request, env, response) => {
    if (!response) {
      return handlePreflight(request, env, config);
    }
    return addCorsHeaders(response, request, env, config);
  };
};
var corsAllowAll = createCorsHandler({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

// src/_app/cors.ts
var cors = corsAllowAll;

// src/email-service/index.ts
import { Service } from "./runtime.js";
var email_service_default = class extends Service {
  async sendRecommendations(data) {
    this.env.logger.info("Sending recommendations email", {
      userEmail: data.userEmail,
      recommendationCount: data.recommendations.length
    });
    try {
      const htmlContent = this.buildRecommendationEmailHtml(data.userName, data.recommendations);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.env.EMAIL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: this.env.EMAIL_FROM_ADDRESS,
          to: data.userEmail,
          subject: "Your Sonic Cartographer Music Recommendations",
          html: htmlContent
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email API error: ${error}`);
      }
      this.env.logger.info("Email sent successfully", { userEmail: data.userEmail });
      return {
        success: true,
        message: "Recommendations sent to your email!"
      };
    } catch (error) {
      this.env.logger.error("Failed to send email", {
        userEmail: data.userEmail,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return {
        success: false,
        message: "Failed to send email. Please try again later."
      };
    }
  }
  buildRecommendationEmailHtml(userName, recommendations) {
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
    `).join("");
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
        Happy listening! \u{1F3B5}
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
  async fetch() {
    return new Response("Not implemented", { status: 501 });
  }
};

// <stdin>
var stdin_default = email_service_default;
export {
  cors,
  stdin_default as default
};
