import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Component Library/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    indeterminate: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
  args: { value: 45 },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success', value: 80 } };
export const Warning: Story = { args: { variant: 'warning', value: 60 } };
export const Error: Story = { args: { variant: 'error', value: 30 } };
export const WithLabel: Story = { args: { showLabel: true, value: 72 } };
export const Indeterminate: Story = { args: { indeterminate: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="max-w-md space-y-4">
      <ProgressBar {...args} size="sm" value={30} />
      <ProgressBar {...args} size="md" value={50} />
      <ProgressBar {...args} size="lg" value={70} />
    </div>
  ),
};
