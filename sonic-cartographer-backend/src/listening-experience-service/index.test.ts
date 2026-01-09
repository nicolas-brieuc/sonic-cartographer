/**
 * TDD RED PHASE - Failing Tests for Listening Experience Service
 */
import { expect, test, describe, vi } from 'vitest';
import { createExperience, getExperience } from './utils.js';

function createMockEnv() {
  return {
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    DATABASE: { query: vi.fn(), execute: vi.fn() },
    AI: { generateText: vi.fn() },
  };
}

describe('Listening Experience Service', () => {
  test('createExperience - should record feedback', async () => {
    const env = createMockEnv();
    await expect(createExperience({ recommendationId: 'rec-123', albumId: 'album-1', rating: 5 }, env)).resolves.toBeDefined();
  });

  test('getExperience - should retrieve experience', async () => {
    const env = createMockEnv();
    await expect(getExperience('exp-123', env)).resolves.toBeDefined();
  });
});
