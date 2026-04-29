import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import Fuse from 'fuse.js';

/* ------------------------------------------------------------------ */
/*  Search index                                                       */
/* ------------------------------------------------------------------ */

interface SearchEntry {
  title: string;
  path: string;
  section: string;
  keywords: string;
}

const searchData: SearchEntry[] = [
  {
    title: 'Introduction',
    path: '/docs',
    section: 'Getting Started',
    keywords: 'overview welcome what is quantallm about introduction getting started',
  },
  {
    title: 'Installation & First Inference',
    path: '/docs/getting-started',
    section: 'Getting Started',
    keywords: 'install setup download apk model load first inference system requirements android permissions storage',
  },
  {
    title: 'Architecture Overview',
    path: '/docs/architecture',
    section: 'Architecture',
    keywords: 'MVVM ViewModel managers ModelLifecycleManager HexagonConfigManager DefaultModeOrchestrator ChatModeService StateFlow layers repository pattern thread safety',
  },
  {
    title: 'Inference Engines',
    path: '/docs/inference-engines',
    section: 'Architecture',
    keywords: 'InferenceEngine LlamaCppEngine OnnxRuntimeEngine ModelEngine singleton strategy pattern JNI streaming tokens generate load release backend',
  },
  {
    title: 'Hexagon NPU Acceleration',
    path: '/docs/hexagon-npu',
    section: 'Hardware',
    keywords: 'Hexagon DSP HTP Qualcomm Snapdragon NPU FastRPC GGML backend v68 v73 v75 v79 v81 SoC 8 Gen 2 3 Elite NDEV NHVX environment variables offload',
  },
  {
    title: 'ARM64 & Native Layer',
    path: '/docs/native-layer',
    section: 'Hardware',
    keywords: 'JNI llama_jni.cpp C++ NDK CMake compiler flags armv8 dotprod i8mm bf16 fp16 LTO 16KB page size NEON SIMD native libraries',
  },
  {
    title: 'AIDL Cross-App Service',
    path: '/docs/aidl-service',
    section: 'Integration',
    keywords: 'AIDL ILlamaInference IInferenceCallback IPC bind service cross-app foreground service async sync generation lifecycle security permissions',
  },
  {
    title: 'Model Formats',
    path: '/docs/model-formats',
    section: 'Integration',
    keywords: 'GGUF ONNX quantization Q4_K_M Q2 Q3 Q4 Q5 Q6 Q8 IQ architecture llama mistral phi gemma scanning model repository huggingface download',
  },
  {
    title: 'API Reference',
    path: '/docs/api-reference',
    section: 'Reference',
    keywords: 'API InferenceEngine ModelEngine LlamaJni GenerationConfig sampling parameters temperature top_p top_k repeat_penalty InferenceBackend LlamaUiState error codes JSON',
  },
  {
    title: 'Build from Source',
    path: '/docs/build-from-source',
    section: 'Reference',
    keywords: 'build gradle NDK CMake clone compile signing debug release llama.cpp ONNX Runtime native libs troubleshooting CI',
  },
];

const fuse = new Fuse(searchData, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'section', weight: 1 },
    { name: 'keywords', weight: 2 },
  ],
  threshold: 0.4,
  includeScore: true,
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = query.length > 0 ? fuse.search(query).slice(0, 8) : [];

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  // Keyboard shortcut: / to open, Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && !open && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        close();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function goTo(path: string) {
    navigate(path);
    close();
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high/50 border border-white/5 text-on-surface-variant text-sm hover:border-white/10 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-body">Search docs...</span>
        <kbd className="hidden sm:inline text-[10px] font-mono bg-surface-container px-1.5 py-0.5 rounded border border-white/10 text-on-surface-variant/60">
          /
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={close}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] px-4"
            >
              <div className="bg-surface-container-high border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="flex-1 bg-transparent text-white font-body text-sm outline-none placeholder:text-on-surface-variant/50"
                  />
                  <button onClick={close} className="text-on-surface-variant hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[340px] overflow-y-auto">
                  {query.length === 0 && (
                    <div className="px-4 py-8 text-center text-on-surface-variant/50 text-sm font-body">
                      Type to search across all documentation pages
                    </div>
                  )}
                  {query.length > 0 && results.length === 0 && (
                    <div className="px-4 py-8 text-center text-on-surface-variant/50 text-sm font-body">
                      No results for "{query}"
                    </div>
                  )}
                  {results.map(({ item }) => (
                    <button
                      key={item.path}
                      onClick={() => goTo(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container text-left transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-headline text-sm font-semibold text-white truncate">
                          {item.title}
                        </p>
                        <p className="font-body text-xs text-on-surface-variant truncate">
                          {item.section}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant/30 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] font-mono text-on-surface-variant/40">
                  <span><kbd className="px-1 py-0.5 rounded border border-white/10 mr-1">↵</kbd> to select</span>
                  <span><kbd className="px-1 py-0.5 rounded border border-white/10 mr-1">esc</kbd> to close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
