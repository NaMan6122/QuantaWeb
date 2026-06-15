import { motion } from 'motion/react';
import { Bolt, Group, LockOpen, Sliders, Sparkles, ShieldCheck, Layers, Cpu, Zap, Terminal, Webhook } from 'lucide-react';

export default function Pricing() {
  const comparisonRows = [
    { feature: "Inference Engine", community: "llama.cpp (ARM64)", developer: "llama.cpp + ONNX Runtime (CPU + QNN)" },
    { feature: "Model Format", community: "GGUF (Q2–Q8)", developer: "GGUF + ONNX" },
    { feature: "Hardware Acceleration", community: "CPU NEON/dotprod", developer: "CPU + Hexagon NPU + QNN NPU" },
    { feature: "Cross-App API", community: "—", developer: "AIDL Service + Inference SDK" },
    { feature: "SDK Modules", community: "—", developer: "quantallm-core, quantallm-llamacpp, quantallm-onnx" },
    { feature: "License Validation", community: "—", developer: "HMAC-signed license key with tiering" },
    { feature: "Context Window", community: "Auto-detect (up to 4096)", developer: "Configurable + KV cache control" },
    { feature: "Thread Config", community: "1–12 threads", developer: "1–12 + Hexagon NDEV/NHVX tuning" },
    { feature: "Chat Sessions", community: "Unlimited", developer: "Unlimited + KV cache persistence" },
    { feature: "Streaming", community: "Token-by-token", developer: "Token-by-token + IInferenceCallback" },
  ];

  return (
    <section id="pricing" className="py-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      <header className="mb-24 text-center">
        <div className="inline-block px-3 py-1 rounded-sm bg-surface-container-highest text-primary font-mono text-[10px] tracking-[0.2em] uppercase mb-6 font-bold">
          Download v2.0.0
        </div>
        <h2 className="text-6xl md:text-7xl font-bold font-headline tracking-tighter mb-8 leading-[0.9]">
          BUILT FOR<br />
          <span className="thermal-text italic">YOUR DEVICE</span>
        </h2>
        <p className="text-on-surface-variant text-xl max-w-2xl mx-auto font-light leading-relaxed">
          QuantaLLM brings production-grade LLM inference to Android — private, offline, and hardware-accelerated. Choose the tier that fits your use case.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-outline-variant/10 border border-outline-variant/10 rounded-xl overflow-hidden mb-32">
        {/* Community */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container-low p-12 flex flex-col justify-between group"
        >
          <div>
            <div className="mb-12">
              <h3 className="text-3xl font-headline font-bold mb-2 uppercase tracking-tighter">Community</h3>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">v2.0.0 — Free</p>
            </div>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Bolt className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Full on-device inference via llama.cpp</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Cpu className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Any GGUF model (Q2–Q8, 90+ architectures)</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Group className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Chat mode with persistent sessions</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Sliders className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Full parameter control (temp, top-k, top-p, penalties, seed)</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Real-time token streaming with t/s metrics</span>
              </li>
              <li className="flex items-center gap-4 text-on-surface-variant group-hover:text-white transition-colors">
                <LockOpen className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">No account, no cloud, no tracking</span>
              </li>
            </ul>
          </div>
          <a
            href="https://github.com/NaMan6122/QuantaLLM-Releases/releases/download/v2.0.0/QuantaLLM-v2.0.0.apk"
            className="block w-full py-4 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all font-headline font-bold uppercase tracking-[0.2em] text-xs text-center rounded"
          >
            Download v2.0.0 APK
          </a>
        </motion.div>

        {/* Developer */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container p-12 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8">
            <span className="bg-secondary/10 text-secondary px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm">v1.0.0</span>
          </div>
          <div>
            <div className="mb-12">
              <h3 className="text-3xl font-headline font-bold mb-2 uppercase tracking-tighter">Developer</h3>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Integrate · Build · Deploy</p>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Embed QuantaLLM's inference engine directly into your own Android app via the QuantaLLM SDK. Generate responses, stream tokens, and run local AI — powered by llama.cpp and ONNX Runtime, exposed via a clean AIDL service interface.
            </p>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4">
                <Webhook className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm font-medium">AIDL cross-app API (ILlamaInference)</span>
              </li>
              <li className="flex items-center gap-4">
                <Terminal className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm font-medium">Bind &amp; call: load model, run inference, stream tokens</span>
              </li>
              <li className="flex items-center gap-4">
                <Zap className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm font-medium">Hexagon NPU acceleration on Snapdragon</span>
              </li>
              <li className="flex items-center gap-4">
                <Layers className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm font-medium">llama.cpp core — 90+ model architectures</span>
              </li>
              <li className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm font-medium">Zero cloud — inference stays on the user's device</span>
              </li>
              <li className="flex items-center gap-4">
                <Sliders className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm font-medium">Full docs, integration guides &amp; API reference</span>
              </li>
            </ul>
          </div>
          <a
            href="https://checkout.dodopayments.com/buy/pdt_0Nh7HvX8q2xjSvUAgHUmh?redirect_url=https://quanta-web-pi.vercel.app/developer/success"
            target="_blank"
            rel="noopener noreferrer"
            className="thermal-gradient block w-full py-4 text-black font-headline font-bold uppercase tracking-[0.2em] text-xs shadow-2xl text-center rounded"
          >
            Buy Developer Tier — $24.99
          </a>
          <a
            href="https://github.com/NaMan6122/QuantaLLM-SDK"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-2 py-3 text-center text-xs text-on-surface-variant hover:text-primary transition-colors font-mono"
          >
            Explore the SDK first on GitHub →
          </a>
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
              <th className="py-8 font-headline text-secondary uppercase tracking-[0.2em] text-[10px] font-bold">Developer</th>
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
