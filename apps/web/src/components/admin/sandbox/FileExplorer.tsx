'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileCode2, ChevronLeft, Search } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
}

interface FileExplorerProps {
  onSelectFile: (path: string) => void;
  currentPath?: string;
}

export function FileExplorer({ onSelectFile, currentPath = '' }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathStack, setPathStack] = useState<string[]>(['']);
  const [hoveredSha, setHoveredSha] = useState<string | null>(null);

  const currentDir = pathStack[pathStack.length - 1] || '';

  useEffect(() => {
    fetchFiles(currentDir);
  }, [currentDir]);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      // Mocking latency for visual effect during demo
      await new Promise(resolve => setTimeout(resolve, 600));
      const res = await fetch(`/api/admin/sandbox/files?path=${path}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}`
        }
      });
      const { data } = await res.json();
      setFiles(data);
    } catch (e) {
      console.error('Failed to fetch files', e);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'dir') {
      setPathStack([...pathStack, item.path]);
    } else {
      onSelectFile(item.path);
    }
  };

  const goUp = () => {
    if (pathStack.length > 1) {
      const newStack = [...pathStack];
      newStack.pop();
      setPathStack(newStack);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-sm text-gray-300 w-full relative">
      <div className="p-3 font-semibold border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2 text-gray-400">
          <Search size={14} />
          <span className="text-xs tracking-wider uppercase">Explorer</span>
        </div>
        <AnimatePresence>
          {pathStack.length > 1 && (
            <motion.button 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={goUp} 
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 p-2"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 w-full opacity-60">
                  <div className="w-4 h-4 bg-white/10 rounded-sm animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  <div className="h-3 bg-white/10 rounded-sm animate-pulse flex-1" style={{ animationDelay: `${i * 100}ms` }} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.ul 
              key="file-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              {files.map(file => {
                const isSelected = currentPath === file.path;
                return (
                  <motion.li 
                    layout
                    key={file.sha}
                    onHoverStart={() => setHoveredSha(file.sha)}
                    onHoverEnd={() => setHoveredSha(null)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-1.5 px-2 rounded-md cursor-pointer flex items-center justify-between group transition-colors ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5'}`}
                    onClick={() => handleItemClick(file)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`${isSelected ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {file.type === 'dir' ? <Folder size={16} fill="currentColor" fillOpacity={0.2} /> : <FileCode2 size={16} />}
                      </span>
                      <span className="truncate text-[13px] font-medium">{file.name}</span>
                    </div>
                    
                    {/* Air.inc style contextual action menu on hover */}
                    <AnimatePresence>
                      {hoveredSha === file.sha && file.type === 'file' && !isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex gap-1"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
