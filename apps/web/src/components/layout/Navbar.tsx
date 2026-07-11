'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants';

export interface NavbarProps {
  variant?: 'default' | 'sticky' | 'glass' | 'transparent';
  className?: string;
}

export function Navbar({ variant = 'sticky', className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navClasses = cn(
    'w-full z-sticky transition-all duration-300',
    {
      'fixed top-0 left-0 right-0': variant !== 'default',
      'bg-transparent': variant === 'transparent' && !isScrolled,
      'glass-medium shadow-sm border-b border-border-primary': 
        (variant === 'sticky' && isScrolled) || (variant === 'transparent' && isScrolled),
      'glass-prominent': variant === 'glass',
      'bg-surface-primary': variant === 'default' || (variant === 'sticky' && !isScrolled),
    },
    className
  );

  return (
    <header className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="font-display text-h4 font-bold text-text-primary tracking-tight z-50 flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-500 text-white flex items-center justify-center text-sm">
              {SITE_CONFIG.author.charAt(0)}
            </div>
            {SITE_CONFIG.author}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const href = link.href;
                const isActive = pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'text-body-sm font-medium transition-colors relative',
                        isActive ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary',
                        "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent-500 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100",
                        isActive && "after:origin-bottom-left after:scale-x-100"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/contact" 
                className="px-4 py-2 bg-text-primary text-surface-primary rounded-md text-sm font-medium hover:bg-text-secondary transition-colors"
              >
                Hire Me
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 lg:hidden z-50">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-text-primary"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between relative">
                <span className={cn("w-full h-[2px] bg-current transition-all duration-300", isMobileMenuOpen && "absolute top-1/2 -translate-y-1/2 rotate-45")} />
                <span className={cn("w-full h-[2px] bg-current transition-all duration-300", isMobileMenuOpen && "opacity-0")} />
                <span className={cn("w-full h-[2px] bg-current transition-all duration-300", isMobileMenuOpen && "absolute top-1/2 -translate-y-1/2 -rotate-45")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={cn(
          "fixed inset-0 top-16 md:top-20 bg-surface-primary z-40 transition-all duration-300 ease-in-out lg:hidden overflow-hidden",
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col h-full px-4 py-8 overflow-y-auto">
          <ul className="flex flex-col gap-6">
            {NAV_LINKS.map((link, i) => {
              const href = link.href;
              const isActive = pathname?.startsWith(href);
              return (
                <li 
                  key={href} 
                  className={cn("transition-all duration-300", isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <Link
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-h3 font-medium transition-colors block',
                      isActive ? 'text-accent-500' : 'text-text-primary'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div 
            className={cn("mt-10 transition-all duration-300", isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
            style={{ transitionDelay: `${NAV_LINKS.length * 50}ms` }}
          >
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-center w-full px-6 py-4 bg-text-primary text-surface-primary rounded-lg text-lg font-medium active:scale-95 transition-transform"
            >
              Hire Me
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
