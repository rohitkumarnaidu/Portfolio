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

// ──────────────────────────────
// Phase 4 Component Library Atoms
// @see docs/07-frontend/FRONTEND-IMPLEMENTATION-PLAN.md §4
// ──────────────────────────────

// Spinner
export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

// Accordion
export { Accordion } from './Accordion';
export type { AccordionProps, AccordionItem } from './Accordion';

// Select
export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Breadcrumb
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

// Pagination
export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

// SearchBar
export { SearchBar } from './SearchBar';
export type { SearchBarProps, SearchResult } from './SearchBar';

// StatCard
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

// ProgressBar
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

// Timeline
export { Timeline } from './Timeline';
export type { TimelineProps, TimelineItem, TimelineStatus } from './Timeline';

// NotificationDot
export { NotificationDot } from './NotificationDot';
export type { NotificationDotProps, PresenceStatus } from './NotificationDot';

// StatusBadge
export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusKind } from './StatusBadge';

// IconButton
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';

// TagInput
export { TagInput } from './TagInput';
export type { TagInputProps } from './TagInput';

// FileUpload
export { FileUpload } from './FileUpload';
export type { FileUploadProps, UploadState, UploadedFile } from './FileUpload';
