import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'elevated', 'bordered', 'interactive'],
    },
    padding: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    children: 'Card content',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const sample = (
  <>
    <CardHeader>
      <h3 className="text-lg font-semibold text-text-primary">Project Title</h3>
      <span className="text-sm text-text-tertiary">Open source</span>
    </CardHeader>
    <CardBody>
      <p className="text-sm text-text-secondary">
        A description of the project, its goals, and what makes it interesting to work on.
      </p>
    </CardBody>
    <CardFooter>
      <button className="text-sm font-medium text-accent-500">View project →</button>
    </CardFooter>
  </>
);

export const Default: Story = {};
export const Elevated: Story = { args: { variant: 'elevated' } };
export const Bordered: Story = { args: { variant: 'bordered' } };
export const Glass: Story = { args: { variant: 'glass' } };
export const Interactive: Story = { args: { variant: 'interactive' } };

export const Composed: Story = {
  args: { children: sample },
  render: (args) => (
    <div className="max-w-sm">
      <Card {...args} />
    </div>
  ),
};

export const Grid: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {['default', 'elevated', 'bordered'].map((v) => (
        <Card key={v} {...args} variant={v as 'default'}>
          <CardBody>
            <p className="text-sm text-text-secondary">Variant: {v}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};
