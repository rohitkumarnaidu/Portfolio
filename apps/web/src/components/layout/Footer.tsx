'use client';

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, SOCIAL_LINKS, NAV_LINKS } from '@/lib/constants';

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-surface-elevated border-t border-border-primary pt-16 pb-8 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Bio */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-h4 font-bold text-text-primary tracking-tight mb-4 inline-block">
              {SITE_CONFIG.author}
            </Link>
            <p className="text-text-secondary text-body-sm mb-6 max-w-xs">
              {SITE_CONFIG.description}
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a 
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent-500 hover:scale-110 transition-all duration-200"
                  aria-label={`Visit ${social.platform} profile`}
                >
                  <span className="sr-only">{social.label}</span>
                  {/* Icon placeholder based on platform */}
                  <div className="w-6 h-6 bg-current" style={{ mask: `url('/icons/${social.platform}.svg') no-repeat center / contain`, WebkitMask: `url('/icons/${social.platform}.svg') no-repeat center / contain` }} />
                </a>
              ))}
            </div>
          </div>

          {/* Links: Navigation */}
          <div>
            <h3 className="font-display font-semibold text-text-primary mb-4">Navigation</h3>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-text-secondary hover:text-accent-500 hover:underline transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Legal & Misc */}
          <div>
            <h3 className="font-display font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-accent-500 hover:underline transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-accent-500 hover:underline transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/styleguide" className="text-text-secondary hover:text-accent-500 hover:underline transition-colors text-sm">
                  Design System
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h3 className="font-display font-semibold text-text-primary mb-4">Stay in touch</h3>
            <p className="text-text-secondary text-sm mb-4">
              Subscribe to my newsletter for the latest updates on my projects and articles.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input 
                type="email" 
                id="footer-email"
                placeholder="hello@example.com"
                className="flex-grow px-3 py-2 bg-surface-primary border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm"
                required
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-text-primary text-surface-primary rounded-md text-sm font-medium hover:bg-text-secondary transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-primary flex flex-col md:flex-row justify-between items-center gap-4">
          <small className="text-text-tertiary">
            &copy; {currentYear} {SITE_CONFIG.author}. All rights reserved.
          </small>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
          >
            Back to top &uarr;
          </button>
        </div>
      </div>
    </footer>
  );
}
