import type { Meta, StoryObj } from '@storybook/react';
import { NeuCard } from './NeuCard';

const meta = {
  title: 'Neumorphism/NeuCard',
  component: NeuCard,
  parameters: { layout: 'centered', backgrounds: { default: 'light' } },
  tags: ['autodocs'],
  argTypes: {
    elevation: { control: 'select', options: ['flat', 'raised'] },
    variant: { control: 'select', options: ['soft', 'hard'] },
    hoverable: { control: 'boolean' },
  },
  args: { children: <p className="text-sm text-text-primary">Neumorphic card surface</p> },
} satisfies Meta<typeof NeuCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Raised: Story = {};
export const Flat: Story = { args: { elevation: 'flat' } };
export const Hoverable: Story = { args: { hoverable: true } };

export const Grid: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      <NeuCard {...args} elevation="flat">
        Flat
      </NeuCard>
      <NeuCard {...args} elevation="raised">
        Raised
      </NeuCard>
    </div>
  ),
};
