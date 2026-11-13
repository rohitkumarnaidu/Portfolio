import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactForm } from '@/components/public/ContactForm';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('composes a mailto link with the visitor details', () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign, href: '' },
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'I would like to talk about a project.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    const href = (window.location as unknown as { href: string }).href;
    expect(href).toContain('mailto:');
    expect(decodeURIComponent(href)).toContain('ada@example.com');
    expect(decodeURIComponent(href)).toContain('I would like to talk about a project.');
    expect(decodeURIComponent(href)).toContain('Ada Lovelace');
  });

  it('confirms that the mail client is opening', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, href: '' },
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there.' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/mail client/i);
  });
});
