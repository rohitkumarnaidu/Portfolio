import type { Meta, StoryObj } from '@storybook/react';
import { NotificationDot } from './NotificationDot';

const meta = {
  title: 'Component Library/NotificationDot',
  component: NotificationDot,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['online', 'away', 'busy', 'offline'] },
    size: { control: 'number' },
    pulse: { control: 'boolean' },
  },
  args: { status: 'online' },
} satisfies Meta<typeof NotificationDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = { args: { status: 'online' } };
export const Away: Story = { args: { status: 'away' } };
export const Busy: Story = { args: { status: 'busy' } };
export const Offline: Story = { args: { status: 'offline' } };
export const Pulsing: Story = { args: { status: 'online', pulse: true } };

export const OnAvatar: Story = {
  render: () => (
    <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-700">
      JD
      <span className="absolute bottom-0 right-0">
        <NotificationDot status="online" pulse size={12} />
      </span>
    </div>
  ),
};
