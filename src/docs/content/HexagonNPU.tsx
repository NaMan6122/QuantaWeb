import CodeBlock from '../CodeBlock';

export default function HexagonNPU() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Hexagon NPU Acceleration</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        Leverage Qualcomm's Hexagon Tensor Processor for accelerated on-device LLM inference on supported Snapdragon SoCs.
        This guide covers the full architecture — from silicon to software — explaining how QuantaLLM offloads tensor
        operations to the HTP, how FastRPC bridges the CPU and DSP, and how to tune every parameter for optimal performance.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. What is Hexagon DSP? */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">What is Hexagon DSP?</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Qualcomm's Hexagon is a family of Digital Signal Processors (DSPs) embedded in every modern Snapdragon
        System-on-Chip. Unlike general-purpose CPU cores (Cortex-A / Kryo), the Hexagon DSP is a
        fixed-function + programmable hybrid processor optimised for sustained, power-efficient numerical workloads:
        audio processing, sensor fusion, camera ISP pipelines, and — most relevant to QuantaLLM — neural network inference.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each Snapdragon SoC typically exposes three DSP domains. The <strong>Compute DSP (cDSP)</strong> handles
        heavy compute tasks including neural network inference. The <strong>Audio DSP (aDSP)</strong> manages
        low-power audio pipelines and always-on voice detection. The <strong>Sensor DSP (sDSP)</strong> processes
        data from accelerometers, gyroscopes, and other sensor hubs. QuantaLLM targets the cDSP exclusively,
        communicating via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libcdsprpc.so</code>.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Hexagon instruction set is a VLIW (Very Long Instruction Word) architecture capable of issuing multiple
        operations per cycle. Starting with the Hexagon v65 generation, Qualcomm added <strong>HVX (Hexagon Vector
        eXtensions)</strong> — wide SIMD units that operate on 1024-bit or 2048-bit vectors, enabling high-throughput
        element-wise operations, reductions, and data shuffles. HVX alone is not sufficient for the dense matrix
        multiplications that dominate transformer inference, which is where the HTP comes in.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        For LLM inference specifically, the key operations are matrix–vector products (during autoregressive token
        generation), batched matrix–matrix products (during prompt processing / prefill), softmax, layer normalisation,
        and various element-wise activations (SiLU, GELU). The HTP accelerates the dominant matrix operations while
        HVX handles supporting element-wise work — together they can deliver significant speedups over CPU-only execution.
      </p>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Key insight:</strong> The Hexagon DSP runs its own real-time operating system (QuRT) and has its own
          memory hierarchy. Data must be explicitly transferred between the application processor's address space and
          the DSP via shared memory mapped through FastRPC. This is fundamentally different from GPU offload, where
          the GPU shares a unified memory space on most mobile SoCs.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HTP Architecture */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">HTP Architecture</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <strong>Hexagon Tensor Processor (HTP)</strong> is a specialised accelerator block integrated within the
        Hexagon DSP complex. It provides hardware-level support for dense matrix operations — specifically, systolic-array
        style multiply-accumulate units optimised for INT8 and INT16 dot products. Starting from HTP v73, FP16
        accumulation support was significantly expanded.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each HTP generation brings improvements across several dimensions: peak throughput (TOPS), supported data types
        and precisions, on-chip SRAM capacity, power efficiency (TOPS/watt), and the set of natively accelerated
        operations. The HTP is not a general-purpose neural accelerator in the way that a GPU is — it is specifically
        designed for the quantised linear algebra that dominates modern neural networks.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generational Improvements</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each HTP version corresponds to a Hexagon DSP generation and ships in a specific Snapdragon SoC family:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>HTP v68 (Hexagon v68):</strong> First generation with dedicated tensor acceleration blocks.
          Introduced basic INT8 systolic arrays. Found in Snapdragon 8 Gen 1.
        </li>
        <li>
          <strong>HTP v69 (Hexagon v69):</strong> Incremental improvement with better scheduling, reduced
          context-switch latency, and improved compiler support. Found in Snapdragon 8+ Gen 1.
        </li>
        <li>
          <strong>HTP v73 (Hexagon v73):</strong> Major generational leap — doubled on-chip SRAM, added native
          FP16 accumulation paths, and improved weight decompression units for 4-bit quantised models. Found in
          Snapdragon 8 Gen 2. This is the first generation where LLM inference on HTP becomes practically viable
          for models up to 7B parameters.
        </li>
        <li>
          <strong>HTP v75 (Hexagon v75):</strong> Further throughput scaling with wider systolic arrays, improved
          memory bandwidth to LPDDR5X, and hardware sparsity support. Found in Snapdragon 8 Gen 3.
        </li>
        <li>
          <strong>HTP v79 (Hexagon v79):</strong> Current flagship generation. Significant increase in on-chip
          SRAM (up to 12 MB shared across HTP and HVX), improved INT4 throughput, and enhanced graph compiler
          optimisations. Found in Snapdragon 8 Elite (SM8750).
        </li>
        <li>
          <strong>HTP v81 (Hexagon v81):</strong> Next-generation architecture expected in Snapdragon 8 Elite Gen 2.
          Prebuilt runtime libraries are already included in QuantaLLM for forward compatibility.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Supported SoCs */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Supported SoCs</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The following table maps each supported Snapdragon SoC to its HTP version, the corresponding prebuilt library
        shipped with QuantaLLM, and practical notes on LLM inference capability.
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">SoC ID</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Marketing Name</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">HTP Version</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Year</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Notes</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8450</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Snapdragon 8 Gen 1</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">v68</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2021</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Baseline HTP. Limited to small models (&le;3B). Thermal throttling common.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8475</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Snapdragon 8+ Gen 1</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">v69</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2022</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">TSMC 4nm refresh, better thermals than SM8450.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8550</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Snapdragon 8 Gen 2</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">v73</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2022</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">First practical HTP for 7B LLMs. INT4 + FP16 accumulation.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8650</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Snapdragon 8 Gen 3</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">v75</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2023</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Recommended minimum. Good 7B performance, viable 13B with Q4_0.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8750</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Snapdragon 8 Elite</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">v79</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2024</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Current flagship. Best HTP performance, 12 MB shared SRAM.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">TBD</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Snapdragon 8 Elite Gen 2</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">v81</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2025</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Forward-compatible runtime included. Not yet released.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Important:</strong> QuantaLLM currently gates Hexagon support to <strong>SM8750</strong> and{' '}
          <strong>SM8650</strong> only via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeviceInfoUtil.getHexagonSupportInfo()</code>.
          While prebuilt HTP libraries for older SoCs (v68–v73) are shipped in the APK, they are not enabled by default
          because those generations lack sufficient on-chip SRAM and throughput for acceptable LLM inference latency.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. How QuantaLLM Integrates with Hexagon */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">How QuantaLLM Integrates with Hexagon</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM's Hexagon integration is built on the GGML backend plugin system from llama.cpp. GGML provides a
        computation graph abstraction where each tensor operation (matrix multiply, softmax, RoPE, etc.) is represented
        as a node. Backend plugins can claim nodes they support, and unsupported nodes automatically fall back to the
        CPU backend.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">GGML Backend Architecture</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The GGML backend system works through a registration and discovery mechanism. At startup, QuantaLLM's native
        layer loads <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-hexagon.so</code>,
        which registers itself as a backend plugin. When a model is loaded and the computation graph is built, GGML
        queries each registered backend to determine which operations it can handle. The Hexagon backend claims
        operations it can accelerate on HTP (primarily large matrix multiplications), while everything else falls
        through to the CPU backend.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Hybrid CPU/NPU Execution Model</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        LLM inference on QuantaLLM with Hexagon enabled is a <strong>hybrid execution model</strong>. Not every
        operation in a transformer layer runs on the HTP. The execution is split roughly as follows:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>HTP-accelerated:</strong> Dense matrix multiplications (the <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_OP_MUL_MAT</code> nodes)
          — these dominate compute time in self-attention QKV projections, attention output projections, and
          feed-forward network layers.
        </li>
        <li>
          <strong>CPU fallback:</strong> Element-wise operations (SiLU, GELU activations), layer normalisation
          (RMSNorm), rotary positional embedding (RoPE), softmax, and tensor reshaping / permutation operations.
        </li>
        <li>
          <strong>Data transfer overhead:</strong> Tensors must be copied between CPU and DSP memory for each
          offloaded operation. The GGML Hexagon backend minimises this by batching transfers and keeping weight
          tensors resident in DSP memory across inference steps where possible.
        </li>
      </ul>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> The performance benefit of Hexagon offload depends heavily on model size and
          quantisation. For Q4_0 quantised 7B models, the matrix multiplications account for roughly 80-90% of
          total compute. Offloading just these operations to HTP can yield a 2-4x speedup in tokens/second compared
          to CPU-only inference on the same SoC.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. FastRPC Communication */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">FastRPC Communication</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        FastRPC (Fast Remote Procedure Call) is Qualcomm's proprietary IPC mechanism for communication between the
        application processor (AP) and DSP domains. It provides a low-overhead, zero-copy (where possible) bridge
        that maps shared memory regions between the Linux userspace process and the QuRT RTOS running on the DSP.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each DSP domain has its own FastRPC driver library:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libcdsprpc.so</code> — Compute DSP.
          This is the domain used by the HTP for neural network inference.
        </li>
        <li>
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libadsprpc.so</code> — Audio DSP.
          Used for audio processing pipelines (not used by QuantaLLM, but declared for completeness).
        </li>
        <li>
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libsdsprpc.so</code> — Sensor DSP.
          Used for always-on sensor processing (not used by QuantaLLM).
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">AndroidManifest Declaration</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        All three FastRPC libraries are declared as optional native libraries in the AndroidManifest. The{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">android:required="false"</code> attribute
        ensures the app can still install on devices that do not ship these vendor libraries:
      </p>
      <CodeBlock language="xml">{`<uses-native-library android:name="libcdsprpc.so" android:required="false" />
<uses-native-library android:name="libadsprpc.so" android:required="false" />
<uses-native-library android:name="libsdsprpc.so" android:required="false" />`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Why useLegacyPackaging Matters</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Android's default packaging behaviour (since AGP 4.1) extracts native libraries from the APK into a
        compressed format that is memory-mapped directly from the APK at runtime. This is efficient for normal JNI
        usage, but <strong>FastRPC requires libraries to exist as real files on the filesystem</strong> — it resolves
        library paths using the <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ADSP_LIBRARY_PATH</code> environment
        variable and opens them via standard file I/O.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM sets <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">useLegacyPackaging = true</code> in{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">build.gradle.kts</code> to force
        all native <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.so</code> files
        to be extracted to the app's native library directory on disk. Without this, the HTP runtime libraries would
        not be discoverable by the FastRPC loader, and Hexagon initialisation would silently fail.
      </p>
      <CodeBlock language="kotlin">{`// build.gradle.kts
android {
    packaging {
        jniLibs {
            // Required: FastRPC needs .so files on the real filesystem,
            // not memory-mapped from the APK.
            useLegacyPackaging = true
        }
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ADSP_LIBRARY_PATH Resolution</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        At runtime, the JNI layer detects the app's native library directory using{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">dladdr()</code> on
        a known loaded symbol, then sets <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ADSP_LIBRARY_PATH</code> to
        that directory. This tells the FastRPC driver where to find the HTP runtime stubs:
      </p>
      <CodeBlock language="cpp">{`static std::string detect_native_lib_dir() {
    Dl_info info;
    // Use address of a known function in our own .so
    if (dladdr((void*)detect_native_lib_dir, &info)) {
        std::string path(info.dli_fname);
        return path.substr(0, path.rfind('/'));
    }
    return "/data/local/tmp"; // fallback
}

// Called during Hexagon initialization
setenv("ADSP_LIBRARY_PATH", native_lib_dir.c_str(), 1);`}</CodeBlock>

      {/* ------------------------------------------------------------------ */}
      {/* 6. Native Library Architecture */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Native Library Architecture</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM ships a set of prebuilt ARM64 native libraries in{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">jniLibs/arm64-v8a/</code>.
        Each library serves a specific role in the Hexagon acceleration pipeline:
      </p>
      <CodeBlock language="text">{`jniLibs/arm64-v8a/
├── libggml-hexagon.so      # GGML Hexagon backend plugin
├── libggml-htp-v68.so      # HTP v68 runtime (SM8450)
├── libggml-htp-v69.so      # HTP v69 runtime (SM8475)
├── libggml-htp-v73.so      # HTP v73 runtime (SM8550)
├── libggml-htp-v75.so      # HTP v75 runtime (SM8650)
├── libggml-htp-v79.so      # HTP v79 runtime (SM8750)
└── libggml-htp-v81.so      # HTP v81 runtime (future)`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Library Roles</h3>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">libggml-hexagon.so</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The core GGML backend plugin. This library implements the GGML backend interface — registering supported
        operations, managing DSP memory allocation, orchestrating data transfers between CPU and DSP, and dispatching
        tensor operations to the appropriate HTP runtime. It is loaded by the GGML backend registry at startup and
        dynamically selects the correct HTP version library based on the detected SoC.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">libggml-htp-vXX.so</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Version-specific HTP runtime libraries. Each one contains the compiled graph definitions, operation kernels,
        and FastRPC stubs for a specific HTP hardware generation. At runtime,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-hexagon.so</code> detects
        the device's SoC and loads exactly one of these libraries via{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">dlopen()</code>.
        Shipping all versions ensures compatibility across the supported device range without requiring
        separate APK builds.
      </p>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Note:</strong> The version-specific libraries are not interchangeable. Loading{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-htp-v75.so</code> on
          an SM8750 (v79) device would result in either a runtime error or degraded performance, as the compiled
          HTP graphs would not match the hardware's instruction set and memory layout.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Configuration Deep Dive */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Configuration Deep Dive</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Hexagon configuration in QuantaLLM is managed by{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">HexagonConfigManager</code>,
        a Kotlin class that bridges the UI settings with the native JNI layer. It handles backend preference
        initialization, runtime switching, and tuning parameter propagation.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Full HexagonConfigManager Implementation</h3>
      <CodeBlock language="kotlin">{`class HexagonConfigManager(private val _uiState: MutableStateFlow<LlamaUiState>) {

    /**
     * Called once at app startup. Queries the device for Hexagon support
     * and sets the default backend accordingly.
     */
    fun initializeBackendPreference() {
        val supportInfo = DeviceInfoUtil.getHexagonSupportInfo()
        val preferredBackend = if (supportInfo.isSupported)
            InferenceBackend.HEXAGON else InferenceBackend.CPU

        // Apply default tuning parameters before setting backend
        ModelEngine.setHexagonConfig(defaultNdev, defaultNhvx, false, false)
        ModelEngine.setBackendMode(preferredBackend.nativeMode)
    }

    /**
     * Switches the inference backend at runtime. Guards against selecting
     * Hexagon on unsupported hardware.
     */
    fun updateInferenceBackend(backend: InferenceBackend) {
        if (backend == InferenceBackend.HEXAGON && !state.isHexagonSupported) {
            // Show warning toast / snackbar — cannot enable Hexagon
            return
        }
        ModelEngine.setBackendMode(backend.nativeMode)
    }

    /**
     * Updates HTP tuning parameters. Changes take effect on next model load.
     */
    fun updateHexagonTuning(
        ndev: Int,
        nhvx: Int,
        verbose: Boolean,
        profile: Boolean
    ) {
        ModelEngine.setHexagonConfig(ndev, nhvx, verbose, profile)
        // If a model is currently loaded, hint user to reload
        // for tuning changes to take effect.
    }

    /**
     * Convenience method for applying preset configurations.
     * - Default preset: ndev=1, safe for all supported devices
     * - Aggressive preset: ndev=2, may improve throughput on
     *   flagship SoCs with sufficient thermal headroom
     */
    fun applyHexagonPreset(aggressive: Boolean) {
        updateHexagonTuning(
            ndev = if (aggressive) 2 else 1,
            nhvx = 0,        // auto
            verbose = false,
            profile = false
        )
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Initialization Flow</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The following sequence describes what happens when QuantaLLM starts up on a Hexagon-capable device:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Application creates <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">HexagonConfigManager</code> and calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">initializeBackendPreference()</code>.</li>
        <li><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeviceInfoUtil.getHexagonSupportInfo()</code> reads the SoC identifier and checks against the supported list (SM8650, SM8750).</li>
        <li>If supported, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.setHexagonConfig()</code> is called via JNI, which sets the global C++ config variables.</li>
        <li><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.setBackendMode(BACKEND_MODE_HEXAGON)</code> is called via JNI.</li>
        <li>On next model load, the native layer calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">configure_hexagon_runtime_env()</code> to set environment variables.</li>
        <li>GGML backend registry discovers <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-hexagon.so</code> and calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">find_hexagon_device()</code> to locate the HTP backend.</li>
        <li>Model computation graph is partitioned between HTP and CPU backends.</li>
      </ol>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Backend Switching</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Users can switch between CPU and Hexagon backends at runtime via the settings UI. When the user selects a
        new backend, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">updateInferenceBackend()</code> validates
        the selection and calls through JNI to update the native backend mode. The change takes effect on the next
        model load — the currently loaded model continues using its existing backend until it is unloaded and reloaded.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 8. Tuning Parameters in Detail */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Tuning Parameters in Detail</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">NDEV — Number of DSP Devices</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">NDEV</code> parameter
        controls how many HTP compute contexts are allocated. Each context can execute operations independently,
        potentially enabling parallel execution of different graph segments.
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Value</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Behaviour</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Recommended For</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1 (default)</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Single HTP context. Safe, predictable performance. Lower power draw.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">All devices. Default preset.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Dual HTP contexts. May improve throughput by overlapping compute and data transfer. Higher power and thermal load.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8750 with active cooling or short sessions. Aggressive preset.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">NHVX — HVX Context Allocation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        HVX (Hexagon Vector eXtensions) contexts control how many SIMD vector units are allocated for element-wise
        operations that complement the HTP's matrix units. The HVX handles operations like activation functions,
        normalisation, and data format conversions.
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Value</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Behaviour</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0 (default)</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Automatic allocation. The HTP runtime decides the optimal number of HVX contexts based on the workload and available hardware resources. This is the recommended setting.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1–4</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Manual allocation. Forces a specific number of HVX contexts. Useful for debugging or when the auto heuristic underperforms. Higher values consume more DSP resources.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Verbose Logging</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When enabled (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">verbose = true</code>),
        the Hexagon backend emits detailed runtime logs including: HTP version detection, library loading status,
        operation offload decisions (which ops were claimed by HTP vs. fell back to CPU), memory allocation events,
        and FastRPC session lifecycle. Logs appear in Android logcat under the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ggml-hexagon</code> tag.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Performance Profiling</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When enabled (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">profile = true</code>),
        the HTP runtime instruments each operation with timing data. After inference, per-operation execution times
        are logged, showing exactly how long each matrix multiplication spent on the HTP, how much time was spent in
        data transfers, and where bottlenecks exist. This is invaluable for diagnosing performance regressions or
        understanding whether a specific model benefits from Hexagon offload.
      </p>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> Both verbose logging and profiling add measurable overhead to inference. Do not
          leave these enabled in production. Use them only for debugging and performance analysis, then disable before
          benchmarking or regular use.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 9. Environment Variables */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Environment Variables</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The JNI layer translates the Kotlin-level configuration into environment variables that the GGML Hexagon
        backend reads at initialisation time. These variables are set via{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">configure_hexagon_runtime_env()</code> before
        the GGML backend registry is queried.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Variable</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Default</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_NDEV</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Integer</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Number of HTP compute contexts to allocate.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_NHVX</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Integer</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Number of HVX vector contexts. 0 = automatic.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_VERBOSE</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean (0/1)</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enable detailed runtime logging to logcat.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_PROFILE</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean (0/1)</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enable per-operation HTP performance profiling.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ADSP_LIBRARY_PATH</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">String (path)</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Auto-detected</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Filesystem path where FastRPC resolves HTP runtime libraries. Set to the app's native lib directory.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 10. Native C++ Implementation */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Native C++ Implementation</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The native layer in <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni.cpp</code> provides
        the C++ implementation that bridges Kotlin configuration with the GGML Hexagon backend.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Global Configuration State</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Hexagon settings are stored as global variables in the JNI layer. These are set by JNI calls from Kotlin
        and read by the environment configuration function before model loading:
      </p>
      <CodeBlock language="cpp">{`// Hexagon config globals — set via JNI from HexagonConfigManager
static int  g_hexagon_ndev    = 1;     // Number of HTP compute contexts
static int  g_hexagon_nhvx    = 0;     // Number of HVX contexts (0 = auto)
static bool g_hexagon_verbose = false; // Runtime logging
static bool g_hexagon_profile = false; // Performance profiling`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">configure_hexagon_runtime_env()</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        This function is called before model loading when the Hexagon backend is active. It detects the native
        library directory and sets all required environment variables:
      </p>
      <CodeBlock language="cpp">{`static void configure_hexagon_runtime_env() {
    // Step 1: Detect native lib directory using dladdr
    // This finds the filesystem path where our .so files were extracted
    std::string native_lib_dir = detect_native_lib_dir();

    // Step 2: Set ADSP_LIBRARY_PATH for FastRPC library resolution
    // Without this, the cDSP driver cannot find libggml-htp-vXX.so
    setenv("ADSP_LIBRARY_PATH", native_lib_dir.c_str(), 1);

    // Step 3: Set GGML Hexagon environment variables
    // These are read by libggml-hexagon.so during backend initialization
    setenv("GGML_HEXAGON_NDEV",
           std::to_string(g_hexagon_ndev).c_str(), 1);
    setenv("GGML_HEXAGON_NHVX",
           std::to_string(g_hexagon_nhvx).c_str(), 1);
    setenv("GGML_HEXAGON_VERBOSE",
           g_hexagon_verbose ? "1" : "0", 1);
    setenv("GGML_HEXAGON_PROFILE",
           g_hexagon_profile ? "1" : "0", 1);
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">find_hexagon_device()</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        After environment setup, the GGML backend registry is queried for available devices. This function iterates
        through all registered backend devices and returns the first one matching the Hexagon/HTP identifier:
      </p>
      <CodeBlock language="cpp">{`static ggml_backend_dev_t find_hexagon_device() {
    // Iterate all registered GGML backend devices
    for (size_t i = 0; i < ggml_backend_dev_count(); i++) {
        auto *dev = ggml_backend_dev_get(i);
        const char *name = ggml_backend_dev_name(dev);

        // The Hexagon backend registers with a name containing
        // "Hexagon" or "HTP" — match either form
        if (strstr(name, "Hexagon") || strstr(name, "HTP")) {
            return dev;
        }
    }
    // No Hexagon device found — will fall back to CPU
    return nullptr;
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Backend Initialization Flow</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When a model is loaded with the Hexagon backend selected, the native code follows this sequence:
      </p>
      <CodeBlock language="cpp">{`// Simplified model loading with Hexagon backend
void load_model_with_backend(const char* model_path, int backend_mode) {
    if (backend_mode == BACKEND_MODE_HEXAGON) {
        // 1. Configure environment before backend discovery
        configure_hexagon_runtime_env();

        // 2. Find the Hexagon backend device
        ggml_backend_dev_t hex_dev = find_hexagon_device();
        if (hex_dev == nullptr) {
            LOG_WARN("Hexagon device not found, falling back to CPU");
            backend_mode = BACKEND_MODE_CPU;
        }
    }

    // 3. Load model — GGML will use the configured backend
    //    for supported operations, CPU for the rest
    llama_model_params params = llama_model_default_params();
    // ... configure params based on backend_mode ...
    llama_model* model = llama_model_load_from_file(model_path, params);
}`}</CodeBlock>

      {/* ------------------------------------------------------------------ */}
      {/* 11. Device Detection */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Device Detection</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM determines whether the current device supports Hexagon acceleration through{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeviceInfoUtil.getHexagonSupportInfo()</code>.
        This utility reads the device's SoC identifier and checks it against a hardcoded allowlist of supported chipsets.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">SoC Identification</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        On Android, the SoC can be identified through several system properties:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ro.soc.model</code> — Returns
          the SoC model string (e.g., "SM8750", "SM8650"). This is the primary identifier used by QuantaLLM.
        </li>
        <li>
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ro.board.platform</code> — Returns
          the platform codename (e.g., "taro", "kalama", "pineapple"). Used as a fallback.
        </li>
        <li>
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ro.hardware.chipname</code> — Vendor-specific
          chip identifier. Availability varies by OEM.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Support Gating Logic</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The current implementation restricts Hexagon support to SM8650 (Snapdragon 8 Gen 3) and SM8750
        (Snapdragon 8 Elite) only. While older SoCs have HTP hardware and QuantaLLM ships their runtime libraries,
        the performance on HTP v68–v73 is insufficient for practical LLM inference — either the on-chip SRAM is
        too small to hold weight tiles efficiently, or the throughput is too low relative to the CPU cores on the
        same SoC.
      </p>
      <CodeBlock language="kotlin">{`// Simplified device detection logic
object DeviceInfoUtil {
    data class HexagonSupportInfo(
        val isSupported: Boolean,
        val socModel: String,
        val htpVersion: String?
    )

    fun getHexagonSupportInfo(): HexagonSupportInfo {
        val socModel = getSystemProperty("ro.soc.model") ?: "unknown"

        // Only SM8650 (v75) and SM8750 (v79) are currently enabled
        val supported = socModel in setOf("SM8650", "SM8750")
        val htpVersion = when (socModel) {
            "SM8450" -> "v68"
            "SM8475" -> "v69"
            "SM8550" -> "v73"
            "SM8650" -> "v75"
            "SM8750" -> "v79"
            else -> null
        }

        return HexagonSupportInfo(supported, socModel, htpVersion)
    }
}`}</CodeBlock>

      {/* ------------------------------------------------------------------ */}
      {/* 12. Troubleshooting */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Troubleshooting</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Unsupported SoC</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Symptom:</strong> The Hexagon backend option is greyed out or not available in settings.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Cause:</strong> The device's SoC is not in the supported allowlist (SM8650 or SM8750).
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Resolution:</strong> Hexagon acceleration requires Snapdragon 8 Gen 3 or newer. Older Snapdragon
        SoCs have HTP hardware but are not enabled due to insufficient performance for LLM workloads. Use CPU
        backend instead.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">FastRPC Library Loading Failure</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Symptom:</strong> Hexagon backend is selected but inference falls back to CPU. Logcat shows errors
        related to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libcdsprpc.so</code> or
        "Failed to open FastRPC session".
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Cause:</strong> The FastRPC vendor libraries are not available on the device, or the APK was built
        without <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">useLegacyPackaging = true</code>,
        so native libraries are not on the filesystem.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Resolution:</strong> Verify the device is a Qualcomm-based phone (not a MediaTek or Exynos variant
        of the same phone model). Check that the APK build configuration includes{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">useLegacyPackaging = true</code>.
        Enable verbose logging to see the ADSP_LIBRARY_PATH that was set.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">HTP Runtime Version Mismatch</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Symptom:</strong> Hexagon initialisation succeeds but inference produces garbage output or crashes
        with a SIGABRT in the DSP domain.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Cause:</strong> The wrong HTP version library was loaded (e.g., v75 library on a v79 device).
        This should not happen under normal operation, as the backend auto-detects the correct version.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Resolution:</strong> Enable verbose logging and check which{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-htp-vXX.so</code> was
        loaded. Ensure all HTP libraries are present in the APK's{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">jniLibs/arm64-v8a/</code> directory.
        Reinstall the app to ensure clean extraction.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Performance Lower Than Expected</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Symptom:</strong> Hexagon backend is active but tokens/second is similar to or worse than CPU.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Possible causes and resolutions:</strong>
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Thermal throttling:</strong> Sustained inference causes the SoC to heat up. The HTP clock speed
          is reduced to stay within thermal limits. Use shorter inference sessions or ensure the device has adequate
          cooling.
        </li>
        <li>
          <strong>Model too large for HTP SRAM:</strong> If the model's weight matrices exceed the HTP's on-chip
          SRAM capacity, frequent spills to LPDDR occur, negating the throughput advantage. Try a smaller quantisation
          (Q4_0 instead of Q5_K_M) or a smaller model.
        </li>
        <li>
          <strong>Data transfer overhead dominates:</strong> For very small models or short sequence lengths,
          the cost of transferring data between CPU and DSP memory may exceed the compute savings. CPU-only
          may actually be faster for sub-1B models.
        </li>
        <li>
          <strong>Background DSP workload:</strong> Other apps or system services may be using the cDSP
          concurrently. Close background apps and retry.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Hexagon Backend Not Discovered</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Symptom:</strong> <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">find_hexagon_device()</code> returns{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nullptr</code> even
        on a supported device.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Cause:</strong> <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-hexagon.so</code> failed
        to load or register with the GGML backend registry. This can happen if the library has unresolved symbol
        dependencies or if the Hexagon SDK version bundled in the library is incompatible with the device's DSP
        firmware.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Resolution:</strong> Check logcat for <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">dlopen</code> errors
        related to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-hexagon.so</code>.
        Common missing symbols indicate a mismatch between the Qualcomm AI Engine Direct SDK version used to build
        the library and the runtime version on the device. An app update with rebuilt libraries is usually required.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 13. Performance Considerations */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Performance Considerations</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Expected Speedup</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The performance benefit of Hexagon offload varies significantly based on model size, quantisation format,
        sequence length, and the specific SoC. As a rough guideline:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Q4_0 7B models on SM8750:</strong> Expect 2–4x speedup in token generation (decode phase)
          compared to CPU-only on the same device. Prompt processing (prefill) sees a similar or larger speedup
          due to the batch matrix multiply.
        </li>
        <li>
          <strong>Q4_0 7B models on SM8650:</strong> Expect 1.5–3x speedup. The v75 HTP has less SRAM than v79,
          leading to more frequent spills on larger layers.
        </li>
        <li>
          <strong>Smaller models (&lt;3B):</strong> Speedup may be marginal (1.1–1.5x) because the data transfer
          overhead between CPU and DSP becomes a larger fraction of total time.
        </li>
        <li>
          <strong>Larger models (&gt;13B):</strong> Performance depends heavily on whether the model fits in
          device RAM. If the model requires swapping, both CPU and Hexagon paths will be memory-bandwidth limited.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Which Operations Benefit Most</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The HTP is a specialised matrix accelerator. The operations that see the greatest speedup are:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Matrix multiplication (GGML_OP_MUL_MAT):</strong> This is the dominant operation, accounting for
          80–90% of compute in typical transformer models. Includes QKV projections, output projections, and
          feed-forward layers. The HTP's systolic arrays are specifically designed for this workload.
        </li>
        <li>
          <strong>Batch matrix multiply:</strong> Used during prompt processing (prefill) where multiple tokens
          are processed simultaneously. The HTP can achieve very high utilisation on these larger matrix operations.
        </li>
      </ul>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Operations that see little or no benefit from HTP offload and remain on CPU:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Softmax — memory-bound, not compute-bound</li>
        <li>RMSNorm / LayerNorm — element-wise, low arithmetic intensity</li>
        <li>RoPE (rotary positional encoding) — complex indexing patterns not suited to systolic arrays</li>
        <li>Activation functions (SiLU, GELU) — element-wise, handled efficiently by CPU NEON</li>
        <li>Tensor reshape, transpose, permute — zero-compute memory layout operations</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Memory Overhead</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Using the Hexagon backend introduces additional memory consumption beyond what CPU-only inference requires:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>DSP shared memory:</strong> Weight tensors offloaded to HTP are mapped into a shared memory
          region accessible by both CPU and DSP. This does not double memory usage (it is the same physical pages),
          but the mapping metadata has a small overhead.
        </li>
        <li>
          <strong>HTP graph compilation:</strong> The HTP runtime compiles operation graphs at model load time.
          This compilation artifact is cached in DSP memory and typically consumes 50–200 MB depending on
          model architecture and the number of distinct operation shapes.
        </li>
        <li>
          <strong>Intermediate buffers:</strong> The Hexagon backend allocates scratch buffers for data format
          conversion (e.g., dequantising INT4 weights to FP16 for accumulation). These are proportional to the
          largest matrix dimension in the model.
        </li>
      </ul>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> Monitor total memory usage when running Hexagon-accelerated inference. On devices
          with 12 GB RAM, a Q4_0 7B model typically uses 4–5 GB for weights plus 0.5–1 GB for HTP graph compilation
          and buffers. Ensure at least 2 GB remains free for the Android system and other apps to avoid OOM kills.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Thermal Management</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The HTP shares the SoC's thermal budget with the CPU and GPU. During sustained LLM inference, the SoC
        temperature rises and the thermal management system may throttle HTP clock speeds. This manifests as
        gradually decreasing tokens/second over the course of a long conversation. Strategies to mitigate this:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Use NDEV=1 (default) to reduce power draw and heat generation.</li>
        <li>Close GPU-intensive background apps to free thermal budget for the HTP.</li>
        <li>On devices with active cooling (gaming phones), enable the cooling fan during inference.</li>
        <li>For benchmarking, allow the device to cool to idle temperature between runs.</li>
      </ul>
    </div>
  );
}
