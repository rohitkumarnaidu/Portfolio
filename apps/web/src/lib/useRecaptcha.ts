'use client';

import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

/**
 * Site key for the invisible reCAPTCHA v3 widget.
 * When unset, reCAPTCHA is skipped gracefully (submission is never blocked).
 */
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export function isRecaptchaEnabled(): boolean {
  return RECAPTCHA_SITE_KEY.length > 0;
}

/**
 * Returns an async function that resolves to a reCAPTCHA v3 token, or `null`
 * when reCAPTCHA is not configured. Never throws — callers can always fall
 * back to submitting without a token.
 */
export function useRecaptchaToken() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  return useCallback(
    async (action = 'submit_lead'): Promise<string | null> => {
      if (!isRecaptchaEnabled() || !executeRecaptcha) return null;
      try {
        return await executeRecaptcha(action);
      } catch {
        return null;
      }
    },
    [executeRecaptcha],
  );
}
