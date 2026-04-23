import CodeBlock from '../CodeBlock';

export default function ModelFormats() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Model Formats</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        QuantaLLM supports two model formats for on-device LLM inference: GGUF as the primary format
        via llama.cpp, and ONNX as a secondary format via ONNX Runtime GenAI. This guide covers
        the internal structure of each format, quantization strategies, supported architectures,
        model scanning behavior, and practical guidance for choosing the right model for your device.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Overview                                                         */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Overview</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Running large language models on mobile devices requires compact, efficient model
        representations. QuantaLLM achieves this through two complementary formats:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>GGUF (GPT-Generated Unified Format)</strong> — the primary and recommended format.
          A single self-contained binary file that packages weights, architecture metadata, and
          tokenizer data together. Powered by llama.cpp.
        </li>
        <li>
          <strong>ONNX (Open Neural Network Exchange)</strong> — a secondary format using a
          directory-based structure with separate files for the model graph, configuration, and
          tokenizer. Powered by ONNX Runtime GenAI (v0.12.2).
        </li>
      </ul>
      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Recommendation:</strong> For most users, GGUF models are the best choice. They
          are simpler to manage (single file), have broader architecture support, and benefit from
          mature memory-mapped loading in llama.cpp. ONNX support is provided for specialized
          workflows and future QNN/Hexagon acceleration.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. GGUF Format Deep Dive                                            */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">GGUF Format Deep Dive</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">History and Evolution</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The GGUF format is the culmination of several iterations by Georgi Gerganov and the
        llama.cpp open-source project:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>GGML (2023-Q1)</strong> — the original format used by the ggml tensor library.
          Stored raw quantized weights with minimal metadata. Lacked versioning and was fragile
          across updates.
        </li>
        <li>
          <strong>GGJT (2023-Q2)</strong> — added alignment padding for memory-mapped loading and
          basic version headers. Still required external tokenizer files and architecture-specific
          loading code.
        </li>
        <li>
          <strong>GGUF (2023-Q3+)</strong> — a complete redesign introducing a self-describing
          key-value metadata system. All information needed to load and run a model (architecture,
          tokenizer, hyperparameters) is embedded in a single file. This is the current and only
          supported GGML-family format.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">File Structure</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        A GGUF file is a binary container with a well-defined layout:
      </p>
      <CodeBlock language="text">{`┌──────────────────────────────────────────────┐
│  Magic Number     (4 bytes: "GGUF")          │
│  Version          (uint32: currently 3)      │
│  Tensor Count     (uint64)                   │
│  Metadata KV Count (uint64)                  │
├──────────────────────────────────────────────┤
│  Metadata Key-Value Pairs                    │
│    general.architecture = "llama"             │
│    general.name = "Meta-Llama-3-8B"          │
│    llama.context_length = 8192               │
│    llama.embedding_length = 4096             │
│    llama.block_count = 32                    │
│    llama.attention.head_count = 32           │
│    tokenizer.ggml.model = "gpt2"             │
│    tokenizer.ggml.tokens = [...]             │
│    tokenizer.ggml.merges = [...]             │
│    ... (dozens more KV pairs)                │
├──────────────────────────────────────────────┤
│  Tensor Metadata (name, shape, type, offset) │
│    token_embd.weight [32000 x 4096] Q4_K     │
│    blk.0.attn_q.weight [4096 x 4096] Q4_K    │
│    blk.0.attn_k.weight [1024 x 4096] Q4_K    │
│    ...                                       │
├──────────────────────────────────────────────┤
│  Alignment Padding (to page boundary)        │
├──────────────────────────────────────────────┤
│  Tensor Data (quantized weight values)       │
│    Contiguous, page-aligned blocks           │
└──────────────────────────────────────────────┘`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Self-Contained Design</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Unlike earlier formats that required separate tokenizer files, prompt templates, or
        configuration JSONs, a GGUF file embeds everything in one binary:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Model weights</strong> — quantized tensor data for all layers</li>
        <li><strong>Architecture metadata</strong> — layer count, embedding dimensions, attention head configuration, context length, RoPE parameters</li>
        <li><strong>Tokenizer</strong> — full vocabulary, merge rules (BPE), and special token IDs (BOS, EOS, PAD)</li>
        <li><strong>Chat template</strong> — Jinja2 template for formatting multi-turn conversations (when provided by the converter)</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Memory-Mapped Loading</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        GGUF files are designed for memory-mapped I/O via <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">mmap()</code>.
        Instead of reading the entire file into RAM, the operating system maps the file directly
        into the process's virtual address space. Pages are loaded on demand as the model accesses
        specific weights during inference.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Benefits of memory mapping on mobile devices:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Reduced peak memory</strong> — only pages currently being used occupy physical RAM</li>
        <li><strong>Fast startup</strong> — no need to read and decompress the full file before inference begins</li>
        <li><strong>OS-managed paging</strong> — the kernel can evict and reload pages under memory pressure, preventing OOM kills</li>
        <li><strong>Alignment</strong> — tensor data is padded to page boundaries in GGUF v3, ensuring each tensor can be mapped independently</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Why GGUF for Mobile</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        GGUF is the ideal format for on-device inference because of its combination of simplicity
        and efficiency:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Single file — easy to download, transfer, and manage on a phone</li>
        <li>No external dependencies — no tokenizer files, no config JSONs, no Python environment</li>
        <li>Efficient memory-mapped loading — the OS handles paging automatically</li>
        <li>Broad quantization support — from 2-bit to 8-bit, covering every device tier</li>
        <li>Mature ecosystem — thousands of pre-quantized models available on HuggingFace</li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Quantization Types                                               */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Quantization Types</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Quantization reduces the precision of model weights from 16-bit floating point (FP16) to
        lower bit widths. This dramatically reduces file size and memory usage at the cost of some
        quality degradation. GGUF supports a wide range of quantization schemes.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">K-Quant vs Legacy Quantization</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        There are two families of quantization methods in GGUF:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Legacy quantization</strong> (Q4_0, Q5_0, Q8_0) — uses a simple block-wise
          quantization scheme where each block of weights shares a single scale factor. Fast to
          compute but less accurate.
        </li>
        <li>
          <strong>K-quant</strong> (Q2_K, Q3_K_*, Q4_K_*, Q5_K_*, Q6_K) — uses a more
          sophisticated approach with multiple scale factors per block (a "super-block" structure).
          Different layers can use different bit widths based on their sensitivity. Produces
          significantly better quality at the same average bit width.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Size Suffixes: _S, _M, _L</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        K-quant types with suffixes use mixed quantization across layers:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>_S (Small)</strong> — more layers use the lower bit width. Smallest file size, lowest quality within that bit level.</li>
        <li><strong>_M (Medium)</strong> — balanced mix. A good default choice that trades a small size increase for noticeably better quality.</li>
        <li><strong>_L (Large)</strong> — more layers use the higher bit width. Largest file size within the level, closest to the next quantization tier.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Complete Quantization Table</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Type</th>
              <th className="text-left py-3 pr-4 font-bold">Bits/Weight</th>
              <th className="text-left py-3 pr-4 font-bold">Quality</th>
              <th className="text-left py-3 pr-4 font-bold">Size (7B)</th>
              <th className="text-left py-3 font-bold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q2_K</code></td><td className="py-3 pr-4">2.5</td><td className="py-3 pr-4">Significant quality loss</td><td className="py-3 pr-4">~2.7 GB</td><td className="py-3">Smallest usable size; only for extreme memory constraints</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q3_K_S</code></td><td className="py-3 pr-4">3.0</td><td className="py-3 pr-4">Noticeable quality loss</td><td className="py-3 pr-4">~2.9 GB</td><td className="py-3">Minimal variant of 3-bit</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q3_K_M</code></td><td className="py-3 pr-4">3.4</td><td className="py-3 pr-4">Fair quality</td><td className="py-3 pr-4">~3.3 GB</td><td className="py-3">Budget devices with 4 GB RAM</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q3_K_L</code></td><td className="py-3 pr-4">3.9</td><td className="py-3 pr-4">Moderate quality</td><td className="py-3 pr-4">~3.6 GB</td><td className="py-3">Upper range of 3-bit quantization</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q4_0</code></td><td className="py-3 pr-4">4.0</td><td className="py-3 pr-4">Acceptable</td><td className="py-3 pr-4">~3.8 GB</td><td className="py-3">Legacy quantization; prefer Q4_K_S instead</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q4_K_S</code></td><td className="py-3 pr-4">4.4</td><td className="py-3 pr-4">Good</td><td className="py-3 pr-4">~3.9 GB</td><td className="py-3">Good balance for mid-range devices</td></tr>
            <tr className="border-b border-outline-variant/20 bg-surface-container"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm"><strong>Q4_K_M</strong></code></td><td className="py-3 pr-4"><strong>4.8</strong></td><td className="py-3 pr-4"><strong>Good — Recommended</strong></td><td className="py-3 pr-4"><strong>~4.1 GB</strong></td><td className="py-3"><strong>Best quality/speed/size balance for most devices</strong></td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q5_0</code></td><td className="py-3 pr-4">5.0</td><td className="py-3 pr-4">Very good</td><td className="py-3 pr-4">~4.3 GB</td><td className="py-3">Legacy 5-bit; prefer Q5_K_S</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q5_K_S</code></td><td className="py-3 pr-4">5.4</td><td className="py-3 pr-4">Very good</td><td className="py-3 pr-4">~4.5 GB</td><td className="py-3">Good for devices with headroom</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q5_K_M</code></td><td className="py-3 pr-4">5.7</td><td className="py-3 pr-4">Very good</td><td className="py-3 pr-4">~4.8 GB</td><td className="py-3">Quality-focused; 6+ GB RAM devices</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q6_K</code></td><td className="py-3 pr-4">6.6</td><td className="py-3 pr-4">Excellent</td><td className="py-3 pr-4">~5.5 GB</td><td className="py-3">High-end devices; near-FP16 quality</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">Q8_0</code></td><td className="py-3 pr-4">8.0</td><td className="py-3 pr-4">Near-FP16</td><td className="py-3 pr-4">~7.2 GB</td><td className="py-3">Maximum quality; requires 12+ GB RAM for 7B</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Importance-Matrix (IQ) Quantizations</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        IQ quantization types use an importance matrix derived from calibration data to allocate
        more bits to weights that have a larger impact on model output. These are experimental
        and offer improved quality at very low bit widths compared to standard K-quants.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Type</th>
              <th className="text-left py-3 pr-4 font-bold">Approx. Bits</th>
              <th className="text-left py-3 font-bold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ1_S</code></td><td className="py-3 pr-4">~1.5</td><td className="py-3">Extreme compression; research use only</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ2_XXS</code></td><td className="py-3 pr-4">~2.0</td><td className="py-3">Ultra-low bit; significant quality loss</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ2_XS</code></td><td className="py-3 pr-4">~2.3</td><td className="py-3">Very low bit; noticeable degradation</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ2_S</code></td><td className="py-3 pr-4">~2.5</td><td className="py-3">Low bit; comparable to Q2_K with better accuracy</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ3_XXS</code></td><td className="py-3 pr-4">~3.0</td><td className="py-3">Competitive with Q3_K_S at smaller size</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ3_S</code></td><td className="py-3 pr-4">~3.4</td><td className="py-3">Competitive with Q3_K_M at smaller size</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ4_NL</code></td><td className="py-3 pr-4">~4.5</td><td className="py-3">Non-linear quantization; good quality</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4"><code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">IQ4_XS</code></td><td className="py-3 pr-4">~4.3</td><td className="py-3">Compact 4-bit with importance weighting</td></tr>
          </tbody>
        </table>
      </div>
      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> IQ quantization types are experimental. Compatibility and
          performance may vary across model architectures. Stick with K-quant types (Q4_K_M, Q5_K_M)
          for production use.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Supported Architectures                                          */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Supported Architectures</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM supports a broad range of transformer architectures via the llama.cpp backend.
        Any model converted to GGUF format using a supported architecture will work. Below is
        a comprehensive list organized by provider.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Meta — LLaMA Family</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>LLaMA 1</strong> — the original open-weight LLM (7B, 13B, 33B, 65B)</li>
        <li><strong>LLaMA 2</strong> — improved training, longer context (7B, 13B, 70B), Chat variants</li>
        <li><strong>LLaMA 3</strong> — new tokenizer (128K vocab), 8B and 70B parameter sizes</li>
        <li><strong>LLaMA 3.1</strong> — extended 128K context, improved multilingual support</li>
        <li><strong>LLaMA 3.2</strong> — small models (1B, 3B) optimized for mobile and edge</li>
        <li><strong>Code Llama</strong> — code-specialized LLaMA 2 variants (7B, 13B, 34B)</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Mistral AI</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Mistral 7B</strong> — sliding window attention, grouped-query attention</li>
        <li><strong>Mixtral 8x7B</strong> — sparse Mixture of Experts (MoE), 8 experts with 2 active</li>
        <li><strong>Mixtral 8x22B</strong> — larger MoE variant for high-capacity tasks</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Microsoft — Phi Family</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Phi-2</strong> — 2.7B parameters, strong reasoning for its size</li>
        <li><strong>Phi-3</strong> — 3.8B parameters, mini/small/medium variants</li>
        <li><strong>Phi-3.5</strong> — improved instruction following and multilingual capabilities</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Google — Gemma Family</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Gemma</strong> — 2B and 7B, built from Gemini research</li>
        <li><strong>Gemma 2</strong> — 2B, 9B, and 27B with improved architecture</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Alibaba — Qwen Family</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Qwen</strong> — original series (1.8B, 7B, 14B, 72B)</li>
        <li><strong>Qwen2</strong> — improved architecture with GQA, 0.5B to 72B</li>
        <li><strong>Qwen2.5</strong> — latest iteration, strong multilingual and coding performance</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">TII — Falcon Family</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Falcon</strong> — 7B and 40B, multi-query attention</li>
        <li><strong>Falcon 2</strong> — 11B with improved training data</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">BigScience</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>BLOOM</strong> — 176B parameter multilingual model (smaller variants available)</li>
        <li><strong>BLOOMZ</strong> — instruction-tuned BLOOM variants</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">EleutherAI</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>GPT-NeoX</strong> — 20B parameter model with rotary embeddings</li>
        <li><strong>Pythia</strong> — suite of models (70M to 12B) for research</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Stability AI</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>StableLM</strong> — 3B and 7B base models</li>
        <li><strong>StableLM 2</strong> — improved architecture, 1.6B and 12B variants</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">DeepSeek</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>DeepSeek</strong> — 7B and 67B general-purpose models</li>
        <li><strong>DeepSeek-Coder</strong> — code-specialized variants (1.3B, 6.7B, 33B)</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Other Supported Architectures</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Yi</strong> (01.AI) — 6B, 9B, and 34B models</li>
        <li><strong>InternLM</strong> (Shanghai AI Lab) — 7B and 20B</li>
        <li><strong>Baichuan</strong> (Baichuan Inc.) — 7B and 13B, optimized for Chinese</li>
        <li><strong>StarCoder</strong> (BigCode) — 1B, 3B, 7B, 15B code models</li>
        <li><strong>MPT</strong> (MosaicML) — 7B and 30B with ALiBi attention</li>
        <li><strong>RedPajama</strong> (Together AI) — open reproduction of LLaMA training</li>
        <li><strong>OpenLLaMA</strong> — permissively licensed LLaMA reproductions</li>
      </ul>
      <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> The llama.cpp project adds new architecture support regularly.
          If a new model family has been added to llama.cpp and converted to GGUF format,
          it will likely work with QuantaLLM after a backend update.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Model Scanning                                                   */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Model Scanning</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM automatically discovers models on the device through its{' '}
        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">ModelRepository</code> component.
        The scanning process runs at app startup and can be triggered manually from the model
        management screen.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Scanned Directories</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The following directories are scanned for GGUF model files:
      </p>
      <CodeBlock language="text" title="GGUF Scan Paths">{`/storage/emulated/0/Download/          # Downloads folder
/storage/emulated/0/Documents/         # Documents folder
/storage/emulated/0/models/            # Dedicated models folder
/storage/<sdcard-id>/Download/         # External SD card (if present)
/storage/<sdcard-id>/Documents/        # External SD card (if present)
/storage/<sdcard-id>/models/           # External SD card (if present)`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        For ONNX models, the scanner looks for directories containing{' '}
        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">.onnx</code> files
        within the same set of paths.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">File Validation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Not every file found during scanning is treated as a valid model. The scanner applies
        these checks:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Extension check</strong> — file must have a <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">.gguf</code> extension (case-insensitive)</li>
        <li><strong>Minimum file size</strong> — file must be at least 10 MB. This filters out incomplete downloads, metadata files, and other non-model files</li>
        <li><strong>GGUF header validation</strong> — the scanner reads the file header to verify the GGUF magic number and version</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Metadata Extraction</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        After validation, the scanner reads the GGUF metadata key-value section to extract:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Model name and architecture type</li>
        <li>Parameter count and quantization type</li>
        <li>Context length and embedding dimensions</li>
        <li>Tokenizer vocabulary size</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Memory Pre-Check</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Before listing a model as available, QuantaLLM calls{' '}
        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">ModelEngine.checkMemoryForModel()</code> to
        estimate whether the device has sufficient free RAM to load the model. Models that exceed
        available memory are still listed but flagged with a warning indicator.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Scanning Code Flow</h3>
      <CodeBlock language="kotlin" title="ModelRepository.kt — Scan Flow">{`// Simplified scan flow
fun scanForModels(): List<ModelInfo> {
    val models = mutableListOf<ModelInfo>()

    // 1. Define scan directories
    val scanDirs = listOf(
        Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_DOWNLOADS),
        Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_DOCUMENTS),
        File(Environment.getExternalStorageDirectory(), "models")
    )

    // 2. Scan each directory for GGUF files
    for (dir in scanDirs) {
        dir.listFiles()?.forEach { file ->
            if (file.extension.equals("gguf", ignoreCase = true)
                && file.length() >= 10 * 1024 * 1024) {
                // 3. Read GGUF header metadata
                val metadata = GGUFReader.readMetadata(file)
                // 4. Check device memory
                val memOk = ModelEngine.checkMemoryForModel(
                    file.length())
                models.add(ModelInfo(file, metadata, memOk))
            }
        }
    }

    // 5. Scan for ONNX model directories
    for (dir in scanDirs) {
        dir.listFiles()?.filter { it.isDirectory }?.forEach { subdir ->
            if (subdir.listFiles()?.any {
                it.extension == "onnx" } == true) {
                models.add(ModelInfo.fromOnnxDir(subdir))
            }
        }
    }

    return models
}`}</CodeBlock>

      {/* ------------------------------------------------------------------ */}
      {/* 6. ONNX Format Deep Dive                                            */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">ONNX Format Deep Dive</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">What is ONNX?</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        ONNX (Open Neural Network Exchange) is an open standard for representing machine learning
        models. Unlike GGUF, which stores raw quantized weights, ONNX represents the model as a
        computational graph — a directed acyclic graph (DAG) of operations (MatMul, Softmax,
        LayerNorm, etc.) with weights attached to operator nodes.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        ONNX was originally developed by Microsoft and Facebook as an interoperability format,
        allowing models trained in PyTorch, TensorFlow, or other frameworks to be exported and
        run in a unified inference runtime.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Directory Structure</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        ONNX models in QuantaLLM require a specific directory layout with multiple files:
      </p>
      <CodeBlock language="text" title="Required ONNX Model Directory">{`model-directory/
├── model.onnx                # Model weights and computation graph
├── genai_config.json         # ORT GenAI configuration
├── tokenizer.model           # SentencePiece or BPE tokenizer binary
├── tokenizer_config.json     # Tokenizer parameters and settings
└── special_tokens_map.json   # Special token definitions (BOS, EOS, PAD)`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">model.onnx</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The primary model file containing the serialized computation graph in Protocol Buffer
        format. Includes all weight tensors, operator definitions, and graph connectivity.
        This is typically the largest file in the directory.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">genai_config.json</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Configuration file specific to the ONNX Runtime GenAI framework. It specifies:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Model type and architecture identifier</li>
        <li>Search parameters (beam width, temperature, top-k, top-p defaults)</li>
        <li>Vocabulary size and special token IDs</li>
        <li>Input/output tensor names and shapes</li>
        <li>Execution provider preferences</li>
      </ul>
      <CodeBlock language="json" title="Example genai_config.json">{`{
  "model": {
    "type": "phi3",
    "vocab_size": 32064,
    "context_length": 4096,
    "bos_token_id": 1,
    "eos_token_id": 32000,
    "pad_token_id": 32000
  },
  "search": {
    "max_length": 2048,
    "do_sample": true,
    "top_k": 50,
    "top_p": 0.9,
    "temperature": 0.7,
    "repetition_penalty": 1.1
  }
}`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Tokenizer Files</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The tokenizer is stored externally (unlike GGUF, where it is embedded).{' '}
        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">tokenizer.model</code> contains the
        SentencePiece or BPE model binary, while{' '}
        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">tokenizer_config.json</code> defines
        parameters like padding direction and truncation behavior.{' '}
        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">special_tokens_map.json</code> maps
        special token names to their string representations.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ORT GenAI Framework</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM uses the <strong>ONNX Runtime GenAI</strong> (v0.12.2) library for ONNX model
        inference. This is a specialized extension of ONNX Runtime designed for generative AI
        workloads. It provides:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Autoregressive token generation with KV-cache management</li>
        <li>Built-in search algorithms (greedy, beam search, sampling)</li>
        <li>Tokenizer integration for end-to-end text-in / text-out inference</li>
        <li>Support for multiple execution providers (CPU, CUDA, QNN)</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">How ONNX Differs from GGUF</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Aspect</th>
              <th className="text-left py-3 pr-4 font-bold">GGUF</th>
              <th className="text-left py-3 font-bold">ONNX</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Representation</td><td className="py-3 pr-4">Raw quantized weights</td><td className="py-3">Computation graph + weights</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">File layout</td><td className="py-3 pr-4">Single binary file</td><td className="py-3">Directory with multiple files</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Tokenizer</td><td className="py-3 pr-4">Embedded in file</td><td className="py-3">Separate tokenizer.model file</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Loading</td><td className="py-3 pr-4">Memory-mapped (mmap)</td><td className="py-3">Graph deserialization</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Inference engine</td><td className="py-3 pr-4">llama.cpp (GGML)</td><td className="py-3">ONNX Runtime GenAI</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Quantization</td><td className="py-3 pr-4">Many types (Q2-Q8, IQ)</td><td className="py-3">INT4, INT8, FP16</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Architecture support</td><td className="py-3 pr-4">70+ architectures</td><td className="py-3">Limited (model-specific export)</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Hardware accel.</td><td className="py-3 pr-4">GGML Hexagon backend</td><td className="py-3">QNN Execution Provider (planned)</td></tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Execution Providers for ONNX                                     */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Execution Providers for ONNX</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        ONNX Runtime uses "execution providers" (EPs) to map graph operations to hardware
        backends. QuantaLLM currently supports one EP with another planned:
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">CPU Execution Provider</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The CPU EP is available on all devices. It runs inference on the ARM64 CPU using
        optimized NEON SIMD instructions. While not as fast as hardware-accelerated providers,
        it offers universal compatibility and predictable behavior.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Available on all Android devices with ARM64 processors</li>
        <li>Uses NEON vectorization for matrix operations</li>
        <li>Multi-threaded inference across available CPU cores</li>
        <li>No special driver or SDK requirements</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">QNN Execution Provider (Planned — Phase 2)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Qualcomm Neural Network (QNN) execution provider will enable offloading ONNX graph
        operations to the Hexagon Tensor Processor on supported Snapdragon SoCs. This is planned
        for Phase 2 of QuantaLLM's ONNX integration.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Requires Qualcomm QNN SDK and compatible Snapdragon chipset</li>
        <li>Offloads supported operations (MatMul, Conv, Softmax) to the HTP</li>
        <li>Falls back to CPU EP for unsupported operations</li>
        <li>Expected to provide 2-4x throughput improvement over CPU-only execution</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">GGUF+Hexagon vs ONNX+QNN</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM has two paths to Hexagon acceleration, targeting different model formats:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Aspect</th>
              <th className="text-left py-3 pr-4 font-bold">GGUF + GGML Hexagon</th>
              <th className="text-left py-3 font-bold">ONNX + QNN EP</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Status</td><td className="py-3 pr-4">Active (Phase 1)</td><td className="py-3">Planned (Phase 2)</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Backend</td><td className="py-3 pr-4">GGML Hexagon backend in llama.cpp</td><td className="py-3">QNN EP in ONNX Runtime</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Integration</td><td className="py-3 pr-4">Operator-level offload</td><td className="py-3">Graph-level partitioning</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Model availability</td><td className="py-3 pr-4">Thousands of GGUF models</td><td className="py-3">Requires QNN-optimized ONNX export</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Quantization</td><td className="py-3 pr-4">K-quant (Q4_K_M, etc.)</td><td className="py-3">INT4/INT8 via ORT quantizer</td></tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 8. Choosing the Right Model                                         */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Choosing the Right Model</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Selecting the right model depends on your device's hardware, your use case, and your
        tolerance for quality vs. speed trade-offs.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">By Device RAM</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Device RAM</th>
              <th className="text-left py-3 pr-4 font-bold">Recommended Quant</th>
              <th className="text-left py-3 pr-4 font-bold">Model Size</th>
              <th className="text-left py-3 font-bold">Example Models</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">3 GB</td><td className="py-3 pr-4">Q3_K_M / Q4_K_S</td><td className="py-3 pr-4">1-1.5B</td><td className="py-3">Phi-3 Mini Q3, LLaMA 3.2 1B Q4</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">4 GB</td><td className="py-3 pr-4">Q3_K_M / Q4_K_M</td><td className="py-3 pr-4">1-3B</td><td className="py-3">LLaMA 3.2 3B Q3, Phi-3 Q4</td></tr>
            <tr className="border-b border-outline-variant/20 bg-surface-container"><td className="py-3 pr-4"><strong>6 GB</strong></td><td className="py-3 pr-4"><strong>Q4_K_M</strong></td><td className="py-3 pr-4"><strong>3-7B</strong></td><td className="py-3"><strong>Mistral 7B Q4, LLaMA 3 8B Q3</strong></td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">8 GB</td><td className="py-3 pr-4">Q4_K_M / Q5_K_M</td><td className="py-3 pr-4">7-8B</td><td className="py-3">LLaMA 3 8B Q4, Gemma 2 9B Q3</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">12+ GB</td><td className="py-3 pr-4">Q5_K_M / Q6_K / Q8_0</td><td className="py-3 pr-4">7-13B</td><td className="py-3">LLaMA 3 8B Q6, Qwen2.5 7B Q8</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">By Use Case</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Use Case</th>
              <th className="text-left py-3 pr-4 font-bold">Recommended Models</th>
              <th className="text-left py-3 font-bold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">General chat</td><td className="py-3 pr-4">LLaMA 3, Mistral 7B, Qwen2.5</td><td className="py-3">Chat-tuned variants preferred</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Coding assistance</td><td className="py-3 pr-4">Code Llama, DeepSeek-Coder, Qwen2.5-Coder</td><td className="py-3">Code-specialized training data</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Instruction following</td><td className="py-3 pr-4">Phi-3, Gemma 2, LLaMA 3 Instruct</td><td className="py-3">Look for "instruct" or "chat" variants</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Creative writing</td><td className="py-3 pr-4">LLaMA 3 8B, Mistral 7B</td><td className="py-3">Higher quant (Q5+) for nuanced output</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">By Speed Requirements</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Fast (15-30+ tok/s)</strong> — 1-3B parameter models at Q4_K_M. Best for real-time conversational use on mid-range devices.</li>
        <li><strong>Balanced (5-15 tok/s)</strong> — 3-7B parameter models at Q4_K_M. The sweet spot for most users — acceptable speed with good quality.</li>
        <li><strong>Quality (2-8 tok/s)</strong> — 7B+ models at Q5_K_M or Q6_K. Slower but noticeably better responses. Best for high-end devices.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Size Estimation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        You can estimate the file size of a quantized model using this formula:
      </p>
      <CodeBlock language="text" title="Size Estimation Formula">{`File Size (GB) ≈ (Parameters × Bits_per_Weight) / 8 / 1,000,000,000 + Overhead

Examples:
  7B  × Q4_K_M (4.8 bpw): (7e9 × 4.8) / 8 / 1e9 ≈ 4.2 GB + ~0.1 GB overhead ≈ 4.3 GB
  3B  × Q4_K_M (4.8 bpw): (3e9 × 4.8) / 8 / 1e9 ≈ 1.8 GB + ~0.1 GB overhead ≈ 1.9 GB
  13B × Q4_K_M (4.8 bpw): (13e9 × 4.8) / 8 / 1e9 ≈ 7.8 GB + ~0.2 GB overhead ≈ 8.0 GB

Runtime RAM ≈ File Size + Context Buffer (0.5–2 GB depending on context length)`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Recommendation:</strong> For most users, a <strong>Q4_K_M</strong> quantized model in the
          3-7B parameter range offers the best balance of quality, speed, and memory usage.
          Start with LLaMA 3.2 3B Q4_K_M if you have 4-6 GB RAM, or Mistral 7B Q4_K_M if you
          have 6-8 GB.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 9. Downloading Models                                               */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Downloading Models</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">HuggingFace Hub</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The primary source for GGUF models is HuggingFace Hub. Use these search strategies to
        find the right model:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Filter by the <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm">gguf</code> tag on the Models page</li>
        <li>Sort by "Most downloads" to find popular, well-tested quantizations</li>
        <li>Search for the model name + "GGUF" (e.g., "Mistral 7B GGUF")</li>
        <li>Check the model card for quantization details and benchmark results</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Direct Download URLs</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        HuggingFace models can be downloaded directly using predictable URL patterns:
      </p>
      <CodeBlock language="text" title="HuggingFace Download URL Pattern">{`https://huggingface.co/<user>/<repo>/resolve/main/<filename>.gguf

Examples:
https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf
https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/Mistral-7B-Instruct-v0.3-Q4_K_M.gguf`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Popular GGUF Quantizers</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Several HuggingFace users maintain large collections of pre-quantized GGUF models:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>TheBloke</strong> — one of the earliest and most prolific GGUF quantizers, with hundreds of models. Note: some older repos may use outdated quantization methods.</li>
        <li><strong>bartowski</strong> — maintains up-to-date quantizations of popular models using latest llama.cpp</li>
        <li><strong>mradermacher</strong> — comprehensive quantization coverage including IQ types</li>
        <li><strong>QuantFactory</strong> — automated quantization pipeline with consistent naming</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Verifying Model Integrity</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        After downloading a model, verify it before relying on it:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>File size</strong> — compare against the expected size listed on the model page. A file significantly smaller than expected may be incomplete.</li>
        <li><strong>Loading test</strong> — attempt to load the model in QuantaLLM. A successful load confirms the GGUF header, metadata, and tensor data are intact.</li>
        <li><strong>Quick inference test</strong> — send a simple prompt ("Hello, how are you?") and verify you get coherent output. Garbled output may indicate a corrupted download.</li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 10. Troubleshooting Model Issues                                    */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Troubleshooting Model Issues</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Not Appearing After Download</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Symptom</th>
              <th className="text-left py-3 pr-4 font-bold">Cause</th>
              <th className="text-left py-3 font-bold">Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Model not listed</td><td className="py-3 pr-4">File not in scanned directory</td><td className="py-3">Move file to Downloads/, Documents/, or models/</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Model not listed</td><td className="py-3 pr-4">Wrong file extension</td><td className="py-3">Rename to .gguf (some downloads omit the extension)</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Model not listed</td><td className="py-3 pr-4">File too small (&lt;10 MB)</td><td className="py-3">Download was incomplete — re-download the file</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Model not listed</td><td className="py-3 pr-4">File in a subdirectory</td><td className="py-3">Move .gguf file to the top level of a scanned directory</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Loading Failures</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Symptom</th>
              <th className="text-left py-3 pr-4 font-bold">Cause</th>
              <th className="text-left py-3 font-bold">Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">App crashes on load</td><td className="py-3 pr-4">Insufficient RAM</td><td className="py-3">Use a smaller model or lower quantization (Q3_K_M)</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Error: invalid GGUF</td><td className="py-3 pr-4">Corrupted or truncated file</td><td className="py-3">Re-download the model file</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Error: unsupported arch</td><td className="py-3 pr-4">Architecture not in llama.cpp</td><td className="py-3">Check llama.cpp compatibility; wait for backend update</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Model loads but very slow</td><td className="py-3 pr-4">Model too large for available memory</td><td className="py-3">OS is swapping; use a smaller quantization</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Poor Quality Output</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 pr-4 font-bold">Symptom</th>
              <th className="text-left py-3 pr-4 font-bold">Cause</th>
              <th className="text-left py-3 font-bold">Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Garbled or nonsensical output</td><td className="py-3 pr-4">Wrong prompt format / template</td><td className="py-3">Ensure chat template matches the model's expected format</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Repetitive text</td><td className="py-3 pr-4">Repetition penalty too low</td><td className="py-3">Increase repetition penalty in generation settings</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Very short responses</td><td className="py-3 pr-4">Max tokens too low</td><td className="py-3">Increase max generation length</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Degraded quality</td><td className="py-3 pr-4">Quantization too aggressive</td><td className="py-3">Try a higher quantization tier (Q4_K_M instead of Q2_K)</td></tr>
            <tr className="border-b border-outline-variant/20"><td className="py-3 pr-4">Wrong language</td><td className="py-3 pr-4">Model not trained on target language</td><td className="py-3">Use a multilingual model (Qwen2.5, LLaMA 3.1)</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> If a model appears to load successfully but produces only
          garbage output, the file may have been partially downloaded or corrupted during transfer.
          Delete the file, clear your browser's download cache, and re-download from the original
          source.
        </p>
      </div>

      <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> When reporting model issues, include the model filename, file size,
          your device model, and available RAM. This information helps diagnose whether the issue
          is related to the model file, quantization compatibility, or device constraints.
        </p>
      </div>
    </div>
  );
}
