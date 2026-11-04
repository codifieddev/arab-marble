'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';

interface CountUpProps {
  value: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUp({ value, delay = 0, className, style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const rawNumberStr = value.replace(/[^0-9.]/g, '');
  const hasNumbers = rawNumberStr.length > 0;
  const numericPart = hasNumbers ? parseFloat(rawNumberStr) : 0;
  const suffix = value.replace(/[0-9.]/g, '');
  const count = useMotionValue(0);
  const springCount = useSpring(count, { stiffness: 40, damping: 15 });
  const decimalPlaces = (numericPart.toString().split('.')[1] || '').length;
  
  const displayValue = useTransform(springCount, (latest) => {
    if (numericPart >= 1000) return Math.round(latest).toString();
    if (decimalPlaces > 0) return latest.toFixed(decimalPlaces);
    return Math.round(latest).toString();
  });

  useEffect(() => {
    if (inView && !hasAnimated && hasNumbers) {
      setHasAnimated(true);
      const timeout = setTimeout(() => {
        count.set(numericPart);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [inView, hasAnimated, count, numericPart, delay, hasNumbers]);

  if (!hasNumbers) {
    return (
      <span ref={ref} className={className} style={style}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} style={style}>
      <motion.span style={{ display: 'inline-block' }}>
        {displayValue}
      </motion.span>
      {suffix}
    </span>
  );
}
