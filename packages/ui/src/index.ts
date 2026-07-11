// Utility
export { cn } from './cn';
export type { ClassValue } from 'clsx';

// ──────────────────────────────
// Design System Components
// @see docs/08-DESIGN-SYSTEM.md
// ──────────────────────────────

// Button
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Card
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card';

// Input
export { Input } from './Input';
export type { InputProps } from './Input';

// Badge
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// Modal
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './Modal';

// Toast
export { ToastProvider, useToast } from './Toast';
export type { ToastData, ToastProviderProps } from './Toast';

// Table
export { Table } from './Table';
export type { TableProps, TableColumn, SortState, SortDirection } from './Table';

// Tabs
export { Tabs } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

// Skeleton
export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Avatar
export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// ──────────────────────────────
// Neumorphism Components (Legacy)
// ──────────────────────────────

export { NeuCard } from './NeuCard';
export type { NeuCardProps } from './NeuCard';

export { NeuButton } from './NeuButton';
export type { NeuButtonProps } from './NeuButton';

export { NeuToggle } from './NeuToggle';
export type { NeuToggleProps } from './NeuToggle';

export { NeuSlider } from './NeuSlider';
export type { NeuSliderProps } from './NeuSlider';

export * from './Textarea';
