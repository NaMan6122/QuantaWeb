import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Construction, CheckCircle2, Clock, Mail, Linkedin, Github, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MorphGeoBg = lazy(() => import('../components/MorphGeoBg'));

type Status = 'active' | 'soon' | 'planned';

interface Feature {
  title: string;
  status: Status;
  eta: string;
  description: string;
  details: string[];
}

const features: Feature[] = [
  {
    title: 'Speculative Decoding',
    status: 'active',
    eta: 'Phase 1 — v2.1 / Phase 2 — v2.2',
    description:
      'Improve token generation throughput by 1.3-2.5x using speculative decoding. Phase 1 (N-gram self-speculation) requires no extra model and targets 1.3-1.5x speedup. Phase 2 (draft model speculation) pairs a 0.5B-1B draft model for 1.8-2.5x speedup.',
    details: [
      'N-gram self-speculation via ngram-mod + ngram-simple — no additional model download',
      'Phase 2: paired draft model (e.g., Llama-3.2-1B for Llama 3.x) with auto-disable if acceptance rate drops below 40%',
      'Preserves identical output quality — verified via byte-for-byte equivalence tests',
      '<10MB memory overhead for Phase 1, auto-fallback to standard decoding',
    ],
  },
  {
    title: 'Model Hub — In-App Downloader',
    status: 'active',
    eta: 'v2.1 target',
    description:
      'Browse, filter, and download GGUF and ONNX models directly from HuggingFace — no file manager, no browser. Curated model browser with size and compatibility checks.',
    details: [
      'HuggingFace Hub search with GGUF + ONNX tag filter and quantization filters (Q4_K_M, Q8_0, etc.)',
      'Device fit indicator: "Fits in RAM" / "May be slow" / "Too large" based on SoC + RAM',
      'Background download manager with progress, pause/resume, and notifications',
      'Auto-scan of downloaded models into the library',
    ],
  },
  {
    title: 'Preset Profiles',
    status: 'soon',
    eta: 'v2.1 target',
    description:
      'One-tap parameter presets ("Creative", "Precise", "Balanced", "Code") that configure all sampling parameters at once. Save custom presets with per-model defaults.',
    details: [
      'P0: Four built-in presets — Creative (temp 1.2), Balanced (temp 0.7), Precise (temp 0.3), Code (temp 0.2)',
      'P1: Save custom named presets, per-model defaults, JSON import/export',
      'Horizontal chip row in Playground with active preset highlighted and "Custom" shown on parameter deviation',
    ],
  },
  {
    title: 'Context Window Visualizer',
    status: 'soon',
    eta: 'v2.1 target',
    description:
      'Real-time visual indicator of context window consumption with color-coded progress bar, warnings at 80% usage, and per-turn token breakdown in chat mode.',
    details: [
      'P0: Horizontal progress bar — Green (<50%), Yellow (50-80%), Red (>80%) with warning toast at 80%',
      'P1: Segment visualization per turn, estimated turns remaining, auto-summarize suggestion',
      'Built into the Chat screen as a thin bar below the top bar with pulsing animation at limit',
    ],
  },
  {
    title: 'Export & Share',
    status: 'soon',
    eta: 'v2.1 target',
    description:
      'Export chat sessions, inference outputs, and benchmark results in Markdown, JSON, or plain text — shared via Android\'s share sheet or saved to device storage.',
    details: [
      'P0: One-tap chat export as Markdown, single output as text, native share intent, copy to clipboard',
      'P1: Direct save to storage, selective turn inclusion, metadata (model, settings, timestamps)',
      'JSON export includes session_id, model, created_at, per-turn tokens and latency',
    ],
  },
  {
    title: 'Benchmarks Tab',
    status: 'soon',
    eta: 'v2.2 target',
    description:
      'Dedicated bottom nav tab for running standardized inference benchmarks across loaded models. Compare speed and quality metrics with visual charts.',
    details: [
      'Predefined benchmark suites: short Q&A, long-form, code, reasoning — with tokens/sec, TTFT, peak memory',
      'Persistent results (last 50 runs) with bar/line chart comparisons',
      'Custom prompts, perplexity-like quality scoring, JSON/CSV export',
    ],
  },
  {
    title: 'Prompt Playground — A/B Comparison',
    status: 'soon',
    eta: 'v2.2 target',
    description:
      'Side-by-side inference comparison tool for testing the same prompt with different settings or configurations. Rapid A/B testing for prompt engineering and parameter tuning.',
    details: [
      'P0: 2-panel split view with independent config slots, shared prompt, one-tap "Run Both"',
      'Diff highlighting to show where outputs diverge between configurations',
      'P1: 4-panel comparison mode (2x2 on tablets), comparison history, thumbs up/down rating',
    ],
  },
  {
    title: 'Voice Mode',
    status: 'planned',
    eta: 'v2.2 target',
    description:
      'Speech-to-text input and text-to-speech output for hands-free LLM interaction. Built on Android\'s SpeechRecognizer and TextToSpeech engines.',
    details: [
      'P0: Mic button in chat bar, offline speech recognition, TTS playback with waveform animation',
      'P1: Continuous walkie-talkie mode, language selection, streaming sentence-by-sentence TTS',
      'P2: Wake word ("Hey Quanta"), on-device Whisper integration, custom TTS voice',
    ],
  },
  {
    title: 'Batch Inference',
    status: 'planned',
    eta: 'v2.2 target',
    description:
      'Process multiple prompts sequentially and export results as CSV/JSON. Designed for researchers, content creators, and developers evaluating models on large prompt sets.',
    details: [
      'Import prompts via paste (newline-separated) or file (.txt/.csv) with progress bar and ETA',
      'Template variables ({{variable}} syntax), retry failed prompts, settings lock per batch',
      'Long-running batches survive screen-off via Service/WorkManager',
    ],
  },
  {
    title: 'RAG / Document Grounding',
    status: 'planned',
    eta: 'Research phase',
    description:
      'Load PDF, TXT, and Markdown documents as context for question-answering and summarization. Semantic retrieval over local files — no cloud, no upload.',
    details: [
      'P0: Import PDF/TXT/MD, chunk and index locally, prepend top-K relevant chunks to prompt',
      'P1: Semantic search via on-device embeddings or TF-IDF with source attribution',
      'Dedicated small GGUF embedding model for retrieval, multi-document cross-retrieval',
    ],
  },
  {
    title: 'API Server Mode',
    status: 'planned',
    eta: 'Research phase',
    description:
      'Expose the locally loaded model as an OpenAI-compatible REST API on the device. Other apps, scripts, and automation tools can use the on-device LLM via standard endpoints.',
    details: [
      'Lightweight HTTP server (Ktor/NanoHTTPD) on configurable port (default 8080)',
      'OpenAI-compatible: POST /v1/completions, POST /v1/chat/completions, GET /v1/models with SSE',
      'Optional bearer token auth, CORS headers, persistent notification while active',
    ],
  },
  {
    title: 'Multimodal Support (Vision)',
    status: 'planned',
    eta: 'Research phase',
    description:
      'Extend inference to vision-language models (VLMs) such as LLaVA and Moondream. Attach images to prompts for on-device visual reasoning — no cloud, no upload.',
    details: [
      'Targeting LLaVA-1.5 and Moondream2 via llama.cpp multimodal support',
      'CLIP visual encoder pipeline for image processing',
      'On-device only — images never leave the device',
    ],
  },
];

