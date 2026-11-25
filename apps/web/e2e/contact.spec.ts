import { test, expect } from '@playwright/test';

/**
 * Contact page (`/contact`).
 *
 * The form is the same component mounted on `/` and `/contact`. Labels carry no
 * asterisks; validation messages come from `lib/contact-schema.ts` (Zod). The
 * e2e webServer starts Next only — no API — so a valid submit must end in
 * either the real success copy or the handled error state.
 */
test.describe('Contact page', () => {
  test('renders the form fields and the honeypot is hidden', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Subject', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();

    // Honeypot: a labelled but `display:none` field (`.field--honeypot`).
    await expect(page.locator('#contact-website')).toBeHidden();
  });

  test('honeypot is never reachable by keyboard', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Name', { exact: true }).focus();

    const visited: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      visited.push(
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.id ?? ''),
      );
    }

    expect(visited).not.toContain('contact-website');
  });

  test('loads no reCAPTCHA script', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('script[src*="recaptcha" i]')).toHaveCount(0);
    expect(await page.content()).not.toMatch(/recaptcha/i);
  });

  test('surfaces each Zod validation message in order', async ({ page }) => {
    await page.goto('/contact');

    // The inputs carry native `required`/`type=email` constraints. Disable the
    // browser's own validation so the Zod branch (the app's real validation
    // layer) runs, exactly as it does for a client that bypasses native checks.
    await page
      .locator('form.contact-form')
      .evaluate((form) => ((form as HTMLFormElement).noValidate = true));

    const submit = page.getByRole('button', { name: 'Send message' });

    await submit.click();
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();

    await page.getByLabel('Name', { exact: true }).fill('Ada Lovelace');
    await submit.click();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();

    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await submit.click();
    await expect(page.getByText('Message must be at least 10 characters')).toBeVisible();
  });

  test('valid submit ends in success or the handled error state', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Name', { exact: true }).fill('Ada Lovelace');
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await page.getByLabel('Subject', { exact: true }).fill('Project inquiry');
    await page
      .getByLabel('Message', { exact: true })
      .fill('I would love to discuss a potential collaboration on an upcoming project.');

    await page.getByRole('button', { name: 'Send message' }).click();

    // Success copy is asserted exactly (never a loose regex that would also
    // match a failure). With no API running, the form renders its handled
    // error state instead — `status === 'error'` with feedback shown.
    const success = page.getByText('Message received. I will reply from the address you left.', {
      exact: true,
    });
    const handledError = page.locator('.form-status--error');

    await expect(success.or(handledError)).toBeVisible({ timeout: 15000 });
  });
});
