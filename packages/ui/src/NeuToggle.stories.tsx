import type { Meta, StoryObj } from '@storybook/react';
import { NeuToggle } from './NeuToggle';

const meta = {
  title: 'Neumorphism/NeuToggle',
  component: NeuToggle,
  parameters: { layout: 'centered', backgrounds: { default: 'light' } },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { label: 'Enable notifications' },
} satisfies Meta<typeof NeuToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
