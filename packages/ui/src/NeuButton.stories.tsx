import type { Meta, StoryObj } from '@storybook/react';
import { NeuButton } from './NeuButton';

const meta = {
  title: 'Neumorphism/NeuButton',
  component: NeuButton,
  parameters: { layout: 'centered', backgrounds: { default: 'light' } },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['soft', 'hard'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Neu Button' },
} satisfies Meta<typeof NeuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soft: Story = {};
export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <NeuButton {...args} size="sm">
        Small
      </NeuButton>
      <NeuButton {...args} size="md">
        Medium
      </NeuButton>
      <NeuButton {...args} size="lg">
        Large
      </NeuButton>
      <NeuButton {...args} size="xl">
        XLarge
      </NeuButton>
    </div>
  ),
};
