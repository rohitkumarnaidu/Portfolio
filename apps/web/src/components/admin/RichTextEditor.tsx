'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@portfolio/ui';

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Write something...', error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[150px] p-4 text-text-primary',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-border-primary'} bg-surface-secondary overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border-primary bg-surface-elevated p-2">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('strike') ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </Button>
        <div className="w-px h-4 bg-border-primary mx-1" />
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 3 }) ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>
        <div className="w-px h-4 bg-border-primary mx-1" />
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('orderedList') ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          List
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('blockquote') ? 'primary' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </Button>
      </div>
      <EditorContent editor={editor} />
      {error && <div className="p-2 text-sm text-red-500 bg-red-500/10 border-t border-red-500/20">{error}</div>}
    </div>
  );
}
