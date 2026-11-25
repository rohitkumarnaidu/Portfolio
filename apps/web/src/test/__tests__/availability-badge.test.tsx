import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SITE } from '@/lib/public-content';
import type { PublicAvailability } from '@/lib/api';

const live: PublicAvailability = {
  isAvailable: true,
  statusLabel: 'Booking Q1 2027',
  availableUntil: '2027-03-31',
  preferredContact: 'email',
  updatedAt: '2026-11-24T00:00:00.000Z',
};

describe('availability badge', () => {
  it('renders the live label and availability state', () => {
    render(<SiteHeader availability={live} />);

    const badge = screen.getByText('Booking Q1 2027').closest('.site-status');
    expect(badge).toHaveAttribute('data-available', 'true');
  });

  it('falls back to the static label when the API is unreachable', () => {
    render(<SiteHeader availability={null} />);

    const badge = screen.getByText(SITE.availabilityLabel).closest('.site-status');
    expect(badge).toHaveAttribute('data-available', String(SITE.available));
  });

  it('marks an unavailable status', () => {
    render(<SiteHeader availability={{ ...live, isAvailable: false, statusLabel: 'On leave' }} />);

    const badge = screen.getByText('On leave').closest('.site-status');
    expect(badge).toHaveAttribute('data-available', 'false');
  });
});
