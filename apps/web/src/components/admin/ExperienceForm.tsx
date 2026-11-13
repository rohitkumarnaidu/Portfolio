'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@portfolio/ui';
import type { Experience } from '@portfolio/shared';

const experienceSchema = z.object({
  company: z.string().min(2, 'Company must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  location: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(7, 'Start date is required (YYYY-MM)'),
  endDate: z.string().optional(),
  companyUrl: z.string().optional(),
  technologies: z.string().optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export interface ExperienceFormProps {
  initialData?: Experience | null;
  onSubmit: (data: Partial<Experience>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExperienceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ExperienceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: '',
      role: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
      companyUrl: '',
      technologies: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        company: initialData.company || '',
        role: initialData.role || '',
        location: initialData.location || '',
        description: initialData.description || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        companyUrl: initialData.companyUrl || '',
        technologies: initialData.technologies?.join(', ') || '',
      });
    } else {
      reset({
        company: '',
        role: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        companyUrl: '',
        technologies: '',
      });
    }
  }, [initialData, reset]);

  const submitHandler = async (data: ExperienceFormData) => {
    const payload: Partial<Experience> = {
      ...data,
      companyUrl: data.companyUrl || undefined,
      endDate: data.endDate || undefined,
      location: data.location || undefined,
      description: data.description || undefined,
      technologies: data.technologies
        ? data.technologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <h3 className="font-display text-h4 text-text-primary">
        {initialData ? 'Edit Experience' : 'New Experience'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Company *" {...register('company')} error={errors.company?.message} />
        <Input label="Role *" {...register('role')} error={errors.role?.message} />
        <Input label="Location" {...register('location')} error={errors.location?.message} />
        <Input
          label="Start Date * (YYYY-MM)"
          placeholder="2020-01"
          {...register('startDate')}
          error={errors.startDate?.message}
        />
        <Input
          label="End Date (YYYY-MM)"
          placeholder="2023-06"
          {...register('endDate')}
          error={errors.endDate?.message}
        />
        <Input
          label="Company URL"
          placeholder="https://..."
          {...register('companyUrl')}
          error={errors.companyUrl?.message}
        />
        <Input
          label="Technologies (comma-separated)"
          placeholder="React, TypeScript, Node.js"
          {...register('technologies')}
          error={errors.technologies?.message}
          className="sm:col-span-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Experience' : 'Create Experience'}
        </Button>
      </div>
    </form>
  );
}
