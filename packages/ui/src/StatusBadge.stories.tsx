import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'Component Library/StatusBadge',
  component: StatusBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'archived', 'draft', 'published'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { status: 'active' } };
export const Archived: Story = { args: { status: 'archived' } };
export const Draft: Story = { args: { status: 'draft' } };
export const Published: Story = { args: { status: 'published' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status="active" />
      <StatusBadge status="archived" />
      <StatusBadge status="draft" />
      <StatusBadge status="published" />
    </div>
  ),
};
