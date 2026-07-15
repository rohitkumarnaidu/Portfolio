'use client';

import { useEffect, useState } from 'react';

interface GradientFallbackProps {
  theme: 'light' | 'dark';
}

export const GradientFallback = ({ theme }: GradientFallbackProps) => {
  const [gradient, setGradient] = useState('');

  useEffect(() => {
    const g1 =
      theme === 'dark' ? ['#0f0f1a', '#1a1a2e', '#16213e'] : ['#f0f0ff', '#e8e8ff', '#ddd6fe'];

    const randomGrad = g1[Math.floor(Math.random() * g1.length)];
    const g2 = g1[(Math.floor(Math.random() * (g1.length - 1)) + 1) % g1.length];
    setGradient(`radial-gradient(ellipse at 50% 50%, ${randomGrad} 0%, ${g2} 100%)`);
  }, [theme]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 transition-colors duration-700"
      style={{ background: gradient || undefined }}
    />
  );
};
