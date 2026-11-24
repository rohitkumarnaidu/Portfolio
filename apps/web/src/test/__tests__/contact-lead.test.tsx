import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { submitLead, ApiError } from '@/lib/api';
import { contactSchema } from '@/lib/contact-schema';
import { ContactForm } from '@/components/public/ContactForm';
import { leadState } from '../mocks/handlers';

/**
 * Exercises the contact form's submitLead flow against the MSW mock API.
 * Covers the happy path (201 success) and the rate-limited path (429), which
 * the Contact section surfaces as a cooldown message. Also pins the client-side
 * Zod contract and the honeypot field that the API silently discards.
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

describe('contactSchema', () => {
  const valid = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    subject: '',
    message: 'I would love to discuss a potential project with you.',
    website: '',
  };

  it('rejects a message shorter than 10 characters', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Message must be at least 10 characters');
    }
  });

  it('rejects an invalid email address', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Please enter a valid email address');
    }
  });

  it('accepts a valid submission', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('trims a padded email before validating', () => {
    const result = contactSchema.safeParse({
      name: 'Ada',
      email: '  ada@example.com  ',
      subject: '',
      message: 'A message long enough to pass.',
      website: '',
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('ada@example.com');
  });
});

describe('ContactForm honeypot', () => {
  it('renders the honeypot as a hidden, non-tabbable field', () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector<HTMLInputElement>('#contact-website');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute('name', 'website');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot?.closest('.field--honeypot')).not.toBeNull();

    // jsdom does not apply stylesheets, so assert the actual hiding rule.
    // `npm test` runs with apps/web as the working directory.
    const css = readFileSync(path.resolve(process.cwd(), 'src/styles/public.css'), 'utf8');
    expect(css).toMatch(/\.field--honeypot\s*\{\s*display:\s*none;\s*\}/);
  });

  it('still reaches the success state when the honeypot is filled', async () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'I would love to discuss a potential project with you.' },
    });
    fireEvent.change(screen.getByLabelText('Website'), {
      target: { value: 'https://spam.example' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/message received/i)).toBeInTheDocument();
  });
});
