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

// src/recommendation-service/index.ts
import { Service } from "./runtime.js";
var recommendation_service_default = class extends Service {
  async generateRecommendations(conversationId) {
    this.env.logger.info("Generating recommendations", { conversationId });
    try {
      const conversationData = await this.env.mem.get(`conversation:${conversationId}`);
      if (!conversationData) {
        throw new Error("Conversation not found");
      }
      const conversation = JSON.parse(conversationData);
      const messages = conversation.messages || [];
      const portraitId = conversation.portraitId;
      const portrait = await this.env.PORTRAIT_SERVICE.getPortrait(portraitId);
      const conversationHistory = messages.map(
        (m) => `${m.role}: ${m.content}`
      ).join("\n");
      const criteriaPrompt = `Based on this conversation about music discovery:

${conversationHistory}

And the user's portrait gaps: ${portrait.noteworthyGaps?.join(", ") || "various musical territories"}

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
      const criteriaResponse = await this.env.AI.run("llama-3.3-70b", {
        messages: [{ role: "user", content: criteriaPrompt }],
        model: "llama-3.3-70b",
        temperature: 0.7,
        max_tokens: 500
      });
      let criteriaJson = (criteriaResponse.response || "[]").trim();
      if (criteriaJson.startsWith("```")) {
        criteriaJson = criteriaJson.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }
      const searchCriteria = JSON.parse(criteriaJson);
      const allAlbums = [];
      for (const criteria of searchCriteria.slice(0, 5)) {
        const albums = await this.env.DATA_ENRICHMENT_SERVICE.searchAlbums({
          genre: criteria.genre,
          style: criteria.style,
          country: criteria.country,
          limit: 10
        });
        allAlbums.push(...albums);
      }
      if (allAlbums.length === 0) {
        throw new Error("No albums found on Discogs");
      }
      this.env.logger.info("Found albums from Discogs", { count: allAlbums.length });
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
      const selectionResponse = await this.env.AI.run("llama-3.3-70b", {
        messages: [{ role: "user", content: selectionPrompt }],
        model: "llama-3.3-70b",
        temperature: 0.8,
        max_tokens: 1500
      });
      let selectionJson = (selectionResponse.response || "[]").trim();
      if (selectionJson.startsWith("```")) {
        selectionJson = selectionJson.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }
      const selections = JSON.parse(selectionJson);
      const recommendations = selections.map((sel) => {
        const album = allAlbums.find((a) => a.discogsId === sel.discogsId);
        if (!album) return null;
        return {
          albumId: `discogs-${album.discogsId}`,
          title: album.title,
          artist: album.artist,
          year: album.year,
          reason: sel.reason,
          reviewLink: `https://www.discogs.com/master/${album.discogsId}`,
          coverImage: void 0
        };
      }).filter((r) => r !== null).slice(0, 5);
      if (recommendations.length === 0) {
        throw new Error("Could not generate recommendations from Discogs results");
      }
      this.env.logger.info("Generated recommendations", {
        conversationId,
        count: recommendations.length,
        source: "Discogs"
      });
      return { recommendations };
    } catch (error) {
      this.env.logger.error("Failed to generate recommendations", {
        conversationId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return {
        recommendations: [
          {
            albumId: crypto.randomUUID(),
            title: "Discovery Awaits",
            artist: "Various Artists",
            year: "2024",
            reason: "We encountered an issue generating personalized recommendations. Please try again or start a new conversation."
          }
        ]
      };
    }
  }
  async fetch() {
    return new Response("Not implemented", { status: 501 });
  }
};

// <stdin>
var stdin_default = recommendation_service_default;
export {
  cors,
  stdin_default as default
};
