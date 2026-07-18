import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Design System/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'circle', 'rectangle'] },
    lines: { control: 'number' },
  },
  args: { variant: 'rectangle' },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rectangle: Story = { args: { width: 240, height: 120 } };
export const Circle: Story = { args: { variant: 'circle', width: 48 } };
export const Text: Story = { args: { variant: 'text', lines: 3 } };

export const CardSkeleton: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton {...args} variant="circle" width={40} />
        <Skeleton {...args} variant="text" width={160} />
      </div>
      <Skeleton {...args} variant="rectangle" height={160} />
      <Skeleton {...args} variant="text" lines={3} />
    </div>
  ),
};
