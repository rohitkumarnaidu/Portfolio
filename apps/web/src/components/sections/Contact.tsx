'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { Button, Input } from '@portfolio/ui';
import { submitLead, ApiError } from '@/lib/api';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useInView } from '@/hooks/useInView';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { RECAPTCHA_SITE_KEY, isRecaptchaEnabled, useRecaptchaToken } from '@/lib/useRecaptcha';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot field — must stay empty for real users. */
  company_url: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name || data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!data.message || data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
}

import type { Section } from '@portfolio/shared';

const RATE_LIMIT_COOLDOWN_SECONDS = 60;

export function Contact({ data }: { data?: Section }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  const { track } = useAnalytics();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company_url: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const getRecaptchaToken = useRecaptchaToken();
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      return;
    }
    if (!cooldownTimer.current) {
      cooldownTimer.current = setInterval(() => {
        setCooldown((s) => Math.max(0, s - 1));
      }, 1000);
    }
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    };
  }, [cooldown]);

  const startCooldown = () => {
    setRateLimited(true);
    setCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'company_url') return;
    if (touched.has(field)) {
      const newErrors = validate({ ...formData, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    if (field === 'company_url') return;
    setTouched((prev) => new Set(prev).add(field));
    const newErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rateLimited) return;

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched(new Set(['name', 'email', 'subject', 'message']));

    if (Object.keys(validationErrors).length > 0) return;

    // Honeypot: bots fill hidden fields. Silently succeed without contacting the backend.
    if (formData.company_url.trim().length > 0) {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', company_url: '' });
      return;
    }

    setStatus('loading');
    try {
      const recaptchaToken = await getRecaptchaToken('submit_lead');

      await submitLead({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        source: 'contact_form',
        metadata: recaptchaToken ? { recaptchaToken } : undefined,
      });
      setStatus('success');
      setRateLimitMessage(null);
      track('contact_submit', { subject: formData.subject, source: 'contact_form' });
      setFormData({ name: '', email: '', subject: '', message: '', company_url: '' });
    } catch (err) {
      if (err instanceof ApiError && err.status_code === 429) {
        startCooldown();
        const remaining = (err.details as Array<{ message?: string }> | undefined)?.[0]?.message;
        setRateLimitMessage(
          remaining || 'Too many messages sent. Please wait a moment before trying again.',
        );
      }
      setStatus('error');
    }
  };

  const content = (data?.content ?? {}) as Record<string, string | undefined>;

  const form = (
    <SectionWrapper
      id="contact"
      variant="alt"
      heading={content.title || "Let's work together"}
      subtitle={
        content.subtitle ||
        "Have a project in mind? I'd love to hear about it. Send me a message and I'll get back to you within 24 hours."
      }
      className="max-w-4xl"
      animate={false}
    >
      <div ref={ref}>
        <div
          className={`grid grid-cols-1 lg:grid-cols-5 gap-8 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-subtle rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-accent-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Email</p>
                  <a
                    href={`mailto:${content.email || 'hello@portfolio.com'}`}
                    className="text-body-sm text-text-secondary hover:text-accent-500 transition-colors"
                  >
                    {content.email || 'hello@portfolio.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-accent-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Location</p>
                  <p className="text-body-sm text-text-secondary">
                    {content.location || 'Remote / Worldwide'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-subtle rounded-2xl p-6">
              <p className="text-sm font-medium text-text-primary mb-3">Availability</p>
              <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-success" />
                </span>
                {content.availability || 'Available for freelance & full-time'}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="glass-subtle rounded-2xl p-6 md:p-8 space-y-5"
              noValidate
            >
              {/* Honeypot — hidden from users, traps bots. Must stay empty. */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="company_url">Company website</label>
                <input
                  id="company_url"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.company_url}
                  onChange={(e) => handleChange('company_url', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Name *"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  error={errors.name}
                  aria-required="true"
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={errors.email}
                  aria-required="true"
                />
              </div>

              <Input
                label="Subject"
                placeholder="Project Inquiry"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Message *</label>
                <textarea
                  className={`w-full rounded-xl border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 min-h-[140px] resize-y ${
                    errors.message
                      ? 'border-semantic-error focus:ring-semantic-error'
                      : 'border-border-primary hover:border-border-accent focus:ring-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-0`}
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  aria-required="true"
                  rows={4}
                />
                {errors.message && (
                  <p className="text-sm text-semantic-error" role="alert">
                    {errors.message}
                  </p>
                )}
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-semantic-success-bg border border-semantic-success/20">
                  <svg
                    className="w-5 h-5 text-semantic-success shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-semantic-success">
                    Message sent! I&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {rateLimited && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl bg-semantic-warning-bg border border-semantic-warning/20"
                  role="alert"
                  aria-live="assertive"
                >
                  <svg
                    className="w-5 h-5 text-semantic-warning shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-semantic-warning">
                    <p>
                      {rateLimitMessage ||
                        'Too many messages sent. Please wait before trying again.'}
                    </p>
                    {cooldown > 0 && (
                      <p className="mt-1 tabular-nums">
                        You can send another message in {cooldown}s.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {status === 'error' && !rateLimited && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-semantic-error-bg border border-semantic-error/20">
                  <svg
                    className="w-5 h-5 text-semantic-error shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-semantic-error">
                    Something went wrong. Please try again later.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={status === 'loading'}
                disabled={rateLimited && cooldown > 0}
              >
                {status === 'loading'
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Try again in ${cooldown}s`
                    : 'Send Message'}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );

  if (isRecaptchaEnabled()) {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>{form}</GoogleReCaptchaProvider>
    );
  }

  return form;
}
