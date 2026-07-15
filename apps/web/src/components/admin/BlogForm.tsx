'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Badge } from '@portfolio/ui';
import { Textarea } from '@portfolio/ui/src/Textarea';
import { RichTextEditor } from './RichTextEditor';
import { ImageUpload } from './ImageUpload';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { ChevronDown, ChevronUp, Search, Plus } from 'lucide-react';
import { useBlogTags } from '@/lib/hooks/useBlogPosts';
import type { BlogPost } from '@portfolio/shared';

const blogSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric and hyphens only'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()),
  authorName: z.string().min(2, 'Author is required'),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  coverImage: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export interface BlogFormProps {
  initialData?: BlogPost | null;
  onSubmit: (data: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogForm({ initialData, onSubmit, onCancel, isLoading }: BlogFormProps) {
  const [seoOpen, setSeoOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { data: existingTags } = useBlogTags();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Development',
      tags: [],
      authorName: 'Admin',
      isPublished: false,
      isFeatured: false,
      publishedAt: '',
      seoTitle: '',
      seoDescription: '',
      coverImage: '',
    },
  });
  const seoTitle = useWatch({ control, name: 'seoTitle' });
  const seoDescription = useWatch({ control, name: 'seoDescription' });
  const slugValue = useWatch({ control, name: 'slug' });
  const tagsValue = useWatch({ control, name: 'tags' });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || 'Development',
        tags: initialData.tags || [],
        authorName: initialData.authorName || 'Admin',
        isPublished: initialData.isPublished ?? false,
        isFeatured: initialData.isFeatured ?? false,
        publishedAt: initialData.publishedAt || '',
        seoTitle: initialData.seoTitle || '',
        seoDescription: initialData.seoDescription || '',
        coverImage: initialData.coverImage || '',
      });
    } else {
      reset({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Development',
        tags: [],
        authorName: 'Admin',
        isPublished: false,
        isFeatured: false,
        coverImage: '',
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedTagInput = tagInput.trim().toLowerCase().replace(/\s+/g, '-');

  const filteredSuggestions = (existingTags ?? [])
    .map((t) => t.name)
    .filter(
      (name) =>
        name.includes(normalizedTagInput) &&
        normalizedTagInput &&
        !tagsValue?.includes(name),
    );

  const addTag = useCallback(
    (tag: string) => {
      const normalized = tag.trim().toLowerCase().replace(/\s+/g, '-');
      if (!normalized || (tagsValue ?? []).includes(normalized)) return;
      setValue('tags', [...(tagsValue ?? []), normalized], { shouldValidate: true });
      setTagInput('');
      setShowSuggestions(false);
    },
    [tagsValue, setValue],
  );

  const removeTag = useCallback(
    (tag: string) => {
      setValue(
        'tags',
        (tagsValue ?? []).filter((t) => t !== tag),
        { shouldValidate: true },
      );
    },
    [tagsValue, setValue],
  );

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && showSuggestions) {
        addTag(filteredSuggestions[0]!);
      } else {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && (tagsValue ?? []).length > 0) {
      removeTag(tagsValue![tagsValue!.length - 1]!);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const submitHandler = async (data: BlogFormData) => {
    const payload: Partial<BlogPost> = {
      ...data,
      tags: data.tags || [],
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <h3 className="font-display text-h4 text-text-primary">
        {initialData ? 'Edit Blog Post' : 'New Blog Post'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title *" {...register('title')} error={errors.title?.message} />
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
        <Input label="Author *" {...register('authorName')} error={errors.authorName?.message} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Cover Image</label>
        <Controller
          name="coverImage"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.coverImage?.message}
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">Tags</label>
        <div className="relative">
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border-primary bg-surface-secondary min-h-[42px] items-center cursor-text focus-within:ring-2 focus-within:ring-accent-500" onClick={() => tagInputRef.current?.focus()}>
            {(tagsValue ?? []).map((tag) => (
              <Badge key={tag} variant="default" size="sm" isDismissible onDismiss={() => removeTag(tag)}>
                {tag}
              </Badge>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={!tagsValue?.length ? 'Type a tag and press Enter...' : ''}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary py-0.5"
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-border-primary bg-surface-primary shadow-lg overflow-hidden"
            >
              {filteredSuggestions.slice(0, 8).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addTag(name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.tags?.message && (
          <p className="text-xs text-semantic-error">{errors.tags.message}</p>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('isPublished')}
            className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary"
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('isFeatured')}
            className="rounded border-border-primary text-accent-500 focus:ring-accent-500 bg-surface-secondary"
          />
          Featured
        </label>
      </div>

      <Input
        label="Publish Date (optional)"
        type="datetime-local"
        {...register('publishedAt')}
        error={errors.publishedAt?.message}
      />

      <div className="border border-border-primary rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setSeoOpen(!seoOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface-secondary hover:bg-surface-elevated transition-colors text-sm font-medium text-text-primary"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-accent-500" />
            SEO Settings
          </div>
          {seoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {seoOpen && (
          <div className="p-4 space-y-4">
            <Input
              label="SEO Title"
              placeholder="Custom title for search results (max 60 chars)"
              {...register('seoTitle')}
              error={errors.seoTitle?.message}
              maxLength={60}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">SEO Description</label>
              <textarea
                className="w-full rounded-lg border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                rows={3}
                placeholder="Meta description for search results (max 160 chars)"
                maxLength={160}
                {...register('seoDescription')}
              />
              {errors.seoDescription?.message && (
                <p className="text-xs text-semantic-error">{errors.seoDescription.message}</p>
              )}
            </div>
            <div className="bg-surface-primary border border-border-primary rounded-lg p-4 space-y-1">
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">
                Search Result Preview
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                https://portfolio.com/blog/{slugValue || 'post-slug'}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {seoTitle || 'SEO Title'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {seoDescription || 'SEO description preview will appear here...'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
        {initialData?.slug && (
          <Button
            variant="secondary"
            type="button"
            onClick={() =>
              window.open(
                `/api/preview?id=${initialData.slug}&token=${process.env.NEXT_PUBLIC_PREVIEW_SECRET || 'default-preview-secret'}`,
                '_blank',
              )
            }
          >
            Preview
          </Button>
        )}
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
