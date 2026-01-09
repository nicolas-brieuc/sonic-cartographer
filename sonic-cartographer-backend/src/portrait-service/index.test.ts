/**
 * TDD RED PHASE - Failing Tests for Portrait Service
 */
import { expect, test, describe, vi } from 'vitest';
import { generatePortrait, getPortrait, listPortraits } from './utils.js';

function createMockEnv() {
  return {
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    DATABASE: { query: vi.fn(), execute: vi.fn() },
    AI: { generateText: vi.fn() },
  };
}

describe('Portrait Service', () => {
  test('generatePortrait - should analyze artist list', async () => {
    const env = createMockEnv();
    await expect(generatePortrait({ userId: '1', artistData: 'Artist1,Artist2', format: 'csv' }, env)).resolves.toBeDefined();
  });

  test('getPortrait - should retrieve portrait', async () => {
    const env = createMockEnv();
    await expect(getPortrait('portrait-123', env)).resolves.toBeDefined();
  });

  test('listPortraits - should list user portraits', async () => {
    const env = createMockEnv();
    await expect(listPortraits('user-123', env)).resolves.toBeDefined();
  });
});
