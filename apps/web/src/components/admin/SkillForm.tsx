'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@portfolio/ui';
import type { Skill } from '@portfolio/shared';

const skillSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  proficiency: z.number().min(0).max(100),
  is_featured: z.boolean(),
});

type SkillFormData = z.infer<typeof skillSchema>;

export interface SkillFormProps {
  initialData?: Skill | null;
  onSubmit: (data: Partial<Skill>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SkillForm({ initialData, onSubmit, onCancel, isLoading }: SkillFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: '',
      category: 'Frontend',
      proficiency: 80,
      is_featured: false,
    },
  });

  const currentProficiency = watch('proficiency');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        category: initialData.category || 'Frontend',
        proficiency: initialData.proficiency ?? 80,
        is_featured: initialData.is_featured ?? false,
      });
    } else {
      reset({
        name: '',
        category: 'Frontend',
        proficiency: 80,
        is_featured: false,
      });
    }
  }, [initialData, reset]);

  const submitHandler = async (data: SkillFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 max-w-lg">
      <h3 className="font-display text-h4 text-text-primary">
        {initialData ? 'Edit Skill' : 'New Skill'}
      </h3>

      <Input label="Name *" {...register('name')} error={errors.name?.message} />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Category</label>
        <select
          {...register('category')}
          className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-500 focus:outline-none"
        >
          {[
            'Frontend',
            'Backend',
            'Languages',
            'DevOps',
            'Databases',
            'Tools',
            'Design',
            'Other',
          ].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">
          Proficiency: {currentProficiency}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          {...register('proficiency', { valueAsNumber: true })}
          className="w-full accent-accent-500"
        />
        {errors.proficiency && <p className="text-sm text-red-500">{errors.proficiency.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          {...register('is_featured')}
          className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary"
        />
        Featured
      </label>

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
