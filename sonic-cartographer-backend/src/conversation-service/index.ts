import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface _StartConversationRequest {
  portraitId: string;
  userId: string;
}

interface StartConversationResponse {
  conversationId: string;
  initialMessage: string;
}

interface _ContinueConversationRequest {
  conversationId: string;
  message: string;
}

interface ContinueConversationResponse {
  response: string;
  conversationComplete: boolean;
}

export default class extends Service<Env> {
  async startConversation(portraitId: string, userId: string): Promise<StartConversationResponse> {
    const conversationId = crypto.randomUUID();
    this.env.logger.info('Starting conversation', { conversationId, portraitId, userId });

    try {
      // Get the portrait to understand user's gaps
      const portrait = await this.env.PORTRAIT_SERVICE.getPortrait(portraitId);

      // Create initial question based on portrait gaps
      const gaps = (portrait as any).noteworthyGaps || [];
      const gapsText = gaps.length > 0 ? gaps.join(', ') : 'various musical territories';

      const prompt = `You are a music discovery guide helping someone explore new music based on their listening portrait.

Their Portrait Gaps: ${gapsText}

Generate an engaging first question (1-2 sentences) that:
1. Acknowledges one specific gap from their portrait
2. Asks what aspect interests them or what has kept them from exploring it
3. Is conversational and encouraging

Return ONLY the question text, no extra formatting.`;

      const response = await this.env.AI.run('llama-3.3-70b', {
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b',
        temperature: 0.8,
        max_tokens: 200,
      });

      const initialMessage = (response as any).response ||
        'Based on your listening portrait, I see opportunities to explore new genres and artists. What musical territories would you like to discover?';

      // Initialize conversation state in KvCache (simpler and more reliable than SmartMemory for this use case)
      const conversationState = {
        conversationId,
        portraitId,
        userId,
        questionCount: 1,
        messages: [
          { role: 'assistant', content: initialMessage }
        ]
      };

      await this.env.mem.put(`conversation:${conversationId}`, JSON.stringify(conversationState));

      this.env.logger.info('Initialized conversation state', {
        conversationId,
        questionCount: 1,
        messageCount: 1
      });

      return {
        conversationId,
        initialMessage,
      };
    } catch (error) {
      this.env.logger.error('Failed to start conversation', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback question
      return {
        conversationId,
        initialMessage: 'I\'d love to help you discover new music. What genres or artists have you been curious about but haven\'t explored yet?',
      };
    }
  }

  async continueConversation(conversationId: string, message: string): Promise<ContinueConversationResponse> {
    this.env.logger.info('Continuing conversation', { conversationId, messageLength: message.length });

    try {
      // Retrieve conversation state from KvCache
      const conversationData = await this.env.mem.get(`conversation:${conversationId}`);

      if (!conversationData) {
        throw new Error('Conversation not found');
      }

      const conversation = JSON.parse(conversationData);
      const questionCount = conversation.questionCount || 1;
      const messages = conversation.messages || [];

      this.env.logger.info('Retrieved conversation state', {
        conversationId,
        questionCount,
        messageCount: messages.length
      });

      // Add user's message to history
      messages.push({ role: 'user', content: message });

      // Check if we should end the conversation (after 3-5 exchanges)
      const shouldComplete = questionCount >= 3;

      this.env.logger.info('Checking conversation completion', {
        conversationId,
        questionCount,
        shouldComplete,
        totalMessages: messages.length
      });

      let aiResponse: string;
      let conversationComplete = false;

      if (shouldComplete) {
        // Generate final summary message
        const conversationHistory = messages.map((m: any) =>
          `${m.role}: ${m.content}`
        ).join('\n');

        const finalPrompt = `Based on this conversation about music discovery:

${conversationHistory}

Generate a brief, enthusiastic conclusion (1-2 sentences) saying you have the perfect recommendations and will show them the albums now. Be conversational and excited.

Return ONLY the conclusion text.`;

        const response = await this.env.AI.run('llama-3.3-70b', {
          messages: [{ role: 'user', content: finalPrompt }],
          model: 'llama-3.3-70b',
          temperature: 0.8,
          max_tokens: 150,
        });

        aiResponse = (response as any).response ||
          'Perfect! Based on our conversation, I\'ve curated recommendations that will expand your musical horizons. Let me show you what I\'ve selected!';
        conversationComplete = true;
      } else {
        // Generate follow-up question
        const conversationHistory = messages.map((m: any) =>
          `${m.role}: ${m.content}`
        ).join('\n');

        const followUpPrompt = `You are a music discovery guide. Based on this conversation:

${conversationHistory}

Generate the next follow-up question (1-2 sentences) that:
1. Builds on what they just said
2. Helps narrow down their preferences (production style vs lyrics, accessible vs challenging, specific artists/sounds, etc.)
3. Is conversational and encouraging
4. Moves closer to specific recommendations

This is question ${questionCount + 1} of 3-5. Return ONLY the question text.`;

        const response = await this.env.AI.run('llama-3.3-70b', {
          messages: [{ role: 'user', content: followUpPrompt }],
          model: 'llama-3.3-70b',
          temperature: 0.8,
          max_tokens: 200,
        });

        aiResponse = (response as any).response || 'Tell me more about what draws you to this style of music?';
        conversationComplete = false;
      }

      // Add AI response to history
      messages.push({ role: 'assistant', content: aiResponse });

      const newQuestionCount = questionCount + 1;

      // Update conversation state in KvCache
      const updatedState = {
        ...conversation,
        questionCount: newQuestionCount,
        messages,
        complete: conversationComplete
      };

      await this.env.mem.put(`conversation:${conversationId}`, JSON.stringify(updatedState));

      this.env.logger.info('Updated conversation state', {
        conversationId,
        oldQuestionCount: questionCount,
        newQuestionCount,
        conversationComplete,
        totalMessages: messages.length
      });

      return {
        response: aiResponse,
        conversationComplete,
      };
    } catch (error) {
      this.env.logger.error('Failed to continue conversation', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback response
      return {
        response: 'That\'s interesting! Let me prepare some recommendations for you based on what you\'ve shared.',
        conversationComplete: true,
      };
    }
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}