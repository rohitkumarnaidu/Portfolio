import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta = {
  title: 'Component Library/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    totalPages: { control: 'number' },
    currentPage: { control: 'number' },
    siblingCount: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: { totalPages: 10, currentPage: 5 },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FirstPage: Story = { args: { currentPage: 1 } };
export const LastPage: Story = { args: { currentPage: 10 } };
export const FewPages: Story = { args: { totalPages: 3, currentPage: 2 } };
export const Disabled: Story = { args: { disabled: true } };
