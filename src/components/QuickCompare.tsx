import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Minus, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Mini comparison table ────────────────────────────────────────────────────

type Support = 'yes' | 'no' | 'partial';

interface Row {
  feature: string;
  quantallm: Support;
  mlcllm: Support;
  llamacppAndroid: Support;
}

const rows: Row[] = [
  { feature: 'Runs on Android',       quantallm: 'yes',     mlcllm: 'yes',     llamacppAndroid: 'yes'     },
  { feature: 'Hexagon NPU Support',   quantallm: 'yes',     mlcllm: 'no',      llamacppAndroid: 'no'      },
  { feature: 'GGUF Model Format',     quantallm: 'yes',     mlcllm: 'no',      llamacppAndroid: 'yes'     },
  { feature: 'AIDL Cross-App API',    quantallm: 'yes',     mlcllm: 'no',      llamacppAndroid: 'no'      },
  { feature: 'ONNX Runtime',          quantallm: 'partial', mlcllm: 'no',      llamacppAndroid: 'no'      },
  { feature: '90+ Architectures',     quantallm: 'yes',     mlcllm: 'partial', llamacppAndroid: 'yes'     },
  { feature: 'Streaming Output',      quantallm: 'yes',     mlcllm: 'yes',     llamacppAndroid: 'yes'     },
];

function Cell({ value }: { value: Support }) {
  if (value === 'yes')     return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
  if (value === 'no')      return <X     className="w-4 h-4 text-red-400/60 mx-auto"  />;
  return                          <Minus className="w-4 h-4 text-yellow-400/60 mx-auto" />;
}

// ── Quick install accordion ──────────────────────────────────────────────────

const installSteps = [
  {
    title: '1. Download & install the APK',
    body: 'Tap "Download v1.3.0" above. Open the file from your notifications or Files app. If prompted, enable "Install from unknown sources" under Settings → Security, then tap Install.',
  },
  {
    title: '2. Grant storage permission',
    body: 'Launch QuantaLLM and tap "Scan Models". Allow the storage permission so the app can find GGUF files in your Downloads folder.',
  },
  {
    title: '3. Download a model from Hugging Face',
    body: 'Open huggingface.co, search for a model + "GGUF" (e.g. "Phi-3 Mini GGUF"), pick a Q4_K_M file (~2 GB), and save it to Downloads. Good starters: Phi-3 Mini Q4_K_M or LLaMA 3.2 3B Q4_K_M.',
  },
  {
    title: '4. Load the model & chat',
    body: 'Back in QuantaLLM, tap the model selector — your file appears automatically. Tap it to load. On Snapdragon 8 Gen 2/3/Elite phones, Hexagon NPU kicks in automatically for 2–5× faster inference.',
  },
];

function InstallStep({ step, index }: { step: typeof installSteps[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl bg-surface-container/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-container-high transition-colors"
      >
        <span className="font-headline text-sm font-semibold text-white">{step.title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-primary"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-4 text-sm text-on-surface-variant leading-relaxed">{step.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Combined section ─────────────────────────────────────────────────────────

export default function QuickCompare() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#000000]">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Left — install accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tighter text-white mb-2">
            New to sideloading? Here's how.
          </h2>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
            QuantaLLM is a direct APK download — no Play Store required. Four steps, under 10 minutes.
          </p>
          <div className="flex flex-col gap-3">
            {installSteps.map((step, i) => (
              <InstallStep key={i} step={step} index={i} />
            ))}
          </div>
          <Link
            to="/tutorial"
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-primary hover:underline font-medium"
          >
            Full setup guide with screenshots <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Right — comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tighter text-white mb-2">
            How QuantaLLM compares
          </h2>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
            The only Android LLM runtime with Hexagon NPU acceleration <em>and</em> a cross-app AIDL API.
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="text-left px-4 py-3 font-headline font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Feature</th>
                  <th className="px-4 py-3 text-center font-headline font-semibold text-xs uppercase tracking-wider text-primary">QuantaLLM</th>
                  <th className="px-4 py-3 text-center font-headline font-semibold text-xs uppercase tracking-wider text-on-surface-variant">MLC LLM</th>
                  <th className="px-4 py-3 text-center font-headline font-semibold text-xs uppercase tracking-wider text-on-surface-variant">llama.cpp</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-surface-container/30' : ''}`}>
                    <td className="px-4 py-3 text-white font-medium">{row.feature}</td>
                    <td className="px-4 py-3"><Cell value={row.quantallm} /></td>
                    <td className="px-4 py-3"><Cell value={row.mlcllm} /></td>
                    <td className="px-4 py-3"><Cell value={row.llamacppAndroid} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-5 mt-3 mb-1">
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant/60"><Check className="w-3 h-3 text-emerald-400" /> Supported</span>
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant/60"><Minus className="w-3 h-3 text-yellow-400/60" /> Partial</span>
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant/60"><X className="w-3 h-3 text-red-400/60" /> Not supported</span>
          </div>

          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline font-medium"
          >
            Full 12-feature comparison <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
