import { useState, type ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Layers,
  GitBranch,
  Lock,
  Cpu,
  FileCode2,
  Box,
  Hexagon,
  Terminal,
  Settings,
  MessageCircle,
  Gauge,
  ArrowUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

interface PipelineStage {
  id: string;
  icon: ElementType;
  label: string;
  sub: string;
  description: string;
  accent?: 'primary' | 'secondary';
}

const stages: PipelineStage[] = [
  {
    id: 'prompt',
    icon: MessageSquare,
    label: 'User Prompt',
    sub: 'Jetpack Compose UI',
    description:
      'User enters a prompt in the Material 3 interface. Compose state triggers ViewModel action.',
    accent: 'primary',
  },
  {
    id: 'viewmodel',
    icon: Layers,
    label: 'LlamaViewModel',
    sub: 'StateFlow Coordinator',
    description:
      'Thin ViewModel exposes LlamaUiState via StateFlow. Delegates work to specialized managers.',
  },
  {
    id: 'managers',
    icon: GitBranch,
    label: 'Manager Layer',
    sub: '4 Specialized Managers',
    description:
      'DefaultModeOrchestrator, ChatModeService, HexagonConfigManager, and ModelLifecycleManager each handle distinct concerns.',
  },
  {
    id: 'engine',
    icon: Lock,
    label: 'ModelEngine',
    sub: 'Singleton · ReentrantLock',
    description:
      'Thread-safe singleton guards the active InferenceEngine instance. ReentrantLock serializes load/unload/generate calls.',
  },
  {
    id: 'interface',
    icon: Cpu,
    label: 'InferenceEngine',
    sub: 'Strategy Pattern',
    description:
      'Abstract interface with load(), generate(), stop(), release(). Implementations swap at runtime.',
    accent: 'primary',
  },
];

const branchA: PipelineStage[] = [
  {
    id: 'llamacpp',
    icon: FileCode2,
    label: 'LlamaCppEngine',
    sub: 'GGUF via JNI',
    description:
      'Bridges Kotlin → LlamaJni → llama_jni.cpp. Supports 90+ architectures, Q2–Q8 quantization.',
    accent: 'primary',
  },
  {
    id: 'ggml',
    icon: Hexagon,
    label: 'GGML Backends',
    sub: 'CPU (NEON) + Hexagon DSP',
    description:
      'ARM64 NEON SIMD for CPU, Qualcomm Hexagon HTP v68–v81 for NPU offload via FastRPC.',
    accent: 'primary',
  },
];

const branchB: PipelineStage[] = [
  {
    id: 'onnx',
    icon: Box,
    label: 'OnnxRuntimeEngine',
    sub: 'ORT GenAI',
    description:
      'ONNX Runtime Generative AI with GenAI config. CPU and QNN execution providers.',
    accent: 'secondary',
  },
  {
    id: 'onnxrt',
    icon: Cpu,
    label: 'ONNX Runtime',
    sub: 'CPU EP · QNN EP',
    description:
      'Qualcomm QNN execution provider for Hexagon, CPU fallback with ARM64 optimizations.',
    accent: 'secondary',
  },
];

const nativeStage: PipelineStage = {
  id: 'native',
  icon: Terminal,
  label: 'Native Layer',
  sub: 'llama.cpp · C++ · JNI',
  description:
    'llama_jni.cpp (2105 LOC) bridges JVM ↔ C++. Compiled with NDK 26.3, -march=armv8.6-a+dotprod+i8mm+bf16+fp16, LTO.',
  accent: 'primary',
};

const managerNodes = [
  { icon: Gauge, label: 'DefaultMode', sub: 'Single prompts' },
  { icon: MessageCircle, label: 'ChatMode', sub: 'KV cache sessions' },
  { icon: Hexagon, label: 'HexagonConfig', sub: 'NPU tuning' },
  { icon: Settings, label: 'ModelLifecycle', sub: 'Load / Unload' },
];

/* ------------------------------------------------------------------ */
/*  Animation constants                                                */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;
const PULSE_DURATION = 2.5;
const CONNECTOR_H = 48;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PipelineNode({
  stage,
  delay = 0,
  className = '',
}: {
  stage: PipelineStage;
  delay?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = stage.icon;

  const borderColor =
    stage.accent === 'primary'
      ? 'border-primary/30'
      : stage.accent === 'secondary'
        ? 'border-secondary/30'
        : 'border-white/10';

  const glowColor =
    stage.accent === 'primary'
      ? 'shadow-primary/10'
      : stage.accent === 'secondary'
        ? 'shadow-secondary/10'
        : 'shadow-white/5';

  const iconColor =
    stage.accent === 'primary'
      ? 'text-primary'
      : stage.accent === 'secondary'
        ? 'text-secondary'
        : 'text-white/70';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      whileHover={{ scale: 1.03 }}
      onClick={() => setExpanded((v) => !v)}
      className={`relative cursor-pointer ${className}`}
    >
      {/* Glow pulse */}
      <motion.div
        className={`absolute -inset-1 rounded-2xl ${
          stage.accent === 'primary'
            ? 'bg-primary/5'
            : stage.accent === 'secondary'
              ? 'bg-secondary/5'
              : 'bg-white/[0.02]'
        }`}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{
          duration: PULSE_DURATION,
          repeat: Infinity,
          delay: delay * 3,
          ease: 'easeInOut',
        }}
      />

      <div
        className={`relative bg-surface-container-high rounded-xl border ${borderColor} px-5 py-4 shadow-lg ${glowColor} transition-shadow`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg ${
              stage.accent === 'primary'
                ? 'bg-primary/10'
                : stage.accent === 'secondary'
                  ? 'bg-secondary/10'
                  : 'bg-white/5'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="font-headline text-sm font-bold text-white leading-tight">
              {stage.label}
            </p>
            <p className="font-mono text-[11px] text-on-surface-variant leading-tight mt-0.5">
              {stage.sub}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="font-body text-xs text-on-surface-variant leading-relaxed mt-3 overflow-hidden"
            >
              {stage.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Connector({
  delay = 0,
  color = 'primary',
  height = CONNECTOR_H,
}: {
  delay?: number;
  color?: 'primary' | 'secondary';
  height?: number;
}) {
  const strokeColor = color === 'primary' ? '#ff9f4a' : '#ff734c';

  return (
    <div className="flex justify-center" style={{ height }}>
      <svg width="24" height={height} className="overflow-visible">
        {/* Line */}
        <line
          x1="12"
          y1="0"
          x2="12"
          y2={height}
          stroke={strokeColor}
          strokeOpacity={0.15}
          strokeWidth={2}
        />
        {/* Animated pulse 1 */}
        <motion.circle
          cx={12}
          r={4}
          fill={strokeColor}
          style={{ filter: 'blur(2px)' }}
          animate={{ cy: [0, height], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: PULSE_DURATION * 0.6,
            repeat: Infinity,
            repeatDelay: PULSE_DURATION * 0.4,
            delay,
            ease: 'linear',
          }}
        />
        {/* Animated pulse 2 (staggered) */}
        <motion.circle
          cx={12}
          r={3}
          fill={strokeColor}
          fillOpacity={0.5}
          style={{ filter: 'blur(3px)' }}
          animate={{ cy: [0, height], opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: PULSE_DURATION * 0.6,
            repeat: Infinity,
            repeatDelay: PULSE_DURATION * 0.4,
            delay: delay + PULSE_DURATION * 0.35,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}

function BranchConnector({
  direction,
  delay = 0,
  color = 'primary',
}: {
  direction: 'left' | 'right';
  delay?: number;
  color?: 'primary' | 'secondary';
}) {
  const strokeColor = color === 'primary' ? '#ff9f4a' : '#ff734c';
  const w = 80;
  const h = 40;
  const x1 = direction === 'left' ? w : 0;
  const x2 = direction === 'left' ? 0 : w;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <line
        x1={x1}
        y1={0}
        x2={x2}
        y2={h}
        stroke={strokeColor}
        strokeOpacity={0.15}
        strokeWidth={2}
      />
      <motion.circle
        r={3}
        fill={strokeColor}
        style={{ filter: 'blur(2px)' }}
        animate={{
          cx: [x1, x2],
          cy: [0, h],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: PULSE_DURATION * 0.5,
          repeat: Infinity,
          repeatDelay: PULSE_DURATION * 0.5,
          delay,
          ease: 'linear',
        }}
      />
    </svg>
  );
}

function ReturnPathLabel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1.5 }}
      className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-center gap-2"
    >
      <div className="flex flex-col items-center gap-1">
        <ArrowUp className="w-4 h-4 text-secondary/60" />
        <motion.div
          className="w-[2px] h-32 bg-gradient-to-t from-transparent via-secondary/20 to-secondary/40 rounded-full"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-mono text-[9px] text-secondary/50 tracking-wider uppercase writing-vertical [writing-mode:vertical-lr] rotate-180">
          Token Callback Stream
        </span>
        <motion.div
          className="w-[2px] h-32 bg-gradient-to-t from-secondary/40 via-secondary/20 to-transparent rounded-full"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <ArrowUp className="w-4 h-4 text-secondary/60" />
      </div>
    </motion.div>
  );
}

function ManagerGrid({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full"
    >
      {managerNodes.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + i * 0.08, duration: 0.4, ease: EASE }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-surface-container rounded-lg border border-white/5 px-3 py-2.5 text-center"
          >
            <Icon className="w-4 h-4 text-on-surface-variant mx-auto mb-1.5" />
            <p className="font-headline text-[11px] font-semibold text-white leading-tight">
              {m.label}
            </p>
            <p className="font-mono text-[9px] text-on-surface-variant mt-0.5">
              {m.sub}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function InferencePipeline() {
  const baseDelay = 0.15;

  return (
    <section id="pipeline" className="py-32 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-headline text-4xl font-bold tracking-tighter uppercase mb-4 text-primary">
            Inference Pipeline
          </h2>
          <p className="font-body text-on-surface-variant text-lg max-w-2xl">
            End-to-end data flow from user prompt to streamed tokens — entirely on-device
          </p>
          <div className="h-1 w-24 thermal-gradient mt-4" />
        </motion.div>

        {/* Pipeline */}
        <div className="relative max-w-3xl mx-auto">
          <ReturnPathLabel />

          <div className="flex flex-col items-center">
            {/* Stages 1-2: Prompt & ViewModel */}
            <PipelineNode stage={stages[0]} delay={baseDelay * 0} className="w-full max-w-sm" />
            <Connector delay={baseDelay * 1} />
            <PipelineNode stage={stages[1]} delay={baseDelay * 2} className="w-full max-w-sm" />
            <Connector delay={baseDelay * 3} />

            {/* Stage 3: Manager layer header + grid */}
            <PipelineNode stage={stages[2]} delay={baseDelay * 4} className="w-full max-w-sm" />
            <Connector delay={baseDelay * 5} height={32} />
            <ManagerGrid delay={baseDelay * 5.5} />
            <Connector delay={baseDelay * 7} height={32} />

            {/* Stage 4: ModelEngine */}
            <PipelineNode stage={stages[3]} delay={baseDelay * 8} className="w-full max-w-sm" />
            <Connector delay={baseDelay * 9} />

            {/* Stage 5: InferenceEngine (fork point) */}
            <PipelineNode stage={stages[4]} delay={baseDelay * 10} className="w-full max-w-sm" />

            {/* ---- BRANCH ---- */}
            {/* Desktop: side-by-side */}
            <div className="hidden md:flex w-full mt-2">
              {/* Branch A: llama.cpp */}
              <div className="flex-1 flex flex-col items-center">
                <BranchConnector direction="left" delay={baseDelay * 11} color="primary" />
                <PipelineNode
                  stage={branchA[0]}
                  delay={baseDelay * 12}
                  className="w-full max-w-[220px]"
                />
                <Connector delay={baseDelay * 13} color="primary" height={36} />
                <PipelineNode
                  stage={branchA[1]}
                  delay={baseDelay * 14}
                  className="w-full max-w-[220px]"
                />
              </div>

              {/* Branch B: ONNX */}
              <div className="flex-1 flex flex-col items-center">
                <BranchConnector direction="right" delay={baseDelay * 11.5} color="secondary" />
                <PipelineNode
                  stage={branchB[0]}
                  delay={baseDelay * 12.5}
                  className="w-full max-w-[220px]"
                />
                <Connector delay={baseDelay * 13.5} color="secondary" height={36} />
                <PipelineNode
                  stage={branchB[1]}
                  delay={baseDelay * 14.5}
                  className="w-full max-w-[220px]"
                />
              </div>
            </div>

            {/* Mobile: stacked */}
            <div className="md:hidden flex flex-col items-center w-full mt-2">
              <Connector delay={baseDelay * 11} />
              <div className="w-full flex items-start gap-3">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <PipelineNode
                    stage={branchA[0]}
                    delay={baseDelay * 12}
                    className="w-full"
                  />
                  <Connector delay={baseDelay * 13} color="primary" height={28} />
                  <PipelineNode
                    stage={branchA[1]}
                    delay={baseDelay * 14}
                    className="w-full"
                  />
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <PipelineNode
                    stage={branchB[0]}
                    delay={baseDelay * 12.5}
                    className="w-full"
                  />
                  <Connector delay={baseDelay * 13.5} color="secondary" height={28} />
                  <PipelineNode
                    stage={branchB[1]}
                    delay={baseDelay * 14.5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Converge to native */}
            <Connector delay={baseDelay * 15} height={40} />
            <PipelineNode stage={nativeStage} delay={baseDelay * 16} className="w-full max-w-sm" />
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: baseDelay * 18 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[10px] font-mono text-on-surface-variant uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary/30 border border-primary/50" />
              llama.cpp path
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary/30 border border-secondary/50" />
              ONNX Runtime path
            </span>
            <span className="flex items-center gap-2">
              <span className="w-8 h-[2px] border-t-2 border-dashed border-secondary/40" />
              Token callback
            </span>
            <span className="text-on-surface-variant/50">Click nodes for details</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
