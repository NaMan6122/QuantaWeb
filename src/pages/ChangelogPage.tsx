import { ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Section {
  title: string;
  items: string[];
}

interface Release {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  sections: Section[];
}

const releases: Release[] = [
  {
    version: '2.0.0',
    date: '2026-06-15',
    tag: 'major',
    sections: [
      {
        title: 'UI / UX',
        items: [
          'Bottom navigation with 4 tabs: Dashboard, Chat, Playground, Analytics',
          'Dashboard — system health monitor, active model card with real-time metrics, model library, quick actions',
          'Playground tab — full LLM sampling controls: temperature, top-K, top-P, min-P, repeat/frequency/presence penalties, seed',
          'Analytics tab — live token speed chart with pinch-to-zoom, inference history, backend telemetry',
          'Theme system: System/Dark/Light with Material You theming',
          'Prompt library with auto-detected chat templates from GGUF metadata',
          'Model Explorer — browse scanned models with size, format, and backend compatibility info',
        ],
      },
      {
        title: 'Inference Engines',
        items: [
          'ONNX Runtime CPU Execution Provider — ARM64 NEON vectorized inference alongside llama.cpp',
          'ONNX QNN NPU Execution Provider — NPU offload via Qualcomm AI Engine Direct (Snapdragon)',
          'Quantized ONNX model support alongside GGUF — dual engine architecture, hot-swappable',
          'Hexagon DSP tuning controls: NDEV/NHVX threading, verbose/profiling modes, Safe/Aggressive presets',
        ],
      },
      {
        title: 'Developer',
        items: [
          'QuantaLLM SDK v1.0.0 — inference SDK with license key validation, 3 modules: core, llamacpp, onnx',
          'Developer tier with AIDL cross-app inference API — bind and call from any Android app',
        ],
      },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-05-30',
    tag: 'minor',
    sections: [
      {
        title: 'Playground',
        items: [
          'Collapsible Advanced Sampling section with all sampler parameters (top-K, top-P, min-P, penalties, seed)',
          'Backend selection: CPU, Hexagon, ONNX (CPU), ONNX (QNN/NPU) with auto-capability detection',
          'Hexagon DSP tuning UI with preset system (Safe / Aggressive) and real-time NDEV/NHVX display',
          'Unlimited token mode toggle — open-ended generation using EOG detection',
        ],
      },
      {
        title: 'Analytics',
        items: [
          'Performance Analytics screen with interactive SpeedChart (gesture zoom/pan, tooltips)',
          'Live metrics display: tokens/sec, token count, backend status',
          'Persistent inference history with per-run records',
        ],
      },
      {
        title: 'Chat',
        items: [
          'Multi-turn conversation UI with session management',
          'KV cache retention across turns for instant follow-ups',
          'Per-session system prompts with template auto-detection',
        ],
      },
      {
        title: 'General',
        items: [
          'App-level settings: theme cycling (System/Dark/Light), haptic feedback',
          'ONNX folder import via storage access framework',
        ],
      },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-05-15',
    tag: 'minor',
    sections: [
      {
        title: 'Added',
        items: [
          'ONNX Runtime QNN Execution Provider — NPU offload via Qualcomm AI Engine Direct',
          'Snapdragon HTP backend for ONNX models (v68-v81) — graph-level partitioning with CPU fallback',
          '4-way backend architecture: CPU + Hexagon (llama.cpp) + ONNX CPU + ONNX QNN',
          'Auto-detection of QNN runtime support via ChipsetDetector',
        ],
      },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-05-01',
    tag: 'patch',
    sections: [
      {
        title: 'Added',
        items: [
          'ONNX Runtime CPU Execution Provider — ARM64 NEON vectorized inference',
          'ONNX model directory scanning (.onnx + genai_config.json bundles)',
          'Autoregressive token generation with KV-cache management on ONNX backend',
        ],
      },
      {
        title: 'Internal',
        items: [
          'Experimentation framework for ONNX vs GGUF benchmark comparisons',
        ],
      },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-04-20',
    tag: 'patch',
    sections: [
      {
        title: 'Internal',
        items: [
          'ONNX Runtime (ORT GenAI v0.12.2) integration foundations',
          'Test infrastructure for dual-engine architecture',
          'Native code scaffolding for ONNX session management',
        ],
      },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-04-10',
    tag: 'minor',
    sections: [
      {
        title: 'UI / UX',
        items: [
          'Bottom navigation bar with 4 tabs: Dashboard, Chat, Settings, Analytics',
          'Dashboard screen — system health panel, active model card with live metrics, model library',
          'Model selector dialog with format badges (GGUF/ONNX) and file size display',
          'Theme toggle: System/Dark/Light with Material You dynamic colors',
        ],
      },
      {
        title: 'Added',
        items: [
          'Model Scanner with GGUF + ONNX directory support',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-04-25',
    tag: 'minor',
    sections: [
      {
        title: 'Added',
        items: [
          'Dual inference engine: llama.cpp (stable) + ONNX Runtime foundation',
          'Hexagon NPU acceleration (Snapdragon 8 Gen 2/3/Elite)',
          'AIDL cross-app inference service',
        ],
      },
      {
        title: 'Changed',
        items: [
          'Redesigned MVVM architecture with StateFlow for reactive UI updates',
          'ARM64 native layer with dotprod/i8mm/bf16 optimizations',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-03-15',
    tag: 'minor',
    sections: [
      {
        title: 'Added',
        items: [
          'GGUF model scanning and metadata extraction',
          'Streaming token generation with sampling parameters',
        ],
      },
      {
        title: 'Changed',
        items: [
          'Improved memory management for large models',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-20',
    tag: 'minor',
    sections: [
      {
        title: 'Added',
        items: [
          'Model download from HuggingFace repositories',
          'Chat history persistence with SQLite',
          'Dark/light theme support following Material You',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2025-11-10',
    tag: 'major',
    sections: [
      {
        title: 'Added',
        items: [
          'Initial release with llama.cpp backend',
          'Basic chat interface with GGUF model support',
          'ARM64 NEON SIMD acceleration',
        ],
      },
    ],
  },
];

const tagColors: Record<string, string> = {
  major: 'bg-primary/15 text-primary',
  minor: 'bg-emerald-500/15 text-emerald-400',
  patch: 'bg-blue-500/15 text-blue-400',
};

const GITHUB_URL = "https://github.com/NaMan6122/QuantaLLM2";

export default function ChangelogPage() {
  return (
    <>
      <Helmet>
        <title>Changelog — QuantaLLM Version History</title>
        <meta name="description" content="QuantaLLM version history — from v1.0 initial release to v2.0 with ONNX QNN NPU, Playground, Analytics, and the QuantaLLM SDK." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/changelog" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/changelog" />
        <meta property="og:title" content="Changelog — QuantaLLM Version History" />
        <meta property="og:description" content="QuantaLLM version history — from v1.0 initial release to v2.0 with ONNX QNN NPU acceleration and the QuantaLLM SDK." />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-[#000000] pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">Changelog</h1>
              <p className="text-on-surface-variant text-base">What's new in QuantaLLM.</p>
            </div>
            <a
              href={`${GITHUB_URL}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              GitHub Releases <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="relative border-l border-white/10 ml-3">
            {releases.map((r) => (
              <div key={r.version} className="relative pl-8 pb-12 last:pb-0">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary -translate-x-[5px]" />

                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-headline text-xl font-bold text-white">v{r.version}</h2>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${tagColors[r.tag]}`}>
                    {r.tag}
                  </span>
                  <span className="text-xs text-on-surface-variant/50 font-mono">{r.date}</span>
                </div>

                <div className="space-y-4">
                  {r.sections.map((s) => (
                    <div key={s.title}>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                        {s.title}
                      </h3>
                      <ul className="space-y-1.5">
                        {s.items.map((c) => (
                          <li key={c} className="text-sm text-on-surface-variant flex gap-2">
                            <span className="text-primary mt-1 shrink-0">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
