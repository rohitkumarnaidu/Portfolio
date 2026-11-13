'use client';

import { useState } from 'react';
import { Input } from '@portfolio/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, Send } from 'lucide-react';

interface SandboxAISidebarProps {
  currentFileContent: string;
  onCodeSuggested: (code: string) => void;
}

export function SandboxAISidebar({ currentFileContent, onCodeSuggested }: SandboxAISidebarProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction) return;

    setLoading(true);
    let fullResponse = '';

    try {
      const response = await fetch('http://localhost:8000/api/agent/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_content: currentFileContent,
          instruction,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const data = line.replace('data: ', '');
            fullResponse += data;
          }
        }
      }

      onCodeSuggested(fullResponse);
      setInstruction('');
    } catch (e) {
      console.error('AI Error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-sm relative">
      <div className="p-4 font-semibold border-b border-white/5 flex items-center gap-2 text-indigo-400 bg-black/20">
        <Sparkles size={16} />
        AI Copilot
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-gray-400 flex flex-col gap-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs leading-relaxed"
        >
          Highlight code in the editor, or ask me to modify the current file. I can connect to your
          GitHub repo and push changes.
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-auto bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg flex items-center gap-3"
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                <Bot size={20} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-indigo-300 font-medium">Agent is thinking...</p>
                <div className="flex gap-1 mt-1">
                  <motion.div
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  />
                  <motion.div
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Refactor this to use Tailwind..."
              disabled={loading}
              className="bg-[#0e0e11] border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500 transition-colors pr-10"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={loading || !instruction}
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:hover:text-indigo-400"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
