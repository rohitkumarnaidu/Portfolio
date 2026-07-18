import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Spinner } from '@portfolio/ui';

describe('Button variants and states', () => {
  it('applies the primary variant classes by default', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button', { name: 'Primary' });
    expect(btn.className).toMatch(/bg-accent-500/);
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies the secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button').className).toMatch(/border-border-primary/);
  });

  it('applies the ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-transparent/);
    expect(btn.className).not.toMatch(/bg-accent-500/);
  });

  it('applies the danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-red-600/);
  });

  it('renders the loading spinner and marks the button busy + disabled', () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn.querySelector('svg.animate-spin')).not.toBeNull();
  });

  it('does not fire onClick while disabled', () => {
    const onClick = vi.fn();
    render(
      <Button isDisabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders left and right icons when not loading', () => {
    render(
      <Button leftIcon={<span data-testid="left" />} rightIcon={<span data-testid="right" />}>
        Icons
      </Button>,
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('exposes an accessible status role with a default label', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('honours a custom label', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<Spinner size="lg" />);
    const inner = container.querySelector('span[aria-hidden="true"]');
    expect(inner?.className).toMatch(/h-10 w-10/);
  });
});
