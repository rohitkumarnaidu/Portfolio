import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast, type ToastData } from './Toast';
import { Button } from './Button';

const meta = {
  title: 'Design System/Toast',
  component: ToastProvider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const { addToast } = useToast();

  const fire = (variant: ToastData['variant']) => {
    addToast({
      variant,
      title: `${variant[0].toUpperCase()}${variant.slice(1)} notification`,
      description: 'This is a sample toast message.',
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => fire('success')}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => fire('error')}>
        Error
      </Button>
      <Button variant="secondary" onClick={() => fire('warning')}>
        Warning
      </Button>
      <Button variant="secondary" onClick={() => fire('info')}>
        Info
      </Button>
    </div>
  );
}

export const Playground: Story = {
  args: { children: null },
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
