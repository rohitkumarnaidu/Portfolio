import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Design System/Input',
  component: Input,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['md', 'lg'] },
    error: { control: 'text' },
    helperText: { control: 'text' },
    isSuccess: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Email', placeholder: 'you@example.com' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHelperText: Story = { args: { helperText: 'We never share your email.' } };
export const WithError: Story = { args: { error: 'Invalid email address.' } };
export const Success: Story = { args: { isSuccess: true, helperText: 'Looks good!' } };
export const Disabled: Story = { args: { disabled: true } };
export const Large: Story = { args: { size: 'lg' } };

export const States: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-4">
      <Input {...args} label="Default" />
      <Input {...args} label="With helper" helperText="Helper text below the field" />
      <Input {...args} label="Error" error="Required field" />
      <Input {...args} label="Disabled" disabled />
    </div>
  ),
};
