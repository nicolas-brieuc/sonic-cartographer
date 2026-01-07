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

// src/auth-service/index.ts
import { Service } from "./runtime.js";

// src/auth-service/utils.ts
var SALT_LENGTH = 16;
var TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;
var JWT_ALGORITHM = "HS256";
var HASH_ALGORITHM = "SHA-256";
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const saltHex = bytesToHex(salt);
  const encoder = new TextEncoder();
  const data = encoder.encode(password + saltHex);
  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data);
  const hashHex = bytesToHex(new Uint8Array(hashBuffer));
  return `${saltHex}:${hashHex}`;
}
function base64urlEncode(str) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64urlDecode(str) {
  const padding = "==".slice(0, (4 - str.length % 4) % 4);
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + padding;
  return atob(base64);
}
async function generateToken(userId, email, env) {
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const payload = {
    userId,
    email,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS
  };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const encoder = new TextEncoder();
  const secret = encoder.encode(env.JWT_SECRET || "default-secret");
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: HASH_ALGORITHM },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${signatureB64}`;
}
async function validateToken(token, env) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const signatureB64 = parts[2];
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }
    const data = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();
    const secret = encoder.encode(env.JWT_SECRET || "default-secret");
    const key = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: HASH_ALGORITHM },
      false,
      ["verify"]
    );
    const decodedSignature = base64urlDecode(signatureB64);
    const signatureBytes = Uint8Array.from(
      decodedSignature,
      (c) => c.charCodeAt(0)
    );
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(data)
    );
    if (!isValid) {
      return null;
    }
    const payloadJson = base64urlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
async function registerUser(data, env) {
  const userId = crypto.randomUUID();
  const _passwordHash = await hashPassword(data.password);
  env.logger.info("User registered", { userId, email: data.email });
  const token = await generateToken(userId, data.email, env);
  return {
    userId,
    token,
    email: data.email
  };
}
async function loginUser(data, env) {
  const userId = crypto.randomUUID();
  env.logger.info("User logged in", { userId, email: data.email });
  const token = await generateToken(userId, data.email, env);
  return {
    userId,
    token,
    email: data.email
  };
}

// src/auth-service/index.ts
var auth_service_default = class extends Service {
  async register(data) {
    return registerUser(data, this.env);
  }
  async login(data) {
    return loginUser(data, this.env);
  }
  async validateToken(token) {
    return validateToken(token, this.env);
  }
  async fetch() {
    return new Response("Not implemented", { status: 501 });
  }
};

// <stdin>
var stdin_default = auth_service_default;
export {
  cors,
  stdin_default as default
};
