'use client';

import { useState } from 'react';
import { ApiError, submitLead } from '@/lib/api';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const INITIAL = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  function update(field: keyof typeof INITIAL, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setFeedback('');

    try {
      await submitLead({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || 'Portfolio enquiry',
        message: form.message.trim(),
        source: 'contact_form',
      });
      setStatus('success');
      setFeedback('Message received. I will reply from the address you left.');
      setForm(INITIAL);
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError) {
        setFeedback(error.message);
      } else {
        setFeedback('Something went wrong sending the message. Please try again.');
      }
    }
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

      {feedback ? (
        <p
          className={`form-status ${status === 'error' ? 'form-status--error' : 'form-status--success'}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      ) : null}

      <div className="form-footer">
        <button
          type="submit"
          className="btn"
          disabled={status === 'submitting'}
          aria-busy={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </button>
        <p className="form-note">
          Messages are stored as leads in the dashboard. No newsletter, no tracking pixel.
        </p>
      </div>
    </form>
  );
}
