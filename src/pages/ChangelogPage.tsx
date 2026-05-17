import { ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Release {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  changes: string[];
}

const releases: Release[] = [
  {
    version: '1.3.0',
    date: '2026-04-25',
    tag: 'minor',
    changes: [
      'Dual inference engine: llama.cpp (stable) + ONNX Runtime (coming soon)',
      'Hexagon NPU acceleration (Snapdragon 8 Gen 2/3/Elite)',
      'AIDL cross-app inference service',
      'Redesigned MVVM architecture with StateFlow',
      'ARM64 native layer with dotprod/i8mm/bf16 optimizations',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-03-15',
    tag: 'minor',
    changes: [
      'Added GGUF model scanning and metadata extraction',
      'Streaming token generation with sampling parameters',
      'Improved memory management for large models',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-20',
    tag: 'minor',
    changes: [
      'Added model download from HuggingFace repositories',
      'Chat history persistence with SQLite',
      'Dark/light theme support following Material You',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-11-10',
    tag: 'major',
    changes: [
      'Initial release with llama.cpp backend',
      'Basic chat interface with GGUF model support',
      'ARM64 NEON SIMD acceleration',
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
        <meta name="description" content="QuantaLLM version history — from v1.0 initial release to v2.0 with dual inference engines, Hexagon NPU acceleration, and AIDL cross-app service." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/changelog" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/changelog" />
        <meta property="og:title" content="Changelog — QuantaLLM Version History" />
        <meta property="og:description" content="QuantaLLM version history — from v1.0 initial release to v2.0 with dual inference engines and Hexagon NPU acceleration." />
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

                <ul className="space-y-2">
                  {r.changes.map((c) => (
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
      </main>
      <Footer />
    </>
  );
}
