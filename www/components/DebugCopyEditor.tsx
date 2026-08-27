'use client';

import { useEffect, useRef, useState } from 'react';

type Entry = {
  el: HTMLElement;
  section: string;
  label: string;
  original: string;
};

// Module-level so the React Compiler treats the DOM writes as external to
// the component (mutating ref contents inside a handler trips its lint).
function restoreOriginals(list: Entry[]) {
  for (const e of list) {
    e.el.textContent = e.original;
  }
}

/**
 * Live copy-editing tool for flowing (non-deck) pages, mounted only when the
 * URL carries ?debug=true. Every text block inside `scope` becomes
 * contentEditable; the Copy button writes an OLD/NEW diff of everything
 * touched to the clipboard so the edits can be pasted back and applied to
 * the source.
 *
 * The deck at /opportunity has its own editor: it needs slide numbers,
 * layout archetypes and per-slide deletion, none of which apply here.
 */
export default function DebugCopyEditor({
  scope = 'main',
  pageName = 'page',
}: {
  scope?: string;
  pageName?: string;
}) {
  const entries = useRef<Entry[]>([]);
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Wait a frame so the page has painted before scanning.
    const raf = requestAnimationFrame(() => {
      for (const e of entries.current) {
        e.el.removeAttribute('contenteditable');
        e.el.classList.remove('debug-editable');
      }
      entries.current = [];

      const root = document.querySelector<HTMLElement>(scope);
      if (!root) return;

      const targets = root.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, p, li, figcaption, .caption'
      );

      // Headings act as section breaks, so each entry is labelled by the
      // heading it sits under rather than a bare document-wide index.
      let section = '(top)';
      let i = 0;
      targets.forEach(target => {
        const el = target;
        const text = el.textContent ?? '';
        if (!text.trim()) return;

        const isHeading = /^H[1-4]$/.test(el.tagName);
        if (isHeading) {
          section = text.trim();
          i = 0;
        } else {
          i += 1;
        }

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
          section,
          label: isHeading
            ? el.tagName.toLowerCase()
            : `${el.tagName.toLowerCase()} #${i}`,
          original: text,
        });
      });
      setCount(entries.current.length);
    });
    return () => cancelAnimationFrame(raf);
  }, [scope]);

  const changed = () =>
    entries.current.filter(
      e => (e.el.textContent ?? '').trim() !== e.original.trim()
    );

  const copy = async () => {
    const edits = changed();
    if (edits.length === 0) {
      setCopied('No edits yet');
      setTimeout(() => setCopied(null), 1500);
      return;
    }
    const lines = [`COPY EDITS from /${pageName}?debug=true`, ''];
    for (const e of edits) {
      lines.push(`[${e.section} · ${e.label}]`);
      lines.push(`OLD: ${e.original.trim()}`);
      lines.push(`NEW: ${(e.el.textContent ?? '').trim()}`);
      lines.push('');
    }
    await navigator.clipboard.writeText(lines.join('\n'));
    const n = edits.length;
    setCopied(`Copied ${n} edit${n === 1 ? '' : 's'}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    restoreOriginals(entries.current);
    setCopied('Reset');
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="debug-bar" role="toolbar" aria-label="Copy editor">
      <span className="debug-bar-hint">
        debug · click text to edit ({count})
      </span>
      <button type="button" onClick={copy}>
        {copied ?? 'Copy edits'}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </div>
  );
}
