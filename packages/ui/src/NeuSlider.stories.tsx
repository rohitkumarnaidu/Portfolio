import type { Meta, StoryObj } from '@storybook/react';
import { NeuSlider } from './NeuSlider';

const meta = {
  title: 'Neumorphism/NeuSlider',
  component: NeuSlider,
  parameters: { layout: 'centered', backgrounds: { default: 'light' } },
  tags: ['autodocs'],
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    label: { control: 'text' },
  },
  args: { label: 'Volume' },
} satisfies Meta<typeof NeuSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
