import type { Meta, StoryObj } from '@storybook/react';
import { Table as TableComponent, type TableColumn, type TableProps } from './Table';
import type { ComponentType } from 'react';

const Table = TableComponent as unknown as ComponentType<TableProps<Row>>;

interface Row {
  id: number;
  name: string;
  role: string;
  status: string;
  [key: string]: unknown;
}

const data: Row[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
  { id: 2, name: 'Alan Turing', role: 'Researcher', status: 'Active' },
  { id: 3, name: 'Grace Hopper', role: 'Admiral', status: 'Inactive' },
  { id: 4, name: 'Katherine Johnson', role: 'Mathematician', status: 'Active' },
  { id: 5, name: 'Linus Torvalds', role: 'Maintainer', status: 'Away' },
];

const columns: TableColumn<Row>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const meta = {
  title: 'Design System/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'striped', 'bordered'] },
    selectable: { control: 'boolean' },
    isLoading: { control: 'boolean' },
  },
  args: { columns, data, rowKey: 'id' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Striped: Story = { args: { variant: 'striped' } };
export const Bordered: Story = { args: { variant: 'bordered' } };
export const Selectable: Story = { args: { selectable: true } };
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { data: [] } };
