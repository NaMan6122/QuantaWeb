import CodeBlock from '../CodeBlock';

export default function APIReference() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">API Reference</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        Complete API reference for QuantaLLM&apos;s Kotlin interfaces, JNI bindings, AIDL service, and data types.
        All APIs are documented with signatures, parameters, return values, and threading behavior.
      </p>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-sm text-on-surface-variant">
          <strong className="text-white">Convention:</strong> All <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine</code> methods
          acquire a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ReentrantLock</code> and
          are safe for concurrent calls from multiple threads or AIDL clients. Return code <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">0</code> indicates
          success; negative values indicate errors.
        </p>
      </div>

      {/* ================================================================== */}
      {/* InferenceEngine Interface */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">InferenceEngine Interface</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The core abstraction that all inference backends implement. This Strategy pattern enables runtime
        switching between llama.cpp and ONNX Runtime without modifying calling code. Both
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaCppEngine</code> and
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">OnnxRuntimeEngine</code> implement
        this interface. All methods are synchronous and expected to be called from a background thread
        (IO dispatcher). The caller (ModelEngine / ModelRepository) handles threading.
      </p>

      <CodeBlock language="kotlin" title="engine/InferenceEngine.kt">{`interface InferenceEngine {

    /** Human-readable engine name for logging / display. */
    val displayName: String

    /**
     * Load a model from the given path.
     * @param modelPath Absolute path to .gguf file or ONNX model directory.
     * @param threads   Number of CPU threads (0 = engine default).
     * @return 0 on success, negative error code on failure.
     */
    fun loadModel(modelPath: String, threads: Int): Int

    /** @return true when a model is loaded and ready for inference. */
    fun isModelLoaded(): Boolean

    /** @return JSON string with model metadata, or error-JSON if no model loaded. */
    fun getModelInfo(): String

    /** @return absolute path of the currently loaded model, or null. */
    fun getCurrentModelPath(): String?

    /**
     * Synchronous text generation.
     * @return Generated text, or error string prefixed with "Error: ".
     */
    fun generate(prompt: String, maxTokens: Int, temperature: Float): String

    /**
     * Streaming text generation with per-token callbacks.
     * @param callback Invoked on every generated token.
     * @return Full generated text on completion.
     */
    fun generateStreaming(
        prompt: String, maxTokens: Int, temperature: Float,
        callback: StreamingCallback
    ): String

    /**
     * Unload the current model and free all resources.
     * @return 0 on success, negative on error.
     */
    fun unloadModel(): Int

    /** Retrieve the last error message from the engine. */
    fun getLastError(): String

    /** Engine-agnostic streaming callback. */
    fun interface StreamingCallback {
        fun onProgress(generatedTokens: Int, partialText: String)
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Method Reference</h3>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Returns</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['loadModel', 'modelPath: String, threads: Int', 'Int (0=ok, <0=err)', 'Load model from filesystem. LlamaCpp: .gguf file. ONNX: directory with model.onnx. threads=0 uses engine default (6 for llama.cpp).'],
              ['isModelLoaded', '—', 'Boolean', 'Check if a model is loaded and ready for inference. Thread-safe.'],
              ['getModelInfo', '—', 'String (JSON)', 'Returns JSON with model metadata: architecture, parameter count, context window, quantization type. Returns error JSON if no model loaded.'],
              ['getCurrentModelPath', '—', 'String?', 'Returns absolute path of the loaded model, or null if no model is loaded.'],
              ['generate', 'prompt, maxTokens, temperature', 'String', 'Synchronous (blocking) text generation. Returns generated text or "Error: ..." string. Blocks until generation completes or is aborted.'],
              ['generateStreaming', 'prompt, maxTokens, temperature, callback', 'String', 'Streaming generation. Calls callback.onProgress() on each token with (tokensSoFar, partialText). Returns full text on completion.'],
              ['unloadModel', '—', 'Int (0=ok)', 'Free model and all associated resources (context, KV cache, etc.). Must be called before loading a new model.'],
              ['getLastError', '—', 'String', 'Returns the last error message from the engine, or empty string if no error.'],
            ].map(([method, params, returns, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{returns}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">StreamingCallback</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        A functional interface (SAM) invoked on every generated token during streaming generation.
        The callback receives the running count of generated tokens and the accumulated partial text.
        Implementations should be lightweight — heavy work (UI updates) should be dispatched to the
        main thread via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Dispatchers.Main</code>.
      </p>

      <CodeBlock language="kotlin" title="Usage Example">{`// Streaming with real-time UI updates
engine.generateStreaming(prompt, maxTokens = 256, temperature = 0.7f) { tokensGenerated, partialText ->
    // Called on IO thread — dispatch to Main for UI
    withContext(Dispatchers.Main) {
        textView.text = partialText
        speedLabel.text = "\${tokensGenerated} tokens"
    }
}`}</CodeBlock>

      {/* ================================================================== */}
      {/* ModelEngine Singleton */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">ModelEngine Singleton</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Thread-safe singleton that manages the active <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code>.
        All methods acquire a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ReentrantLock</code>,
        making it safe for concurrent access from the ViewModel, AIDL service, and multiple clients.
        Defaults to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaCppEngine</code> with
        CPU backend on initialization.
      </p>

      <CodeBlock language="kotlin" title="service/ModelEngine.kt (signature)">{`object ModelEngine {
    private val lock = ReentrantLock()
    private var engine: InferenceEngine = LlamaCppEngine()
    private var activeBackend: InferenceBackend = InferenceBackend.CPU
    private var currentThreadCount: Int = 0
    private val activeInferences = mutableSetOf<Int>()
    private var nextRequestId = 1
    // ...
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Engine Management</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Signature</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['switchEngine', 'switchEngine(backend: InferenceBackend): Boolean', 'Switch to a new inference backend. Unloads current model if loaded. Instantiates new engine based on backend enum value. Returns true on success.'],
              ['getActiveBackend', 'getActiveBackend(): InferenceBackend', 'Returns the currently active InferenceBackend enum value.'],
              ['getEngine', 'getEngine(): InferenceEngine', 'Returns the active InferenceEngine instance. For advanced callers that need direct engine access.'],
            ].map(([method, sig, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{sig}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Lifecycle</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Signature</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['loadModel', 'loadModel(modelPath: String, threads: Int = 0): Int', 'Load a model file/directory via the active engine. Validates file existence first. Returns 0 on success, -1 if file not found, -2 on load failure.'],
              ['isModelLoaded', 'isModelLoaded(): Boolean', 'Delegates to active engine\'s isModelLoaded(). Thread-safe.'],
              ['getModelInfo', 'getModelInfo(): String', 'Returns JSON model metadata from active engine. Returns error JSON if no model loaded.'],
              ['getCurrentModelPath', 'getCurrentModelPath(): String?', 'Returns the path of the currently loaded model, or null.'],
              ['unloadModel', 'unloadModel(): Int', 'Unload model via active engine. Clears active inferences tracking. Returns 0 on success.'],
            ].map(([method, sig, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{sig}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generation</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Signature</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['generate', 'generate(prompt: String, maxTokens: Int, temperature: Float): String', 'Synchronous (blocking) text generation via active engine. Returns generated text or "Error: No model loaded".'],
              ['generateStreaming', 'generateStreaming(prompt, maxTokens, temp, callback): String', 'Streaming generation with per-token callbacks. Assigns request ID, tracks in activeInferences set. Returns full text on completion.'],
              ['abortGeneration', 'abortGeneration()', 'Sets atomic abort flag in native code. The generation loop checks this flag on each token and stops gracefully. Safe to call from any thread.'],
            ].map(([method, sig, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{sig}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Backend Configuration</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Signature</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['setBackendMode', 'setBackendMode(mode: Int): Boolean', 'Set the native backend mode. mode=1 for CPU, mode=2 for Hexagon. Delegates to LlamaJni.nativeSetBackendMode(). Model must be reloaded after changing backend.'],
              ['setHexagonConfig', 'setHexagonConfig(ndev: Int, nhvx: Int, verbose: Boolean, profile: Boolean): Boolean', 'Configure Hexagon DSP tuning parameters. NDEV: number of DSP devices (1-2). NHVX: HVX contexts (0=auto). Delegates to LlamaJni.nativeSetHexagonConfig().'],
              ['getLastError', 'getLastError(): String', 'Returns the last error message from the active engine.'],
            ].map(([method, sig, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{sig}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-sm text-on-surface-variant">
          <strong className="text-white">Important:</strong> After calling <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">setBackendMode()</code> or <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">setHexagonConfig()</code>,
          you must unload and reload the model for changes to take effect. The backend configuration is applied during model initialization
          in the native layer.
        </p>
      </div>

      {/* ================================================================== */}
      {/* LlamaJni Native Bindings */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">LlamaJni Native Bindings</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Direct JNI bindings to the native C++ layer (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni.cpp</code>).
        These are low-level methods — prefer using <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine</code> or
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code> for application code.
        The native library is loaded via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">System.loadLibrary(&quot;llama_jni&quot;)</code> in
        the companion object&apos;s <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">init</code> block.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Lifecycle</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Returns</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nativeInit', 'modelPath: String, nThreads: Int', 'Int', 'Initialize llama_backend, configure Hexagon env if needed, load model via llama_model_load_from_file(), create context with llama_new_context_with_model(). Returns 0 on success.'],
              ['nativeShutdown', '—', 'Int', 'Free llama_context, free llama_model, call llama_backend_free(). Resets all global state. Returns 0.'],
              ['nativeGetModelInfo', '—', 'String', 'Returns JSON: {"model":"path","arch":"llama","params":"7B","context":4096,"quant":"Q4_K_M"}. Empty string if no model.'],
              ['nativeGetLastError', '—', 'String', 'Returns g_last_error string. Cleared on next successful operation.'],
            ].map(([method, params, returns, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{returns}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Text Generation</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Returns</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nativeGenerate', 'prompt: String, maxTokens: Int, temperature: Float', 'String', 'Synchronous generation. Tokenizes prompt, creates llama_batch, runs decode loop, samples tokens via llama_sampler. Checks g_abort_generation on each iteration.'],
              ['nativeGenerateStreaming', 'prompt: String, maxTokens: Int, temperature: Float, callback: StreamingCallback', 'String', 'Streaming generation. Same as nativeGenerate but calls callback.onProgress(tokensGenerated, partialText) after each token via JNI CallVoidMethod.'],
              ['nativeGenerateAdvanced', 'prompt, maxTokens, temperature, topK, topP, minP, repeatPenalty, penaltyLastN, frequencyPenalty, presencePenalty, seed', 'String', 'Full-parameter generation. Configures llama_sampler chain with all sampling parameters. seed=0 uses random seed.'],
              ['nativeAbortGeneration', '—', 'void', 'Sets g_abort_generation atomic flag to true. Thread-safe (memory_order_relaxed). Generation loop checks this flag each iteration.'],
            ].map(([method, params, returns, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{returns}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Backend Control</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Returns</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nativeSetBackendMode', 'mode: Int', 'Boolean', 'Set backend: 1=CPU, 2=Hexagon. Sets g_backend_mode enum. Must be called before nativeInit(). Returns true.'],
              ['nativeSetHexagonConfig', 'ndev: Int, nhvx: Int, verbose: Boolean, profile: Boolean', 'Boolean', 'Set Hexagon tuning globals (g_hexagon_ndev, g_hexagon_nhvx, etc.). Applied on next nativeInit() via configure_hexagon_runtime_env().'],
              ['nativeSetContextSize', 'contextSize: Int', 'Boolean', 'Override context window for next model load. 0=auto-detect from model metadata (capped at 4096). Returns true.'],
              ['nativeGetContextSize', '—', 'Int', 'Returns the active context window size set during the last nativeInit().'],
            ].map(([method, params, returns, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{returns}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Chat Session Management</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Chat sessions maintain KV cache state across multiple turns, enabling efficient multi-turn
        conversations without re-processing the entire conversation history. Each session is identified
        by a native sequence ID (seq_id) mapped to a UUID from Kotlin.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Returns</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nativeCreateChatSession', 'systemPrompt: String?, sessionIdUuid: String', 'Int', 'Create new chat session with optional system prompt. Returns native seq_id (>0) on success, -1 on error. System prompt is tokenized and fed into KV cache.'],
              ['nativeSetActiveChatSession', 'sessionId: Int', 'Boolean', 'Switch the active session for subsequent chat generation calls. The KV cache for this session is restored. Returns true if session exists.'],
              ['nativeDeleteChatSession', 'sessionId: Int', 'void', 'Delete session and free its KV cache memory. Clears the session\'s sequence from the llama_context.'],
              ['nativeChatGenerate', 'message: String, maxTokens: Int, temperature: Float', 'String', 'Generate response in active chat session. Returns JSON: {"response":"...","turn_id":1,"tokens_used":123,"n_past":456}. KV cache is updated in-place.'],
              ['nativeChatGenerateStreaming', 'message: String, maxTokens: Int, temperature: Float, callback: StreamingCallback', 'String', 'Streaming chat generation. Same as nativeChatGenerate but calls callback.onProgress() per token. Returns same JSON format.'],
              ['nativeGetChatSessionInfo', 'sessionId: Int', 'String', 'Returns JSON: {"session_id":N,"turns":5,"tokens_used":1234,"n_past":2048}. Useful for monitoring context window usage.'],
              ['nativeListChatSessions', '—', 'String', 'Returns JSON array of all active session metadata. Each entry includes session_id, uuid, turns, tokens_used.'],
            ].map(([method, params, returns, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{returns}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* GenerationConfig */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">GenerationConfig</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Data class encapsulating all sampling parameters for advanced text generation.
        Used by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaJni.generateAdvanced()</code> to
        pass the full parameter set to the native layer&apos;s llama_sampler chain.
      </p>

      <CodeBlock language="kotlin" title="LlamaJni.kt">{`data class GenerationConfig(
    val maxTokens: Int = 64,           // Max tokens to generate
    val temperature: Float = 0.8f,     // Softmax temperature
    val topK: Int = 50,                // Top-K sampling
    val topP: Float = 0.9f,            // Nucleus sampling
    val minP: Float = 0.0f,            // Minimum probability filter
    val repeatPenalty: Float = 1.1f,   // Repeat penalty
    val penaltyLastN: Int = 64,        // Penalty window size
    val frequencyPenalty: Float = 0.0f, // Frequency-based penalty
    val presencePenalty: Float = 0.0f, // Presence-based penalty
    val seed: Int = 0                  // RNG seed (0 = random)
)`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Parameter Reference</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameter</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Valid Range</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['maxTokens', 'Int', '64', '1 – 10000', 'Maximum number of tokens to generate. 0 or very large values are capped at 10,000 by DefaultModeOrchestrator when useUnlimitedTokens is enabled.'],
              ['temperature', 'Float', '0.8', '0.0 – 2.0', 'Controls randomness by scaling logits before softmax. T=0.0: greedy (deterministic). T=0.7-0.8: balanced. T=1.0: natural probability. T>1.0: increasingly creative/random.'],
              ['topK', 'Int', '50', '1 – 100', 'Keep only the top K highest-probability tokens, discard all others. Lower values produce more focused, deterministic output. K=1 is equivalent to greedy decoding.'],
              ['topP', 'Float', '0.9', '0.0 – 1.0', 'Nucleus sampling: keep the smallest set of tokens whose cumulative probability exceeds P. P=0.9 keeps tokens covering 90% of probability mass. Applied after top-K.'],
              ['minP', 'Float', '0.0', '0.0 – 1.0', 'Minimum probability filter: discard tokens whose probability is below minP × max_token_probability. Dynamically adjusts based on the most likely token. minP=0.05 is a common starting point.'],
              ['repeatPenalty', 'Float', '1.1', '0.0 – 2.0', 'Multiplicative penalty for repeated tokens. Logits of previously generated tokens are divided by this value. >1.0 reduces repetition. 1.0 disables. Typical range: 1.05-1.3.'],
              ['penaltyLastN', 'Int', '64', '0 – 2048', 'Number of recent tokens to consider for repeat/frequency/presence penalties. 0 disables penalties. 64 is a good default. Larger values penalize over a wider window.'],
              ['frequencyPenalty', 'Float', '0.0', '0.0 – 2.0', 'Subtractive penalty proportional to token frequency in the generated text. penalty_value = frequency × frequencyPenalty is subtracted from logits. Reduces common word repetition.'],
              ['presencePenalty', 'Float', '0.0', '0.0 – 2.0', 'Flat subtractive penalty for any previously seen token (regardless of frequency). Encourages topic diversity. Subtracted from logits of any token that has appeared at least once.'],
              ['seed', 'Int', '0', '0 – INT_MAX', 'Random number generator seed. 0 = non-deterministic (random seed each run). Any other value produces deterministic output for identical prompts and parameters.'],
            ].map(([param, type, def, range, desc]) => (
              <tr key={param} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{param}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{range}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* Sampling Parameters Deep Explanation */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Sampling Parameters — Deep Explanation</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Understanding sampling parameters is critical for getting high-quality output from language models.
        Each parameter controls a different stage of the token selection pipeline in the llama_sampler chain.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Temperature</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Temperature controls the &quot;sharpness&quot; of the probability distribution by scaling the raw logits
        before applying softmax. The formula is: <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">P(token) = softmax(logits / temperature)</code>.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong className="text-white">T = 0.0:</strong> Greedy decoding — always picks the highest-probability token. Deterministic but can be repetitive.</li>
        <li><strong className="text-white">T = 0.3–0.5:</strong> Low creativity — focused, factual responses. Good for code generation and factual Q&amp;A.</li>
        <li><strong className="text-white">T = 0.7–0.8:</strong> Balanced — the recommended default. Good mix of coherence and variety.</li>
        <li><strong className="text-white">T = 1.0:</strong> Natural probability — tokens sampled according to the model&apos;s learned distribution.</li>
        <li><strong className="text-white">T &gt; 1.0:</strong> High creativity — flattens the distribution, making unlikely tokens more probable. Can produce surprising but less coherent output.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Top-K Sampling</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Top-K truncates the probability distribution to keep only the K most likely tokens,
        setting all other probabilities to zero. This prevents the model from sampling extremely
        unlikely tokens that could derail coherence. After truncation, the remaining probabilities
        are renormalized to sum to 1.0.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong className="text-white">K = 1</strong> is equivalent to greedy decoding. <strong className="text-white">K = 50</strong> (default)
        is a common choice that keeps enough variety while filtering noise. Higher values (K = 100) allow
        more diversity but risk less coherent output.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Top-P (Nucleus) Sampling</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Top-P (nucleus sampling) dynamically selects the smallest set of tokens whose cumulative
        probability exceeds the threshold P. Unlike Top-K, which always keeps a fixed number of tokens,
        Top-P adapts: when the model is confident (one token has 90%+ probability), it effectively
        becomes greedy; when uncertain, it keeps many tokens.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Applied <em>after</em> Top-K filtering. <strong className="text-white">P = 0.9</strong> (default) keeps tokens
        covering 90% of the probability mass. <strong className="text-white">P = 1.0</strong> disables Top-P filtering.
        <strong className="text-white">P = 0.5</strong> is very focused, only keeping the top-probability tokens.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Min-P Filtering</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Min-P is a newer sampling technique that filters tokens whose probability falls below
        a threshold relative to the most likely token: <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">threshold = minP × P(most_likely_token)</code>.
        This adapts naturally to the model&apos;s confidence — when the model is very confident in one
        token, Min-P aggressively filters; when uncertain, more tokens pass through.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong className="text-white">minP = 0.0</strong> (default) disables Min-P.
        <strong className="text-white">minP = 0.05–0.1</strong> is commonly used as a replacement or
        complement to Top-K/Top-P, often producing better results with fewer parameters to tune.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Repetition Penalties</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Three complementary mechanisms prevent the model from repeating itself, all operating over
        a sliding window of the most recent <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">penaltyLastN</code> tokens:
      </p>
      <ul className="list-disc list-inside space-y-3 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong className="text-white">Repeat Penalty (multiplicative):</strong> For each token in the penalty window,
          its logit is divided by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">repeatPenalty</code>.
          Values above 1.0 reduce probability of repeated tokens. 1.1 is a gentle penalty; 1.3+ is aggressive.
        </li>
        <li>
          <strong className="text-white">Frequency Penalty (subtractive, proportional):</strong> Subtracts
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">count(token) × frequencyPenalty</code> from
          each token&apos;s logit. Tokens that appear more frequently receive stronger penalties. Good for
          reducing repetitive filler words.
        </li>
        <li>
          <strong className="text-white">Presence Penalty (subtractive, flat):</strong> Subtracts a flat
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">presencePenalty</code> from the
          logit of any token that has appeared at least once in the window, regardless of frequency.
          Encourages the model to explore new topics rather than re-visiting old ones.
        </li>
      </ul>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-sm text-on-surface-variant">
          <strong className="text-white">Tip:</strong> For most use cases, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">repeatPenalty = 1.1</code> with
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">penaltyLastN = 64</code> is sufficient. Only add
          frequency/presence penalties if you observe specific repetition patterns that repeat penalty alone
          doesn&apos;t address.
        </p>
      </div>

      {/* ================================================================== */}
      {/* InferenceBackend Enum */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">InferenceBackend Enum</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Enumeration of all supported inference backends. Each value maps to a native mode integer
        used by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.setBackendMode()</code> and
        determines which <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code> implementation
        is instantiated by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.switchEngine()</code>.
      </p>

      <CodeBlock language="kotlin" title="model/InferenceBackend.kt">{`enum class InferenceBackend(val nativeMode: Int, val displayName: String) {
    CPU(1, "CPU (ARM64)"),           // LlamaCppEngine — default
    HEXAGON(2, "Hexagon HTP"),       // LlamaCppEngine + Hexagon backend
    ONNX_CPU(3, "ONNX Runtime (CPU)"), // OnnxRuntimeEngine (CPU EP)
    ONNX_QNN(4, "ONNX Runtime (QNN)") // OnnxRuntimeEngine (QNN EP) — Phase 2
}`}</CodeBlock>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Value</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Native Mode</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Engine Class</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Model Format</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Requirements</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['CPU', '1', 'LlamaCppEngine', 'GGUF', 'Available', 'Any ARM64 device'],
              ['HEXAGON', '2', 'LlamaCppEngine', 'GGUF', 'Available', 'Snapdragon 8 Gen 1+ (SM8450+)'],
              ['ONNX_CPU', '3', 'OnnxRuntimeEngine', 'ONNX', 'Available', 'Any ARM64 device'],
              ['ONNX_QNN', '4', 'OnnxRuntimeEngine', 'ONNX', 'Phase 2', 'Qualcomm QNN SDK'],
            ].map(([val, mode, engine, format, status, reqs]) => (
              <tr key={val} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{val}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{mode}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{engine}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{format}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{status}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{reqs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* AIDL Service API */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">AIDL Service API</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The AIDL interface exposed by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaInferenceService</code> for
        cross-app integration. All methods are callable via IPC from any Android application.
        See the <a href="/docs/aidl-service" className="text-primary hover:underline">AIDL Service guide</a> for
        integration instructions.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ILlamaInference Methods</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Returns</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Thread</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['loadModel', 'modelPath: String, threads: int', 'int', 'Binder', 'Load model. Returns 0 on success, negative on error.'],
              ['isModelLoaded', '—', 'boolean', 'Binder', 'Check if model is ready.'],
              ['getModelInfo', '—', 'String', 'Binder', 'JSON model metadata.'],
              ['generate', 'prompt, maxTokens, temperature', 'String', 'Binder (blocks)', 'Synchronous generation. Blocks the binder thread until complete.'],
              ['generateAsync', 'prompt, maxTokens, temperature, callback', 'int', 'Binder → IO', 'Async generation. Returns request ID. Launches coroutine on IO dispatcher. Delivers results via callback.'],
              ['cancelInference', 'requestId: int', 'void', 'Binder', 'Cancel in-flight generation by request ID. Calls abortGeneration() + delivers onCancelled callback.'],
              ['unloadModel', '—', 'int', 'Binder', 'Free model resources. Returns 0.'],
              ['getVersion', '—', 'String', 'Binder', 'Returns version string (e.g. "1.3.0").'],
              ['ping', '—', 'boolean', 'Binder', 'Health check. Returns true if service is operational.'],
            ].map(([method, params, returns, thread, desc]) => (
              <tr key={method} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{method}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{returns}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{thread}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">IInferenceCallback Methods</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Callback</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Parameters</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">When Called</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['onStart', 'requestId: int', 'Immediately after async generation begins', 'Called once per request. Use to show loading UI.'],
              ['onProgress', 'requestId, tokensGenerated, totalTokens, partialText', 'After each token is generated', 'Called on IO thread — marshal to Main for UI updates. partialText accumulates all generated text.'],
              ['onComplete', 'requestId: int, result: String, timeMs: long', 'When generation finishes successfully', 'result contains full generated text. timeMs is wall-clock elapsed time.'],
              ['onError', 'requestId: int, errorMessage: String', 'On generation failure', 'Delivered via RemoteException-safe wrapper. Check for DeadObjectException on service side.'],
              ['onCancelled', 'requestId: int', 'When cancelInference() is called', 'Delivered after abort flag is set and generation loop exits.'],
            ].map(([cb, params, when, notes]) => (
              <tr key={cb} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary whitespace-nowrap">{cb}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{params}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{when}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* LlamaUiState */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">LlamaUiState</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The single data class that holds all UI state, exposed as a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">MutableStateFlow&lt;LlamaUiState&gt;</code> from
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaViewModel</code>. Compose UI collects this flow and recomposes on changes.
        All mutations use <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">copy()</code> for immutable updates.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Lifecycle Flags</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['isScanning', 'Boolean', 'false', 'True while ModelRepository is scanning filesystem for models.'],
              ['isLoading', 'Boolean', 'false', 'True while a model is being loaded into memory.'],
              ['isModelLoaded', 'Boolean', 'false', 'True when a model is loaded and ready for inference.'],
              ['isGenerating', 'Boolean', 'false', 'True during active text generation (default or chat mode).'],
              ['statusMessage', 'String', '""', 'Human-readable status/error message shown in UI snackbar.'],
            ].map(([field, type, def, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model State</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['availableModels', 'List<ModelInfo>', '[]', 'GGUF models found during filesystem scan.'],
              ['selectedModel', 'ModelInfo?', 'null', 'Currently selected model (may or may not be loaded).'],
              ['modelInfo', 'String', '""', 'JSON metadata string from the loaded model.'],
              ['availableOnnxModels', 'List<ModelInfo>', '[]', 'ONNX model directories found during scan.'],
              ['isOnnxAvailable', 'Boolean', 'false', 'True if ONNX Runtime libraries are available on device.'],
            ].map(([field, type, def, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generation Parameters</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['currentPrompt', 'String', '""', 'The prompt text entered by the user.'],
              ['generatedText', 'String', '""', 'Accumulated generated output text.'],
              ['maxTokens', 'Int', '1024', 'Maximum tokens to generate.'],
              ['temperature', 'Float', '0.7f', 'Sampling temperature.'],
              ['useUnlimitedTokens', 'Boolean', 'false', 'When true, generates until EOG token (capped at 10,000).'],
            ].map(([field, type, def, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Hardware Configuration</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['selectedThreadCount', 'Int', '6', 'Number of CPU threads for inference. Clamped 1-12 by LlamaCppEngine.'],
              ['selectedBackend', 'InferenceBackend', 'CPU', 'Active inference backend.'],
              ['isHexagonSupported', 'Boolean', 'false', 'True if device has a supported Snapdragon SoC.'],
              ['backendSupportMessage', 'String', '""', 'Reason from DeviceInfoUtil for Hexagon support status.'],
              ['hexagonNdev', 'Int', '1', 'Number of DSP devices. 1=default, 2=aggressive.'],
              ['hexagonNhvx', 'Int', '0', 'HVX contexts. 0=auto-detect.'],
              ['hexagonVerbose', 'Boolean', 'false', 'Enable Hexagon runtime debug logging.'],
              ['hexagonProfile', 'Boolean', 'false', 'Enable HTP performance profiling.'],
            ].map(([field, type, def, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Token Metrics</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['currentTokenCount', 'Int', '0', 'Tokens generated so far in current generation.'],
              ['targetTokenCount', 'Int', '0', 'Target max tokens for current generation.'],
              ['tokensPerSecond', 'Float', '0f', 'Real-time tokens/second metric, updated each token during streaming.'],
              ['finalTokenCount', 'Int', '0', 'Final token count from last completed generation.'],
            ].map(([field, type, def, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Chat Mode State</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Default</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['isDefaultMode', 'Boolean', 'true', 'True = default single-prompt mode. False = chat mode.'],
              ['currentChatSession', 'Session?', 'null', 'The active chat session object with message history.'],
              ['availableChatSessions', 'List<SessionMetadata>', '[]', 'All saved chat sessions for session picker.'],
              ['chatStreamingText', 'String', '""', 'Partial streaming text during chat generation.'],
            ].map(([field, type, def, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{def}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* Error Codes */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Error Codes</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Integer return codes used throughout the native layer and propagated through ModelEngine.
        All error codes are negative; success is always 0.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Code</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Meaning</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Common Cause</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Recovery</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['0', 'Success', 'Operation completed normally.', 'N/A'],
              ['-1', 'File not found', 'Model path does not exist or is not accessible. Storage permissions may be missing.', 'Verify file path. Check MANAGE_EXTERNAL_STORAGE permission. Re-scan for models.'],
              ['-2', 'Load / operation failure', 'Model file is corrupted, unsupported architecture, or insufficient RAM. Also returned on unload failure.', 'Try a smaller quantization. Check available RAM. Try a different model file.'],
              ['-3', 'Backend init failure', 'Hexagon backend failed to initialize. FastRPC libraries not found or SoC not supported.', 'Fall back to CPU backend. Check Hexagon support with DeviceInfoUtil.getHexagonSupportInfo().'],
            ].map(([code, meaning, cause, recovery]) => (
              <tr key={code} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{code}</td>
                <td className="py-3 px-4 text-sm text-white font-medium">{meaning}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{cause}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{recovery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================== */}
      {/* JSON Response Formats */}
      {/* ================================================================== */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">JSON Response Formats</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Several native methods return JSON strings. Here are the expected formats:
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">getModelInfo() Response</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returned by both <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine.getModelInfo()</code> and
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ILlamaInference.getModelInfo()</code>.
      </p>
      <CodeBlock language="json" title="Model Info Response">{`{
  "model": "/storage/emulated/0/Download/phi-3-mini-4k-q4_k_m.gguf",
  "arch": "phi3",
  "params": "3.8B",
  "context": 4096,
  "quant": "Q4_K_M",
  "vocab_size": 32064,
  "embedding_length": 3072,
  "n_layers": 32,
  "n_heads": 32
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">nativeChatGenerate() Response</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returned by chat generation methods. Contains the response text plus session metadata
        for tracking context window usage and conversation turns.
      </p>
      <CodeBlock language="json" title="Chat Generate Response">{`{
  "response": "Quantum computing uses qubits that can exist in superposition...",
  "turn_id": 3,
  "tokens_used": 847,
  "n_past": 1523
}`}</CodeBlock>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Field</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['response', 'String', 'The generated response text for this turn.'],
              ['turn_id', 'Int', 'Sequential turn number in this chat session (1-based).'],
              ['tokens_used', 'Int', 'Number of tokens generated for this response.'],
              ['n_past', 'Int', 'Total KV cache position after this turn. Monitor this vs context window to detect approaching limits.'],
            ].map(([field, type, desc]) => (
              <tr key={field} className="border-b border-outline-variant/10">
                <td className="py-3 px-4 text-sm font-mono text-primary">{field}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{type}</td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">nativeGetChatSessionInfo() Response</h3>
      <CodeBlock language="json" title="Session Info Response">{`{
  "session_id": 1,
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "system_prompt": "You are a helpful assistant.",
  "turns": 5,
  "tokens_used": 2341,
  "n_past": 3072,
  "context_size": 4096,
  "context_usage_percent": 75.0
}`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-sm text-on-surface-variant">
          <strong className="text-white">Context Window Monitoring:</strong> When <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">n_past</code> approaches
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">context_size</code> (typically 80%+),
          the model may start losing context from earlier turns. The ChatModeService provides
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isNearContextLimit()</code> to
          check this threshold and prompt the user to start a new session.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">nativeListChatSessions() Response</h3>
      <CodeBlock language="json" title="Session List Response">{`[
  {
    "session_id": 1,
    "uuid": "a1b2c3d4-...",
    "turns": 5,
    "tokens_used": 2341,
    "n_past": 3072,
    "is_active": true
  },
  {
    "session_id": 2,
    "uuid": "b2c3d4e5-...",
    "turns": 2,
    "tokens_used": 456,
    "n_past": 789,
    "is_active": false
  }
]`}</CodeBlock>
    </div>
  );
}
