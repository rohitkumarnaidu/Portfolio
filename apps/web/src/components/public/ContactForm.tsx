'use client';

import { useState } from 'react';

type Status = 'idle' | 'ready';

const INITIAL = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState<Status>('idle');

  function update(field: keyof typeof INITIAL, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (status === 'ready') setStatus('idle');
  }

  /**
   * The site is static, so the form composes a message in the visitor's mail
   * client instead of posting to a server. Nothing is stored and nothing is
   * tracked — the visitor stays in control of what they send.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const to = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@example.com';
    const subject = form.subject.trim() || 'Portfolio enquiry';
    const body = `${form.message.trim()}\n\n— ${form.name.trim()}\n${form.email.trim()}`;

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('ready');
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="field field--full">
          <label htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={(event) => update('subject', event.target.value)}
            placeholder="What is this about?"
          />
        </div>

        <div className="field field--full">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            required
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            placeholder="The problem, the context, and what a good outcome looks like."
          />
        </div>
      </div>

      {status === 'ready' ? (
        <p className="form-status form-status--success" role="status" aria-live="polite">
          Your mail client should be opening with the message ready to send.
        </p>
      ) : null}

      <div className="form-footer">
        <button type="submit" className="btn">
          Send message
        </button>
        <p className="form-note">
          Opens your mail client with the message prefilled. Nothing is stored, no newsletter, no
          tracking pixel.
        </p>
      </div>
    </form>
  );
}
