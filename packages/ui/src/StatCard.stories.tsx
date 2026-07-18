import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta = {
  title: 'Component Library/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    trend: { control: 'select', options: ['up', 'down', 'neutral'] },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
  },
  args: { label: 'Total Revenue' },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: '$48.2k', delta: '+12%', trend: 'up' } };
export const Down: Story = { args: { value: '1,204', delta: '-4%', trend: 'down' } };
export const Neutral: Story = { args: { value: '320', delta: '0%', trend: 'neutral' } };
export const Loading: Story = { args: { isLoading: true } };
export const Error: Story = { args: { error: 'Failed to load metric' } };

export const Grid: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard {...args} label="Revenue" value="$48.2k" delta="+12%" trend="up" />
      <StatCard {...args} label="Users" value="1,204" delta="-4%" trend="down" />
      <StatCard {...args} label="Projects" value="320" delta="0%" trend="neutral" />
    </div>
  ),
};
