import React, {
  lazy,
  Suspense,
  useRef,
  useState,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { motion, useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldOff,
  Zap,
  Hexagon,
  Cpu,
  Box,
  Cable,
  FileCode2,
  Lock,
  Gauge,
  Code2,
  CloudOff,
  ArrowRight,
  MessageSquare,
  Settings2,
  Layers,
  ChevronRight,
  WifiOff,
  Bell,
  BarChart3,
  ToggleRight,
  Heading,
  type LucideIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TypewriterText from '../components/TypewriterText';

const DataStreamBg = lazy(() => import('../components/DataStreamBg'));
const HexChipVisual = lazy(() => import('../components/HexChipVisual'));
const AmbientDriftBg = lazy(() => import('../components/AmbientDriftBg'));

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------------------------------------------ */
/*  Magnetic Tilt Card                                                 */
/* ------------------------------------------------------------------ */

function MagneticCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');

  const handleMove = (e: ReactMouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateY = ((x - cx) / cx) * 8;
    const rotateX = ((cy - y) / cy) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)');
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  children,
  className = '',
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section id={id} className={`py-28 md:py-36 px-6 md:px-12 relative z-10 ${className}`} style={style}>
      <div className="max-w-[1440px] mx-auto">{children}</div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <span className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {eyebrow}
        </span>
        <div className="flex-1 h-px bg-outline-variant/20 max-w-32" />
      </div>
      <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">{title}</h2>
      <div className="h-1 w-24 thermal-gradient mb-4" />
      {subtitle && (
        <p className="font-body text-on-surface-variant text-lg max-w-2xl leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedCounter({
  end,
  suffix = '',
  duration = 1200,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    let start: number | null = null;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Model Ticker                                                       */
/* ------------------------------------------------------------------ */

const modelNames = [
  'Llama 3',
  'Mistral',
  'Phi-3',
  'Gemma',
  'Qwen',
  'Falcon',
  'StarCoder',
  'Vicuna',
  'Alpaca',
  'Orca',
  'DeepSeek',
  'Code Llama',
  'TinyLlama',
  'Neural Chat',
  'WizardCoder',
  'Hermes',
];

function ModelTicker() {
  return (
    <div className="relative overflow-hidden py-6 group">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="flex gap-6 animate-scroll-x group-hover:[animation-play-state:paused]">
        {[...modelNames, ...modelNames].map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="shrink-0 px-5 py-2.5 rounded-xl border border-white/10 bg-surface-container text-sm font-headline font-semibold text-white/80 hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quantization Spectrum                                              */
/* ------------------------------------------------------------------ */

const quantLevels = [
  { label: 'Q2_K', size: '~30%', quality: 'Low', width: 14 },
  { label: 'Q3_K', size: '~40%', quality: 'Fair', width: 28 },
  { label: 'Q4_K_M', size: '~50%', quality: 'Good', width: 50, recommended: true },
  { label: 'Q5_K_M', size: '~60%', quality: 'Great', width: 65 },
  { label: 'Q6_K', size: '~70%', quality: 'High', width: 78 },
  { label: 'Q8_0', size: '~85%', quality: 'Near-FP', width: 92 },
];

function QuantSpectrum() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="space-y-3 mt-8">
      {quantLevels.map((q, i) => (
        <motion.div
          key={q.label}
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4"
        >
          <span
            className={`font-mono text-xs w-16 shrink-0 ${
              q.recommended ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            {q.label}
          </span>
          <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${q.width}%` } : {}}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${
                q.recommended
                  ? 'thermal-gradient shadow-[0_0_12px_rgba(255,159,74,0.4)]'
                  : 'bg-gradient-to-r from-white/15 to-white/25'
              }`}
            />
          </div>
          <span className="text-[11px] text-on-surface-variant w-14 text-right">{q.quality}</span>
          {q.recommended && (
            <span className="text-[10px] font-headline font-bold text-primary border border-primary/30 rounded-full px-2 py-0.5 uppercase tracking-wider">
              Best
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing Code Snippet                                                */
/* ------------------------------------------------------------------ */

const codeLines = [
  'val intent = Intent().apply {',
  '    component = ComponentName(',
  '        "com.naman.quantallm",',
  '        "com.naman.quantallm.service',
  '            .LlamaInferenceService"',
  '    )',
  '}',
  'bindService(intent, conn, BIND_AUTO_CREATE)',
  '',
  'val result = llamaService',
  '    ?.generate("Explain AI", 50, 0.7f)',
];

function TypingCodeBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [visibleLines, setVisibleLines] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;
    let line = 0;
    const id = setInterval(() => {
      line++;
      setVisibleLines(line);
      if (line >= codeLines.length) clearInterval(id);
    }, 180);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="bg-surface-container border border-white/5 rounded-xl overflow-hidden"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/10">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
          ExternalApp.kt
        </span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed min-h-[280px]">
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={i < visibleLines ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3 }}
            className="flex"
          >
            <span className="text-white/20 w-7 text-right mr-4 select-none text-xs leading-relaxed">
              {i + 1}
            </span>
            <span className="text-primary/90">{line}</span>
          </motion.div>
        ))}
        {visibleLines > 0 && visibleLines < codeLines.length && (
          <span className="inline-block w-[2px] h-4 bg-primary animate-pulse ml-11" />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fallback Chain Diagram                                             */
/* ------------------------------------------------------------------ */

function FallbackChain() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const nodes = [
    { label: 'Hexagon DSP', sub: 'NPU Offload', accent: true },
    { label: 'CPU + mmap', sub: 'Memory-Mapped', accent: false },
    { label: 'CPU', sub: 'Standard', accent: false },
  ];

  return (
    <div ref={ref} className="flex items-center justify-center gap-3 flex-wrap mt-8">
      {nodes.map((node, i) => (
        <motion.div
          key={node.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div
            className={`px-5 py-3 rounded-xl text-center font-headline text-sm font-semibold ${
              node.accent
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-surface-container-high border border-white/10 text-white/80'
            }`}
          >
            {node.label}
            <div className="text-[10px] font-body font-normal text-on-surface-variant mt-0.5">
              {node.sub}
            </div>
          </div>
          {i < nodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.15 + 0.1 }}
            >
              <ArrowRight className="w-4 h-4 text-on-surface-variant/40" />
            </motion.div>
          )}
        </motion.div>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
        className="text-[10px] font-mono text-on-surface-variant ml-2"
      >
        auto-fallback
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Streaming Progress Visual                                          */
/* ------------------------------------------------------------------ */

function StreamingVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [tokenCount, setTokenCount] = useState(0);
  const [tps, setTps] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      setTokenCount(count);
      setTps(Math.round((10 + Math.random() * 4) * 10) / 10);
      if (count >= 64) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [inView]);

  const progress = Math.min((tokenCount / 64) * 100, 100);

  return (
    <div ref={ref} className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs font-mono text-on-surface-variant mb-2">
          <span>Generation Progress</span>
          <span className="text-primary tabular-nums">{tokenCount} / 64 tokens</span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            className="h-full thermal-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tokens/sec', value: tokenCount > 0 ? `${tps.toFixed(1)} t/s` : 'idle' },
          { label: 'Backend', value: 'Hexagon NPU' },
          { label: 'Memory', value: '1.8 GB' },
        ].map((m) => (
          <div key={m.label} className="bg-surface-container rounded-lg p-3 text-center border border-white/5">
            <div className="text-[10px] font-headline uppercase tracking-wider text-on-surface-variant mb-1">
              {m.label}
            </div>
            <div className="font-mono text-sm text-primary font-semibold tabular-nums">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown Showcase                                                  */
/* ------------------------------------------------------------------ */

function MarkdownShowcase() {
  return (
    <div className="bg-surface-container rounded-xl border border-white/5 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-mono text-on-surface-variant">Rendered Output</span>
      </div>
      <div className="space-y-3 text-sm font-body">
        <h3 className="text-lg font-bold font-headline text-white">Quantum Computing Basics</h3>
        <p className="text-on-surface-variant leading-relaxed">
          Quantum computing uses <span className="font-bold text-white">qubits</span> that leverage{' '}
          <span className="italic text-white/80">superposition</span> and{' '}
          <span className="italic text-white/80">entanglement</span>.
        </p>
        <div className="bg-surface-container-high rounded-lg px-4 py-3 border-l-2 border-primary/40">
          <p className="text-on-surface-variant text-xs italic">
            "A quantum computer can explore all paths simultaneously."
          </p>
        </div>
        <div className="bg-surface-container-high rounded-lg px-4 py-2 font-mono text-xs">
          <span className="text-on-surface-variant/60">// Kotlin</span>
          <br />
          <span className="text-primary">val</span>{' '}
          <span className="text-white">qubit = superpose(</span>
          <span className="text-secondary">0</span>, <span className="text-secondary">1</span>
          <span className="text-white">)</span>
        </div>
        <ul className="space-y-1 text-on-surface-variant">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">-</span> Exponential state space with N qubits
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">-</span> Error correction remains challenging
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function FeaturesPage() {
  return (
    <>
      <Helmet>
        <title>Features — QuantaLLM On-Device LLM for Android</title>
        <meta name="description" content="Explore QuantaLLM's full feature set: Hexagon NPU acceleration, GGUF + ONNX support, AIDL cross-app API, and 90+ model architectures — all running offline on Android." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/features" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/features" />
        <meta property="og:title" content="Features — QuantaLLM On-Device LLM for Android" />
        <meta property="og:description" content="Hexagon NPU acceleration, GGUF + ONNX support, AIDL cross-app API, and 90+ model architectures. All offline on Android." />
      </Helmet>
      <Navbar />
      <main className="bg-[#000000] min-h-screen relative">
        {/* Page-level ambient 3D background — subtle, fixed, non-distracting */}
        <Suspense fallback={null}>
          <AmbientDriftBg />
        </Suspense>

        {/* ============================================================ */}
        {/*  1. HERO BANNER                                              */}
        {/* ============================================================ */}
        <section className="relative z-10 pt-36 pb-28 px-6 md:px-12 overflow-hidden">
          <Suspense fallback={null}>
            <DataStreamBg />
          </Suspense>
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] -z-10" />

          <div className="max-w-[1440px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-container-low px-4 py-1.5 text-xs font-mono text-white/60 mb-8">
                <WifiOff className="w-3 h-3" />
                100% Offline &middot; Zero Cloud Dependencies
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-6">
                Built for{' '}
                <span className="thermal-text">On-Device</span>
                <br />
                Intelligence
              </h1>
              <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-2">
                Every feature in QuantaLLM is designed around one principle: your data never leaves
                your phone.
              </p>
              <p className="font-headline text-xl md:text-2xl font-bold tracking-tight min-h-[1.8em]">
                <TypewriterText
                  texts={[
                    'Private by Design.',
                    'Hexagon NPU Accelerated.',
                    'Any GGUF Model.',
                    'Cross-App via AIDL.',
                    'Real-Time Streaming.',
                  ]}
                  className="thermal-text"
                  cursorClassName="bg-primary"
                  typeSpeed={65}
                  eraseSpeed={35}
                  pauseAfterType={2200}
                />
              </p>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-8 md:gap-16 mt-14"
            >
              {[
                { value: 90, suffix: '+', label: 'Model Architectures' },
                { value: 3, suffix: '', label: 'Inference Backends' },
                { value: 0, suffix: 'ms', label: 'Cloud Latency' },
                { value: 6, suffix: '', label: 'HTP Versions' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-headline text-3xl md:text-4xl font-bold text-primary">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </div>
                  <div className="font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  2. PRIVACY & SECURITY                                       */}
        {/* ============================================================ */}
        <Section className="" id="privacy">
          <SectionTitle
            icon={Lock}
            eyebrow="Privacy & Security"
            title="Your Data Stays Yours"
            subtitle="QuantaLLM never phones home. Every prompt, every response, every model weight stays entirely on-device. Works in airplane mode."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <MagneticCard className="h-full">
              <motion.div
                variants={slideFromLeft}
                className="bg-surface-container p-8 md:p-10 rounded-xl border border-white/5 hover:border-primary/20 transition-colors group h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck className="w-40 h-40" />
                </div>
                <ShieldCheck className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-headline text-2xl md:text-3xl font-bold mb-4">100% On-Device</h3>
                <p className="font-body text-on-surface-variant leading-relaxed text-base mb-6">
                  Every inference runs locally via llama.cpp compiled to native ARM64. No API keys, no
                  internet required, no telemetry, no tracking pixels. Your prompts never leave the
                  silicon.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['No API Keys', 'No Internet', 'No Telemetry'].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-primary/80 border border-primary/20 bg-primary/5 rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </MagneticCard>

            <MagneticCard className="h-full">
              <motion.div
                variants={slideFromRight}
                className="bg-surface-container p-8 md:p-10 rounded-xl border border-white/5 hover:border-secondary/20 transition-colors group h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CloudOff className="w-40 h-40" />
                </div>
                <ShieldOff className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-headline text-2xl md:text-3xl font-bold mb-4">Zero Data Collection</h3>
                <p className="font-body text-on-surface-variant leading-relaxed text-base mb-6">
                  No analytics SDKs, no crash reporting services, no cloud calls of any kind. The app
                  makes exactly zero network requests. Put your phone in airplane mode — everything works.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['No Analytics', 'No Cloud', 'Airplane Mode OK'].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-secondary/80 border border-secondary/20 bg-secondary/5 rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </MagneticCard>
          </motion.div>
        </Section>

        {/* ============================================================ */}
        {/*  3. INFERENCE ENGINE DEEP-DIVE                                */}
        {/* ============================================================ */}
        <Section
          className="border-y border-outline-variant/10"
          id="engines"
          style={{ background: 'linear-gradient(180deg, rgba(10,10,12,0.85) 0%, rgba(14,14,14,0.85) 50%, rgba(10,10,12,0.85) 100%)' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
            <div className="flex-1">
              <SectionTitle
                icon={Gauge}
                eyebrow="Performance"
                title="Three Inference Backends"
                subtitle="QuantaLLM automatically selects the fastest available backend for your hardware, with graceful fallback at every level."
              />

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="space-y-5"
              >
                {/* CPU Backend */}
                <MagneticCard>
                  <motion.div
                    variants={fadeUp}
                    className="bg-surface-container rounded-xl p-7 border border-white/5 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold">CPU Backend (ARM64)</h3>
                        <p className="text-xs text-on-surface-variant font-mono">Always Available</p>
                      </div>
                    </div>
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4">
                      Compiled with <span className="font-mono text-xs text-primary">-march=armv8.6-a+dotprod+i8mm+bf16+fp16</span> and
                      LTO enabled. ARM NEON SIMD acceleration with cache-friendly matrix multiplication.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['NEON SIMD', 'dotprod', 'i8mm', 'bf16', 'LTO'].map((f) => (
                        <span key={f} className="text-[10px] font-mono text-white/50 border border-white/10 rounded px-2 py-0.5">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </MagneticCard>

                {/* Hexagon Backend */}
                <MagneticCard>
                  <motion.div
                    variants={fadeUp}
                    className="bg-primary/[0.04] rounded-xl p-7 border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                        <Hexagon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold text-primary">Hexagon DSP Acceleration</h3>
                        <p className="text-xs text-on-surface-variant font-mono">Snapdragon 8 Gen 2+</p>
                      </div>
                      <span className="ml-auto text-xs font-headline font-bold text-primary border border-primary/30 rounded-full px-3 py-1 uppercase tracking-wider">
                        1.5x Faster
                      </span>
                    </div>
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4">
                      Qualcomm Hexagon HTP backend with NPU offload. Supports HTP versions v68-v81
                      (Snapdragon 8 Gen 2, 8 Gen 3, 8 Elite). Configurable ndev/nhvx threading with profiling mode.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['HTP v68-v81', 'NPU Offload', 'Profiling', 'Auto-Detection'].map((f) => (
                        <span key={f} className="text-[10px] font-mono text-primary/70 border border-primary/20 rounded px-2 py-0.5">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </MagneticCard>

                {/* ONNX Backend */}
                <MagneticCard>
                  <motion.div
                    variants={fadeUp}
                    className="bg-surface-container rounded-xl p-7 border border-white/5 hover:border-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Box className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold">ONNX Runtime</h3>
                        <p className="text-xs text-on-surface-variant font-mono">Dual Engine Architecture</p>
                      </div>
                    </div>
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4">
                      Load ONNX models via ORT GenAI with CPU Execution Provider. QNN EP planned for
                      future NPU acceleration. Switch engines without recompile.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['ORT GenAI', 'CPU EP', 'QNN EP (Planned)'].map((f) => (
                        <span key={f} className="text-[10px] font-mono text-secondary/70 border border-secondary/20 rounded px-2 py-0.5">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </MagneticCard>
              </motion.div>

              {/* Fallback chain */}
              <FallbackChain />
            </div>

            {/* HexChip visual */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="hidden lg:block w-64 h-64 xl:w-80 xl:h-80 shrink-0 sticky top-32"
            >
              <Suspense fallback={null}>
                <HexChipVisual />
              </Suspense>
            </motion.div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  4. MODEL COMPATIBILITY                                      */}
        {/* ============================================================ */}
        <Section className="" id="models">
          <SectionTitle
            icon={FileCode2}
            eyebrow="Model Support"
            title="Any GGUF Model. 90+ Architectures."
            subtitle="From TinyLlama at 600MB to Mistral 7B at 4GB — load any llama.cpp-compatible GGUF model with full quantization support."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="font-headline text-xl font-bold mb-2">Supported Models</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Continuously updated via llama.cpp upstream. If it compiles to GGUF, it runs on QuantaLLM.
              </p>
              <ModelTicker />
              <div className="mt-6">
                <Link
                  to="/models"
                  className="inline-flex items-center gap-2 text-primary text-sm font-headline font-semibold hover:underline"
                >
                  Browse all models
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="font-headline text-xl font-bold mb-2">Quantization Levels</h3>
              <p className="text-on-surface-variant text-sm mb-2">
                Trade model size for quality. Q4_K_M is the sweet spot for mobile devices.
              </p>
              <QuantSpectrum />
            </motion.div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  5. DEVELOPER INTEGRATION                                    */}
        {/* ============================================================ */}
        <Section
          className="border-y border-outline-variant/10"
          id="developer"
          style={{ background: 'linear-gradient(180deg, rgba(10,10,12,0.85) 0%, rgba(14,14,14,0.85) 50%, rgba(10,10,12,0.85) 100%)' }}
        >
          <SectionTitle
            icon={Code2}
            eyebrow="Developer"
            title="Cross-App LLM in 30 Minutes"
            subtitle="Expose QuantaLLM's inference engine to any Android app via AIDL IPC. No native code, no ML libraries, no model bundling required."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <TypingCodeBlock />
              </motion.div>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {[
                {
                  icon: Cable,
                  title: 'AIDL Interface',
                  desc: 'Full sync/async generation API with streaming callbacks and request cancellation. Protected by foreground service.',
                },
                {
                  icon: Settings2,
                  title: 'Zero Configuration',
                  desc: 'No ML dependencies needed in your app. No model files to bundle. Just bind the service and call generate().',
                },
                {
                  icon: Layers,
                  title: 'Architecture Diagram',
                  desc: 'External App → Binder IPC → QuantaLLM Service → ModelEngine → JNI → llama.cpp Native',
                },
              ].map((item) => (
                <MagneticCard key={item.title}>
                  <motion.div
                    variants={fadeUp}
                    className="bg-surface-container rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <h4 className="font-headline text-base font-bold">{item.title}</h4>
                    </div>
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                </MagneticCard>
              ))}

              <Link
                to="/docs"
                className="inline-flex items-center gap-2 text-primary text-sm font-headline font-semibold hover:underline mt-4"
              >
                Full integration guide
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  6. REAL-TIME STREAMING                                      */}
        {/* ============================================================ */}
        <Section className="" id="streaming">
          <SectionTitle
            icon={Zap}
            eyebrow="Real-Time"
            title="Live Streaming Inference"
            subtitle="Watch tokens generate in real-time with live performance metrics. Configurable update frequency with less than 1% overhead."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-surface-container rounded-xl p-8 border border-white/5"
            >
              <StreamingVisual />
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {[
                {
                  icon: BarChart3,
                  title: 'Live Metrics',
                  desc: 'Real-time tokens/sec, memory usage, and backend status. Post-generation summary with final statistics.',
                },
                {
                  icon: ToggleRight,
                  title: 'Unlimited Token Mode',
                  desc: 'Toggle for open-ended generation using End-of-Generation detection from llama.cpp. Model decides when to stop.',
                },
                {
                  icon: Gauge,
                  title: 'Sub-1% Overhead',
                  desc: 'Streaming callback updates every 5 tokens. Total overhead for 100 tokens: ~20-40ms. Negligible impact on generation speed.',
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-headline text-base font-bold mb-1">{item.title}</h4>
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  7. CHAT MODE                                                */}
        {/* ============================================================ */}
        <Section
          className="border-y border-outline-variant/10"
          id="chat"
          style={{ background: 'linear-gradient(180deg, rgba(10,10,12,0.85) 0%, rgba(14,14,14,0.85) 50%, rgba(10,10,12,0.85) 100%)' }}
        >
          <SectionTitle
            icon={MessageSquare}
            eyebrow="Chat"
            title="Multi-Turn Conversations"
            subtitle="Full chat mode with session management, system prompts, KV cache retention across turns, and beautiful markdown rendering."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {[
                {
                  icon: MessageSquare,
                  title: 'Session Management',
                  desc: 'Create, delete, and switch between chat sessions. Conversations persist across app restarts via JSON storage.',
                },
                {
                  icon: Settings2,
                  title: 'System Prompts',
                  desc: 'Define custom assistant behavior per session. Auto-detects chat templates from model metadata.',
                },
                {
                  icon: Zap,
                  title: 'KV Cache Retention',
                  desc: 'Attention context reused across turns for instant follow-ups. No need to re-process the entire conversation.',
                },
                {
                  icon: Heading,
                  title: 'Markdown Rendering',
                  desc: 'Headings, bold, italic, code blocks, blockquotes, lists — all rendered with Material 3 styling.',
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 mt-1">
                    <item.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-headline text-base font-bold mb-1">{item.title}</h4>
                    <p className="font-body text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <MarkdownShowcase />
            </motion.div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  8. CTA                                                      */}
        {/* ============================================================ */}
        <Section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Ready to Run AI <span className="thermal-text">On Your Phone</span>?
            </h2>
            <p className="font-body text-on-surface-variant text-lg max-w-xl mx-auto mb-10">
              Star us on GitHub to get notified when QuantaLLM launches.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="https://github.com/NaMan6122/QuantaLLM-Releases/releases/download/v1.3.0/QuantaLLM-v1.3.0.apk"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="thermal-gradient text-black px-8 py-4 rounded-lg text-lg font-bold font-headline flex items-center gap-2"
              >
                Coming Soon
                <Bell className="w-5 h-5" />
              </motion.a>
              <Link
                to="/docs"
                className="border border-secondary px-8 py-4 rounded-lg text-lg font-bold font-headline text-secondary hover:bg-secondary/5 transition-all flex items-center gap-2"
              >
                Read the Docs
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
