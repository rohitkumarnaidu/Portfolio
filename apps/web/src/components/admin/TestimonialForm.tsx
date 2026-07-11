'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@portfolio/ui';
import { Textarea } from '@portfolio/ui/src/Textarea';
import { ImageUpload } from './ImageUpload';
import type { Testimonial } from '@portfolio/shared';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional(),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  rating: z.number().min(1).max(5).default(5),
  avatar_url: z.string().optional(),
  is_visible: z.boolean().default(true),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export interface TestimonialFormProps {
  initialData?: Testimonial | null;
  onSubmit: (data: Partial<Testimonial>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TestimonialForm({ initialData, onSubmit, onCancel, isLoading }: TestimonialFormProps) {
  const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      role: '',
      company: '',
      content: '',
      rating: 5,
      avatar_url: '',
      is_visible: true,
    },
  });

  const currentRating = watch('rating');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        role: initialData.role || '',
        company: initialData.company || '',
        content: initialData.content || '',
        rating: initialData.rating ?? 5,
        avatar_url: initialData.avatar_url || '',
        is_visible: initialData.is_visible ?? true,
      });
    } else {
      reset({
        name: '',
        role: '',
        company: '',
        content: '',
        rating: 5,
        avatar_url: '',
        is_visible: true,
      });
    }
  }, [initialData, reset]);

  const submitHandler = async (data: TestimonialFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <h3 className="font-display text-h4 text-text-primary">
        {initialData ? 'Edit Testimonial' : 'New Testimonial'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Name *" {...register('name')} error={errors.name?.message} />
        <Input label="Company *" {...register('company')} error={errors.company?.message} />
        <Input label="Role" {...register('role')} error={errors.role?.message} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button 
                key={n} 
                type="button" 
                onClick={() => setValue('rating', n, { shouldValidate: true })} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${n <= currentRating ? 'bg-accent-500/20 text-accent-500' : 'bg-surface-elevated text-text-tertiary'}`}
              >
                {n}
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Avatar Image (optional)</label>
        <Controller
          name="avatar_url"
          control={control}
          render={({ field }) => (
            <ImageUpload 
              value={field.value} 
              onChange={field.onChange} 
              error={errors.avatar_url?.message} 
            />
          )}
        />
      </div>

      <Textarea 
        label="Content *" 
        {...register('content')} 
        error={errors.content?.message} 
        rows={4}
      />

      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input 
          type="checkbox" 
          {...register('is_visible')} 
          className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary" 
        /> 
        Visible on portfolio
      </label>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Testimonial' : 'Create Testimonial'}
        </Button>
      </div>
    </form>
  );
}
