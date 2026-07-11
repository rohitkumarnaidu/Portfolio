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
import type { BlogPost } from '@portfolio/shared';

const blogSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric and hyphens only'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  tags: z.string().optional(),
  author: z.string().min(2, 'Author is required'),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  cover_image: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export interface BlogFormProps {
  initialData?: BlogPost | null;
  onSubmit: (data: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogForm({ initialData, onSubmit, onCancel, isLoading }: BlogFormProps) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Development',
      tags: '',
      author: 'Admin',
      is_published: false,
      is_featured: false,
      cover_image: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || 'Development',
        tags: initialData.tags?.join(', ') || '',
        author: initialData.author || 'Admin',
        is_published: initialData.is_published || false,
        is_featured: initialData.is_featured || false,
        cover_image: initialData.cover_image || '',
      });
    } else {
      reset({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Development',
        tags: '',
        author: 'Admin',
        is_published: false,
        is_featured: false,
        cover_image: '',
      });
    }
  }, [initialData, reset]);

  const submitHandler = async (data: BlogFormData) => {
    const payload: Partial<BlogPost> = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <h3 className="font-display text-h4 text-text-primary">
        {initialData ? 'Edit Blog Post' : 'New Blog Post'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input 
          label="Title *" 
          {...register('title')} 
          error={errors.title?.message} 
        />
        <Input 
          label="Slug *" 
          placeholder="my-post-slug" 
          {...register('slug')} 
          error={errors.slug?.message} 
        />
        <Input 
          label="Category *" 
          placeholder="e.g. Development, Design" 
          {...register('category')} 
          error={errors.category?.message} 
        />
        <Input 
          label="Author *" 
          {...register('author')} 
          error={errors.author?.message} 
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

      <Textarea 
        label="Excerpt *" 
        placeholder="A short summary of the post..." 
        {...register('excerpt')} 
        error={errors.excerpt?.message} 
        rows={2}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Content *</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <div className="space-y-4">
              <RichTextEditor 
                content={field.value || ''} 
                onChange={field.onChange} 
                error={errors.content?.message} 
              />
              <AIAnalysisPanel content={field.value || ''} type="blog" />
            </div>
          )}
        />
      </div>

      <Input 
        label="Tags (comma-separated)" 
        placeholder="react, nextjs, tutorial" 
        {...register('tags')} 
        error={errors.tags?.message} 
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input 
            type="checkbox" 
            {...register('is_published')} 
            className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary" 
          /> 
          Published
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input 
            type="checkbox" 
            {...register('is_featured')} 
            className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary" 
          /> 
          Featured
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}
