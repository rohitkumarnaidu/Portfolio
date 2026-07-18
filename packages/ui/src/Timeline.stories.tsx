import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';

const items = [
  {
    title: 'Project kickoff',
    description: 'Initial planning and scope definition.',
    time: 'Jan 12',
    status: 'completed' as const,
  },
  {
    title: 'Design phase',
    description: 'Wireframes and visual design approved.',
    time: 'Feb 3',
    status: 'completed' as const,
  },
  {
    title: 'Development',
    description: 'Building the core feature set.',
    time: 'Mar 18',
    status: 'active' as const,
  },
  {
    title: 'Launch',
    description: 'Public release and marketing.',
    time: 'Apr 2',
    status: 'future' as const,
  },
];

const meta = {
  title: 'Component Library/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { items },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};
export const Alternate: Story = { args: { alternate: true } };
