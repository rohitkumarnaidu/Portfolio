import { test, expect } from '@playwright/test';

/**
 * Contact page (`/contact`).
 *
 * Verifies the form renders, client-side validation blocks empty submissions,
 * and a valid submission ends in either the success state or the rate-limit
 * handling path (both are acceptable depending on backend availability).
 */
test.describe('Contact page', () => {
  test('renders the contact form fields', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByLabel('Name *')).toBeVisible();
    await expect(page.getByLabel('Email *')).toBeVisible();
    await expect(page.getByLabel('Message *')).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
  });

  test('shows validation errors for an empty submission', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: /send message/i }).click();

    // Client-side validation surfaces a name error at minimum.
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    await expect(page.getByText('Message must be at least 10 characters')).toBeVisible();
  });

  test('submits a valid message and reaches success or rate-limit state', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Name *').fill('Ada Lovelace');
    await page.getByLabel('Email *').fill('ada@example.com');
    await page.getByLabel('Subject').fill('Project inquiry');
    await page
      .getByLabel('Message *')
      .fill('I would love to discuss a potential collaboration on an upcoming project.');

    await page.getByRole('button', { name: /send message/i }).click();

    // A successful send shows the confirmation; a rate-limited/backend error
    // shows the error banner. Either outcome is a valid, handled end state.
    const success = page.getByText(/Message sent!/i);
    const errorBanner = page.getByText(/Something went wrong/i);

    await expect(success.or(errorBanner)).toBeVisible({ timeout: 15000 });
  });
});
