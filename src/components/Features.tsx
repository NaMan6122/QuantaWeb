import type { ElementType } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ShieldOff,
  Zap,
  Hexagon,
  Cpu,
  Box,
  Cable,
  FileCode2,
  ChevronRight,
  Lock,
  Gauge,
  Code2,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function GroupHeader({ icon: Icon, label }: { icon: ElementType; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="col-span-full flex items-center gap-3 mt-8 first:mt-0"
    >
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
        {label}
      </span>
      <div className="flex-1 h-px bg-outline-variant/20" />
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  large,
  accent = 'primary',
}: {
  icon: ElementType;
  title: string;
  description: string;
  large?: boolean;
  accent?: 'primary' | 'secondary';
}) {
  const colorClass = accent === 'primary' ? 'text-primary' : 'text-secondary';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`${
        large ? 'md:col-span-2' : ''
      } bg-surface-container p-8 rounded-xl hover:bg-surface-container-high transition-all group relative overflow-hidden border border-white/5`}
    >
      {large && (
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="w-48 h-48" />
        </div>
      )}
      <Icon className={`w-10 h-10 ${colorClass} mb-5 group-hover:scale-110 transition-transform`} />
      <h3 className="font-headline text-2xl font-bold mb-3">{title}</h3>
      <p className="font-body text-on-surface-variant leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ArchitectureArrow() {
  return (
    <div className="flex items-center justify-center text-on-surface-variant/40">
      <ChevronRight className="w-5 h-5" />
    </div>
  );
}

function ArchitectureBox({ label, sub, accent }: { label: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className={`px-4 py-2.5 rounded-lg text-center text-sm font-headline font-semibold whitespace-nowrap ${
        accent
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-surface-container-high border border-white/10 text-white/80'
      }`}
    >
      {label}
      {sub && <div className="text-[10px] font-body font-normal text-on-surface-variant mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-12 bg-[#000000]">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-headline text-4xl font-bold tracking-tighter uppercase mb-4 text-primary">
            Core Architecture
          </h2>
          <div className="h-1 w-24 thermal-gradient" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* --- Privacy & Security --- */}
          <GroupHeader icon={Lock} label="Privacy & Security" />

          <FeatureCard
            icon={ShieldCheck}
            title="100% On-Device"
            description="Every inference runs locally via llama.cpp. No API keys, no internet, no telemetry. Prompts never leave the device."
            large
            accent="primary"
          />
          <FeatureCard
            icon={ShieldOff}
            title="Zero Data Collection"
            description="No analytics, no tracking, no cloud calls. The app works in airplane mode."
            large
            accent="secondary"
          />

          {/* --- Performance --- */}
          <GroupHeader icon={Gauge} label="Performance" />

          <FeatureCard
            icon={Zap}
            title="Streaming Inference"
            description="Token-by-token generation with real-time t/s metrics. 3-15 tokens/sec depending on hardware."
            accent="secondary"
          />
          <FeatureCard
            icon={Hexagon}
            title="Hexagon NPU Acceleration"
            description="Snapdragon Hexagon HTP backend for supported SoCs (SD 8 Gen 2, 8 Gen 3, 8 Elite). Hybrid CPU/NPU execution with graceful fallback. Supports HTP versions v68-v81."
            large
            accent="primary"
          />
          <FeatureCard
            icon={Cpu}
            title="ARM64 Optimized"
            description="Compiled with -march=armv8.6-a+dotprod+i8mm+bf16+fp16, LTO enabled. SIMD/FPU extensions for maximum throughput."
            accent="primary"
          />

          {/* --- Developer --- */}
          <GroupHeader icon={Code2} label="Developer" />

          <FeatureCard
            icon={Box}
            title="ONNX Runtime Support"
            description="Dual inference engine architecture. Load ONNX models via ORT GenAI with CPU EP (QNN EP planned). Switch engines without recompile."
            accent="secondary"
          />
          <FeatureCard
            icon={Cable}
            title="AIDL Cross-App Service"
            description="Expose LLM inference to any Android app via IPC. Full AIDL interface with sync/async generation, streaming callbacks, and request cancellation."
            accent="primary"
          />
          <FeatureCard
            icon={FileCode2}
            title="Any GGUF Model"
            description="90+ llama.cpp architectures: Llama 3, Mistral, Phi-3, Gemma, Qwen, Falcon. Q2 through Q8 quantization."
            large
            accent="secondary"
          />

          {/* --- Architecture Diagram --- */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-4 md:col-span-2 bg-surface-container rounded-xl border border-white/5 p-10 overflow-hidden"
          >
            <h3 className="font-headline text-2xl font-bold mb-2">Inference Pipeline</h3>
            <p className="font-body text-on-surface-variant text-sm mb-8">
              End-to-end architecture from UI to native code — see the{' '}
              <a href="#pipeline" className="text-primary hover:underline">full animated diagram</a>{' '}
              below
            </p>

            {/* Simplified flow */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <ArchitectureBox label="UI Layer" sub="Jetpack Compose" />
              <ArchitectureArrow />
              <ArchitectureBox label="ViewModel" sub="StateFlow" />
              <ArchitectureArrow />
              <ArchitectureBox label="ModelEngine" sub="Singleton" />
              <ArchitectureArrow />
              <ArchitectureBox label="InferenceEngine" sub="Interface" accent />
              <ArchitectureArrow />
              <div className="flex flex-col gap-2">
                <ArchitectureBox label="LlamaCpp" sub="GGUF" accent />
                <ArchitectureBox label="ONNX Runtime" sub="ORT GenAI" accent />
              </div>
              <ArchitectureArrow />
              <ArchitectureBox label="Native" sub="JNI / C++" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
