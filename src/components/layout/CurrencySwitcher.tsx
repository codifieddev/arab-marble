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
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold tracking-wider text-neutral-800 hover:text-[#C9A96E] border border-neutral-300/80 hover:border-[#C9A96E] bg-white transition-all duration-300 shadow-2xs cursor-pointer select-none"
        aria-label="Switch currency"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-[#C9A96E]">{symbol}</span>
        <span className="uppercase font-semibold tracking-[0.15em] text-[11px]">{currency}</span>
        <svg
          className={`w-3 h-3 text-neutral-400 group-hover:text-[#C9A96E] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C9A96E]' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xs bg-white border border-neutral-200 shadow-2xl z-50 py-1.5 overflow-hidden border-t-2 border-t-[#C9A96E] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 border-b border-neutral-100 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-semibold">
              Currency
            </span>
          </div>
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
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A96E]/12 text-[#9E7D42] font-semibold border-l-2 border-[#C9A96E]'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-black border-l-2 border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-bold text-neutral-400 w-4 text-center">{c.symbol}</span>
                  <span className="tracking-wider">{c.code}</span>
                </span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-[#C9A96E]"
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
