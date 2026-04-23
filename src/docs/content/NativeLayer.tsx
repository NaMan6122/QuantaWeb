import CodeBlock from '../CodeBlock';

export default function NativeLayer() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Native Layer (JNI / C++)</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        QuantaLLM bridges Kotlin and llama.cpp through a 2100+ line JNI layer compiled with aggressive ARM64
        optimizations. This page covers every aspect of the native stack: the JNI architecture, each shared library,
        the C++ bridge internals, build configuration, compiler flags, and the memory model that makes on-device
        LLM inference possible.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. JNI Architecture Overview                                       */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">JNI Architecture Overview</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Java Native Interface (JNI) is the standard mechanism for calling compiled C/C++ code from the JVM
        (and, by extension, from Kotlin on Android). In QuantaLLM the entire inference engine lives in native code;
        the Kotlin layer is a thin orchestration shell that delegates every compute-heavy operation across the JNI
        boundary.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">How the Kotlin-to-C++ Bridge Works</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When a Kotlin class declares a function as <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">external</code>,
        the compiler emits no body for it. At runtime the JVM resolves the symbol by searching loaded native
        libraries for a C function whose name follows the JNI naming convention:
      </p>
      <CodeBlock language="text">{`Java_<package>_<Class>_<method>

Example:
  Kotlin:  LlamaJni.nativeInit(path, threads)
  C++:     Java_com_naman_quantallm_LlamaJni_nativeInit(JNIEnv*, jobject, jstring, jint)`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The JVM marshals Kotlin types into their JNI equivalents (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">String</code> becomes <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">jstring</code>,
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Int</code> becomes <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">jint</code>, etc.)
        and passes a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">JNIEnv*</code> pointer that the native code uses
        to call back into the JVM -- for example, to invoke the streaming callback.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">System.loadLibrary Flow</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaJni</code> Kotlin object uses an <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">init</code> block
        to load the native library the moment the object is first referenced:
      </p>
      <CodeBlock language="kotlin">{`object LlamaJni {
    init { System.loadLibrary("llama_jni") }
    // ...
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">System.loadLibrary("llama_jni")</code> executes, the Android
        runtime searches the app's native library directory for <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libllama_jni.so</code>.
        The dynamic linker then resolves all of its dependencies (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libllama.so</code>,
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml.so</code>, etc.) which must already be present in the same
        directory. If any dependency is missing, loading fails with an <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">UnsatisfiedLinkError</code>.
      </p>
      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Info</p>
        <p className="text-on-surface-variant text-sm">
          Because <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaJni</code> is a Kotlin <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">object</code> (singleton),
          the library is loaded exactly once for the lifetime of the process. Subsequent accesses reuse the
          already-loaded symbols with no overhead.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Native Library Architecture                                     */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Native Library Architecture</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The app ships a set of prebuilt <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.so</code> shared libraries
        under <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">jniLibs/arm64-v8a/</code>. Each library has a distinct
        responsibility:
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Library</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Role</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libllama.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Core llama.cpp inference library -- model loading, tokenization, context management, sampling</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libggml.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">GGML tensor computation library -- graph construction, operator dispatch, backend routing</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libggml-base.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Base GGML operations -- memory allocation, tensor creation, format conversions</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libggml-cpu.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">CPU compute backend -- NEON-optimized kernels for matmul, attention, and element-wise ops</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libggml-hexagon.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Qualcomm Hexagon DSP backend -- offloads tensor ops to the HTP (Hexagon Tensor Processor)</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libggml-htp-v68..v81.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">HTP version-specific variants -- matched to the Hexagon architecture revision on the target SoC</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">libllama_jni.so</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">JNI bridge (compiled from llama_jni.cpp) -- the only library with JNI-exported symbols</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Dependency Chain and Loading Order</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The dynamic linker resolves dependencies bottom-up. When <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libllama_jni.so</code> is
        loaded, the linker first loads its direct dependencies, which in turn load theirs:
      </p>
      <CodeBlock language="text">{`libllama_jni.so
  ├── libllama.so
  │     └── libggml.so
  │           ├── libggml-base.so
  │           ├── libggml-cpu.so
  │           └── libggml-hexagon.so  (optional, loaded at runtime)
  │                 └── libggml-htp-vXX.so  (selected by SoC revision)
  ├── liblog.so       (Android logging)
  └── libdl.so        (dladdr / dlopen)`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Hexagon backend is optional. If the device has no Hexagon DSP, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">libggml-hexagon.so</code> is
        still present in the APK but the GGML backend registry simply reports zero Hexagon devices, and inference
        falls back to the CPU backend transparently.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 3. llama_jni.cpp Deep Dive                                         */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">llama_jni.cpp Deep Dive</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        At 2105 lines, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni.cpp</code> is the heart of the native layer. It
        is organized into several logical sections: global state, helper functions, initialization, generation
        (blocking, streaming, and advanced), chat session management, and shutdown.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Global State</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The bridge maintains a small set of file-scoped globals that represent the currently loaded model, its
        inference context, and backend configuration:
      </p>
      <CodeBlock language="cpp">{`static llama_model   * g_model = nullptr;     // The loaded GGUF model
static llama_context * g_ctx   = nullptr;     // Inference context (KV cache, scratch buffers)
static bool g_backend_initialized = false;    // Has llama_backend_init() been called?
static std::string g_last_error;              // Most recent error message
static std::atomic<bool> g_abort_generation{false};  // Abort flag (thread-safe)

// Hexagon DSP configuration
static int  g_hexagon_ndev     = 1;       // Number of Hexagon devices to use
static int  g_hexagon_nhvx     = 0;       // Number of HVX contexts
static bool g_hexagon_verbose  = false;   // Enable verbose Hexagon logging
static bool g_hexagon_profile  = false;   // Enable Hexagon profiling

enum BackendMode : int {
    BACKEND_MODE_CPU     = 1,
    BACKEND_MODE_HEXAGON = 2,
};
static BackendMode g_backend_mode = BACKEND_MODE_CPU;`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Warning</p>
        <p className="text-on-surface-variant text-sm">
          Because these are file-scoped globals, only one model can be loaded at a time. Calling{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeInit</code> while
          a model is already loaded will shut down the previous model first. This is by design -- mobile devices
          rarely have enough RAM for multiple concurrent LLMs.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Helper Functions</h3>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">detect_native_lib_dir()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Uses <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">dladdr()</code> on a known symbol
        within the loaded JNI library to discover the directory where the <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.so</code> files
        were extracted at install time. This path is needed to set <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ADSP_LIBRARY_PATH</code> for the
        Hexagon runtime, which loads its own <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.so</code> files from
        the same directory.
      </p>
      <CodeBlock language="cpp">{`// Simplified logic:
Dl_info info;
if (dladdr((void*)some_known_symbol, &info)) {
    std::string path(info.dli_fname);
    return path.substr(0, path.find_last_of('/'));
}`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">configure_hexagon_runtime_env()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Sets environment variables that the Hexagon runtime reads before initializing the DSP. These include{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ADSP_LIBRARY_PATH</code> (where to find HTP skel libraries),{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_NDEV</code>,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_NHVX</code>,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_VERBOSE</code>, and{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GGML_HEXAGON_PROFILE</code>.
        These must be set before the GGML backend is initialized.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">find_hexagon_device()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Iterates over all registered GGML backend devices via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ggml_backend_dev_count()</code> and
        checks each device name for the substrings "Hexagon" or "HTP". Returns the device handle if found, or
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nullptr</code> if the hardware is not available.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">set_last_error() and llama_log_bridge()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">set_last_error()</code> stores an error
        message in <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">g_last_error</code> so
        the Kotlin side can retrieve it via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeGetLastError()</code>.
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary"> llama_log_bridge()</code> is registered
        as the GGML log callback and forwards all native log messages to Android's logcat via{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">__android_log_print()</code>.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Initialization (nativeInit)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeInit</code> function is the
        entry point for loading a model. It performs the following steps in order:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>If a model is already loaded, calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeShutdown()</code> to release it first.</li>
        <li>If the backend has not been initialized, calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_backend_init()</code> and sets up the log callback.</li>
        <li>If <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">g_backend_mode == BACKEND_MODE_HEXAGON</code>, calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">configure_hexagon_runtime_env()</code>.</li>
        <li>Calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_model_load_from_file()</code> with the provided path and default model parameters.</li>
        <li>Creates the inference context with <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_new_context_with_model()</code>, configuring thread count from the <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nThreads</code> parameter.</li>
        <li>Returns 0 on success, or a negative error code on failure (with details in <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">g_last_error</code>).</li>
      </ul>
      <CodeBlock language="cpp">{`// Pseudocode for nativeInit
JNIEXPORT jint JNICALL Java_com_naman_quantallm_LlamaJni_nativeInit(
    JNIEnv *env, jobject thiz, jstring model_path, jint n_threads)
{
    if (g_model) nativeShutdown();

    if (!g_backend_initialized) {
        llama_backend_init();
        llama_log_set(llama_log_bridge, nullptr);
        g_backend_initialized = true;
    }

    if (g_backend_mode == BACKEND_MODE_HEXAGON)
        configure_hexagon_runtime_env();

    const char *path = env->GetStringUTFChars(model_path, nullptr);
    g_model = llama_model_load_from_file(path, default_params);
    env->ReleaseStringUTFChars(model_path, path);

    if (!g_model) { set_last_error("Failed to load model"); return -1; }

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_threads = n_threads;
    g_ctx = llama_new_context_with_model(g_model, ctx_params);

    return g_ctx ? 0 : -2;
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generation (nativeGenerate)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The blocking generation function tokenizes the input prompt, creates a batch, and enters a decode loop
        that runs until the maximum token count is reached, an end-of-sequence token is produced, or the abort
        flag is set. Each iteration calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_decode()</code> to
        evaluate the batch, then samples the next token using <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_sampler</code>.
        The sampled token is converted back to text and appended to the output string.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Streaming Generation (nativeGenerateStreaming)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Identical to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeGenerate</code> except
        that after each token is sampled, the function calls back into the JVM to invoke the Kotlin{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">StreamingCallback.onProgress()</code> method.
        See the Streaming Implementation section below for details on how this cross-language callback works.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Advanced Generation (nativeGenerateAdvanced)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Exposes the full set of sampling parameters: top-k, top-p, min-p, repeat penalty, frequency penalty,
        presence penalty, and seed. The sampler chain is configured with these parameters before the decode loop
        begins. This is the function used by the UI when the user customizes generation settings.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Shutdown (nativeShutdown)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Releases all native resources in reverse order of allocation:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Frees the inference context (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_free(g_ctx)</code>), releasing KV cache and scratch memory.</li>
        <li>Frees the model (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_free_model(g_model)</code>), unmapping the GGUF file.</li>
        <li>Calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_backend_free()</code> to tear down the compute backend.</li>
        <li>Resets all global pointers to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nullptr</code> and flags to defaults.</li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 4. LlamaJni.kt Bindings                                           */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">LlamaJni.kt -- Complete Binding Reference</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaJni</code> Kotlin object is
        the sole public interface to all native functionality. Every method is documented below.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Lifecycle</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Method</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Signature</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeInit</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">(modelPath: String, nThreads: Int): Int</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Loads a GGUF model from disk and creates an inference context. Returns 0 on success, negative on error.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeShutdown</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">(): Int</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Releases model, context, and backend. Returns 0 on success.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGetModelInfo</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">(): String</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Returns JSON with model metadata (name, parameter count, quantization type, context length).</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGetLastError</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">(): String</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Returns the most recent error message from the native layer.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generation Methods</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Method</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGenerate</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Blocking generation. Takes prompt, maxTokens, and temperature. Returns the complete generated string.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGenerateStreaming</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Same as nativeGenerate but calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">StreamingCallback.onProgress()</code> after each token.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGenerateAdvanced</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Full-parameter generation with top-k, top-p, min-p, repeat penalty, frequency/presence penalties, and seed.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Backend Control</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Method</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeSetBackendMode</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Switches between CPU (1) and Hexagon (2) backends. Must be called before nativeInit.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeSetHexagonConfig</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Configures Hexagon parameters: device count, HVX contexts, verbose logging, profiling.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeAbortGeneration</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Sets the atomic abort flag to interrupt an in-progress generation from any thread.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeSetContextSize</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Sets the context window size (in tokens) for the next model load.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGetContextSize</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Returns the current context size in tokens.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Chat Session Methods</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Method</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeCreateChatSession</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Creates a new chat session with an optional system prompt and a UUID. Returns an integer session ID.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeSetActiveChatSession</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Switches the active KV cache sequence to the specified session.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeDeleteChatSession</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Removes a session and frees its KV cache entries.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeChatGenerate</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Generates a response in the context of the active chat session, maintaining KV cache continuity.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeChatGenerateStreaming</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Streaming variant of chat generation with per-token callback.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeGetChatSessionInfo</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Returns JSON with session metadata: token count, system prompt, creation time.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">nativeListChatSessions</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Returns JSON array of all active session IDs and their metadata.</td></tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. GenerationConfig                                                */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">GenerationConfig -- Sampling Parameters</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">GenerationConfig</code> data class
        bundles all sampling parameters that control how tokens are selected during generation:
      </p>
      <CodeBlock language="kotlin">{`data class GenerationConfig(
    val maxTokens: Int = 64,
    val temperature: Float = 0.8f,
    val topK: Int = 50,
    val topP: Float = 0.9f,
    val minP: Float = 0.0f,
    val repeatPenalty: Float = 1.1f,
    val penaltyLastN: Int = 64,
    val frequencyPenalty: Float = 0.0f,
    val presencePenalty: Float = 0.0f,
    val seed: Int = 0
)`}</CodeBlock>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Parameter</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Default</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Range</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Effect</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">maxTokens</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">64</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1 -- context size</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Maximum number of tokens to generate. Generation stops when this limit is reached or EOS is produced.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">temperature</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.8</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0 -- 2.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Controls randomness. 0.0 = greedy (always pick most likely token). Higher values increase diversity.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">topK</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">50</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1 -- vocab size</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Limits sampling to the K most probable tokens. Lower values make output more focused.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">topP</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.9</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0 -- 1.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Nucleus sampling. Considers only the smallest set of tokens whose cumulative probability exceeds P.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">minP</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0 -- 1.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Filters tokens below (minP * max_probability). Adaptive alternative to topK that scales with confidence.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">repeatPenalty</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1.1</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1.0 -- 2.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Penalizes tokens that appeared in the last N tokens. 1.0 = no penalty. Higher values reduce repetition.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">penaltyLastN</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">64</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0 -- context size</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Window size for the repeat penalty. Only the last N tokens are checked for repeats.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">frequencyPenalty</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0 -- 2.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Reduces probability proportional to how often a token has appeared. Discourages frequent word reuse.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">presencePenalty</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.0 -- 2.0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Flat penalty applied to any token that has appeared at all. Encourages topic diversity.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">seed</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">any int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">RNG seed for reproducible generation. 0 = random seed each time.</td></tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 6. Streaming Implementation                                        */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Streaming Implementation</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Streaming is the mechanism that allows the UI to display tokens as they are generated, rather than waiting
        for the entire response. The implementation involves a JNI callback from C++ back into Kotlin.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">The Callback Interface</h3>
      <CodeBlock language="kotlin">{`interface StreamingCallback {
    fun onProgress(generatedTokens: Int, partialText: String)
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Kotlin side passes an object implementing this interface to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeGenerateStreaming()</code>.
        On the C++ side, the JNI code holds a reference to this Java object and calls its <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">onProgress</code> method
        on every token:
      </p>
      <CodeBlock language="cpp">{`// Inside the generation loop in C++:
jclass callbackClass = env->GetObjectClass(callback);
jmethodID onProgress = env->GetMethodID(callbackClass, "onProgress",
    "(ILjava/lang/String;)V");

// After each token is sampled:
jstring partial = env->NewStringUTF(accumulated_text.c_str());
env->CallVoidMethod(callback, onProgress, (jint)token_count, partial);
env->DeleteLocalRef(partial);`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The JNI signature <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">(ILjava/lang/String;)V</code> encodes
        the parameter types: <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">I</code> = int,
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Ljava/lang/String;</code> = String,
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">V</code> = void return.
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeleteLocalRef</code> call is
        essential to prevent JNI local reference table overflow during long generations.
      </p>
      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Tip</p>
        <p className="text-on-surface-variant text-sm">
          The streaming callback runs on the same native thread as the generation loop. The Kotlin side
          should dispatch UI updates to the main thread (e.g., via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">withContext(Dispatchers.Main)</code>)
          to avoid blocking generation while the UI renders.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Chat Session Management                                         */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Chat Session Management in Native Code</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Chat sessions enable multi-turn conversations by preserving the KV cache between messages. Without
        sessions, every generation call would re-process the entire conversation history from scratch, which
        is prohibitively slow for long conversations.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">KV Cache Sequences</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each chat session is backed by a llama.cpp KV cache sequence. The KV (key-value) cache stores the
        intermediate attention states computed during token processing. By assigning each session a unique
        sequence ID, the native layer can maintain independent conversation states within a single inference
        context.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Session creation:</strong> <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeCreateChatSession()</code> allocates a new sequence ID and optionally tokenizes a system prompt into the cache.</li>
        <li><strong>Session switching:</strong> <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeSetActiveChatSession()</code> changes which sequence ID is used for subsequent generation calls.</li>
        <li><strong>Session deletion:</strong> <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeDeleteChatSession()</code> removes the sequence and frees its KV cache entries.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Context Window Management</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The context window is fixed at model load time (controlled by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeSetContextSize()</code>).
        As a conversation grows, the KV cache fills. When the cache reaches capacity, the native layer must
        either truncate old entries or refuse to generate. QuantaLLM tracks token counts per session via{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeGetChatSessionInfo()</code>, allowing the
        Kotlin layer to warn users or implement context window sliding strategies.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 8. Abort Mechanism                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Abort Mechanism</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Users need the ability to cancel a generation that is taking too long or producing unwanted output.
        The abort mechanism uses a C++ atomic flag that is checked on every iteration of the decode loop:
      </p>
      <CodeBlock language="cpp">{`static std::atomic<bool> g_abort_generation{false};

// In the generation loop:
while (n_generated < max_tokens) {
    if (g_abort_generation.load(std::memory_order_relaxed)) {
        g_abort_generation.store(false);
        break;  // Exit the loop, return partial output
    }
    llama_decode(ctx, batch);
    // ... sample next token ...
}

// Called from Kotlin (potentially from a different thread):
JNIEXPORT void JNICALL ...nativeAbortGeneration(JNIEnv*, jobject) {
    g_abort_generation.store(true, std::memory_order_relaxed);
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Thread Safety Guarantees</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">std::atomic&lt;bool&gt;</code> type
        guarantees that reads and writes are indivisible -- there is no risk of tearing. The{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">memory_order_relaxed</code> ordering
        is sufficient because no other data depends on the flag value; we only need the store to eventually
        become visible to the generation thread, which it will within a few iterations.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The flag is reset to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">false</code> inside the
        generation loop when it is observed, ensuring a subsequent generation call starts with a clean state.
        This avoids a race condition where an abort call intended for a previous generation could cancel
        a new one.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 9. CMake Build Configuration                                       */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">CMake Build Configuration</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The native build is driven by CMake, invoked by the Android Gradle Plugin during the build process.
        The CMakeLists.txt file declares prebuilt library imports and compiles the JNI bridge.
      </p>
      <CodeBlock language="cmake">{`cmake_minimum_required(VERSION 3.22.1)
project(llama_jni CXX)

# Import prebuilt shared libraries.
# IMPORTED tells CMake these already exist as compiled .so files.
add_library(llama SHARED IMPORTED)
set_target_properties(llama PROPERTIES
    IMPORTED_LOCATION \${CMAKE_SOURCE_DIR}/jniLibs/\${ANDROID_ABI}/libllama.so)

add_library(ggml SHARED IMPORTED)
set_target_properties(ggml PROPERTIES
    IMPORTED_LOCATION \${CMAKE_SOURCE_DIR}/jniLibs/\${ANDROID_ABI}/libggml.so)

add_library(ggml-base SHARED IMPORTED)
set_target_properties(ggml-base PROPERTIES
    IMPORTED_LOCATION \${CMAKE_SOURCE_DIR}/jniLibs/\${ANDROID_ABI}/libggml-base.so)

add_library(ggml-cpu SHARED IMPORTED)
set_target_properties(ggml-cpu PROPERTIES
    IMPORTED_LOCATION \${CMAKE_SOURCE_DIR}/jniLibs/\${ANDROID_ABI}/libggml-cpu.so)

# Compile the JNI bridge from source
add_library(llama_jni SHARED llama_jni.cpp)

# Link against prebuilt libs + Android system libs
target_link_libraries(llama_jni llama ggml ggml-base ggml-cpu log dl)

# 16KB page size alignment for Android 15+
target_link_options(llama_jni PRIVATE -Wl,-z,max-page-size=16384)`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Line-by-Line Breakdown</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>cmake_minimum_required(VERSION 3.22.1)</strong> -- Requires CMake 3.22.1+, which ships with Android Studio Flamingo and later.</li>
        <li><strong>project(llama_jni CXX)</strong> -- Declares a C++ project. Only C++ source files will be compiled.</li>
        <li><strong>add_library(... SHARED IMPORTED)</strong> -- Tells CMake about a prebuilt .so. No source is compiled; it is linked as-is.</li>
        <li><strong>IMPORTED_LOCATION</strong> -- The path to the .so file. <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ANDROID_ABI</code> is set by the NDK to "arm64-v8a".</li>
        <li><strong>add_library(llama_jni SHARED ...)</strong> -- Compiles llama_jni.cpp into libllama_jni.so.</li>
        <li><strong>target_link_libraries</strong> -- Links the JNI bridge against the inference libs, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">log</code> (Android logcat), and <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">dl</code> (dladdr/dlopen).</li>
        <li><strong>target_link_options</strong> -- Passes the 16KB page alignment flag to the linker.</li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 10. Compiler Flags                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Compiler Flags -- Detailed Explanation</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Gradle build applies an aggressive set of compiler flags tuned for maximum inference throughput
        on ARM64 Android devices:
      </p>
      <CodeBlock language="kotlin">{`cppFlags += listOf(
    "-std=c++17",       // C++17 language standard
    "-O3",              // Maximum optimization
    "-DNDEBUG",         // Disable assertions
    "-ffast-math",      // Aggressive floating-point optimizations
    "-flto",            // Link-time optimization
    "-march=armv8.6-a+dotprod+i8mm+bf16+fp16",  // Target ISA
    "-mtune=cortex-a76", // Instruction scheduling target
    "-DLLAMA_NATIVE=ON"  // Enable native-build paths in llama.cpp
)`}</CodeBlock>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Flag</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">What It Does</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Performance Impact</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-std=c++17</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables C++17 features (structured bindings, if-constexpr, std::optional)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">None directly; enables cleaner code that the optimizer handles well</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-O3</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables all -O2 optimizations plus loop vectorization, function inlining heuristics, and tree vectorization</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Significant -- typically 20-40% faster than -O2 for compute-heavy code</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-DNDEBUG</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Defines the NDEBUG preprocessor macro, disabling assert() statements</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Removes assertion checks from hot paths in GGML kernels</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-ffast-math</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Allows the compiler to reorder/reassociate floating-point operations, assume no NaN/Inf, and use reciprocal approximations</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">5-15% speedup on FP-heavy inference code; trades strict IEEE 754 compliance for speed</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-flto</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Link-Time Optimization -- the compiler emits IR instead of machine code, then optimizes across all translation units at link time</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables cross-file inlining and dead code elimination; 5-10% improvement</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-march=armv8.6-a+...</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Targets the ARMv8.6-A architecture with specific ISA extensions enabled (see next section)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Unlocks specialized instructions for quantized inference</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-mtune=cortex-a76</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Optimizes instruction scheduling for the Cortex-A76 microarchitecture pipeline</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Better instruction ordering reduces pipeline stalls; 2-5% improvement</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">-DLLAMA_NATIVE=ON</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Compile-time flag enabling native-build code paths in llama.cpp (vs. generic builds)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Activates platform-specific optimized routines</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">CMake Arguments from Gradle</h3>
      <CodeBlock language="kotlin">{`arguments += listOf(
    "-DANDROID_STL=c++_static",    // Statically link libc++
    "-DANDROID_PLATFORM=android-31", // Minimum API level 31 (Android 12)
    "-DANDROID_LD_FLAGS=-Wl,-z,max-page-size=16384",
    "-DGGML_USE_ARM_DOTPROD=ON",   // Enable dot product kernels
    "-DGGML_USE_ARM_FP16=ON",      // Enable FP16 kernels
    "-DGGML_USE_ARM_I8MM=ON",      // Enable I8MM kernels
    "-DLLAMA_BLAS=ON",             // Enable BLAS matmul acceleration
    "-DLLAMA_BLAS_VENDOR=OpenBLAS"  // Use OpenBLAS as the BLAS provider
)`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ANDROID_STL=c++_static</code> flag
        statically links libc++ into the binary, avoiding version conflicts with the system's shared libc++.
        The GGML flags enable architecture-specific kernel selection at compile time, ensuring the fastest
        available code path is compiled in.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 11. ARM64 ISA Extensions                                           */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">ARM64 ISA Extensions for LLM Inference</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">-march=armv8.6-a+dotprod+i8mm+bf16+fp16</code> flag
        enables four critical ISA extensions that dramatically accelerate quantized LLM inference:
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">dotprod (Dot Product)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The SDOT and UDOT instructions compute the dot product of four pairs of 8-bit integers and accumulate
        into a 32-bit register in a single cycle. For Q4_0 and Q8_0 quantized models, this means the
        inner loop of matrix multiplication processes 4 elements per instruction instead of 1. This provides
        roughly a 3-4x speedup for quantized matmul operations, which dominate inference time.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">i8mm (Int8 Matrix Multiply)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The SMMLA and UMMLA instructions perform an 8x2-by-2x8 integer matrix multiply, accumulating into a
        2x2 block of 32-bit results. This is a further evolution beyond dotprod, processing 16 multiply-accumulate
        operations per instruction. For quantized models, i8mm can deliver 2x additional speedup over dotprod
        alone, as it exposes more parallelism to the hardware.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">bf16 (BFloat16)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        BFloat16 uses the same 8-bit exponent as float32 but only 7 bits of mantissa (vs. 23). This preserves
        the dynamic range of float32 while halving memory bandwidth requirements. The BFMMLA and BFMLAL
        instructions perform BF16 matrix multiplies natively. For models distributed in BF16 format, this
        avoids costly conversions to FP32.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">fp16 (Half-Precision Float)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        ARM's FP16 extension enables native 16-bit floating-point arithmetic using the IEEE 754 half-precision
        format. The FMLA (fused multiply-add) instructions operate on 8 FP16 values simultaneously in a
        128-bit NEON register. This doubles throughput compared to FP32 for operations that can tolerate
        reduced precision. GGML uses FP16 for accumulation in many quantized kernels.
      </p>
      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Info</p>
        <p className="text-on-surface-variant text-sm">
          All four extensions are available on Snapdragon 888 (Cortex-X1/A78) and later SoCs, which covers
          all flagship Android devices from 2021 onward. The app targets API 31 (Android 12) as the minimum,
          so all target devices are expected to support these instructions.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 12. 16KB Page Size                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">16KB Page Size Support</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Starting with Android 15, devices may use 16KB memory pages instead of the traditional 4KB. This
        change improves TLB efficiency and reduces page table overhead for large memory mappings -- both
        important for LLM inference where models are memory-mapped.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        However, shared libraries compiled with the default 4KB page alignment will crash on 16KB-page
        devices because the ELF segment alignment does not match the kernel page size. The linker flag
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary"> -Wl,-z,max-page-size=16384</code> forces
        the linker to align ELF segments to 16KB boundaries, making the binary compatible with both 4KB
        and 16KB page sizes.
      </p>
      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Warning</p>
        <p className="text-on-surface-variant text-sm">
          All <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.so</code> files in the app must
          be compiled with this flag -- not just the JNI bridge. The prebuilt libraries (libllama.so, libggml.so,
          etc.) must also be built with 16KB alignment. A single misaligned library will crash the app on
          16KB-page devices.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 13. Memory Management                                              */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Memory Management</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Loading via mmap</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        llama.cpp loads GGUF model files using <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">mmap()</code>,
        which maps the file directly into the process's virtual address space without copying it into RAM.
        The kernel loads pages on demand as they are accessed and can evict them under memory pressure
        without any I/O (since they are backed by the file). This has several advantages:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Fast startup:</strong> The model appears loaded instantly. Only the metadata pages are read immediately; weight data is faulted in during the first inference.</li>
        <li><strong>Shared pages:</strong> If multiple processes load the same model, the kernel shares the physical pages.</li>
        <li><strong>Graceful memory pressure:</strong> The OS can drop clean mmap'd pages without writing to swap, making the app more resilient on memory-constrained devices.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Context Allocation and KV Cache</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_new_context_with_model()</code> is
        called, it allocates the KV cache and computation scratch buffers. The KV cache size is determined by:
      </p>
      <CodeBlock language="text">{`KV cache memory = n_layers * 2 * n_ctx * n_embd * sizeof(dtype)

Example for a 7B model (32 layers, 4096 ctx, 4096 embd, FP16):
  = 32 * 2 * 4096 * 4096 * 2 bytes
  = 2 GB`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        This is the primary consumer of RAM beyond the model weights themselves. Reducing the context size
        via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeSetContextSize()</code> directly
        reduces KV cache memory proportionally.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 14. Logging Bridge                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Logging Bridge</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        GGML and llama.cpp produce diagnostic messages through a logging callback. The JNI bridge registers
        a custom callback that forwards these messages to Android's logcat system:
      </p>
      <CodeBlock language="cpp">{`static void llama_log_bridge(enum ggml_log_level level, const char *text, void *) {
    int prio;
    switch (level) {
        case GGML_LOG_LEVEL_ERROR: prio = ANDROID_LOG_ERROR; break;
        case GGML_LOG_LEVEL_WARN:  prio = ANDROID_LOG_WARN;  break;
        case GGML_LOG_LEVEL_INFO:  prio = ANDROID_LOG_INFO;  break;
        default:                   prio = ANDROID_LOG_DEBUG;  break;
    }
    __android_log_print(prio, "llama_jni", "%s", text);
}

// Registered during initialization:
llama_log_set(llama_log_bridge, nullptr);`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        This makes all native log output visible in Android Studio's Logcat window under the tag{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni</code>, which is
        invaluable for debugging model loading issues, backend selection, and performance profiling.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 15. Error Handling                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Error Handling in Native Code</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The native layer uses a multi-strategy error handling approach since C++ exceptions cannot safely
        cross the JNI boundary.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Return Codes</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Functions that can fail return integer status codes. By convention:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>0</strong> -- Success</li>
        <li><strong>-1</strong> -- Model loading failed (file not found, corrupt GGUF, unsupported format)</li>
        <li><strong>-2</strong> -- Context creation failed (insufficient memory for KV cache)</li>
        <li><strong>-3</strong> -- Backend initialization failed</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">set_last_error() and nativeGetLastError()</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When an error occurs, the native code calls <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">set_last_error()</code> with
        a descriptive message. The Kotlin layer can retrieve this message via{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeGetLastError()</code> to
        display user-facing diagnostics or log the failure reason. The error string persists until the next
        error or until the model is shut down.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Exception Safety</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        C++ exceptions thrown inside JNI functions are not caught by the JVM and will crash the process.
        The JNI bridge wraps all operations in try-catch blocks at the JNI boundary:
      </p>
      <CodeBlock language="cpp">{`JNIEXPORT jint JNICALL ...nativeInit(...) {
    try {
        // ... all initialization logic ...
        return 0;
    } catch (const std::exception &e) {
        set_last_error(std::string("Exception: ") + e.what());
        return -1;
    } catch (...) {
        set_last_error("Unknown native exception");
        return -1;
    }
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        This pattern ensures that no exception escapes into the JVM. The Kotlin side always checks
        the return code and, on failure, reads the error message for diagnostics.
      </p>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Tip</p>
        <p className="text-on-surface-variant text-sm">
          When debugging native crashes, enable Hexagon verbose mode via{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">nativeSetHexagonConfig(1, 0, true, false)</code> and
          watch logcat for tag <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni</code>.
          Most initialization failures produce descriptive error messages that pinpoint the root cause
          (missing skel library, unsupported HTP version, insufficient memory).
        </p>
      </div>
    </div>
  );
}
