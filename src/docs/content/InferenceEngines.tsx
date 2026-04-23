import CodeBlock from '../CodeBlock';

export default function InferenceEngines() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Inference Engines</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        QuantaLLM implements a dual-engine inference architecture that supports both llama.cpp (GGUF models)
        and ONNX Runtime GenAI (ONNX models). Engines are hot-swappable at runtime through a shared
        <code className="font-mono text-primary"> InferenceEngine</code> interface, coordinated by the
        thread-safe <code className="font-mono text-primary">ModelEngine</code> singleton.
      </p>

      {/* ── Architecture Overview ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Architecture Overview</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The inference stack is layered so that the UI and ViewModel never interact with engine
        implementations directly. Every request flows through <code className="font-mono text-primary">ModelEngine</code>,
        which holds a <code className="font-mono text-primary">ReentrantLock</code> and delegates to whichever
        <code className="font-mono text-primary"> InferenceEngine</code> is currently active.
      </p>

      <CodeBlock language="bash">{`┌─────────────────────────────────────────────────────────┐
│                   Compose UI Layer                       │
│          collectAsState() on StreamingText flow          │
└──────────────────────┬──────────────────────────────────┘
                       │  viewModelScope.launch(IO)
┌──────────────────────▼──────────────────────────────────┐
│                    ViewModel                             │
│       Calls ModelEngine.generateStreaming()              │
└──────────────────────┬──────────────────────────────────┘
                       │  lock.withLock { }
┌──────────────────────▼──────────────────────────────────┐
│              ModelEngine (singleton)                     │
│    Holds active InferenceEngine + ReentrantLock          │
│    Routes to correct engine based on InferenceBackend    │
└─────────┬───────────────────────────────┬───────────────┘
          │                               │
┌─────────▼──────────┐     ┌──────────────▼──────────────┐
│  LlamaCppEngine    │     │    OnnxRuntimeEngine         │
│  ┌──────────────┐  │     │  ┌────────────────────────┐  │
│  │  LlamaJni    │  │     │  │ ORT GenAI v0.12.2 API  │  │
│  │  (JNI calls) │  │     │  │ Model / Tokenizer /    │  │
│  └──────┬───────┘  │     │  │ GeneratorParams /       │  │
│         │          │     │  │ Generator               │  │
│  ┌──────▼───────┐  │     │  └────────────────────────┘  │
│  │ libllama.so  │  │     │                              │
│  │ (native C++) │  │     │                              │
│  └──────────────┘  │     │                              │
└────────────────────┘     └──────────────────────────────┘`}</CodeBlock>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        This design enforces a single active engine at any moment. Switching backends automatically
        unloads the current model, instantiates the new engine class, and updates the tracked backend.
        The lock guarantees that no generation can be in flight during a switch.
      </p>

      {/* ── InferenceEngine Interface ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">The InferenceEngine Interface</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Every inference backend implements this Kotlin interface. It defines the complete lifecycle of
        model loading, inference, streaming, and cleanup. Because it is an interface (not an abstract
        class), engines carry no inherited state and remain fully testable in isolation.
      </p>

      <CodeBlock language="kotlin">{`interface InferenceEngine {
    val displayName: String
    fun loadModel(modelPath: String, threads: Int): Int
    fun isModelLoaded(): Boolean
    fun getModelInfo(): String
    fun getCurrentModelPath(): String?
    fun generate(prompt: String, maxTokens: Int, temperature: Float): String
    fun generateStreaming(prompt: String, maxTokens: Int, temperature: Float,
                         callback: StreamingCallback): String
    fun unloadModel(): Int
    fun getLastError(): String

    fun interface StreamingCallback {
        fun onProgress(generatedTokens: Int, partialText: String)
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Method-by-Method Reference</h3>

      {/* displayName */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">displayName</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        A read-only property returning a human-readable name for the engine, used in the UI settings
        screen and log output. For <code className="font-mono text-primary">LlamaCppEngine</code> this
        returns <code className="font-mono text-primary">"llama.cpp"</code>; for
        <code className="font-mono text-primary"> OnnxRuntimeEngine</code> it returns
        <code className="font-mono text-primary">"ONNX Runtime (CPU)"</code> or
        <code className="font-mono text-primary">"ONNX Runtime (QNN)"</code> depending on the execution provider.
      </p>

      {/* loadModel */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">loadModel(modelPath, threads)</h4>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="py-3 px-4 text-on-surface font-bold">Parameter</th>
              <th className="py-3 px-4 text-on-surface font-bold">Type</th>
              <th className="py-3 px-4 text-on-surface font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">modelPath</td>
              <td className="py-3 px-4">String</td>
              <td className="py-3 px-4">Absolute path to the GGUF file or ONNX model directory</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">threads</td>
              <td className="py-3 px-4">Int</td>
              <td className="py-3 px-4">Number of CPU threads. 0 = engine default (6 for llama.cpp)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Returns:</strong> <code className="font-mono text-primary">0</code> on success,
        negative error code on failure (<code className="font-mono text-primary">-1</code> = file not found
        at ModelEngine level, <code className="font-mono text-primary">-2</code> = engine-level failure).
        This method is blocking and may take several seconds for large models. The caller (ModelEngine)
        always holds the lock during this call.
      </p>

      {/* isModelLoaded */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">isModelLoaded()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returns <code className="font-mono text-primary">true</code> if a model is currently loaded and
        ready for inference. Each engine tracks this internally: LlamaCppEngine uses a boolean flag
        set after successful JNI load; OnnxRuntimeEngine checks whether its
        <code className="font-mono text-primary"> model</code> reference is non-null.
      </p>

      {/* getModelInfo */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">getModelInfo()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returns a human-readable string with model metadata. For LlamaCppEngine this delegates to
        <code className="font-mono text-primary">LlamaJni.getModelInfo()</code> which returns native model
        parameters (size, context length, architecture). For OnnxRuntimeEngine it returns the model
        directory name and computed file size.
      </p>

      {/* getCurrentModelPath */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">getCurrentModelPath()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returns the absolute path of the currently loaded model, or <code className="font-mono text-primary">null</code> if
        no model is loaded. Both engines track this in a private <code className="font-mono text-primary">currentModelPath</code> variable
        that is set on successful load and cleared on unload.
      </p>

      {/* generate */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">generate(prompt, maxTokens, temperature)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Synchronous, non-streaming generation. Blocks until the full response is produced and returns
        it as a single string. Parameters:
      </p>
      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li><code className="font-mono text-primary">prompt</code> -- the complete prompt text (with any chat template already applied)</li>
        <li><code className="font-mono text-primary">maxTokens</code> -- hard cap on generated tokens; the engine stops after this many</li>
        <li><code className="font-mono text-primary">temperature</code> -- sampling temperature (0.0 = greedy, higher = more random)</li>
      </ul>

      {/* generateStreaming */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">generateStreaming(prompt, maxTokens, temperature, callback)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The primary generation method used by the app. Identical parameters to
        <code className="font-mono text-primary"> generate()</code> plus a
        <code className="font-mono text-primary"> StreamingCallback</code>. The callback fires after every
        generated token with the running count and the accumulated text so far. Returns the final
        complete text when generation finishes.
      </p>

      {/* unloadModel */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">unloadModel()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Frees all resources associated with the currently loaded model. Returns
        <code className="font-mono text-primary"> 0</code> on success, <code className="font-mono text-primary">-2</code> on
        failure. For LlamaCppEngine this calls <code className="font-mono text-primary">LlamaJni.unloadModel()</code> which
        frees native memory. For OnnxRuntimeEngine this calls <code className="font-mono text-primary">model?.close()</code> and
        sets references to null.
      </p>

      {/* getLastError */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">getLastError()</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returns the most recent error message string. Useful for displaying failure reasons in the UI
        when <code className="font-mono text-primary">loadModel()</code> or
        <code className="font-mono text-primary"> generate()</code> returns an error code.
      </p>

      {/* StreamingCallback */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">StreamingCallback (SAM interface)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Declared as a <code className="font-mono text-primary">fun interface</code> (Single Abstract Method),
        enabling lambda syntax at call sites. The single method
        <code className="font-mono text-primary"> onProgress(generatedTokens: Int, partialText: String)</code> is
        invoked on the inference thread -- callers must post to the main thread for UI updates.
      </p>

      {/* ── LlamaCppEngine Deep Dive ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">LlamaCppEngine Deep Dive</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        LlamaCppEngine is the default and most capable engine. It wraps the
        <code className="font-mono text-primary"> LlamaJni</code> JNI bridge, which calls into a compiled
        <code className="font-mono text-primary"> libllama.so</code> native library built from the llama.cpp
        project. Every public method delegates directly to a corresponding JNI native method.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Thread Clamping Logic</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        LlamaCppEngine applies hard bounds to the <code className="font-mono text-primary">threads</code> parameter
        before passing it to native code. This prevents both under-utilization and over-subscription
        of CPU cores on mobile devices:
      </p>

      <CodeBlock language="kotlin">{`// Thread clamping in LlamaCppEngine.loadModel()
val clampedThreads = when {
    threads <= 0 -> 6    // Default: 6 threads
    threads > 12 -> 12   // Maximum: 12 threads
    else -> threads      // Use requested value
}`}</CodeBlock>

      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li><strong>Default (0):</strong> Maps to 6 threads -- a balanced choice for most Snapdragon SoCs with 4 performance + 4 efficiency cores</li>
        <li><strong>Maximum (12):</strong> Hard cap prevents runaway thread creation on devices that report high core counts (e.g. big.LITTLE configurations with SMT)</li>
        <li><strong>Range 1-12:</strong> Passed through unchanged, giving advanced users direct control</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">JNI Delegation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Every method in LlamaCppEngine is a thin wrapper around
        <code className="font-mono text-primary"> LlamaJni</code> static methods. The engine itself holds
        minimal state: a <code className="font-mono text-primary">loaded: Boolean</code> flag and a
        <code className="font-mono text-primary"> currentModelPath: String?</code>. All heavy lifting --
        memory allocation, tokenization, sampling, KV cache management -- happens in native C++ code.
      </p>

      <CodeBlock language="kotlin">{`// Typical delegation pattern
override fun loadModel(modelPath: String, threads: Int): Int {
    val clampedThreads = clampThreads(threads)
    val result = LlamaJni.loadModel(modelPath, clampedThreads)
    if (result == 0) {
        loaded = true
        currentModelPath = modelPath
    }
    return result
}

override fun unloadModel(): Int {
    val result = LlamaJni.unloadModel()
    if (result == 0) {
        loaded = false
        currentModelPath = null
    }
    return result
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Streaming Adapter</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The native <code className="font-mono text-primary">LlamaJni.StreamingCallback</code> has a
        different signature from the engine-agnostic
        <code className="font-mono text-primary"> InferenceEngine.StreamingCallback</code>. LlamaCppEngine
        bridges between them by wrapping the caller's callback in a JNI-compatible adapter:
      </p>

      <CodeBlock language="kotlin">{`override fun generateStreaming(
    prompt: String,
    maxTokens: Int,
    temperature: Float,
    callback: StreamingCallback
): String {
    // Wrap engine-agnostic callback into JNI callback
    val jniCallback = LlamaJni.StreamingCallback { tokens, text ->
        callback.onProgress(tokens, text)
    }
    return LlamaJni.generateStreaming(prompt, maxTokens, temperature, jniCallback)
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Supported Features</h3>
      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li><strong>Chat sessions:</strong> KV cache is preserved between turns, enabling multi-turn conversations without re-processing the full context</li>
        <li><strong>Context control:</strong> Configurable context window size, with automatic truncation when the KV cache fills</li>
        <li><strong>All GGUF quantizations:</strong> Q2_K, Q3_K_S/M/L, Q4_0, Q4_K_S/M, Q5_0, Q5_K_S/M, Q6_K, Q8_0, plus IQ (importance quantization) variants</li>
        <li><strong>Hexagon NPU offload:</strong> When backend is set to HEXAGON, the same LlamaCppEngine is used but the native library routes compute through the Qualcomm Hexagon HTP</li>
        <li><strong>Advanced sampling:</strong> Temperature, top-k, top-p, repetition penalty -- all configured at the native level</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Error Handling</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        LlamaCppEngine uses integer error codes returned from JNI:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="py-3 px-4 text-on-surface font-bold">Code</th>
              <th className="py-3 px-4 text-on-surface font-bold">Meaning</th>
              <th className="py-3 px-4 text-on-surface font-bold">Typical Cause</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">0</td>
              <td className="py-3 px-4">Success</td>
              <td className="py-3 px-4">Operation completed normally</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">-1</td>
              <td className="py-3 px-4">File not found</td>
              <td className="py-3 px-4">Caught at ModelEngine level before reaching engine</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">-2</td>
              <td className="py-3 px-4">Engine failure</td>
              <td className="py-3 px-4">Native load/unload failure, OOM, corrupt model file</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> LlamaCppEngine is the default engine and handles the vast majority of models
          available on HuggingFace. If you are unsure which engine to use, start here.
        </p>
      </div>

      {/* ── OnnxRuntimeEngine Deep Dive ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">OnnxRuntimeEngine Deep Dive</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        OnnxRuntimeEngine wraps the <code className="font-mono text-primary">onnxruntime-genai</code> Android
        library (v0.12.2) for models exported in ONNX format. Unlike LlamaCppEngine which loads a single
        file, OnnxRuntimeEngine operates on a directory containing the model weights, tokenizer data,
        and a configuration file.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ExecutionProvider Enum</h3>
      <CodeBlock language="kotlin">{`enum class ExecutionProvider {
    CPU,  // Standard CPU inference
    QNN   // Qualcomm QNN (Hexagon NPU) -- Phase 2
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The execution provider is set at construction time and determines which ORT backend is used for
        tensor computation. Currently only CPU is fully implemented; QNN support is planned for Phase 2.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Directory-Based Model Loading</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Before loading, OnnxRuntimeEngine validates that the model directory contains the required files:
      </p>

      <CodeBlock language="kotlin">{`override fun loadModel(modelPath: String, threads: Int): Int {
    val modelDir = File(modelPath)
    // Validation: must be a directory
    if (!modelDir.isDirectory) return -2

    // Validation: must contain .onnx file(s)
    val hasOnnx = modelDir.listFiles()?.any { it.extension == "onnx" } ?: false
    if (!hasOnnx) return -2

    // Validation: must contain genai_config.json
    val configFile = File(modelDir, "genai_config.json")
    if (!configFile.exists()) return -2

    // Load via ORT GenAI API
    model = Model(modelPath)
    tokenizer = Tokenizer(model)
    loaded = true
    currentModelPath = modelPath
    return 0
}`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> Unlike LlamaCppEngine, the <code className="font-mono text-primary">threads</code> parameter
          is currently ignored by OnnxRuntimeEngine. ORT manages its own thread pool internally based
          on the execution provider configuration.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ORT GenAI API Usage</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The engine uses four core classes from <code className="font-mono text-primary">ai.onnxruntime.genai</code>:
      </p>
      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li><code className="font-mono text-primary">Model</code> -- loads the ONNX model from disk and holds the computation graph</li>
        <li><code className="font-mono text-primary">Tokenizer</code> -- converts text to token IDs and back; constructed from the Model instance</li>
        <li><code className="font-mono text-primary">GeneratorParams</code> -- holds generation settings (max length, temperature); constructed directly (no builder pattern in v0.12.2)</li>
        <li><code className="font-mono text-primary">Generator</code> -- the stateful token generator that produces output tokens one at a time</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Tokenization Pipeline</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Prompt encoding uses <code className="font-mono text-primary">appendTokenSequences</code> rather than
        a simple encode-then-set pattern. This is required by the ORT GenAI v0.12.2 API:
      </p>

      <CodeBlock language="kotlin">{`// Tokenize and configure generation
val params = GeneratorParams(model)
params.setSearchOption("max_length", maxTokens.toDouble())
params.setSearchOption("temperature", temperature.toDouble())

// Encode prompt and append to params
val tokenSequences = tokenizer.encode(prompt)
params.appendTokenSequences(tokenSequences)`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generator Loop Internals</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Token generation is an explicit loop that calls <code className="font-mono text-primary">generateNextToken()</code>
        on each iteration. The loop checks <code className="font-mono text-primary">isDone()</code> to know
        when the model has emitted an end-of-sequence token or hit the max length:
      </p>

      <CodeBlock language="kotlin">{`val generator = Generator(model, params)
val sb = StringBuilder()
var tokenCount = 0

while (!generator.isDone()) {
    generator.generateNextToken()
    val lastTokens = generator.getLastTokens()
    val tokenText = tokenizer.decode(lastTokens)
    sb.append(tokenText)
    tokenCount++

    // Fire streaming callback
    callback.onProgress(tokenCount, sb.toString())
}

return sb.toString()`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Size Calculation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Since ONNX models are stored as directories with multiple files, OnnxRuntimeEngine computes
        the total model size by walking the directory tree and summing file sizes:
      </p>

      <CodeBlock language="kotlin">{`private fun calculateModelSize(modelDir: File): Long {
    return modelDir.walkTopDown()
        .filter { it.isFile }
        .sumOf { it.length() }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Resource Cleanup</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        OnnxRuntimeEngine implements careful resource cleanup. The ORT <code className="font-mono text-primary">Model</code> class
        implements <code className="font-mono text-primary">AutoCloseable</code>, so it must be explicitly closed
        to release native memory:
      </p>

      <CodeBlock language="kotlin">{`override fun unloadModel(): Int {
    return try {
        model?.close()
        model = null
        tokenizer = null
        loaded = false
        currentModelPath = null
        0 // success
    } catch (e: Exception) {
        lastError = e.message ?: "Unknown error during unload"
        -2 // failure
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Current Limitations</h3>
      <div className="bg-surface-container border-l-4 border-secondary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed mb-2">
          <strong>Note:</strong> OnnxRuntimeEngine has several limitations compared to LlamaCppEngine:
        </p>
        <ul className="list-disc ml-4 space-y-1 text-on-surface-variant">
          <li>No chat session / KV cache persistence between turns</li>
          <li>No context window control -- managed entirely by the model config</li>
          <li>Thread count parameter is ignored; ORT manages threading internally</li>
          <li>QNN execution provider (NPU acceleration) is not yet implemented</li>
          <li>Fewer available models compared to the GGUF ecosystem</li>
          <li>No advanced sampling parameters (top-k, top-p, repetition penalty) exposed yet</li>
        </ul>
      </div>

      {/* ── ModelEngine Singleton ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">ModelEngine Singleton</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="font-mono text-primary">ModelEngine</code> is a Kotlin
        <code className="font-mono text-primary"> object</code> (singleton) that serves as the single point of
        access for all inference operations. It owns the active engine instance, serializes all
        operations through a lock, and tracks concurrent request state.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Thread Safety Model</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Every public method acquires a <code className="font-mono text-primary">ReentrantLock</code> via
        Kotlin's <code className="font-mono text-primary">lock.withLock &#123;&#125;</code> extension. This
        ensures that model loading, generation, unloading, and engine switching are fully serialized.
        No two operations can execute concurrently:
      </p>

      <CodeBlock language="kotlin">{`object ModelEngine {
    private val lock = ReentrantLock()
    private var engine: InferenceEngine = LlamaCppEngine()
    private var activeBackend: InferenceBackend = InferenceBackend.CPU
    private var currentThreadCount: Int = 0
    private val activeInferences = mutableSetOf<Int>()
    private var nextRequestId = 1

    // Every public method follows this pattern:
    fun someOperation(): Result = lock.withLock {
        // ... serialized work ...
    }
}`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> Because <code className="font-mono text-primary">generateStreaming()</code> holds
          the lock for the entire duration of generation, no other ModelEngine operation can proceed
          until generation completes. This is by design -- it prevents model unloading during active
          inference -- but callers must be aware of this blocking behavior.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Request ID Tracking</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        ModelEngine maintains a set of active inference request IDs and an incrementing counter.
        This enables tracking of concurrent or queued generation requests for diagnostics and
        future cancellation support:
      </p>

      <CodeBlock language="kotlin">{`private val activeInferences = mutableSetOf<Int>()
private var nextRequestId = 1

// Used internally to track active generation
fun generateStreaming(...): String = lock.withLock {
    val requestId = nextRequestId++
    activeInferences.add(requestId)
    try {
        engine.generateStreaming(prompt, maxTokens, temperature, callback)
    } finally {
        activeInferences.remove(requestId)
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Public Methods</h3>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">switchEngine(backend)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Replaces the active engine. If a model is currently loaded, it is unloaded first. The new engine
        is instantiated based on the <code className="font-mono text-primary">InferenceBackend</code> enum value:
      </p>

      <CodeBlock language="kotlin">{`fun switchEngine(backend: InferenceBackend): Boolean = lock.withLock {
    if (engine.isModelLoaded()) unloadModelInternal()
    engine = when (backend) {
        InferenceBackend.CPU, InferenceBackend.HEXAGON -> LlamaCppEngine()
        InferenceBackend.ONNX_CPU -> OnnxRuntimeEngine(ExecutionProvider.CPU)
        InferenceBackend.ONNX_QNN -> OnnxRuntimeEngine(ExecutionProvider.QNN)
    }
    activeBackend = backend
    return true
}`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">loadModel(modelPath, threads)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Validates the file path exists, stores the thread count, and delegates to the active engine.
        Returns <code className="font-mono text-primary">-1</code> immediately if the path does not exist
        on disk, without touching the engine at all:
      </p>

      <CodeBlock language="kotlin">{`fun loadModel(modelPath: String, threads: Int = 0): Int = lock.withLock {
    val file = File(modelPath)
    if (!file.exists()) return -1
    currentThreadCount = threads
    engine.loadModel(modelPath, threads)
}`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">generateStreaming(prompt, maxTokens, temperature, callback)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The primary generation entry point. Checks that a model is loaded, then delegates to the
        active engine. Returns an error string (not an exception) if no model is loaded:
      </p>

      <CodeBlock language="kotlin">{`fun generateStreaming(
    prompt: String,
    maxTokens: Int,
    temperature: Float,
    callback: StreamingCallback
): String = lock.withLock {
    if (!engine.isModelLoaded()) return "Error: No model loaded"
    engine.generateStreaming(prompt, maxTokens, temperature, callback)
}`}</CodeBlock>

      {/* ── InferenceBackend Enum ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">InferenceBackend Enum</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="font-mono text-primary">InferenceBackend</code> enum defines all available
        backend configurations. Each entry carries a native mode integer (used in JNI calls) and a
        display name for the UI:
      </p>

      <CodeBlock language="kotlin">{`enum class InferenceBackend(val nativeMode: Int, val displayName: String) {
    CPU(1, "CPU (ARM64)"),
    HEXAGON(2, "Hexagon HTP"),
    ONNX_CPU(3, "ONNX Runtime (CPU)"),
    ONNX_QNN(4, "ONNX Runtime (QNN)")
}`}</CodeBlock>

      {/* ── Backend Comparison Matrix ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Backend Comparison Matrix</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The following table compares all four inference backends across key dimensions:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="py-3 px-4 text-on-surface font-bold">Feature</th>
              <th className="py-3 px-4 text-on-surface font-bold">CPU (ARM64)</th>
              <th className="py-3 px-4 text-on-surface font-bold">Hexagon HTP</th>
              <th className="py-3 px-4 text-on-surface font-bold">ONNX CPU</th>
              <th className="py-3 px-4 text-on-surface font-bold">ONNX QNN</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Engine Class</td>
              <td className="py-3 px-4">LlamaCppEngine</td>
              <td className="py-3 px-4">LlamaCppEngine</td>
              <td className="py-3 px-4">OnnxRuntimeEngine</td>
              <td className="py-3 px-4">OnnxRuntimeEngine</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Model Format</td>
              <td className="py-3 px-4">GGUF (single file)</td>
              <td className="py-3 px-4">GGUF (single file)</td>
              <td className="py-3 px-4">ONNX (directory)</td>
              <td className="py-3 px-4">ONNX (directory)</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Native Mode</td>
              <td className="py-3 px-4 font-mono">1</td>
              <td className="py-3 px-4 font-mono">2</td>
              <td className="py-3 px-4 font-mono">3</td>
              <td className="py-3 px-4 font-mono">4</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Quantization</td>
              <td className="py-3 px-4">Q2_K - Q8_0, IQ variants</td>
              <td className="py-3 px-4">Q2_K - Q8_0, IQ variants</td>
              <td className="py-3 px-4">Model-dependent</td>
              <td className="py-3 px-4">Model-dependent</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Streaming</td>
              <td className="py-3 px-4"><span className="text-green-400">Yes</span></td>
              <td className="py-3 px-4"><span className="text-green-400">Yes</span></td>
              <td className="py-3 px-4"><span className="text-green-400">Yes</span></td>
              <td className="py-3 px-4"><span className="text-yellow-400">Planned</span></td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Chat Sessions</td>
              <td className="py-3 px-4"><span className="text-green-400">Yes (KV cache)</span></td>
              <td className="py-3 px-4"><span className="text-green-400">Yes (KV cache)</span></td>
              <td className="py-3 px-4"><span className="text-red-400">No</span></td>
              <td className="py-3 px-4"><span className="text-red-400">No</span></td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Context Control</td>
              <td className="py-3 px-4"><span className="text-green-400">Yes</span></td>
              <td className="py-3 px-4"><span className="text-green-400">Yes</span></td>
              <td className="py-3 px-4"><span className="text-red-400">No</span></td>
              <td className="py-3 px-4"><span className="text-red-400">No</span></td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Thread Control</td>
              <td className="py-3 px-4">Yes (clamped 1-12)</td>
              <td className="py-3 px-4">Yes (clamped 1-12)</td>
              <td className="py-3 px-4">No (ORT-managed)</td>
              <td className="py-3 px-4">No (ORT-managed)</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Status</td>
              <td className="py-3 px-4"><span className="text-green-400 font-semibold">Available</span></td>
              <td className="py-3 px-4"><span className="text-green-400 font-semibold">Available</span></td>
              <td className="py-3 px-4"><span className="text-green-400 font-semibold">Available</span></td>
              <td className="py-3 px-4"><span className="text-yellow-400 font-semibold">Phase 2</span></td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Performance</td>
              <td className="py-3 px-4">Good (multi-threaded ARM NEON)</td>
              <td className="py-3 px-4">Best (NPU offload, lower power)</td>
              <td className="py-3 px-4">Moderate (ORT CPU optimizations)</td>
              <td className="py-3 px-4">Expected best for ONNX models</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-semibold">Best For</td>
              <td className="py-3 px-4">Universal compatibility</td>
              <td className="py-3 px-4">Qualcomm SoCs, battery life</td>
              <td className="py-3 px-4">Cross-framework ONNX models</td>
              <td className="py-3 px-4">NPU-accelerated ONNX (future)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Streaming Architecture ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Streaming Architecture</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Token streaming flows through five layers, from the Compose UI down to native code and back.
        Understanding this chain is essential for debugging latency or missed token issues.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Full Callback Chain</h3>
      <ol className="list-decimal ml-4 space-y-3 text-on-surface-variant mb-6">
        <li>
          <strong>UI Layer (Compose):</strong> User taps "Generate." The composable calls a ViewModel
          method, which launches a coroutine on <code className="font-mono text-primary">Dispatchers.IO</code>.
        </li>
        <li>
          <strong>ViewModel:</strong> Calls <code className="font-mono text-primary">ModelEngine.generateStreaming()</code>,
          passing a lambda as the <code className="font-mono text-primary">StreamingCallback</code>. The lambda
          updates a <code className="font-mono text-primary">MutableStateFlow&lt;String&gt;</code>.
        </li>
        <li>
          <strong>ModelEngine:</strong> Acquires the <code className="font-mono text-primary">ReentrantLock</code>,
          verifies a model is loaded, assigns a request ID, and delegates to the active engine's
          <code className="font-mono text-primary"> generateStreaming()</code>.
        </li>
        <li>
          <strong>InferenceEngine:</strong> For LlamaCppEngine, the callback is wrapped in a
          <code className="font-mono text-primary"> LlamaJni.StreamingCallback</code> adapter and passed to
          native code. For OnnxRuntimeEngine, the generator loop calls the callback directly after
          each <code className="font-mono text-primary">generateNextToken()</code>.
        </li>
        <li>
          <strong>Native / ORT layer:</strong> Each new token triggers the callback on the inference
          thread. The callback fires with <code className="font-mono text-primary">(tokenCount, accumulatedText)</code>.
        </li>
        <li>
          <strong>Back to ViewModel:</strong> The StateFlow update is thread-safe. Compose's
          <code className="font-mono text-primary"> collectAsState()</code> observes the flow and recomposes
          on the main thread whenever a new value arrives.
        </li>
      </ol>

      <CodeBlock language="kotlin">{`// Complete streaming flow example

// 1. ViewModel launches on IO dispatcher
fun startGeneration(prompt: String, maxTokens: Int, temp: Float) {
    viewModelScope.launch(Dispatchers.IO) {
        _isGenerating.value = true
        val result = ModelEngine.generateStreaming(
            prompt, maxTokens, temp
        ) { tokenCount, partialText ->
            // 5. Callback fires on inference thread
            _streamingText.value = partialText
            _tokenCount.value = tokenCount
        }
        _isGenerating.value = false
        _finalResult.value = result
    }
}

// 6. Compose collects on main thread
@Composable
fun GenerationScreen(viewModel: InferenceViewModel) {
    val text by viewModel.streamingText.collectAsState()
    val isGenerating by viewModel.isGenerating.collectAsState()

    Text(text = text)
    if (isGenerating) CircularProgressIndicator()
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Timing Characteristics</h3>
      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li><strong>Callback frequency:</strong> Once per token generated (typically 10-50ms apart depending on model size and hardware)</li>
        <li><strong>StateFlow coalescing:</strong> If tokens arrive faster than Compose can recompose, intermediate values may be skipped -- but the final text is always correct since each callback sends the full accumulated text</li>
        <li><strong>Thread hop:</strong> Callback fires on the inference thread, StateFlow delivers on the main thread. The thread hop is handled automatically by Compose's flow collection</li>
        <li><strong>Lock duration:</strong> The ReentrantLock is held for the entire generation, meaning the streaming callback fires while the lock is held. This is safe because the callback only writes to a StateFlow (non-blocking)</li>
      </ul>

      {/* ── Engine Switching Workflow ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Engine Switching Workflow</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When the user selects a different backend in the settings UI, the following sequence executes:
      </p>

      <ol className="list-decimal ml-4 space-y-3 text-on-surface-variant mb-6">
        <li>
          <strong>UI dispatches switch request:</strong> The settings screen calls
          <code className="font-mono text-primary"> ModelEngine.switchEngine(newBackend)</code> on a background thread.
        </li>
        <li>
          <strong>Lock acquired:</strong> <code className="font-mono text-primary">switchEngine()</code> acquires
          the <code className="font-mono text-primary">ReentrantLock</code>. If a generation is in progress, this
          call blocks until it completes.
        </li>
        <li>
          <strong>Current model unloaded:</strong> If <code className="font-mono text-primary">engine.isModelLoaded()</code> returns
          true, <code className="font-mono text-primary">unloadModelInternal()</code> is called. This frees native
          memory (LlamaCpp) or closes the ORT Model object.
        </li>
        <li>
          <strong>New engine instantiated:</strong> A fresh engine instance is created based on the backend
          enum value. CPU and HEXAGON both create <code className="font-mono text-primary">LlamaCppEngine()</code>;
          ONNX_CPU and ONNX_QNN create <code className="font-mono text-primary">OnnxRuntimeEngine</code> with
          the appropriate <code className="font-mono text-primary">ExecutionProvider</code>.
        </li>
        <li>
          <strong>Backend tracking updated:</strong> <code className="font-mono text-primary">activeBackend</code> is
          set to the new value.
        </li>
        <li>
          <strong>Lock released:</strong> The method returns <code className="font-mono text-primary">true</code>.
          The user must then load a model compatible with the new backend.
        </li>
      </ol>

      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> Engine switching always unloads the current model. The user must explicitly
          load a new model after switching backends. The UI should reflect this by showing the "no model
          loaded" state after a switch.
        </p>
      </div>

      <CodeBlock language="bash">{`Engine Switch Timeline
──────────────────────────────────────────────────

  [User taps "ONNX CPU"]
          │
          ▼
  switchEngine(ONNX_CPU)
          │
          ├── lock.withLock acquired
          │
          ├── engine.isModelLoaded()? ── YES ──► unloadModelInternal()
          │                                          │
          │                                          ├── engine.unloadModel()
          │                                          └── native memory freed
          │
          ├── engine = OnnxRuntimeEngine(CPU)
          │
          ├── activeBackend = ONNX_CPU
          │
          └── return true, lock released`}</CodeBlock>

      {/* ── Error Handling ── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Error Handling</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The inference stack uses a combination of integer error codes and string error messages.
        Exceptions are caught at the engine level and converted to error codes/messages -- they never
        propagate to the ViewModel or UI.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Error Code Summary</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="py-3 px-4 text-on-surface font-bold">Code</th>
              <th className="py-3 px-4 text-on-surface font-bold">Source</th>
              <th className="py-3 px-4 text-on-surface font-bold">Meaning</th>
              <th className="py-3 px-4 text-on-surface font-bold">Recovery</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">0</td>
              <td className="py-3 px-4">Both engines</td>
              <td className="py-3 px-4">Success</td>
              <td className="py-3 px-4">N/A</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">-1</td>
              <td className="py-3 px-4">ModelEngine</td>
              <td className="py-3 px-4">File/directory not found on disk</td>
              <td className="py-3 px-4">Prompt user to re-select model file</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 px-4 font-mono text-primary">-2</td>
              <td className="py-3 px-4">Both engines</td>
              <td className="py-3 px-4">Engine-level failure (corrupt model, OOM, missing config)</td>
              <td className="py-3 px-4">Check getLastError(), try smaller model</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Exception Propagation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Both engines catch exceptions internally and convert them to error codes:
      </p>
      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li><strong>LlamaCppEngine:</strong> JNI exceptions from native code are caught by the JNI boundary. The native method returns <code className="font-mono text-primary">-2</code> and the error message is retrievable via <code className="font-mono text-primary">getLastError()</code></li>
        <li><strong>OnnxRuntimeEngine:</strong> Kotlin try/catch blocks wrap all ORT API calls. Exceptions are caught, their message stored in <code className="font-mono text-primary">lastError</code>, and <code className="font-mono text-primary">-2</code> is returned</li>
        <li><strong>ModelEngine:</strong> Does not add its own exception handling -- it relies on engines to return clean error codes. The only ModelEngine-originated error is <code className="font-mono text-primary">-1</code> for missing files</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Graceful Degradation</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When generation fails, the system degrades gracefully:
      </p>
      <ul className="list-disc ml-4 space-y-2 text-on-surface-variant mb-6">
        <li>If <code className="font-mono text-primary">generateStreaming()</code> is called with no model loaded, ModelEngine returns the string <code className="font-mono text-primary">"Error: No model loaded"</code> immediately without touching the engine</li>
        <li>If a model fails to load, the engine remains in an unloaded state -- subsequent generation calls will return the "no model loaded" error rather than crashing</li>
        <li>If unload fails (e.g., ORT close throws), the error is captured but the engine still clears its internal references to prevent dangling state</li>
        <li>The UI layer checks for error prefixes in returned strings and displays appropriate user-facing messages</li>
      </ul>

      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> Always check the return value of <code className="font-mono text-primary">loadModel()</code> before
          attempting generation. If it returns a non-zero value, call <code className="font-mono text-primary">getLastError()</code> on
          the engine (via ModelEngine) to retrieve a human-readable explanation of the failure.
        </p>
      </div>
    </div>
  );
}
