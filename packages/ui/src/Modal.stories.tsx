import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta = {
  title: 'Design System/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    closeOnBackdrop: { control: 'boolean' },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo(args: React.ComponentProps<typeof Modal>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm action"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to proceed? Any changes will be permanent.
        </p>
      </Modal>
    </>
  );
}

export const Default: Story = {
  args: { onClose: () => {} },
  render: (args) => <ModalDemo {...args} />,
};

export const Small: Story = {
  args: { onClose: () => {} },
  render: (args) => <ModalDemo {...args} size="sm" />,
};
export const Large: Story = {
  args: { onClose: () => {} },
  render: (args) => <ModalDemo {...args} size="lg" />,
};
