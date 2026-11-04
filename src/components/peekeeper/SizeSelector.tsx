'use client';

export interface SizeOption {
  value: string;
  label: string;
  note?: string;
}

export interface SizeVariant {
  value: string;
  tag: string;
  length?: number;
  waistMin?: number;
  waistMax?: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedTag: string;
  onSelect: (tag: string) => void;
  sizeLabel?: string;
  locale?: string;
  cmsProps?: any;
}

const WAIST_RANGES: Record<string, string> = {
  xs: 'Waist 9"–12"',
  sm: 'Waist 13"–16"',
  med: 'Waist 17"–21"',
};

export default function SizeSelector({
  sizes,
  selectedTag,
  onSelect,
  sizeLabel = 'Size',
}: SizeSelectorProps) {
  const displaySizes = ['xs', 'sm', 'med']
    .map((size) => sizes.find((item) => item.value === size))
    .filter((item): item is SizeOption => Boolean(item));

  const waistText = selectedTag ? WAIST_RANGES[selectedTag.toLowerCase()] : null;

  return (
    <div className="single-product-section" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Size Selection */}
      <div>
        <div className="single-product-label" style={{ marginBottom: 10 }}>
          {sizeLabel}: <strong>{selectedTag ? (displaySizes.find((s) => s.value === selectedTag)?.note || selectedTag.toUpperCase()) : 'Select Size'}</strong>
          {waistText && (
            <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
              ({waistText})
            </span>
          )}
        </div>
        <div className="single-product-sizes">
          {displaySizes.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSelect(s.value)}
              className={`single-product-size-btn ${selectedTag === s.value ? 'active' : ''}`}
              aria-label={`Size ${s.value.toUpperCase()} - ${s.note}`}
              aria-pressed={selectedTag === s.value}
            >
              <span className="single-product-size-tag">{s.value.toUpperCase()}</span>
              <span>{s.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
