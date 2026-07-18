import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Design System/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    helperText: { control: 'text' },
    isSuccess: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
  args: { label: 'Message', placeholder: 'Type your message…' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHelperText: Story = { args: { helperText: 'Keep it brief.' } };
export const WithError: Story = { args: { error: 'Message is required.' } };
export const Disabled: Story = { args: { disabled: true } };

export const States: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-4">
      <Textarea {...args} label="Default" />
      <Textarea {...args} label="Error" error="Required field" />
      <Textarea {...args} label="Disabled" disabled />
    </div>
  ),
};
