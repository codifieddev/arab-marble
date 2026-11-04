import type { ScreenSize } from './store';

export const getScreenSize = (width: number): ScreenSize => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const getCssSelector = (el: Element): string => {
  if (el.tagName.toLowerCase() === 'body') return 'body';
  if (el.id) return `#${el.id}`;
    
  if (el.hasAttribute('data-annotate-id')) {
    return `[data-annotate-id="${el.getAttribute('data-annotate-id')}"]`;
  }

  // 1. Try to find a unique class in the entire document for absolute stability
  const classes = Array.from(el.classList)
    .filter(c => !['hover', 'active', 'focus', 'selected', 'opacity', 'transition', 'duration', 'ease', 'text-', 'bg-', 'p-', 'm-', 'flex', 'grid', 'w-', 'h-', 'top-', 'left-', 'right-', 'bottom-', 'inset-', 'z-'].some(token => c.includes(token)) && c.length > 2);
    
  for (const cls of classes) {
    if (document.getElementsByClassName(cls).length === 1) {
      return `.${CSS.escape(cls)}`;
    }
  }

  const path: string[] = [];
  let current: Element | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
        
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    } else if (current.hasAttribute('data-annotate-id')) {
      selector += `[data-annotate-id="${current.getAttribute('data-annotate-id')}"]`;
      path.unshift(selector);
      break;
    } else {
      // Add classes for robustness (filtering out common utility/state classes)
      const currentClasses = Array.from(current.classList)
        .filter(c => !['hover', 'active', 'focus', 'selected', 'opacity', 'transition', 'duration', 'ease', 'text-', 'bg-', 'z-', 'top-', 'left-', 'right-', 'bottom-', 'inset-'].some(token => c.includes(token)));
      
      if (currentClasses.length > 0) {
        selector += `.${currentClasses.map(c => CSS.escape(c)).join('.')}`;
      }

      let sib = current.previousElementSibling;
      let nth = 1;
      while (sib) {
        if (sib.nodeName.toLowerCase() === current.nodeName.toLowerCase()) nth++;
        sib = sib.previousElementSibling;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    current = current.parentElement;
  }
  return path.join(' > ');
};

export const resolveTargetElement = (selector?: string): Element | null => {
  if (!selector) return null;

  try {
    return document.querySelector(selector);
  } catch {
    // Recover older stored class selectors like ".z-[9998]" that are invalid for querySelector.
    if (selector.startsWith('.') && !selector.includes(' ') && !selector.includes('>')) {
      const className = selector.slice(1);
      return document.getElementsByClassName(className)[0] ?? null;
    }
    return null;
  }
};

export const isPointVisible = (x: number, y: number, element: Element): boolean => {
  let current: Element | null = element.parentElement;
    
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    if (
      overflowY === 'hidden' || overflowY === 'scroll' || overflowY === 'auto' ||
      overflowX === 'hidden' || overflowX === 'scroll' || overflowX === 'auto'
    ) {
      const rect = current.getBoundingClientRect();
      if (
        x < rect.left ||
        x > rect.right ||
        y < rect.top ||
        y > rect.bottom
      ) {
        return false;
      }
    }
    current = current.parentElement;
  }
  return true;
};
