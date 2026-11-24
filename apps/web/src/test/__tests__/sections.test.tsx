import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from '@/components/public/sections/HeroSection';
import { FlagshipWork } from '@/components/public/sections/FlagshipWork';
import { Capabilities } from '@/components/public/sections/Capabilities';
import { Principles } from '@/components/public/sections/Principles';
import { ContactSection } from '@/components/public/sections/ContactSection';

describe('funnel sections', () => {
  it('hero has one h1, an availability badge and two CTAs', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/open to work/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view case studies/i })).toHaveAttribute(
      'href',
      '#work',
    );
    expect(screen.getByRole('link', { name: /r[eé]sum[eé]/i })).toHaveAttribute('href', '/resume');
  });

  it('flagship work renders exactly the three featured projects in order', () => {
    const { container } = render(<FlagshipWork />);
    expect(container.querySelectorAll('.work-row')).toHaveLength(3);
    expect(screen.getByText('Forgevena')).toBeInTheDocument();
    expect(screen.getByText('DRAXELYRA')).toBeInTheDocument();
    expect(screen.getByText('Evidence Review Pipeline')).toBeInTheDocument();
  });

  it('capabilities and principles render every curated item', () => {
    const caps = render(<Capabilities />);
    expect(within(caps.container).getAllByRole('article')).toHaveLength(3);
    expect(within(caps.container).getAllByRole('list')).toHaveLength(3);
    const principles = render(<Principles />);
    expect(within(principles.container).getAllByRole('listitem')).toHaveLength(4);
  });

  it('contact section hosts the shared form', () => {
    render(<ContactSection />);
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByText(/start with the problem/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /start with the problem/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Response', level: 3 })).toBeInTheDocument();
  });
});
