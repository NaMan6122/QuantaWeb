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
    title: 'ONNX Runtime Integration',
    status: 'active',
    eta: 'Final dev phase',
    description:
      'Full support for ONNX model format via ORT GenAI (v0.12.2). Load ONNX models alongside GGUF — same app, dual engine architecture, hot-swappable at runtime.',
    details: [
      'CPU Execution Provider live on ARM64 with NEON vectorization',
      'Directory-based model scanning for .onnx + genai_config.json bundles',
      'Autoregressive token generation with built-in KV-cache management',
      'QNN Execution Provider (Hexagon offload) in integration — Phase 2',
    ],
  },
  {
    title: 'QNN Execution Provider (ONNX + Hexagon)',
    status: 'active',
    eta: 'Phase 2 — post ONNX launch',
    description:
      'Qualcomm Neural Network (QNN) EP for ONNX Runtime will offload graph operations to the Hexagon Tensor Processor on Snapdragon SoCs. This gives ONNX models the same NPU advantage currently available to GGUF via the GGML Hexagon backend.',
    details: [
      'Graph-level partitioning: supported ops go to HTP, rest falls back to CPU EP',
      'Targets Snapdragon 8 Gen 2, Gen 3, and Snapdragon Elite',
      'Expected 2–4× throughput improvement over CPU-only ONNX execution',
      'Requires Qualcomm QNN SDK — bundled in the app, no user setup',
    ],
  },
  {
    title: 'In-App Model Downloader',
    status: 'soon',
    eta: 'v1.4 target',
    description:
      'Browse and download GGUF models directly from within QuantaLLM — no file manager, no browser. Search HuggingFace repositories, preview size and quantization info, and download with progress tracking.',
    details: [
      'HuggingFace Hub search with GGUF tag filter',
      'File size preview and RAM compatibility check before download',
      'Resumable downloads — safe across app restarts',
      'Automatic placement in the scanned model directory',
    ],
  },
  {
    title: 'Developer API (AIDL v2)',
    status: 'soon',
    eta: 'Alongside Developer tier launch',
    description:
      'The second revision of the AIDL cross-app inference interface. Third-party apps bind to QuantaLLM as a background service and call inference without shipping their own model runtime.',
    details: [
      'ILlamaInference v2 with async token streaming via IInferenceCallback',
      'Model lifecycle management: load, unload, swap — from the client app',
      'Permission-gated binding — user approves which apps can use the engine',
      'Full integration guide and sample app in the docs',
    ],
  },
  {
    title: 'Multimodal Support (Vision)',
    status: 'planned',
    eta: 'Research phase',
    description:
      'Extend inference to vision-language models (VLMs) such as LLaVA and Moondream. Users will be able to attach images to prompts and get on-device visual reasoning — no cloud, no upload.',
    details: [
      'Targeting LLaVA-1.5 and Moondream2 initially via llama.cpp multimodal support',
      'Image encoding pipeline with CLIP visual encoder',
      'Prompt template adaptation for image + text interleaved input',
      'On-device only — images never leave the device',
    ],
  },
  {
    title: 'Prompt Templates & System Presets',
    status: 'planned',
    eta: 'v1.5 target',
    description:
      'First-class prompt template management. Ship with built-in templates for common model families (LLaMA 3, Mistral, Phi-3, ChatML) and let users define and save custom system prompts.',
    details: [
      'Auto-detect chat template from GGUF metadata (Jinja2)',
      'Manual override for models with missing or incorrect templates',
      'Saveable system prompt presets per model',
      'Community template sharing format (JSON export/import)',
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
        <meta name="description" content="See what's actively being built in QuantaLLM — ONNX Runtime, QNN acceleration, in-app model downloader, multimodal support, and more. Get in touch with the developer." />
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
