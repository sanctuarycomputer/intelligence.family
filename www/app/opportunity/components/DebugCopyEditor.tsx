'use client';

import { useEffect, useRef, useState } from 'react';

type Entry = { el: HTMLElement; page: string; label: string; original: string };

// Module-level so the React Compiler treats the DOM writes as external to
// the component (mutating ref contents inside a handler trips its lint).
function restoreOriginals(list: Entry[]) {
  for (const e of list) {
    e.el.textContent = e.original;
  }
}

const LAYOUT_VARIANTS = [
  'Statement',
  'Statement (splash)',
  'BigStat',
  'Split',
  'Split (flipped)',
  'EvidenceGrid',
  'DiagramPage',
  'Ledger',
  'Cards',
  'Cards (3-col)',
] as const;

/**
 * Live copy-editing tool, mounted only when the URL carries ?debug=true.
 * Every text block inside the deck pages becomes contentEditable; the Copy
 * button writes an OLD/NEW diff of everything touched (plus any requested
 * layout-variant changes) to the clipboard so the edits can be pasted back
 * and applied to the source files. Layout picks are recorded, not
 * live-previewed: slides are pre-composed components.
 */
export default function DebugCopyEditor({
  refreshKey,
}: {
  refreshKey: string;
}) {
  const entries = useRef<Entry[]>([]);
  const layoutPicks = useRef<Map<string, string>>(new Map());
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('1');
  const [, forceRender] = useState(0);

  useEffect(() => {
    // Wait a frame so the (un)locked page list has rendered before scanning.
    const raf = requestAnimationFrame(() => {
      for (const e of entries.current) {
        const el = e.el;
        el.removeAttribute('contenteditable');
        el.classList.remove('debug-editable');
      }
      entries.current = [];
      const sections = document.querySelectorAll<HTMLElement>(
        'section[id^="page-"]'
      );
      sections.forEach(section => {
        const page = section.id.replace('page-', '');
        const targets = section.querySelectorAll<HTMLElement>(
          'h1, h2, h3, h4, p, figcaption, li'
        );
        let i = 0;
        targets.forEach(target => {
          const el = target;
          const text = el.textContent ?? '';
          if (!text.trim()) return;
          i += 1;
          try {
            // Chrome/Safari support plaintext-only, which keeps pasted markup out.
            el.contentEditable = 'plaintext-only';
          } catch {
            el.contentEditable = 'true';
          }
          el.classList.add('debug-editable');
          el.spellcheck = false;
          entries.current.push({
            el,
            page,
            label: `${el.tagName.toLowerCase()} #${i}`,
            original: text,
          });
        });
      });
      setCount(entries.current.length);
    });
    return () => cancelAnimationFrame(raf);
  }, [refreshKey]);

  // Track which slide is in view so the layout picker targets it.
  useEffect(() => {
    const deck = document.querySelector('.deck');
    if (!deck) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let best: { page: string; dist: number } | null = null;
        document
          .querySelectorAll<HTMLElement>('section[id^="page-"]')
          .forEach(section => {
            const dist = Math.abs(section.getBoundingClientRect().top);
            if (!best || dist < best.dist) {
              best = { page: section.id.replace('page-', ''), dist };
            }
          });
        if (best) setCurrentPage((best as { page: string }).page);
      });
    };
    onScroll();
    deck.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      deck.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [refreshKey]);

  const changed = () =>
    entries.current.filter(
      e => (e.el.textContent ?? '').trim() !== e.original.trim()
    );

  const copy = async () => {
    const edits = changed();
    const picks = [...layoutPicks.current.entries()];
    if (edits.length === 0 && picks.length === 0) {
      setCopied('No edits yet');
      setTimeout(() => setCopied(null), 1500);
      return;
    }
    const lines = ['COPY EDITS from /opportunity?debug=true', ''];
    for (const e of edits) {
      lines.push(`[page ${e.page} · ${e.label}]`);
      lines.push(`OLD: ${e.original.trim()}`);
      lines.push(`NEW: ${(e.el.textContent ?? '').trim()}`);
      lines.push('');
    }
    for (const [page, variant] of picks) {
      lines.push(`[page ${page} · layout]`);
      lines.push(`NEW LAYOUT: ${variant}`);
      lines.push('');
    }
    await navigator.clipboard.writeText(lines.join('\n'));
    const n = edits.length + picks.length;
    setCopied(`Copied ${n} edit${n === 1 ? '' : 's'}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    restoreOriginals(entries.current);
    layoutPicks.current.clear();
    forceRender(v => v + 1);
    setCopied('Reset');
    setTimeout(() => setCopied(null), 1200);
  };

  const pickLayout = (variant: string) => {
    if (variant === '') {
      layoutPicks.current.delete(currentPage);
    } else {
      layoutPicks.current.set(currentPage, variant);
    }
    forceRender(v => v + 1);
  };

  return (
    <div className="debug-bar" role="toolbar" aria-label="Copy editor">
      <span className="debug-bar-hint">
        debug · p{currentPage} · click text to edit ({count})
      </span>
      <label className="debug-bar-hint">
        layout{' '}
        <select
          value={layoutPicks.current.get(currentPage) ?? ''}
          onChange={e => pickLayout(e.target.value)}
        >
          <option value="">(keep)</option>
          {LAYOUT_VARIANTS.map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={copy}>
        {copied ?? 'Copy edits'}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </div>
  );
}
