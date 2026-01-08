import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Hono } from 'hono';
import { Env } from './raindrop.gen';
import {
  validateToken,
  checkRateLimit,
  handleJsonError,
  CORS_HEADERS,
} from './utils';

// Create Hono app with type-safe bindings
const app = new Hono<{ Bindings: Env }>();

// Handle OPTIONS requests for CORS preflight
app.options('*', (_c) => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
});

// Health check endpoint with uptime (no /v1 prefix)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
  });
});

// === Authentication Endpoints ===

app.post('/v1/auth/register', async (c) => {
  try {
    const body = await c.req.json();

    // Validate email format using standard regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate password meets minimum requirements
    if (!body.password || body.password.length < 8) {
      return c.json({ error: 'password must be at least 8 characters' }, 400);
    }

    const result = await c.env.AUTH_SERVICE.register(body);
    return c.json(result, 201);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

app.post('/v1/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const result = await c.env.AUTH_SERVICE.login(body);
    return c.json(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Invalid credentials')) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    return handleJsonError(error, c);
  }
});

// === Portrait Endpoints ===

app.post('/v1/portraits/generate', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isAllowed = await checkRateLimit(user.userId, '/portrait/generate', c.env);
    if (!isAllowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    const body = await c.req.json();
    const result = await c.env.PORTRAIT_SERVICE.generatePortrait({
      ...body,
      userId: user.userId,
    });
    return c.json(result, 201);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

app.get('/v1/portraits/:portraitId', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const portraitId = c.req.param('portraitId');
    const result = await c.env.PORTRAIT_SERVICE.getPortrait(portraitId);
    return c.json(result, 200);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

app.get('/v1/portraits/list', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const result = await c.env.PORTRAIT_SERVICE.listPortraits(user.userId);
    return c.json(result, 200);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

// === Conversation Endpoints ===

app.post('/v1/conversations', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const result = await c.env.CONVERSATION_SERVICE.startConversation(
      body.portraitId,
      user.userId
    );
    return c.json(result, 201);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

app.post('/v1/conversations/:conversationId/messages', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const conversationId = c.req.param('conversationId');
    const body = await c.req.json();
    const result = await c.env.CONVERSATION_SERVICE.continueConversation(
      conversationId,
      body.message
    );
    return c.json(result, 200);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

// === Recommendation Endpoints ===

app.post('/v1/conversations/:conversationId/recommendations', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const conversationId = c.req.param('conversationId');
    const result = await c.env.RECOMMENDATION_SERVICE.generateRecommendations(
      conversationId
    );
    return c.json(result, 201);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

app.post('/v1/recommendations/email', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const result = await c.env.EMAIL_SERVICE.sendRecommendations({
      userEmail: user.email,
      userName: user.name || user.email,
      recommendations: body.recommendations,
    });

    if (!result.success) {
      return c.json({ error: result.message }, 500);
    }

    return c.json(result, 200);
  } catch (error) {
    return handleJsonError(error, c);
  }
});

// Submit listening experience feedback
app.post('/v1/listening-experience/feedback', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();

    c.env.logger.info('Submitting listening feedback', {
      userId: user.userId,
      feedbackCount: body.feedback?.length
    });

    const result = await c.env.LISTENING_EXPERIENCE_SERVICE.submitFeedback({
      userId: user.userId,
      sessionId: body.sessionId,
      feedback: body.feedback
    });

    return c.json(result, 200);
  } catch (error) {
    c.env.logger.error('Failed to submit feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return handleJsonError(error, c);
  }
});

// Get listening experience analysis
app.get('/v1/listening-experience/analysis/:feedbackId', async (c) => {
  try {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const feedbackId = c.req.param('feedbackId');

    c.env.logger.info('Getting feedback analysis', {
      userId: user.userId,
      feedbackId
    });

    const result = await c.env.LISTENING_EXPERIENCE_SERVICE.getAnalysis(feedbackId);

    return c.json(result, 200);
  } catch (error) {
    c.env.logger.error('Failed to get analysis', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return handleJsonError(error, c);
  }
});

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const honoCtx = {
      waitUntil: this.ctx.waitUntil.bind(this.ctx),
      passThroughOnException: () => {},
      props: {},
    };
    return app.fetch(request, this.env, honoCtx);
  }
}