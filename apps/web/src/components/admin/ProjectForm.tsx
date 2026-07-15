'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@portfolio/ui';
import { Textarea } from '@portfolio/ui/src/Textarea';
import { RichTextEditor } from './RichTextEditor';
import { ImageUpload } from './ImageUpload';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import type { Project } from '@portfolio/shared';

const projectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  category: z.string().optional(),
  live_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  tech_stack: z.string().optional(),
  is_featured: z.boolean(),
  is_private: z.boolean(),
  cover_image: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      category: '',
      live_url: '',
      github_url: '',
      description: '',
      tech_stack: '',
      is_featured: false,
      is_private: false,
      cover_image: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        category: initialData.category || '',
        live_url: initialData.live_url || '',
        github_url: initialData.github_url || '',
        description: initialData.description || '',
        tech_stack: initialData.tech_stack?.join(', ') || '',
        is_featured: initialData.is_featured || false,
        is_private: initialData.is_private || false,
        cover_image: initialData.cover_image || '',
      });
    } else {
      reset({
        title: '',
        category: '',
        live_url: '',
        github_url: '',
        description: '',
        tech_stack: '',
        is_featured: false,
        is_private: false,
        cover_image: '',
      });
    }
  }, [initialData, reset]);

  const submitHandler = async (data: ProjectFormData) => {
    const payload: Partial<Project> = {
      ...data,
      category: data.category as Project['category'] | undefined,
      tech_stack: data.tech_stack
        ? data.tech_stack
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <h3 className="font-display text-h4 text-text-primary">
        {initialData ? 'Edit Project' : 'New Project'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title *" {...register('title')} error={errors.title?.message} />
        <Input
          label="Category"
          placeholder="e.g. web, mobile, ai"
          {...register('category')}
          error={errors.category?.message}
        />
        <Input
          label="Live URL"
          placeholder="https://..."
          {...register('live_url')}
          error={errors.live_url?.message}
        />
        <Input
          label="GitHub URL"
          placeholder="https://github.com/..."
          {...register('github_url')}
          error={errors.github_url?.message}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Cover Image</label>
        <Controller
          name="cover_image"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.cover_image?.message}
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">
          Description (Rich Text)
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <div className="space-y-4">
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                error={errors.description?.message}
              />
              <AIAnalysisPanel content={field.value || ''} type="project" />
            </div>
          )}
        />
      </div>

      <Textarea
        label="Technologies (comma-separated)"
        placeholder="React, TypeScript, Node.js"
        {...register('tech_stack')}
        error={errors.tech_stack?.message}
        rows={2}
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('is_featured')}
            className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('is_private')}
            className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary"
          />
          Private (NDA)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
