import { describe, it, expect, afterEach } from 'vitest';
import { submitLead, ApiError } from '@/lib/api';
import { leadState } from '../mocks/handlers';

/**
 * Exercises the contact form's submitLead flow against the MSW mock API.
 * Covers the happy path (201 success) and the rate-limited path (429), which
 * the Contact section surfaces as a cooldown message.
 */

const validLead = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Collaboration',
  message: 'I would love to discuss a potential project with you.',
  source: 'contact_form',
};

describe('submitLead flow (MSW)', () => {
  afterEach(() => {
    leadState.rateLimited = false;
  });

  it('returns the created lead on success', async () => {
    const result = await submitLead(validLead);
    expect(result).toMatchObject({
      id: 'lead-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      source: 'contact_form',
      status: 'new',
    });
  });

  it('throws an ApiError with status 429 when rate limited', async () => {
    leadState.rateLimited = true;

    await expect(submitLead(validLead)).rejects.toBeInstanceOf(ApiError);

    try {
      await submitLead(validLead);
      expect.unreachable('submitLead should have rejected');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status_code).toBe(429);
      expect(apiErr.code).toBe('RATE_LIMITED');
      expect(apiErr.details?.[0]?.message).toMatch(/wait/i);
    }
  });
});
