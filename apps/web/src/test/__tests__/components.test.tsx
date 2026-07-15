import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@portfolio/ui';
import { Card } from '@portfolio/ui';
import { Badge } from '@portfolio/ui';
import { Skeleton } from '@portfolio/ui';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-red-600/);
  });

  it('disables button when isLoading', () => {
    render(<Button isLoading>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders as full width', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button').className).toMatch(/w-full/);
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Content</p>
      </Card>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>);
    expect(container.firstChild!.className).toMatch(/shadow-md/);
  });

  it('renders as a link when href is provided', () => {
    render(<Card href="/test">Link Card</Card>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('handles onClick', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success').className).toMatch(/bg-green-100/);
  });

  it('applies size classes', () => {
    render(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large').className).toMatch(/px-3 py-1/);
  });

  it('renders dismiss button when isDismissible', () => {
    const onDismiss = vi.fn();
    render(
      <Badge isDismissible onDismiss={onDismiss}>
        Dismissible
      </Badge>,
    );
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissBtn).toBeInTheDocument();
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Skeleton', () => {
  it('renders with role status', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders circle variant', () => {
    const { container } = render(<Skeleton variant="circle" width={48} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/rounded-full/);
    expect(el.style.width).toBe('48px');
  });

  it('renders text variant with multiple lines', () => {
    render(<Skeleton variant="text" lines={3} />);
    const lines = screen.getByRole('status').querySelectorAll(':scope > div');
    expect(lines.length).toBe(3);
  });
});
