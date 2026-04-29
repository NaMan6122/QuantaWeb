import { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Download, ChevronRight, Cpu, Play, MessageSquare, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const NeuralMeshBackground = lazy(() => import('./NeuralMeshBackground'));

export default function Hero() {
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const poweredBy = ['llama.cpp', 'Hexagon DSP', 'ONNX Runtime', 'ARM64'];

  const steps = [
    { icon: Cpu, label: 'Load Model', desc: 'Pick any GGUF or ONNX model' },
    { icon: Play, label: 'Run Locally', desc: 'Inference on-device, zero cloud' },
    { icon: MessageSquare, label: 'Stream Response', desc: 'Real-time token streaming' },
  ];

  return (
    <section className="relative pt-48 pb-32 px-6 md:px-12 overflow-hidden">
      <Suspense fallback={null}>
        <NeuralMeshBackground />
      </Suspense>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left column */}
        <div className="flex flex-col">
          <motion.h1
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-4"
          >
            On-Device LLM Inference{' '}
            <span className="text-on-surface-variant">for Android</span>
          </motion.h1>

          <motion.p
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="thermal-text font-headline text-2xl md:text-3xl font-bold tracking-tight mb-8"
          >
            Zero Cloud. Zero Compromise.
          </motion.p>

          <motion.p
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="font-body text-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed"
          >
            QuantaLLM runs large language models entirely on your phone. Powered
            by llama.cpp with Snapdragon Hexagon NPU acceleration and ONNX
            Runtime support -- 100% offline, fully private inference on ARM64.
          </motion.p>

          {/* Powered by badges */}
          <motion.div
            custom={3}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-2 mb-10"
          >
            <span className="text-xs text-on-surface-variant font-body mr-1 self-center">
              Powered by
            </span>
            {poweredBy.map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono text-primary/90 border border-primary/20 bg-primary/5 rounded-full px-3 py-1"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            custom={4}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4 mb-14"
          >
            <motion.a
              href="https://github.com/NaMan6122/QuantaLLM2"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="thermal-gradient text-black px-8 py-4 rounded-lg text-lg font-bold font-headline flex items-center gap-2 group transition-all"
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
          </motion.div>

          {/* How it works mini-steps */}
          <motion.div
            custom={5}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-4 max-w-xl"
          >
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center text-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-outline-variant absolute -right-5 hidden sm:block" />
                  )}
                </div>
                <span className="font-headline text-sm font-semibold text-white">
                  {i + 1}. {step.label}
                </span>
                <span className="font-body text-[11px] text-on-surface-variant leading-tight">
                  {step.desc}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column -- terminal mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative lg:block hidden"
        >
          <div className="absolute -inset-20 bg-primary/20 blur-[120px] rounded-full" />
          <div className="relative bg-surface-container border border-outline-variant/20 rounded-xl p-4 shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-4">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <div className="ml-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                quantallm -- inference log
              </div>
            </div>

            {/* Terminal content */}
            <div className="font-mono text-sm space-y-2 text-on-surface-variant p-2">
              <p className="text-primary">
                $ quantallm load phi-3-mini-q4_k_m.gguf
              </p>
              <p className="text-on-surface-variant/60">
                [info] Scanning hardware capabilities...
              </p>
              <p className="text-secondary">
                ✔ Qualcomm Hexagon DSP detected -- enabling NPU offload
              </p>
              <p className="animate-pulse">
                ⠋ Mapping model layers... [2.1GB / 4 threads]
              </p>
              <p className="text-secondary">
                ✔ Model loaded in 2.3s -- Context: 4096 tokens
              </p>
              <p className="text-on-surface-variant/60 mt-2">
                [info] Backend: llama.cpp | Device: ARM64 + Hexagon NPU
              </p>
              <p className="text-white mt-4 font-bold">
                &gt;&gt;&gt; Explain quantum computing briefly.
              </p>
              <p className="text-primary/80 mt-2 leading-relaxed">
                Quantum computing leverages quantum-mechanical phenomena
                <br />
                such as superposition and entanglement to perform
                <br />
                computations on qubits rather than classical bits...
              </p>
              <p className="text-on-surface-variant/40 mt-3 text-xs">
                Speed: 14.2 t/s | Mem: 1.8GB | Backend: Hexagon NPU + CPU | Privacy: 100% On-Device
              </p>
              <div className="w-2 h-4 bg-primary animate-pulse inline-block align-middle ml-1" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
