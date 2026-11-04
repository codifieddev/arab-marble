"use client"

import { useState } from "react";

const MIN_PRICE = 0;
const MAX_PRICE = 200000;

const PriceRangeFilter = () => {
  const [minVal, setMinVal] = useState(MIN_PRICE);
  const [maxVal, setMaxVal] = useState(MAX_PRICE);

  const minPercent = ((minVal - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent = ((maxVal - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <div className="p-4 border-b border-border/70">
      <div className="text-[11px] font-black uppercase tracking-[2px] text-foreground/80 mb-3">
        Price
      </div>

      {/* Min / Max input boxes */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <input
          type="number"
          placeholder="Min"
          value={minVal}
          min={MIN_PRICE}
          max={maxVal - 500}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - 500);
            setMinVal(Math.max(val, MIN_PRICE));
          }}
          className="h-10 px-3 rounded-xl border border-border bg-background/80 text-xs font-bold outline-none focus:border-secondary w-full"
        />
        <input
          type="number"
          placeholder="Max"
          value={maxVal}
          min={minVal + 500}
          max={MAX_PRICE}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + 500);
            setMaxVal(Math.min(val, MAX_PRICE));
          }}
          className="h-10 px-3 rounded-xl border border-border bg-background/80 text-xs font-bold outline-none focus:border-secondary w-full"
        />
      </div>

      {/* Dual-handle track */}
      <div className="relative h-1.5 rounded-full bg-border mx-1">
        {/* Active fill */}
        <div
          className="absolute h-full rounded-full bg-secondary"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={500}
          value={minVal}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - 500);
            setMinVal(val);
          }}
          className="price-thumb"
        />

        {/* Max thumb */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={500}
          value={maxVal}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + 500);
            setMaxVal(val);
          }}
          className="price-thumb"
        />
      </div>

      <style>{`
        .price-thumb {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          pointer-events: all;
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }
        .price-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid var(--color-secondary, #6fba44);
          box-shadow: 0 1px 6px rgba(0,0,0,0.18);
          cursor: grab;
          pointer-events: all;
        }
        .price-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid var(--color-secondary, #6fba44);
          box-shadow: 0 1px 6px rgba(0,0,0,0.18);
          cursor: grab;
          pointer-events: all;
        }
        .price-thumb:last-of-type { z-index: 1; }
      `}</style>
    </div>
  );
};

export default PriceRangeFilter;