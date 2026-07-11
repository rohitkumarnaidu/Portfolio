import React, { useState } from 'react';
import { Sparkles, Activity, Search, MessageSquare, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@portfolio/ui';

interface AIAnalysisPanelProps {
  content: string;
  type?: 'blog' | 'project' | 'section';
}

export function AIAnalysisPanel({ content, type = 'blog' }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 2000);
  };

  if (!hasAnalyzed && !isAnalyzing) {
    return (
      <div className="bg-surface-secondary border border-border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">AI Content Analysis</h3>
          <p className="text-xs text-text-tertiary mt-1 max-w-sm">Get real-time feedback on readability, SEO, and tone to optimize your content.</p>
        </div>
        <Button onClick={handleAnalyze} disabled={!content.trim()}>Analyze Content</Button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-surface-secondary border border-border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Analyzing...</h3>
          <p className="text-xs text-text-tertiary mt-1">Checking readability, SEO, and tone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-border-primary pb-4">
        <div className="flex items-center gap-2 text-accent-500">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-sm font-semibold">AI Analysis Results</h3>
        </div>
        <button onClick={handleAnalyze} className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
          Re-analyze
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary flex flex-col items-center text-center space-y-2">
          <Activity className="w-5 h-5 text-semantic-success" />
          <div className="text-2xl font-bold text-text-primary">85<span className="text-sm text-text-tertiary">/100</span></div>
          <div className="text-xs font-medium text-text-secondary">Readability</div>
        </div>
        <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary flex flex-col items-center text-center space-y-2">
          <Search className="w-5 h-5 text-semantic-warning" />
          <div className="text-2xl font-bold text-text-primary">72<span className="text-sm text-text-tertiary">/100</span></div>
          <div className="text-xs font-medium text-text-secondary">SEO Score</div>
        </div>
        <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary flex flex-col items-center text-center space-y-2">
          <MessageSquare className="w-5 h-5 text-accent-500" />
          <div className="text-lg font-bold text-text-primary mt-1">Professional</div>
          <div className="text-xs font-medium text-text-secondary">Tone</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Suggestions</h4>
        
        <div className="flex items-start gap-3 p-3 bg-semantic-warning-bg/50 border border-semantic-warning/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary">Add more keywords</p>
            <p className="text-xs text-text-secondary mt-0.5">Consider adding keywords related to "{type}" in the first paragraph to boost SEO.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-semantic-success-bg/50 border border-semantic-success/20 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary">Great sentence variety</p>
            <p className="text-xs text-text-secondary mt-0.5">The length of sentences varies nicely, keeping the reader engaged.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-surface-secondary border border-border-primary rounded-lg cursor-pointer hover:border-accent-500 transition-colors group">
          <Sparkles className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">Optimize Title</p>
            <p className="text-xs text-text-secondary mt-0.5">The current title is a bit generic. Let AI suggest a more engaging one.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
