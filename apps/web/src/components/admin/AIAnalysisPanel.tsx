import React, { useState } from 'react';
import { Sparkles, Activity, Search, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@portfolio/ui';

const AI_API_BASE =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000'
    : process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

interface AnalysisResult {
  readability: { score: number; suggestions: string[]; metrics: Record<string, unknown> };
  seo: { score: number; suggestions: string[]; metrics: Record<string, unknown> };
  tone: {
    score: number;
    suggestions: string[];
    metrics: { tone: string } & Record<string, unknown>;
  };
  sentiment: {
    score: number;
    suggestions: string[];
    metrics: { sentiment: string } & Record<string, unknown>;
  };
}

interface AIAnalysisPanelProps {
  content: string;
  type?: 'blog' | 'project' | 'section';
}

const ANALYSIS_TYPES = ['readability', 'seo', 'tone', 'sentiment'] as const;

export function AIAnalysisPanel({ content }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const results: Record<
        string,
        { score: number; suggestions: string[]; metrics: Record<string, unknown> }
      > = {};

      for (const analysisType of ANALYSIS_TYPES) {
        const res = await fetch(`${AI_API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, analysis_type: analysisType }),
        });

        if (!res.ok) throw new Error(`Analysis request failed for ${analysisType}`);

        const data = await res.json();
        results[analysisType] = data;
      }

      setResult(results as unknown as AnalysisResult);
      setHasAnalyzed(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (error) {
    return (
      <div className="bg-surface-secondary border border-border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-semantic-error/10 text-semantic-error flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Analysis Failed</h3>
          <p className="text-xs text-text-tertiary mt-1 max-w-sm">{error}</p>
        </div>
        <Button onClick={handleAnalyze}>Retry</Button>
      </div>
    );
  }

  if (!hasAnalyzed && !isAnalyzing) {
    return (
      <div className="bg-surface-secondary border border-border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">AI Content Analysis</h3>
          <p className="text-xs text-text-tertiary mt-1 max-w-sm">
            Get real-time feedback on readability, SEO, and tone to optimize your content.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={!content.trim()}>
          Analyze Content
        </Button>
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

  const suggestions = [
    ...(result?.readability?.suggestions?.map((s) => ({ type: 'readability', text: s })) || []),
    ...(result?.seo?.suggestions?.map((s) => ({ type: 'seo', text: s })) || []),
    ...(result?.tone?.suggestions?.map((s) => ({ type: 'tone', text: s })) || []),
    ...(result?.sentiment?.suggestions?.map((s) => ({ type: 'sentiment', text: s })) || []),
  ];

  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-border-primary pb-4">
        <div className="flex items-center gap-2 text-accent-500">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-sm font-semibold">AI Analysis Results</h3>
        </div>
        <button
          onClick={handleAnalyze}
          className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          Re-analyze
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary flex flex-col items-center text-center space-y-2">
          <Activity className="w-5 h-5 text-semantic-success" />
          <div className="text-2xl font-bold text-text-primary">
            {result?.readability?.score || 0}
            <span className="text-sm text-text-tertiary">/100</span>
          </div>
          <div className="text-xs font-medium text-text-secondary">Readability</div>
        </div>
        <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary flex flex-col items-center text-center space-y-2">
          <Search className="w-5 h-5 text-semantic-warning" />
          <div className="text-2xl font-bold text-text-primary">
            {result?.seo?.score || 0}
            <span className="text-sm text-text-tertiary">/100</span>
          </div>
          <div className="text-xs font-medium text-text-secondary">SEO Score</div>
        </div>
        <div className="bg-surface-secondary p-4 rounded-xl border border-border-primary flex flex-col items-center text-center space-y-2">
          <MessageSquare className="w-5 h-5 text-accent-500" />
          <div className="text-lg font-bold text-text-primary mt-1">
            {result?.tone?.metrics?.tone || 'N/A'}
          </div>
          <div className="text-xs font-medium text-text-secondary">Tone</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Suggestions
        </h4>

        {suggestions.length === 0 && (
          <div className="flex items-start gap-3 p-3 bg-semantic-success-bg/50 border border-semantic-success/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">No issues found</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Your content looks well-optimized!
              </p>
            </div>
          </div>
        )}

        {suggestions
          .filter((s) => s.type === 'seo')
          .slice(0, 2)
          .map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-semantic-warning-bg/50 border border-semantic-warning/20 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  SEO {s.type === 'seo' ? 'Suggestion' : ''}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{s.text}</p>
              </div>
            </div>
          ))}

        {suggestions
          .filter((s) => s.type !== 'seo')
          .slice(0, 2)
          .map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-surface-secondary border border-border-primary rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {s.type === 'readability'
                    ? 'Readability'
                    : s.type === 'tone'
                      ? 'Tone'
                      : 'Sentiment'}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{s.text}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
