import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Heart, ExternalLink, Search, ChevronDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

type SortOption = 'downloads' | 'likes' | 'createdAt';

interface HFSibling {
  rfilename: string;
}

interface HFModel {
  id: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag?: string;
  siblings?: HFSibling[];
}

const QUANT_RE = /\b(Q[2-8]_K_[MS]?|Q[2-8]_[0-9]|IQ[1-4]_[A-Z]+|F16|F32)\b/i;
const PAGE_SIZE = 12;

const SORT_LABELS: Record<SortOption, string> = {
  downloads: 'Downloads',
  likes: 'Likes',
  createdAt: 'Newest',
};

// Known noise tags to exclude from tag chips
const SKIP_TAGS = new Set([
  'gguf', 'transformers', 'pytorch', 'safetensors', 'arxiv',
  'license', 'region', 'has_space', 'endpoints_compatible',
  'text-generation-inference', 'conversational',
]);

function extractQuants(siblings: HFSibling[]): string[] {
  const found = new Set<string>();
  for (const s of siblings) {
    if (!s.rfilename.endsWith('.gguf')) continue;
    const m = s.rfilename.match(QUANT_RE);
    if (m) found.add(m[0].toUpperCase());
  }
  return Array.from(found).sort();
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container border border-white/5 rounded-xl p-6 animate-pulse flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-surface-container-high rounded" />
        <div className="h-4 w-4 bg-surface-container-high rounded" />
      </div>
      <div className="h-6 w-3/4 bg-surface-container-high rounded" />
      <div className="h-4 w-1/2 bg-surface-container-high rounded" />
      <div className="flex gap-2 flex-wrap mt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-5 w-14 bg-surface-container-high rounded-full" />
        ))}
      </div>
      <div className="flex gap-4 mt-auto pt-4 border-t border-white/5">
        <div className="h-4 w-20 bg-surface-container-high rounded" />
        <div className="h-4 w-16 bg-surface-container-high rounded" />
      </div>
    </div>
  );
}

interface ModelCardProps {
  model: HFModel;
}

function ModelCard({ model }: ModelCardProps) {
  const [author, name] = model.id.includes('/')
    ? [model.id.split('/')[0], model.id.split('/').slice(1).join('/')]
    : ['', model.id];

  const quants = extractQuants(model.siblings ?? []);

  const displayTags = model.tags
    .filter(t => !SKIP_TAGS.has(t) && !t.includes(':') && t.length < 24)
    .slice(0, 4);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-surface-container border border-white/5 rounded-xl p-6 flex flex-col gap-3 hover:bg-surface-container-high transition-colors group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        {model.pipeline_tag && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">
            {model.pipeline_tag.replace(/-/g, ' ')}
          </span>
        )}
        <a
          href={`https://huggingface.co/${model.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-on-surface-variant hover:text-primary transition-colors shrink-0"
          aria-label="Open on HuggingFace"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Model name */}
      <div>
        <p className="font-headline text-xl font-bold leading-tight break-words">{name || model.id}</p>
        {author && (
          <p className="text-on-surface-variant text-sm mt-0.5 font-mono">{author}/</p>
        )}
      </div>

      {/* Quantization chips */}
      {quants.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quants.map(q => (
            <span
              key={q}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/20"
            >
              {q}
            </span>
          ))}
        </div>
      )}

      {/* Tag chips */}
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map(tag => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-5 mt-auto pt-4 border-t border-white/5 text-on-surface-variant text-sm">
        <span className="flex items-center gap-1.5 font-mono">
          <Download className="w-3.5 h-3.5 text-primary" />
          {formatNum(model.downloads)}
        </span>
        <span className="flex items-center gap-1.5 font-mono">
          <Heart className="w-3.5 h-3.5 text-secondary" />
          {formatNum(model.likes)}
        </span>
      </div>
    </motion.div>
  );
}

export default function Models() {
  const [models, setModels] = useState<HFModel[]>([]);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState<SortOption>('downloads');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchModels = useCallback(async (currentOffset: number, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        filter: 'gguf',
        sort,
        direction: '-1',
        limit: PAGE_SIZE.toString(),
        offset: currentOffset.toString(),
        full: 'true',
      });
      if (debouncedQuery) params.set('search', debouncedQuery);

      const res = await fetch(`https://huggingface.co/api/models?${params}`);
      if (!res.ok) throw new Error(`HuggingFace API error: ${res.status}`);
      const data: HFModel[] = await res.json();

      setModels(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch models.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort, debouncedQuery]);

  // Reset and fetch when sort or search changes
  useEffect(() => {
    setOffset(0);
    setModels([]);
    fetchModels(0, false);
  }, [sort, debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchModels(nextOffset, true);
  };

  const handleRetry = () => fetchModels(offset, false);

  return (
    <section id="models" className="py-32 px-6 md:px-12 bg-[#000000]">
      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-headline text-4xl font-bold tracking-tighter uppercase mb-4 text-primary">
            GGUF Models
          </h2>
          <div className="h-1 w-24 thermal-gradient mb-6" />
          <p className="font-body text-on-surface-variant text-lg max-w-2xl">
            Browse quantized GGUF models from HuggingFace Hub — all compatible with QuantaLLM.
            Browse compatible GGUF models — ready to load when QuantaLLM launches.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              placeholder="Search models..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-surface-container border border-white/10 rounded-lg pl-10 pr-4 py-3 font-body text-sm text-white placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-2 bg-surface-container border border-white/10 rounded-lg px-4 py-3 font-headline text-sm font-bold uppercase tracking-wide hover:border-white/20 transition-colors min-w-[160px] justify-between"
            >
              <span className="text-on-surface-variant text-xs">Sort: </span>
              <span>{SORT_LABELS[sort]}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 bg-surface-container-highest border border-white/10 rounded-lg overflow-hidden z-20 min-w-full shadow-2xl"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map(s => (
                    <button
                      key={s}
                      onClick={() => { setSort(s); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-headline font-bold uppercase tracking-wide transition-colors hover:bg-white/5 ${sort === s ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {SORT_LABELS[s]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-surface-container border border-secondary/20 rounded-xl p-6 mb-8 text-secondary"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-body text-sm flex-1">{error}</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wide hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sort}-${debouncedQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {models.map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty state */}
        {!loading && !error && models.length === 0 && (
          <div className="text-center py-24 text-on-surface-variant font-body">
            No models found for <span className="text-white font-bold">"{debouncedQuery}"</span>
          </div>
        )}

        {/* Load More */}
        {!loading && !error && hasMore && models.length > 0 && (
          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 border border-primary/30 text-primary px-8 py-3 rounded-lg font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              {loadingMore
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                : 'Load More'}
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
