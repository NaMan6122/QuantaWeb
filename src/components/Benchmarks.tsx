import { motion } from 'motion/react';
import { Info } from 'lucide-react';

interface BenchmarkRow {
  device: string;
  soc: string;
  model: string;
  quant: string;
  backend: string;
  tokensPerSec: string;
  isNpu?: boolean;
}

const benchmarks: BenchmarkRow[] = [
  { device: 'Pixel 9 Pro', soc: 'Tensor G4', model: 'Llama 3.2 1B', quant: 'Q4_K_M', backend: 'CPU', tokensPerSec: '~12 t/s' },
  { device: 'Samsung S24 Ultra', soc: 'SD 8 Gen 3', model: 'Llama 3.2 1B', quant: 'Q4_K_M', backend: 'CPU', tokensPerSec: '~14 t/s' },
  { device: 'Samsung S24 Ultra', soc: 'SD 8 Gen 3', model: 'Llama 3.2 1B', quant: 'Q4_K_M', backend: 'Hexagon', tokensPerSec: '~18 t/s', isNpu: true },
  { device: 'OnePlus 12', soc: 'SD 8 Gen 3', model: 'Phi-3 Mini 3.8B', quant: 'Q4_0', backend: 'CPU', tokensPerSec: '~5 t/s' },
  { device: 'Samsung S25 Ultra', soc: 'SD 8 Elite', model: 'Llama 3.2 3B', quant: 'Q4_K_M', backend: 'CPU', tokensPerSec: '~8 t/s' },
  { device: 'Samsung S25 Ultra', soc: 'SD 8 Elite', model: 'Llama 3.2 3B', quant: 'Q4_K_M', backend: 'Hexagon', tokensPerSec: '~11 t/s', isNpu: true },
  { device: 'Pixel 8 Pro', soc: 'Tensor G3', model: 'Gemma 2B', quant: 'Q4_0', backend: 'CPU', tokensPerSec: '~9 t/s' },
  { device: 'Samsung S23 Ultra', soc: 'SD 8 Gen 2', model: 'Mistral 7B', quant: 'Q2_K', backend: 'CPU', tokensPerSec: '~2 t/s' },
];

const columns = ['Device', 'SoC', 'Model', 'Quant', 'Backend', 'Tokens/sec'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function BenchmarkCard({ row }: { row: BenchmarkRow }) {
  return (
    <motion.div
      variants={rowVariants}
      className={`bg-surface-container rounded-xl p-5 border ${
        row.isNpu ? 'border-primary/20 bg-primary/[0.03]' : 'border-white/5'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-headline text-sm font-bold">{row.device}</span>
        <span className={`font-headline text-lg font-bold ${row.isNpu ? 'text-primary' : 'text-white'}`}>
          {row.tokensPerSec}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        <div>
          <span className="text-on-surface-variant text-xs">SoC</span>
          <p className="font-body">{row.soc}</p>
        </div>
        <div>
          <span className="text-on-surface-variant text-xs">Model</span>
          <p className="font-body">{row.model}</p>
        </div>
        <div>
          <span className="text-on-surface-variant text-xs">Quant</span>
          <p className="font-body font-mono text-xs">{row.quant}</p>
        </div>
        <div>
          <span className="text-on-surface-variant text-xs">Backend</span>
          <p className={`font-body ${row.isNpu ? 'text-primary font-semibold' : ''}`}>{row.backend}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Benchmarks() {
  return (
    <section id="benchmarks" className="py-32 px-6 md:px-12 bg-[#000000]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-headline text-4xl font-bold tracking-tighter uppercase mb-4 text-primary">
            Performance Benchmarks
          </h2>
          <div className="h-1 w-24 thermal-gradient" />
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="hidden lg:block"
        >
          <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-outline-variant/20">
              {columns.map((col) => (
                <span
                  key={col}
                  className="font-headline text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Table Rows */}
            {benchmarks.map((row, i) => (
              <motion.div
                key={i}
                variants={rowVariants}
                className={`grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/5 last:border-b-0 transition-colors ${
                  row.isNpu
                    ? 'bg-primary/[0.04] hover:bg-primary/[0.08]'
                    : 'hover:bg-surface-container-high'
                }`}
              >
                <span className="font-body text-sm font-medium">{row.device}</span>
                <span className="font-body text-sm text-on-surface-variant">{row.soc}</span>
                <span className="font-body text-sm">{row.model}</span>
                <span className="font-mono text-xs text-on-surface-variant">{row.quant}</span>
                <span className={`font-body text-sm ${row.isNpu ? 'text-primary font-semibold' : ''}`}>
                  {row.backend}
                </span>
                <span className={`font-headline text-sm font-bold ${row.isNpu ? 'text-primary' : ''}`}>
                  {row.tokensPerSec}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mobile Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {benchmarks.map((row, i) => (
            <BenchmarkCard key={i} row={row} />
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-start gap-3 text-on-surface-variant"
        >
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="font-body text-xs leading-relaxed">
            Benchmarks are approximate and vary by thermal conditions, background processes, and model
            architecture. Hexagon NPU acceleration available on Snapdragon 8 Gen 2+ SoCs.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
