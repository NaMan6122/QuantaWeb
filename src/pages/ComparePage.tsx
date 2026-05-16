import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MorphGeoBg = lazy(() => import('../components/MorphGeoBg'));

type Support = 'yes' | 'no' | 'partial';

interface Row {
  feature: string;
  quantallm: Support;
  mlcllm: Support;
  llamacppAndroid: Support;
  ollama: Support;
}

const rows: Row[] = [
  { feature: 'Runs on Android', quantallm: 'yes', mlcllm: 'yes', llamacppAndroid: 'yes', ollama: 'no' },
  { feature: '100% Offline', quantallm: 'yes', mlcllm: 'yes', llamacppAndroid: 'yes', ollama: 'yes' },
  { feature: 'Hexagon NPU Support', quantallm: 'yes', mlcllm: 'no', llamacppAndroid: 'no', ollama: 'no' },
  { feature: 'GGUF Model Format', quantallm: 'yes', mlcllm: 'no', llamacppAndroid: 'yes', ollama: 'yes' },
  { feature: 'ONNX Runtime', quantallm: 'partial', mlcllm: 'no', llamacppAndroid: 'no', ollama: 'no' },
  { feature: 'AIDL Cross-App API', quantallm: 'yes', mlcllm: 'no', llamacppAndroid: 'no', ollama: 'no' },
  { feature: 'ARM64 Optimized', quantallm: 'yes', mlcllm: 'yes', llamacppAndroid: 'yes', ollama: 'partial' },
  { feature: 'Streaming Output', quantallm: 'yes', mlcllm: 'yes', llamacppAndroid: 'yes', ollama: 'yes' },
  { feature: 'Open Source', quantallm: 'no', mlcllm: 'yes', llamacppAndroid: 'yes', ollama: 'yes' },
  { feature: 'Desktop / Server', quantallm: 'no', mlcllm: 'yes', llamacppAndroid: 'no', ollama: 'yes' },
  { feature: 'GPU Acceleration (Android)', quantallm: 'partial', mlcllm: 'yes', llamacppAndroid: 'partial', ollama: 'no' },
  { feature: 'Multiple Concurrent Models', quantallm: 'no', mlcllm: 'no', llamacppAndroid: 'no', ollama: 'yes' },
];

const products = [
  { key: 'quantallm' as const, name: 'QuantaLLM', highlight: true },
  { key: 'mlcllm' as const, name: 'MLC LLM', highlight: false },
  { key: 'llamacppAndroid' as const, name: 'llama.cpp Android', highlight: false },
  { key: 'ollama' as const, name: 'Ollama', highlight: false },
];

function Cell({ value }: { value: Support }) {
  if (value === 'yes') return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
  if (value === 'no') return <X className="w-4 h-4 text-red-400/60 mx-auto" />;
  return <Minus className="w-4 h-4 text-yellow-400/60 mx-auto" />;
}

export default function ComparePage() {
  return (
    <>
      <Helmet>
        <title>QuantaLLM vs MLC LLM vs llama.cpp vs Ollama — Feature Comparison</title>
        <meta name="description" content="See how QuantaLLM compares to MLC LLM, llama.cpp Android, and Ollama across 12 feature categories including Hexagon NPU, ONNX, and AIDL support." />
        <link rel="canonical" href="https://quantallm.dev/compare" />
        <meta property="og:url" content="https://quantallm.dev/compare" />
        <meta property="og:title" content="QuantaLLM vs MLC LLM vs llama.cpp vs Ollama — Feature Comparison" />
        <meta property="og:description" content="12-category feature comparison of Android on-device LLM inference solutions. Hexagon NPU, ONNX, AIDL, and more." />
      </Helmet>
      <Navbar />
      <main className="relative min-h-screen bg-[#000000] pt-24 pb-20 px-6">
        <Suspense fallback={null}>
          <MorphGeoBg />
        </Suspense>
        <div className="max-w-5xl mx-auto">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
            How QuantaLLM Compares
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl mb-12">
            Feature comparison with other popular on-device and local LLM inference solutions.
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="text-left px-4 py-3 font-headline font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    Feature
                  </th>
                  {products.map((p) => (
                    <th
                      key={p.key}
                      className={`px-4 py-3 text-center font-headline font-semibold text-xs uppercase tracking-wider ${
                        p.highlight ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-surface-container/30' : ''}`}
                  >
                    <td className="px-4 py-3 text-white font-medium">{row.feature}</td>
                    {products.map((p) => (
                      <td key={p.key} className="px-4 py-3">
                        <Cell value={row[p.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-5 mb-1">
            <span className="flex items-center gap-2 text-xs text-on-surface-variant/70">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Supported
            </span>
            <span className="flex items-center gap-2 text-xs text-on-surface-variant/70">
              <Minus className="w-3.5 h-3.5 text-yellow-400/60" /> Under development
            </span>
            <span className="flex items-center gap-2 text-xs text-on-surface-variant/70">
              <X className="w-3.5 h-3.5 text-red-400/60" /> Not supported
            </span>
          </div>

          <p className="text-on-surface-variant/50 text-xs mt-4 text-center">
            Comparison based on publicly available information as of 2025. Features may change.
          </p>

          <div className="mt-12 text-center">
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
