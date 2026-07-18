import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const items = [
  {
    value: 'item-1',
    title: 'What is your return policy?',
    content: 'You can return any item within 30 days of purchase for a full refund.',
  },
  {
    value: 'item-2',
    title: 'How do I track my order?',
    content: 'Once shipped, you will receive an email with a tracking link.',
  },
  {
    value: 'item-3',
    title: 'Do you ship internationally?',
    content: 'Yes, we ship to over 50 countries worldwide.',
  },
];

const meta = {
  title: 'Component Library/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
  },
  args: { items, defaultValue: ['item-1'] },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { type: 'single' } };
export const Multiple: Story = { args: { type: 'multiple', defaultValue: ['item-1', 'item-2'] } };