const statusConfig: Record<Status, { label: string; color: string; icon: typeof Construction }> = {
  active: { label: 'In Development', color: 'text-primary border-primary/30 bg-primary/5', icon: Construction },
  soon: { label: 'Coming Soon', color: 'text-secondary border-secondary/30 bg-secondary/5', icon: Clock },
  planned: { label: 'Planned', color: 'text-on-surface-variant border-outline-variant/40 bg-surface-container-high', icon: CheckCircle2 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function RoadmapPage() {
  return (
    <>
      <Helmet>
        <title>Roadmap & Contact — QuantaLLM</title>
        <meta name="description" content="See what's next for QuantaLLM — in-app model downloader, multimodal vision, prompt templates, guardrails, and more. Get in touch with the developer." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/roadmap" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/roadmap" />
        <meta property="og:title" content="Roadmap & Contact — QuantaLLM" />
        <meta property="og:description" content="Active development, upcoming features, and how to reach the developer behind QuantaLLM." />
      </Helmet>
      <Navbar />
      <main className="relative min-h-screen bg-[#000000] pt-28 pb-24 px-6">
        <Suspense fallback={null}>
          <MorphGeoBg />
        </Suspense>

        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20"
          >
            <span className="text-[10px] font-mono text-primary/80 border border-primary/30 rounded-full px-3 py-1 tracking-widest uppercase mb-6 inline-block">
              What's Being Built
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              Roadmap
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
              QuantaLLM is actively developed by a single engineer. Below is an honest, detailed look at what's in progress, what's next, and what's planned further out.
            </p>
          </motion.div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-14">
            {(Object.entries(statusConfig) as [Status, typeof statusConfig[Status]][]).map(([, cfg]) => (
              <span key={cfg.label} className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
                <cfg.icon className="w-3 h-3" />
                {cfg.label}
              </span>
            ))}
          </div>

          {/* Feature cards */}
          <div className="space-y-6 mb-32">
            {features.map((f, i) => {
              const cfg = statusConfig[f.status];
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface-container border border-outline-variant/15 rounded-xl p-8 hover:border-outline-variant/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <h2 className="font-headline text-xl font-bold text-white">{f.title}</h2>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-on-surface-variant font-mono">{f.eta}</span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-5">{f.description}</p>
                  <ul className="space-y-2">
                    {f.details.map((d) => (
                      <li key={d} className="flex items-start gap-2.5 text-sm text-on-surface-variant/70">
                        <ChevronRight className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-t border-outline-variant/15 pt-20"
          >
            <span className="text-[10px] font-mono text-secondary/80 border border-secondary/30 rounded-full px-3 py-1 tracking-widest uppercase mb-6 inline-block">
              Get in Touch
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">
              Let's Talk
            </h2>
            <p className="text-on-surface-variant text-base max-w-xl leading-relaxed mb-10">
              Whether you're interested in the Developer tier, want to discuss a use case, have a feature idea, or just want to follow the project — reach out directly. QuantaLLM is built by one person and I read every message.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <a
                href="mailto:namang2510@gmail.com"
                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-high transition-all text-white font-medium text-sm group"
              >
                <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                namang2510@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/in/namangupta2510/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-secondary/30 hover:bg-surface-container-high transition-all text-white font-medium text-sm group"
              >
                <Linkedin className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                Naman Gupta
              </a>
              <a
                href="https://github.com/NaMan6122"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-white/20 hover:bg-surface-container-high transition-all text-white font-medium text-sm group"
              >
                <Github className="w-5 h-5 text-white/70 group-hover:scale-110 transition-transform" />
                github.com/NaMan6122
              </a>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  );
}
