'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileExplorer } from '@/components/admin/sandbox/FileExplorer';
import { SandboxEditor } from '@/components/admin/sandbox/SandboxEditor';
import { SandboxAISidebar } from '@/components/admin/sandbox/SandboxAISidebar';
import { PreviewPane } from '@/components/admin/sandbox/PreviewPane';
import { Button } from '@portfolio/ui';
import { getWebContainer } from '@/lib/webcontainer';
import { Sidebar, Play, Code2, UploadCloud, Activity } from 'lucide-react';

export default function SandboxPage() {
  const [currentFilePath, setCurrentFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('// Select a file to edit');
  const [isCommitting, setIsCommitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    async function initWc() {
      try {
        const wc = await getWebContainer();
        wc.on('server-ready', (_port, url) => {
          setPreviewUrl(url);
          setIsBooting(false);
        });
        
        // Simulate boot time if not already booted
        setTimeout(() => setIsBooting(false), 2500);
      } catch (e) {
        console.error('WebContainer error:', e);
        setIsBooting(false);
      }
    }
    initWc();
  }, []);

  const handleSelectFile = async (path: string) => {
    setCurrentFilePath(path);
    try {
      const res = await fetch(`/api/admin/sandbox/file?path=${path}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}` }
      });
      const { data } = await res.json();
      setFileContent(data.content);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommit = async () => {
    if (!currentFilePath) return;
    setIsCommitting(true);
    try {
      await fetch('/api/admin/sandbox/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}`
        },
        body: JSON.stringify({
          path: currentFilePath,
          content: fileContent,
          message: `Admin Sandbox: Update ${currentFilePath.split('/').pop()}`,
          branch: 'main'
        })
      });
      alert('Committed successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to commit.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCodeSuggested = (suggestedCode: string) => {
    setFileContent(suggestedCode);
    setActiveTab('code'); // Auto-switch to code tab so user can see AI typing
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0e0e11] text-white overflow-hidden relative font-sans">
      
      {/* Dynamic Workspace Container */}
      <motion.div 
        layout 
        className="flex-1 flex flex-col min-w-0 h-full relative"
      >
        {/* Workspace Header / Tabs */}
        <motion.div layout className="flex items-center justify-between p-3 px-4 border-b border-white/5 bg-[#18181b]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Sidebar size={18} />
            </motion.button>
            
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'preview' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <Play size={14} /> Preview
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'code' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <Code2 size={14} /> Code
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isBooting ? (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400/80">
                <Activity size={14} className="animate-pulse" />
                Booting Container...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400/80">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                Environment Ready
              </div>
            )}
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" onClick={handleCommit} isLoading={isCommitting} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2">
                <UploadCloud size={16} /> Deploy to GitHub
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Workspace Content Area */}
        <div className="flex-1 overflow-hidden relative bg-[#0e0e11] p-4">
          <AnimatePresence mode="popLayout">
            {/* Preview View */}
            {activeTab === 'preview' && (
              <motion.div
                key="preview-pane"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                className="absolute inset-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black"
              >
                {isBooting ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#18181b]">
                    <div className="w-64 h-64 relative flex items-center justify-center">
                      <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border-r-2 border-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      <Activity size={32} className="text-white/50" />
                    </div>
                    <p className="mt-8 text-white/60 font-medium tracking-wide animate-pulse">Initializing WebContainer...</p>
                  </div>
                ) : (
                  <PreviewPane url={previewUrl} />
                )}
              </motion.div>
            )}

            {/* Code View */}
            {activeTab === 'code' && (
              <motion.div
                key="code-pane"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                className="absolute inset-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl flex bg-[#18181b]"
              >
                <div className="w-64 border-r border-white/5 bg-[#1e1e24] overflow-y-auto">
                  <FileExplorer onSelectFile={handleSelectFile} currentPath={currentFilePath} />
                </div>
                <div className="flex-1">
                  <SandboxEditor 
                    content={fileContent} 
                    onChange={(val) => setFileContent(val || '')} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Slide-over AI Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: 50 }}
            animate={{ width: 320, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-30"
          >
            <SandboxAISidebar 
              currentFileContent={fileContent} 
              onCodeSuggested={handleCodeSuggested} 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
