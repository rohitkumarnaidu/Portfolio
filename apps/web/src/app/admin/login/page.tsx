'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@portfolio/ui';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter email and password');
      return;
    }

    try {
      await login(email, password);
      router.push('/admin');
    } catch {
      // Error is set by useAuth
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-primary p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="font-display text-xl font-bold text-text-primary hover:no-underline">
            Portfolio
          </a>
          <h1 className="font-display text-h3 text-text-primary mt-6 mb-2">Admin Login</h1>
          <p className="text-body-sm text-text-secondary">Sign in to manage your portfolio</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-8">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => window.location.href = 'http://localhost:3001/api/admin/auth/github'}
            className="flex items-center justify-center gap-2"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
          </Button>
          
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => window.location.href = 'http://localhost:3001/api/admin/auth/google'}
            className="flex items-center justify-center gap-2"
          >
            <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-primary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface-primary text-text-tertiary">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="admin@portfolio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 hover:border-border-accent focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              autoComplete="current-password"
            />
          </div>

          {(formError || error) && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-semantic-error-bg border border-semantic-error/20">
              <svg className="w-4 h-4 text-semantic-error shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-semantic-error">{formError || error}</p>
            </div>
          )}

          <Button type="submit" size="lg" fullWidth isLoading={loading}>
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-caption text-text-tertiary mt-8">
          <a href="/" className="text-text-secondary hover:text-text-primary transition-colors">
            ← Back to portfolio
          </a>
        </p>
      </div>
    </div>
  );
}
