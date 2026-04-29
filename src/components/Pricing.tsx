import { motion } from 'motion/react';
import { Bolt, Group, LockOpen, Sliders, Sparkles, ShieldCheck, RefreshCw, Layers, Cpu, Code } from 'lucide-react';

export default function Pricing() {
  const comparisonRows = [
    { feature: "Model Format", community: "GGUF (Q2\u2013Q8)", developer: "GGUF + ONNX" },
    { feature: "Inference Backend", community: "CPU (ARM64)", developer: "CPU + Hexagon HTP + ONNX" },
    { feature: "Context Window", community: "Auto-detect (up to 4096)", developer: "Configurable + KV cache control" },
    { feature: "Cross-App API", community: "\u2014", developer: "AIDL Service (ILlamaInference)" },
    { feature: "Thread Config", community: "1\u201312 threads", developer: "1\u201312 + Hexagon NDEV/NHVX tuning" },
    { feature: "Chat Sessions", community: "Unlimited", developer: "Unlimited + KV cache persistence" },
    { feature: "Streaming", community: "Token-by-token", developer: "Token-by-token + IInferenceCallback" },
    { feature: "Build Target", community: "Prebuilt ARM64", developer: "Custom CMake + NDK 26.3" },
  ];

  return (
    <section id="pricing" className="py-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      <header className="mb-24 text-center">
        <div className="inline-block px-3 py-1 rounded-sm bg-surface-container-highest text-primary font-mono text-[10px] tracking-[0.2em] uppercase mb-6 font-bold">
          Free & Open Source
        </div>
        <h2 className="text-6xl md:text-7xl font-bold font-headline tracking-tighter mb-8 leading-[0.9]">
          OPEN SOURCE,<br />
          <span className="thermal-text italic">ZERO COST</span>
        </h2>
        <p className="text-on-surface-variant text-xl max-w-2xl mx-auto font-light leading-relaxed">
          QuantaLLM will be free for everyone — get the APK or build from source. No subscriptions, no paywalls, no tracking.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-outline-variant/10 border border-outline-variant/10 rounded-xl overflow-hidden mb-32">
        {/* Community APK */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container-low p-12 flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-3xl font-headline font-bold mb-2 uppercase tracking-tighter">Community</h3>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">Coming Soon — Always Free</p>
              </div>
              <span className="text-4xl font-headline font-bold">$0</span>
            </div>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Bolt className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Full on-device inference</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Cpu className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Any GGUF model</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Group className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Chat mode with sessions</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Sliders className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Full parameter control (temp, top-k, top-p, min-p, penalties, seed)</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Streaming with t/s metrics</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <LockOpen className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">No account required</span>
              </li>
            </ul>
          </div>
          <a
            href="https://github.com/NaMan6122/QuantaLLM2"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all font-headline font-bold uppercase tracking-[0.2em] text-xs text-center"
          >
            Coming Soon
          </a>
        </motion.div>

        {/* Developer / Source */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container p-12 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8">
            <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm">Open Source</span>
          </div>
          <div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-3xl font-headline font-bold mb-2 uppercase tracking-tighter">Developer</h3>
                <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Build from Source</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-headline font-bold">$0</span>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter mt-1">Fork & Contribute</p>
              </div>
            </div>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4">
                <Code className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Full source access</span>
              </li>
              <li className="flex items-center gap-4">
                <Layers className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Dual engine architecture (llama.cpp + ONNX Runtime)</span>
              </li>
              <li className="flex items-center gap-4">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">AIDL cross-app service</span>
              </li>
              <li className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Hexagon NPU backend</span>
              </li>
              <li className="flex items-center gap-4">
                <RefreshCw className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">MVVM + Repository + Strategy pattern architecture</span>
              </li>
              <li className="flex items-center gap-4">
                <Sliders className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Comprehensive documentation</span>
              </li>
            </ul>
          </div>
          <motion.a
            href="https://github.com/NaMan6122/QuantaLLM2"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="thermal-gradient block w-full py-4 text-black font-headline font-bold uppercase tracking-[0.2em] text-xs shadow-2xl text-center"
          >
            View on GitHub
          </motion.a>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <div className="mt-40 overflow-x-auto">
        <h3 className="text-4xl font-headline font-bold mb-16 tracking-tighter uppercase">Technical Specifications</h3>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-8 font-headline text-on-surface-variant uppercase tracking-[0.2em] text-[10px] font-bold">Feature</th>
              <th className="py-8 font-headline text-on-surface-variant uppercase tracking-[0.2em] text-[10px] font-bold">Community</th>
              <th className="py-8 font-headline text-primary uppercase tracking-[0.2em] text-[10px] font-bold">Developer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {comparisonRows.map((row) => (
              <tr key={row.feature} className="group hover:bg-white/[0.02] transition-colors">
                <td className="py-8 font-medium text-sm">{row.feature}</td>
                <td className="py-8 text-on-surface-variant text-sm">{row.community}</td>
                <td className="py-8 text-white text-sm font-medium">{row.developer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
