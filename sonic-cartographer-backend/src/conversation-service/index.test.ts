/**
 * TDD RED PHASE - Failing Tests for Conversation Service
 */
import { expect, test, describe, vi } from 'vitest';
import { startConversation, continueConversation, getConversation } from './utils.js';

function createMockEnv() {
  return {
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    DATABASE: { query: vi.fn(), execute: vi.fn() },
    MEMORY: { store: vi.fn(), retrieve: vi.fn() },
    AI: { generateText: vi.fn() },
  };
}

describe('Conversation Service', () => {
  test('startConversation - should start new conversation', async () => {
    const env = createMockEnv();
    await expect(startConversation('portrait-123', 'user-123', env)).rejects.toThrow('Not implemented');
  });

  test('continueConversation - should process message', async () => {
    const env = createMockEnv();
    await expect(continueConversation('conv-123', 'My answer', env)).rejects.toThrow('Not implemented');
  });

  test('getConversation - should retrieve conversation', async () => {
    const env = createMockEnv();
    await expect(getConversation('conv-123', env)).rejects.toThrow('Not implemented');
  });
});
