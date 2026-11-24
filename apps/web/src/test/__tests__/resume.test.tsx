import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PUBLIC_NAV } from '@/lib/public-content';
import ResumePage from '@/app/(public)/resume/page';

describe('resume page', () => {
  it('resume page renders verified profile content and a PDF link', () => {
    render(<ResumePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/rohith kumar naidu/i);
    expect(screen.getByText('Forgevena')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute(
      'href',
      '/resume/rohith-naidu-resume.pdf',
    );
    expect(PUBLIC_NAV.some((item) => item.href === '/resume')).toBe(true);
  });
});
