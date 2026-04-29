import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState('');
  const { pathname } = useLocation();

  // Extract headings whenever the route changes
  useEffect(() => {
    // Small delay to let content render
    const t = setTimeout(() => {
      const els = document.querySelectorAll('main h2, main h3');
      const items: Heading[] = [];
      els.forEach((el) => {
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ?? '';
        }
        if (el.id) {
          items.push({ id: el.id, text: el.textContent ?? '', level: el.tagName === 'H2' ? 2 : 3 });
        }
      });
      setHeadings(items);
      setActiveId('');
    }, 100);
    return () => clearTimeout(t);
  }, [pathname]);

  // Track which heading is in view
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return (
      <>
        <div className="text-xs font-headline font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-3">
          On this page
        </div>
        <div className="text-sm text-[var(--on-surface-variant)]/50 italic">No headings</div>
      </>
    );
  }

  return (
    <>
      <div className="text-xs font-headline font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-3">
        On this page
      </div>
      <nav className="flex flex-col gap-1.5">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`text-sm transition-colors leading-snug ${
              h.level === 3 ? 'pl-3' : ''
            } ${
              activeId === h.id
                ? 'text-[var(--primary)] font-medium'
                : 'text-[var(--on-surface-variant)]/60 hover:text-[var(--on-surface-variant)]'
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </>
  );
}
