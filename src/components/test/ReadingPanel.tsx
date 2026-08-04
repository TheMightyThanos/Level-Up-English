import { BookOpen, Minus, Plus } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';

interface ReadingPanelProps {
  title: string;
  text: string;
  highlight?: string;
  highlightLine?: number;
  /** Bumping this value re-triggers the scroll/highlight pulse (e.g. on answer select). */
  pulseKey?: string | number;
}

const FONT_SIZES = [13, 14, 15, 16, 18, 20, 22];

export default function ReadingPanel({ title, text, highlight, highlightLine, pulseKey }: ReadingPanelProps) {
  // Default size: a touch bigger on small screens
  const [sizeIdx, setSizeIdx] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 3; // 16px
    return 2; // 15px
  });
  const fontSize = FONT_SIZES[sizeIdx];

  // Parse text into academic paragraphs separated by blank lines
  const { paragraphs, paragraphMeta } = useMemo(() => {
    const normalized = text.replace(/\r/g, '');
    const blocks = normalized.split(/\n{2,}/);
    const result: string[] = [];
    const meta: { startLine: number; endLine: number }[] = [];
    let lineCounter = 0;

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) continue;
      const startLine = lineCounter + 1;
      lineCounter += lines.length;
      result.push(lines.join(' '));
      meta.push({ startLine, endLine: lineCounter });
    }

    return { paragraphs: result, paragraphMeta: meta };
  }, [text]);

  // Case-insensitive matcher for the highlight phrase.
  // Uses word-boundaries (\b) when the term starts/ends with a word character so
  // that asking to highlight "catch" does NOT also highlight "catches" or "catching".
  // Only the FIRST occurrence in the passage is marked (see assignedFirstMark below).
  const highlightRegex = useMemo(() => {
    if (!highlight) return null;
    const trimmed = highlight.trim();
    if (!trimmed) return null;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const isWord = /^\w/.test(trimmed) && /\w$/.test(trimmed);
    const pattern = isWord ? `\\b${escaped}\\b` : escaped;
    return new RegExp(`(${pattern})`, 'gi');
  }, [highlight]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const firstMarkRef = useRef<HTMLSpanElement | null>(null);
  const paraRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Pulse state — briefly flash the active paragraph when triggered
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setPulse((p) => p + 1);
  }, [highlight, highlightLine, pulseKey]);

  // Auto-scroll to the paragraph containing the target line first, otherwise the first quoted match
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;

      let targetEl: HTMLElement | null = null;

      if (highlightLine !== undefined && highlightLine !== null) {
        const paraIdx = paragraphMeta.findIndex(
          (m) => m.startLine <= highlightLine && m.endLine >= highlightLine
        );
        if (paraIdx >= 0 && paraRefs.current.get(paraIdx)) {
          targetEl = paraRefs.current.get(paraIdx) as HTMLElement;
        }
      }

      if (!targetEl && firstMarkRef.current) {
        targetEl = firstMarkRef.current;
      }

      if (!targetEl) return;

      const cTop = container.getBoundingClientRect().top;
      const tTop = targetEl.getBoundingClientRect().top;
      container.scrollBy({ top: tTop - cTop - 80, behavior: 'smooth' });
    });
  }, [highlightRegex, highlightLine, sizeIdx, pulseKey, paragraphMeta]);

  // Reset the first-mark tracker each render
  let assignedFirstMark = false;

  function renderParagraph(paragraphText: string) {
    if (!highlightRegex) return paragraphText;
    const parts = paragraphText.split(highlightRegex);
    return parts.map((part, i) => {
      // Reset lastIndex before each .test() call (g flag carries state).
      highlightRegex.lastIndex = 0;
      const matches = highlightRegex.test(part);
      highlightRegex.lastIndex = 0;
      if (matches) {
        // Only the FIRST occurrence in the entire passage gets highlighted.
        if (assignedFirstMark) return <span key={i}>{part}</span>;
        assignedFirstMark = true;
        return (
          <mark
            key={i}
            ref={firstMarkRef}
            className="bg-yellow-200/80 dark:bg-yellow-500/80 text-yellow-900 dark:text-yellow-950 rounded px-1 py-0.5 font-semibold shadow-sm"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-accent to-muted border-b lg:border-b-0 lg:border-r border-border flex flex-col min-h-0">
      {/* Header */}
      <div className="p-3 sm:p-5 bg-card border-b border-border flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <BookOpen className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-lg font-display font-bold text-foreground leading-snug sm:leading-tight line-clamp-2 sm:truncate">{title}</h2>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 block">
              {highlightLine ? `Jumping to relevant section` : 'Read the passage carefully'}
            </p>
          </div>
        </div>

        {/* A- / A+ font-size controls */}
        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 flex-shrink-0 self-start sm:self-auto">
          <button
            type="button"
            aria-label="Decrease text size"
            onClick={() => setSizeIdx((i) => Math.max(0, i - 1))}
            disabled={sizeIdx === 0}
            className="p-1.5 rounded-md hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground w-7 text-center">A {fontSize}</span>
          <button
            type="button"
            aria-label="Increase text size"
            onClick={() => setSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            disabled={sizeIdx === FONT_SIZES.length - 1}
            className="p-1.5 rounded-md hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto reading-scroll">
        <div className="py-3 sm:py-6 px-4 sm:px-8">
          {paragraphs.map((para, idx) => {
            const meta = paragraphMeta[idx];
            const isActive =
              highlightLine !== undefined &&
              highlightLine !== null &&
              meta.startLine <= highlightLine &&
              meta.endLine >= highlightLine;
            const isMultipleOf5 = meta.startLine % 5 === 0;

            return (
              <div
                key={idx}
                ref={(el) => {
                  paraRefs.current.set(idx, el);
                }}
                className={`flex group transition-colors duration-300 rounded-md ${
                  isActive ? 'bg-yellow-100/70 dark:bg-yellow-500/10 ring-1 ring-yellow-300/60 dark:ring-yellow-500/30' : ''
                }`}
              >


                {/* Paragraph content */}
                <p
                  className={`reading-line flex-1 text-justify indent-8 leading-relaxed mb-4 py-[1px] rounded-sm transition-colors duration-150 ${
                    isActive ? '' : 'group-hover:bg-primary/[0.03] dark:group-hover:bg-primary/[0.08]'
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {renderParagraph(para)}
                </p>
              </div>
            );
          })}
        </div>
        {/* Pulse marker — unused visually but keeps render reactive */}
        <span className="sr-only">{pulse}</span>
      </div>
    </div>
  );
}
