'use client';

import React from 'react';
import { SceneErrorFallback } from './fallbacks/SceneErrorFallback';
import type { Tier } from '@/lib/3d/types';

interface SceneErrorBoundaryState {
  hasError: boolean;
  errorType: 'webgl' | 'bundle' | 'render' | 'unknown';
  tier: Tier;
}

interface SceneErrorBoundaryProps {
  children: React.ReactNode;
  initialTier: Tier;
  onDemote?: (tier: Tier) => void;
}

export class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorType: 'unknown',
      tier: props.initialTier,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<SceneErrorBoundaryState> {
    const msg = error.message.toLowerCase();
    const errorType =
      msg.includes('webgl') || msg.includes('context')
        ? 'webgl'
        : msg.includes('chunk') || msg.includes('import')
          ? 'bundle'
          : msg.includes('render') || msg.includes('shader')
            ? 'render'
            : 'unknown';

    return { hasError: true, errorType };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[3D Error]', error.message, info.componentStack);

    if (this.state.tier === 'high') {
      this.setState({ tier: 'mid', hasError: false });
    } else if (this.state.tier === 'mid') {
      this.setState({ tier: 'low', hasError: false });
    } else {
      this.setState({ tier: 'off' });
      this.props.onDemote?.('off');
    }
  }

  render() {
    if (this.state.hasError && this.state.tier === 'off') {
      return <SceneErrorFallback errorType={this.state.errorType} />;
    }

    return this.props.children;
  }
}
