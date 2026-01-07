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

// src/conversation-service/index.ts
import { Service } from "./runtime.js";
var conversation_service_default = class extends Service {
  async startConversation(portraitId, userId) {
    const conversationId = crypto.randomUUID();
    this.env.logger.info("Starting conversation", { conversationId, portraitId, userId });
    try {
      const portrait = await this.env.PORTRAIT_SERVICE.getPortrait(portraitId);
      const gaps = portrait.noteworthyGaps || [];
      const gapsText = gaps.length > 0 ? gaps.join(", ") : "various musical territories";
      const prompt = `You are a music discovery guide helping someone explore new music based on their listening portrait.

Their Portrait Gaps: ${gapsText}

Generate an engaging first question (2-3 sentences) that:
1. Acknowledges one specific gap from their portrait
2. Asks what aspect interests them or what has kept them from exploring it
3. Is conversational and encouraging

Return ONLY the question text, no extra formatting.`;
      const response = await this.env.AI.run("llama-3.3-70b", {
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b",
        temperature: 0.8,
        max_tokens: 200
      });
      const initialMessage = response.response || "Based on your listening portrait, I see opportunities to explore new genres and artists. What musical territories would you like to discover?";
      const conversationState = {
        conversationId,
        portraitId,
        userId,
        questionCount: 1,
        messages: [
          { role: "assistant", content: initialMessage }
        ]
      };
      await this.env.mem.put(`conversation:${conversationId}`, JSON.stringify(conversationState));
      this.env.logger.info("Initialized conversation state", {
        conversationId,
        questionCount: 1,
        messageCount: 1
      });
      return {
        conversationId,
        initialMessage
      };
    } catch (error) {
      this.env.logger.error("Failed to start conversation", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return {
        conversationId,
        initialMessage: "I'd love to help you discover new music. What genres or artists have you been curious about but haven't explored yet?"
      };
    }
  }
  async continueConversation(conversationId, message) {
    this.env.logger.info("Continuing conversation", { conversationId, messageLength: message.length });
    try {
      const conversationData = await this.env.mem.get(`conversation:${conversationId}`);
      if (!conversationData) {
        throw new Error("Conversation not found");
      }
      const conversation = JSON.parse(conversationData);
      const questionCount = conversation.questionCount || 1;
      const messages = conversation.messages || [];
      this.env.logger.info("Retrieved conversation state", {
        conversationId,
        questionCount,
        messageCount: messages.length
      });
      messages.push({ role: "user", content: message });
      const shouldComplete = questionCount >= 3;
      this.env.logger.info("Checking conversation completion", {
        conversationId,
        questionCount,
        shouldComplete,
        totalMessages: messages.length
      });
      let aiResponse;
      let conversationComplete = false;
      if (shouldComplete) {
        const conversationHistory = messages.map(
          (m) => `${m.role}: ${m.content}`
        ).join("\n");
        const finalPrompt = `Based on this conversation about music discovery:

${conversationHistory}

Generate a brief, enthusiastic conclusion (1-2 sentences) saying you have the perfect recommendations and will show them the albums now. Be conversational and excited.

Return ONLY the conclusion text.`;
        const response = await this.env.AI.run("llama-3.3-70b", {
          messages: [{ role: "user", content: finalPrompt }],
          model: "llama-3.3-70b",
          temperature: 0.8,
          max_tokens: 150
        });
        aiResponse = response.response || "Perfect! Based on our conversation, I've curated recommendations that will expand your musical horizons. Let me show you what I've selected!";
        conversationComplete = true;
      } else {
        const conversationHistory = messages.map(
          (m) => `${m.role}: ${m.content}`
        ).join("\n");
        const followUpPrompt = `You are a music discovery guide. Based on this conversation:

${conversationHistory}

Generate the next follow-up question (2-3 sentences) that:
1. Builds on what they just said
2. Helps narrow down their preferences (production style vs lyrics, accessible vs challenging, specific artists/sounds, etc.)
3. Is conversational and encouraging
4. Moves closer to specific recommendations

This is question ${questionCount + 1} of 3-5. Return ONLY the question text.`;
        const response = await this.env.AI.run("llama-3.3-70b", {
          messages: [{ role: "user", content: followUpPrompt }],
          model: "llama-3.3-70b",
          temperature: 0.8,
          max_tokens: 200
        });
        aiResponse = response.response || "Tell me more about what draws you to this style of music?";
        conversationComplete = false;
      }
      messages.push({ role: "assistant", content: aiResponse });
      const newQuestionCount = questionCount + 1;
      const updatedState = {
        ...conversation,
        questionCount: newQuestionCount,
        messages,
        complete: conversationComplete
      };
      await this.env.mem.put(`conversation:${conversationId}`, JSON.stringify(updatedState));
      this.env.logger.info("Updated conversation state", {
        conversationId,
        oldQuestionCount: questionCount,
        newQuestionCount,
        conversationComplete,
        totalMessages: messages.length
      });
      return {
        response: aiResponse,
        conversationComplete
      };
    } catch (error) {
      this.env.logger.error("Failed to continue conversation", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return {
        response: "That's interesting! Let me prepare some recommendations for you based on what you've shared.",
        conversationComplete: true
      };
    }
  }
  async fetch() {
    return new Response("Not implemented", { status: 501 });
  }
};

// <stdin>
var stdin_default = conversation_service_default;
export {
  cors,
  stdin_default as default
};
