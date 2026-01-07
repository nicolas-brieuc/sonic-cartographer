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

// src/data-enrichment-service/index.ts
import { Service } from "./runtime.js";
var data_enrichment_service_default = class extends Service {
  async searchAlbums(request) {
    this.env.logger.info("Searching albums on Discogs", {
      genre: request.genre,
      style: request.style,
      country: request.country,
      limit: request.limit
    });
    try {
      const params = new URLSearchParams();
      params.append("type", "master");
      params.append("format", "album");
      if (request.genre) params.append("genre", request.genre);
      if (request.style) params.append("style", request.style);
      if (request.year) params.append("year", request.year);
      if (request.country) params.append("country", request.country);
      params.append("per_page", String(request.limit || 20));
      const url = `https://api.discogs.com/database/search?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Discogs token=${this.env.DISCOGS_API_KEY}`,
          "User-Agent": "SonicCartographer/1.0 +https://soniccartographer.com"
        }
      });
      if (!response.ok) {
        throw new Error(`Discogs API error: ${response.status}`);
      }
      const data = await response.json();
      const results = data.results || [];
      const albums = results.filter((r) => r.type === "master" && r.title && r.year).map((r) => {
        const parts = (r.title || "").split(" - ");
        const artist = parts.length > 1 && parts[0] ? parts[0].trim() : "Unknown Artist";
        const title = parts.length > 1 ? parts.slice(1).join(" - ").trim() : r.title || "Unknown Album";
        return {
          discogsId: r.master_id || r.id,
          title,
          artist,
          year: r.year,
          genres: r.genre || [],
          country: r.country
        };
      });
      this.env.logger.info("Found albums on Discogs", {
        count: albums.length,
        query: request
      });
      return albums;
    } catch (error) {
      this.env.logger.error("Failed to search Discogs", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return [];
    }
  }
  async fetch() {
    return new Response("Not implemented", { status: 501 });
  }
};

// <stdin>
var stdin_default = data_enrichment_service_default;
export {
  cors,
  stdin_default as default
};
