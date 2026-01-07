globalThis.__RAINDROP_GIT_COMMIT_SHA = "5d83e3cb6fe8e5357ae569bd34837ff4360a4f43"; 

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

// src/portrait-service/index.ts
import { Service } from "./runtime.js";
var portrait_service_default = class extends Service {
  async generatePortrait(data) {
    const portraitId = crypto.randomUUID();
    this.env.logger.info("Generating portrait", {
      portraitId,
      userId: data.userId,
      hasArtistList: !!data.artistList
    });
    let artistData = data.artistList || data.artistData || "";
    if (!artistData || artistData.trim().length === 0) {
      throw new Error("No artist data provided");
    }
    const prompt = `You are a music analyst expert. Analyze the following Spotify listening history data and create a comprehensive listener portrait.

Listening Data:
${artistData.substring(0, 15e3)} ${artistData.length > 15e3 ? "... (truncated)" : ""}

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
      const analysis = await this.env.AI.run("llama-3.3-70b", {
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b",
        temperature: 0.7,
        max_tokens: 2e3
      });
      const responseText = analysis.response || "";
      this.env.logger.info("AI analysis response", { responseLength: responseText.length });
      let jsonText = responseText.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
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
        summary: portraitData.summary || void 0
      };
    } catch (error) {
      this.env.logger.error("Failed to analyze portrait with AI", {
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
      return {
        portraitId,
        userId: data.userId,
        genres: ["Various Genres"],
        eras: ["Mixed Eras"],
        primaryGenres: ["Unable to analyze - AI error"],
        geographicCenters: ["Unable to analyze - AI error"],
        keyEras: ["Unable to analyze - AI error"],
        noteworthyGaps: ["AI analysis failed - please try again"]
      };
    }
  }
  async getPortrait(portraitId) {
    this.env.logger.info("Getting portrait", { portraitId });
    return {
      portraitId,
      userId: "user-123",
      genres: ["Rock"]
    };
  }
  async listPortraits(userId) {
    this.env.logger.info("Listing portraits", { userId });
    return [
      { portraitId: "p1" },
      { portraitId: "p2" }
    ];
  }
  async fetch() {
    return new Response("Not implemented", { status: 501 });
  }
};

// <stdin>
var stdin_default = portrait_service_default;
export {
  cors,
  stdin_default as default
};
