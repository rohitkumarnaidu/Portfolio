'use client';

import { Editor } from '@monaco-editor/react';

interface SandboxEditorProps {
  content: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}

export function SandboxEditor({ content, onChange, language = 'typescript' }: SandboxEditorProps) {
  return (
    <div className="flex-1 h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={content}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
