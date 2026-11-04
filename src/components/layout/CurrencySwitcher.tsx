'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/lib/currency/useCurrency';

export default function CurrencySwitcher({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, symbol, enabledCurrencies, shouldShowSwitcher, setCurrency } = useCurrency();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If single currency or switcher not allowed, hide completely
  if (!shouldShowSwitcher || enabledCurrencies.length <= 1) {
    return null;
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hdr-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-foreground/80 hover:text-foreground border border-border/60 hover:border-border transition-all"
        aria-label="Switch currency"
        aria-expanded={isOpen}
      >
        <span className="font-bold opacity-80">{symbol}</span>
        <span className="uppercase font-bold tracking-wider">{currency}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-card border border-border shadow-xl z-50 py-1.5 overflow-hidden backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150">
          {enabledCurrencies.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground w-4 text-center">{c.symbol}</span>
                  <span>{c.code}</span>
                </span>
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
