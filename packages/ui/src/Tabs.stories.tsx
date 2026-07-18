import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, type TabItem } from './Tabs';

const items: TabItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    content: <p className="text-sm text-text-secondary">Overview tab content.</p>,
  },
  {
    key: 'activity',
    label: 'Activity',
    content: <p className="text-sm text-text-secondary">Recent activity feed.</p>,
  },
  {
    key: 'settings',
    label: 'Settings',
    content: <p className="text-sm text-text-secondary">Configure your preferences.</p>,
  },
  { key: 'disabled', label: 'Disabled', disabled: true, content: null },
];

const meta = {
  title: 'Design System/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'pills', 'bordered'] },
    fullWidth: { control: 'boolean' },
  },
  args: { items },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pills: Story = { args: { variant: 'pills' } };
export const Bordered: Story = { args: { variant: 'bordered' } };
export const FullWidth: Story = { args: { fullWidth: true } };
