import CodeBlock from '../CodeBlock';

export default function Architecture() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Architecture Overview</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        QuantaLLM follows a clean MVVM + Repository architecture with a Strategy pattern for swappable
        inference backends. Every layer is purpose-built for on-device LLM inference on Android, with
        particular attention to thread safety, memory management, and hardware-aware execution.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. HIGH-LEVEL ARCHITECTURE DIAGRAM                                  */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">High-Level Architecture</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The system is organized into six horizontal layers. Each layer communicates strictly
        downward; upward notifications flow through reactive <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">StateFlow</code> streams.
      </p>

      <div className="mb-12 space-y-0">
        {/* UI Layer */}
        <div className="bg-primary/20 border border-primary/40 rounded-t-xl px-6 py-4 text-center">
          <p className="font-bold text-on-surface text-lg">UI Layer</p>
          <p className="text-on-surface-variant text-sm">Jetpack Compose &middot; Material 3 &middot; Reactive recomposition via collectAsState()</p>
        </div>
        <div className="flex justify-center text-on-surface-variant text-xl py-1">↓ StateFlow.collectAsState()</div>

        {/* ViewModel Layer */}
        <div className="bg-secondary/20 border border-secondary/40 px-6 py-4 text-center">
          <p className="font-bold text-on-surface text-lg">ViewModel Layer</p>
          <p className="text-on-surface-variant text-sm">LlamaViewModel &mdash; thin coordinator, delegates to 4 managers</p>
        </div>
        <div className="flex justify-center text-on-surface-variant text-xl py-1">↓ Direct delegation</div>

        {/* Manager Layer */}
        <div className="bg-tertiary/20 border border-tertiary/40 px-6 py-4">
          <p className="font-bold text-on-surface text-lg text-center mb-3">Manager Layer</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-container border border-outline/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm font-semibold text-on-surface">ModelLifecycleManager</p>
              <p className="text-xs text-on-surface-variant">scan / load / unload</p>
            </div>
            <div className="bg-surface-container border border-outline/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm font-semibold text-on-surface">HexagonConfigManager</p>
              <p className="text-xs text-on-surface-variant">HW detect &middot; NPU config</p>
            </div>
            <div className="bg-surface-container border border-outline/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm font-semibold text-on-surface">DefaultModeOrchestrator</p>
              <p className="text-xs text-on-surface-variant">single-prompt streaming</p>
            </div>
            <div className="bg-surface-container border border-outline/30 rounded-lg px-3 py-2 text-center">
              <p className="text-sm font-semibold text-on-surface">ChatModeService</p>
              <p className="text-xs text-on-surface-variant">multi-turn &middot; KV cache</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center text-on-surface-variant text-xl py-1">↓ ModelEngine calls</div>

        {/* Engine Layer */}
        <div className="bg-primary/10 border border-primary/30 px-6 py-4 text-center">
          <p className="font-bold text-on-surface text-lg mb-3">Engine Layer</p>
          <p className="text-on-surface-variant text-sm mb-3">ModelEngine (Singleton + ReentrantLock) &rarr; InferenceEngine (Strategy)</p>
          <div className="flex justify-center gap-4">
            <div className="bg-surface-container border border-outline/30 rounded-lg px-4 py-2">
              <p className="text-sm font-semibold text-on-surface">LlamaCppEngine</p>
              <p className="text-xs text-on-surface-variant">JNI &rarr; libllama.so</p>
            </div>
            <div className="bg-surface-container border border-outline/30 rounded-lg px-4 py-2">
              <p className="text-sm font-semibold text-on-surface">OnnxRuntimeEngine</p>
              <p className="text-xs text-on-surface-variant">ORT GenAI runtime</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center text-on-surface-variant text-xl py-1">↓ JNI / NDK</div>

        {/* Repository Layer */}
        <div className="bg-tertiary/10 border border-tertiary/30 px-6 py-4 text-center">
          <p className="font-bold text-on-surface text-lg">Repository Layer</p>
          <p className="text-on-surface-variant text-sm">ModelRepository &mdash; filesystem scanning, validation, dual-mode loading</p>
        </div>
        <div className="flex justify-center text-on-surface-variant text-xl py-1">↓ NDK / System.loadLibrary</div>

        {/* Native Layer */}
        <div className="bg-secondary/10 border border-secondary/30 rounded-b-xl px-6 py-4 text-center">
          <p className="font-bold text-on-surface text-lg">Native Layer</p>
          <p className="text-on-surface-variant text-sm">llama_jni.cpp (2105 LOC) &rarr; llama.cpp / GGML / Hexagon DSP</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. COMPONENT TABLE                                                  */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Component Reference</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The table below lists every major component, its source file, approximate line count, and
        primary responsibility within the architecture.
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Component</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">File Path</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Lines</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Responsibility</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">MainActivity</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">MainActivity.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~120</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Entry point, runtime permissions, Compose host setup</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">LlamaViewModel</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaViewModel.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~250</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Thin coordinator delegating to 4 managers; exposes StateFlow</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">LlamaUiState</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaUiState.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~80</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Immutable data class holding ALL UI state fields</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">ModelEngine</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~180</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Singleton managing active InferenceEngine; thread-safe via ReentrantLock</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">ModelLifecycleManager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelLifecycleManager.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~200</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Model scan, load, unload orchestration with memory pre-checks</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">HexagonConfigManager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">HexagonConfigManager.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~150</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Hardware detection, Hexagon DSP gating, NPU parameter tuning</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">DefaultModeOrchestrator</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DefaultModeOrchestrator.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~160</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Single-prompt generation with streaming callbacks and token metrics</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">ChatModeService</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ChatModeService.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~300</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Multi-turn chat with native session mapping and KV cache continuity</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">ModelRepository</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelRepository.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~220</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Filesystem scanning for GGUF/ONNX models, dual-mode loading</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">DeviceInfoUtil</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeviceInfoUtil.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~180</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">CPU core count, chipset identification, Hexagon support gating</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">LlamaJni</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaJni.kt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">~90</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">JNI binding declarations (20+ external native methods)</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">llama_jni.cpp</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni.cpp</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2105</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">C++ JNI bridge to llama.cpp / GGML with atomic flags and session mgmt</td></tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. LAYER-BY-LAYER DEEP DIVE                                         */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Layer-by-Layer Deep Dive</h2>

      {/* --- UI Layer --- */}
      <h3 className="text-xl font-bold font-headline mt-10 mb-4">UI Layer: Jetpack Compose + Material 3</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The UI is built entirely with Jetpack Compose using Material 3 design tokens. There are no
        XML layouts. The composable tree subscribes to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaViewModel.uiState</code> via{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">collectAsState()</code>, which triggers
        automatic recomposition whenever any field in the immutable <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaUiState</code> data
        class changes.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Key UI responsibilities include rendering the model selector, prompt input area, generation
        output with real-time token-per-second metrics, the chat conversation view, and the hardware
        configuration panel. All user interactions (button taps, slider changes, text input) funnel
        through ViewModel methods that update state immutably via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">_uiState.update {'{}'}</code>.
      </p>
      <CodeBlock language="kotlin">{`// Composable subscribes to ViewModel state reactively
@Composable
fun LlamaScreen(viewModel: LlamaViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    // Recomposes automatically when any field changes
    if (uiState.isGenerating) {
        StreamingOutputView(
            text = uiState.generatedText,
            tokensPerSecond = uiState.tokensPerSecond,
            currentTokenCount = uiState.currentTokenCount
        )
    }
}`}</CodeBlock>

      {/* --- ViewModel Layer --- */}
      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ViewModel Layer: LlamaViewModel as Thin Coordinator</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaViewModel</code> is intentionally thin. It owns the single source of truth &mdash;
        a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">MutableStateFlow&lt;LlamaUiState&gt;</code> &mdash; and
        delegates all business logic to four specialized managers. This Delegation Pattern keeps the
        ViewModel under 250 lines while still serving as the central coordination point.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Delegation Map</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">ViewModel Method</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Delegates To</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">scanModels()</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ModelLifecycleManager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Triggers filesystem scan for GGUF/ONNX models</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">loadModel()</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ModelLifecycleManager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Loads selected model into memory with backend config</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">unloadModel()</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ModelLifecycleManager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Frees native resources and resets engine state</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">detectHardware()</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">HexagonConfigManager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Reads chipset, determines Hexagon/NPU eligibility</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">generate()</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">DefaultModeOrchestrator</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Runs single-prompt generation with streaming</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">sendChatMessage()</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ChatModeService</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Sends a turn in the active chat session</td></tr>
          </tbody>
        </table>
      </div>

      <CodeBlock language="kotlin">{`class LlamaViewModel(application: Application) : AndroidViewModel(application) {
    private val _uiState = MutableStateFlow(LlamaUiState())
    val uiState: StateFlow<LlamaUiState> = _uiState.asStateFlow()

    // Managers receive the shared MutableStateFlow + viewModelScope
    private val lifecycleManager = ModelLifecycleManager(_uiState, viewModelScope)
    private val hexagonConfig   = HexagonConfigManager(_uiState)
    private val defaultMode     = DefaultModeOrchestrator(_uiState, viewModelScope)
    private val chatService     = ChatModeService(_uiState, viewModelScope)

    fun scanModels()  = lifecycleManager.scan()
    fun loadModel()   = lifecycleManager.load()
    fun unloadModel() = lifecycleManager.unload()
    fun generate()    = defaultMode.generate()
    // ... all methods are one-line delegations
}`}</CodeBlock>

      {/* --- Manager Layer --- */}
      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Manager Layer</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each manager encapsulates a single domain of responsibility. They all receive a reference to
        the shared <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">MutableStateFlow&lt;LlamaUiState&gt;</code> and
        a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">CoroutineScope</code> (typically <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">viewModelScope</code>)
        for launching async work.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">ModelLifecycleManager</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Handles the full lifecycle of a model: scanning the filesystem via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelRepository</code>,
        loading the selected model into the active <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code>, and
        cleanly unloading it when switching models or shutting down. Before loading, it calls{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.checkMemoryForModel()</code> to
        verify sufficient RAM is available, preventing OOM crashes on memory-constrained devices.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>scan()</strong> &mdash; Sets <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isScanning = true</code>, invokes ModelRepository, populates <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">availableModels</code></li>
        <li><strong>load()</strong> &mdash; Sets <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isLoading = true</code>, switches engine backend, loads model file, sets <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isModelLoaded = true</code></li>
        <li><strong>unload()</strong> &mdash; Frees native resources, resets <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isModelLoaded</code>, clears generation state</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">HexagonConfigManager</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Uses <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeviceInfoUtil</code> to detect the device chipset and determine
        whether the Hexagon DSP is available. Hexagon support is gated to SM8750 (Snapdragon 8 Elite)
        and SM8650 (Snapdragon 8 Gen 3) only. When supported, it exposes NPU tuning parameters:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>hexagonNdev</strong> &mdash; Number of NPU compute devices to utilize</li>
        <li><strong>hexagonNhvx</strong> &mdash; Number of HVX (Hexagon Vector eXtension) units</li>
        <li><strong>hexagonVerbose</strong> &mdash; Enables verbose DSP logging for debugging</li>
        <li><strong>hexagonProfile</strong> &mdash; Performance profile (power vs. throughput tradeoff)</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">DefaultModeOrchestrator</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Manages single-prompt (non-chat) generation. It takes a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">MutableStateFlow&lt;LlamaUiState&gt;</code> and
        a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">CoroutineScope</code>. Before starting generation, it validates that
        a model is loaded and the prompt is non-empty. If a previous generation job is running, it
        cancels it before launching a new one.
      </p>
      <CodeBlock language="kotlin">{`class DefaultModeOrchestrator(
    private val uiState: MutableStateFlow<LlamaUiState>,
    private val scope: CoroutineScope
) {
    private var generationJob: Job? = null

    fun generate() {
        val state = uiState.value
        if (!state.isModelLoaded || state.currentPrompt.isBlank()) return

        // Cancel any existing generation
        generationJob?.cancel()

        generationJob = scope.launch(Dispatchers.IO) {
            uiState.update { it.copy(isGenerating = true, generatedText = "") }
            val startTime = System.nanoTime()
            var tokenCount = 0

            val maxTokens = if (state.useUnlimitedTokens) 10000 else state.maxTokens

            ModelEngine.generateStreaming(
                prompt = state.currentPrompt,
                maxTokens = maxTokens,
                temperature = state.temperature
            ) { token ->
                tokenCount++
                val elapsed = (System.nanoTime() - startTime) / 1_000_000_000.0
                val tps = if (elapsed > 0) tokenCount / elapsed else 0.0

                uiState.update { it.copy(
                    generatedText = it.generatedText + token,
                    currentTokenCount = tokenCount,
                    tokensPerSecond = tps.toFloat()
                )}
            }

            uiState.update { it.copy(isGenerating = false) }
        }
    }
}`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">ChatModeService</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The most complex manager. It maintains a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ConcurrentHashMap</code> mapping
        Kotlin Session IDs to native <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">seq_id</code> values,
        enabling KV cache continuity across conversation turns. Each session preserves its KV cache
        state in native memory, so switching between sessions does not require re-processing the
        entire conversation history.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>createSession()</strong> &mdash; Allocates a new native session slot, returns a Session object</li>
        <li><strong>loadSession()</strong> &mdash; Restores a previously saved session from disk</li>
        <li><strong>setActiveSession()</strong> &mdash; Switches the active context to the given session ID</li>
        <li><strong>saveSession()</strong> &mdash; Persists session state (KV cache snapshot) to disk</li>
        <li><strong>deleteSession()</strong> &mdash; Frees native resources and removes the session mapping</li>
        <li><strong>generate() / generateStreaming()</strong> &mdash; Runs inference within the active session context</li>
      </ul>

      <CodeBlock language="kotlin">{`// Native response JSON parsed by ChatModeService
fun parseGenerationResult(json: String): GenerationResult {
    val obj = JSONObject(json)
    return GenerationResult(
        response   = obj.getString("response"),
        turnId     = obj.getInt("turn_id"),
        tokensUsed = obj.getInt("tokens_used"),
        nPast      = obj.getInt("n_past")  // KV cache position
    )
}`}</CodeBlock>

      {/* --- Engine Layer --- */}
      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Engine Layer: ModelEngine + InferenceEngine Strategy</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine</code> is a Kotlin <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">object</code> (singleton)
        that holds exactly one active <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code> at any time.
        All public methods are guarded by a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ReentrantLock</code> to
        guarantee thread safety when accessed from multiple coroutine dispatchers.
      </p>

      <CodeBlock language="kotlin">{`object ModelEngine {
    private val lock = ReentrantLock()
    private var engine: InferenceEngine = LlamaCppEngine()

    fun switchEngine(backend: InferenceBackend): Boolean = lock.withLock {
        engine = when (backend) {
            InferenceBackend.CPU,
            InferenceBackend.HEXAGON -> LlamaCppEngine()
            InferenceBackend.ONNX_CPU -> OnnxRuntimeEngine(ExecutionProvider.CPU)
            InferenceBackend.ONNX_QNN -> OnnxRuntimeEngine(ExecutionProvider.QNN)
        }
        true
    }

    fun loadModel(path: String, params: ModelParams): Boolean = lock.withLock {
        engine.loadModel(path, params)
    }

    fun generateStreaming(
        prompt: String,
        maxTokens: Int,
        temperature: Float,
        callback: (String) -> Unit
    ): String = lock.withLock {
        engine.generateStreaming(prompt, maxTokens, temperature, callback)
    }

    fun checkMemoryForModel(path: String): Boolean = lock.withLock {
        engine.estimateMemoryRequirement(path) < getAvailableMemory()
    }

    fun unload() = lock.withLock { engine.unload() }
}`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="font-bold text-on-surface mb-2">Why ReentrantLock instead of synchronized?</p>
        <p className="text-on-surface-variant text-sm">
          Kotlin coroutines can resume on different threads after suspension points. A{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ReentrantLock</code> paired with{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">withLock</code> ensures the critical section
          is properly guarded regardless of which thread the coroutine resumes on. It also supports
          try-lock patterns for non-blocking checks.
        </p>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">InferenceBackend Enum</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The backend enum drives the Strategy pattern selection:
      </p>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Backend</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Engine</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Runtime</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Requirements</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">CPU</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">LlamaCppEngine</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">llama.cpp via JNI</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Any ARM64 device</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">HEXAGON</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">LlamaCppEngine</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">llama.cpp + Hexagon DSP</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SM8750 or SM8650 only</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ONNX_CPU</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">OnnxRuntimeEngine</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ORT GenAI (CPU EP)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Any device</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ONNX_QNN</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">OnnxRuntimeEngine</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ORT GenAI (QNN EP)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Qualcomm SoC with QNN SDK</td></tr>
          </tbody>
        </table>
      </div>

      {/* --- Repository Layer --- */}
      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Repository Layer: ModelRepository</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelRepository</code> abstracts all filesystem operations for model
        discovery. It supports two model formats and two loading modes.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Model Scanning</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        GGUF model scanning traverses three directories:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Downloads/</code> &mdash; Where users typically download models from HuggingFace</li>
        <li><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Documents/</code> &mdash; Alternative storage location</li>
        <li><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">models/</code> &mdash; App-specific model directory</li>
      </ul>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        For GGUF files, validation requires the <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.gguf</code> extension and
        a minimum file size of 10 MB (to filter out corrupted or incomplete downloads). ONNX model
        scanning looks for directories containing at least one <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">.onnx</code> file.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Dual-Mode Loading</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The repository supports two loading strategies:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Service-based (AIDL)</strong> &mdash; Loads the model in a separate service process via Android AIDL IPC. Useful for isolating large memory allocations from the UI process.</li>
        <li><strong>Direct</strong> &mdash; Loads the model directly via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine</code> in the app process. Lower latency but shares memory space with the UI.</li>
      </ul>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="font-bold text-on-surface mb-2">Memory Pre-check</p>
        <p className="text-on-surface-variant text-sm">
          Before loading, <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.checkMemoryForModel()</code> estimates
          the memory footprint of the model file and compares it against available device RAM.
          This prevents OOM kills that would crash the entire application.
        </p>
      </div>

      {/* --- Native Layer --- */}
      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Native Layer: JNI Bridge</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The native layer consists of <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni.cpp</code> (2105 lines of C++),
        which bridges between the Kotlin JNI declarations in <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaJni.kt</code> and
        the llama.cpp / GGML library. This layer manages:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Model loading and context creation with llama.cpp parameters</li>
        <li>Tokenization (encode/decode) via the loaded model vocabulary</li>
        <li>Batched inference with KV cache management</li>
        <li>Streaming token generation with JNI callbacks back to Kotlin</li>
        <li>Session state persistence (save/load KV cache snapshots)</li>
        <li>Atomic abort flags for cancellation from the Kotlin side</li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 4. DATA FLOW DIAGRAMS                                               */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Data Flow: Prompt to Response</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The following diagram traces how a user prompt flows through every layer of the system
        during default-mode (single-prompt) generation:
      </p>
      <CodeBlock language="text">{`User types prompt
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  UI Layer (Compose)                                     │
│  TextField onChange → viewModel.updatePrompt(text)      │
│  Button onClick    → viewModel.generate()               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  LlamaViewModel                                         │
│  generate() → defaultModeOrchestrator.generate()        │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  DefaultModeOrchestrator                                │
│  1. Validate: isModelLoaded && prompt.isNotBlank()      │
│  2. Cancel existing generationJob                       │
│  3. Launch on Dispatchers.IO                            │
│  4. uiState.update { isGenerating = true }              │
│  5. Call ModelEngine.generateStreaming(...)               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  ModelEngine (ReentrantLock)                             │
│  lock.withLock { engine.generateStreaming(...) }         │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  LlamaCppEngine / OnnxRuntimeEngine                     │
│  Calls JNI native method or ORT GenAI API               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  llama_jni.cpp → llama.cpp                              │
│  Token-by-token generation loop                         │
│  Each token → JNI callback → Kotlin lambda              │
│  Checks atomic abort flag each iteration                │
└───────────────────────────┬─────────────────────────────┘
                            │
                    token callback
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  DefaultModeOrchestrator callback                       │
│  tokenCount++                                           │
│  Calculate tokens/sec = count / elapsed                 │
│  uiState.update { generatedText += token }              │
└───────────────────────────┬─────────────────────────────┘
                            │
                   StateFlow emission
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  UI Layer (Compose)                                     │
│  collectAsState() triggers recomposition                │
│  StreamingOutputView renders updated text               │
└─────────────────────────────────────────────────────────┘`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Chat Mode Data Flow</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Chat mode follows a similar path but routes through <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ChatModeService</code> instead,
        which adds session management and KV cache continuity:
      </p>
      <CodeBlock language="text">{`User sends message
    │
    ▼
LlamaViewModel.sendChatMessage()
    │
    ▼
ChatModeService.generate(sessionId, message)
    │
    ├── Look up native seq_id from ConcurrentHashMap
    ├── Build prompt with conversation history
    ├── Call ModelEngine with session context
    │       │
    │       ▼
    │   llama_jni.cpp uses seq_id for KV cache slot
    │   Generates from n_past position (no re-processing)
    │       │
    │       ▼
    │   Returns JSON: {"response":"...", "turn_id":1,
    │                   "tokens_used":123, "n_past":456}
    │
    ▼
parseGenerationResult(json)
    │
    ▼
uiState.update { currentChatSession += newTurn }`}</CodeBlock>

      {/* ------------------------------------------------------------------ */}
      {/* 5. STATE MANAGEMENT                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">State Management: LlamaUiState</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        All UI state lives in a single immutable data class. Every state mutation creates a new copy
        via Kotlin <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">copy()</code>, ensuring Compose can
        efficiently diff changes. The fields are grouped into six categories:
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Lifecycle Flags</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Field</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Default</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isScanning</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">false</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">True while filesystem scan is in progress</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isLoading</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">false</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">True while model is being loaded into memory</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isModelLoaded</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">false</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">True when a model is ready for inference</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isGenerating</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">false</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">True during active token generation</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Model State</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Field</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">availableModels</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">List&lt;ModelInfo&gt;</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">All discovered models from last scan</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">selectedModel</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ModelInfo?</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Currently selected model (null if none)</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">modelInfo</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">String</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Metadata string from loaded model (params, quant type)</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Generation Parameters</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Field</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Default</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">currentPrompt</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">String</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">""</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Current user input text</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">generatedText</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">String</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">""</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Accumulated generated output (grows token by token)</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">maxTokens</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1024</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Maximum tokens to generate (capped at 10000 in unlimited mode)</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">temperature</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Float</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">0.7f</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Sampling temperature (0.0 = greedy, 1.0+ = creative)</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Hardware Configuration</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Field</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Default</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">selectedThreadCount</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">6</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Number of CPU threads for inference</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">selectedBackend</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">InferenceBackend</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">CPU</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Active inference backend</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isHexagonSupported</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">false</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Whether device chipset supports Hexagon DSP</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">hexagonNdev</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">-</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Number of NPU compute devices</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">hexagonNhvx</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">-</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Number of HVX vector units</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">hexagonVerbose</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">false</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables verbose DSP logging</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">hexagonProfile</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">String</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">-</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Performance profile for power/throughput tradeoff</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Token Metrics</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Field</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">currentTokenCount</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Tokens generated so far in current run</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">targetTokenCount</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Int</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Target token count (for progress indication)</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">tokensPerSecond</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Float</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Real-time generation speed (updated each token)</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Mode & Chat State</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Field</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Type</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">isDefaultMode</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Boolean</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Toggles between single-prompt and chat mode UI</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">currentChatSession</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Session?</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Active chat session with conversation history</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">chatStreamingText</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">String</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Partial response being streamed in chat mode</td></tr>
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 6. DESIGN PATTERNS                                                  */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Design Patterns</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Strategy Pattern: InferenceEngine</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code> interface defines a
        contract for model loading, inference, and resource cleanup. Concrete implementations
        (<code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaCppEngine</code>,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">OnnxRuntimeEngine</code>) can be swapped at
        runtime via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine.switchEngine()</code> without
        any changes to calling code.
      </p>
      <CodeBlock language="kotlin">{`interface InferenceEngine {
    fun loadModel(path: String, params: ModelParams): Boolean
    fun generate(prompt: String, maxTokens: Int, temperature: Float): String
    fun generateStreaming(
        prompt: String, maxTokens: Int, temperature: Float,
        callback: (String) -> Unit
    ): String
    fun estimateMemoryRequirement(path: String): Long
    fun unload()
}

// LlamaCppEngine adapts native JNI calls to this interface
class LlamaCppEngine : InferenceEngine {
    override fun loadModel(path: String, params: ModelParams): Boolean {
        return LlamaJni.loadModel(path, params.nThreads, params.nCtx, ...)
    }
    // ...
}

// OnnxRuntimeEngine uses ORT GenAI APIs
class OnnxRuntimeEngine(private val ep: ExecutionProvider) : InferenceEngine {
    override fun loadModel(path: String, params: ModelParams): Boolean {
        return OrtGenAI.createSession(path, ep.toNative())
    }
    // ...
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Singleton Pattern: ModelEngine</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Kotlin's <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">object</code> declaration ensures
        exactly one <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ModelEngine</code> instance exists
        process-wide. Combined with <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ReentrantLock</code>,
        this guarantees that only one engine operation can execute at a time, preventing data races
        on native pointers.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Delegation Pattern: LlamaViewModel</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Rather than growing into a god-object, the ViewModel delegates each concern to a dedicated
        manager. This keeps each class focused and testable. The ViewModel remains under 250 lines
        while coordinating model lifecycle, hardware config, default-mode generation, and multi-turn
        chat.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Observer Pattern: StateFlow</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">StateFlow</code> implements the Observer
        pattern with Kotlin coroutines. The ViewModel produces state; Compose composables consume it
        via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">collectAsState()</code>. Because{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">StateFlow</code> is conflated (only the
        latest value is kept), rapid token-by-token updates during generation do not cause unbounded
        buffering.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Adapter Pattern: LlamaCppEngine</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">LlamaCppEngine</code> adapts the low-level
        JNI interface (C-style function calls with raw pointers) into the clean{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">InferenceEngine</code> Kotlin interface.
        It handles type conversions, error mapping, and resource lifecycle that the JNI layer cannot
        express idiomatically.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Repository Pattern: ModelRepository</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Encapsulates all data-access logic (filesystem scanning, model validation, metadata
        extraction) behind a clean API. The rest of the application never interacts with the
        filesystem directly for model operations, making it straightforward to add new model
        sources (e.g., network downloads) without changing consumers.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 7. THREAD SAFETY MODEL                                              */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Thread Safety Model</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        On-device LLM inference involves multiple threads across the Kotlin and native layers.
        QuantaLLM uses a layered approach to thread safety:
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Kotlin Layer</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>ModelEngine</strong> &mdash; All public methods guarded by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ReentrantLock.withLock {'{}'}</code>. Prevents concurrent engine access from multiple coroutines.</li>
        <li><strong>StateFlow</strong> &mdash; Thread-safe by design. <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">MutableStateFlow.update {'{}'}</code> uses CAS (compare-and-swap) internally, so concurrent updates from <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Dispatchers.IO</code> and <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Dispatchers.Main</code> are safe.</li>
        <li><strong>ChatModeService</strong> &mdash; Session mappings stored in <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">ConcurrentHashMap</code> for lock-free concurrent reads.</li>
        <li><strong>Coroutine dispatchers</strong> &mdash; IO-bound work (model loading, generation) runs on <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Dispatchers.IO</code>; UI updates flow back via StateFlow to <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Dispatchers.Main</code>.</li>
      </ul>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Native Layer (llama_jni.cpp)</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Atomic abort flag</strong> &mdash; A <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">std::atomic&lt;bool&gt;</code> checked on every iteration of the token generation loop. When the Kotlin side calls the cancel method, it sets this flag, and the native loop exits cleanly without holding any locks.</li>
        <li><strong>Context pointers</strong> &mdash; Native <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_context</code> and <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_model</code> pointers are stored as Java <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">long</code> values. Access is serialized by the ModelEngine lock on the Kotlin side.</li>
        <li><strong>JNI callback safety</strong> &mdash; Token callbacks from native code into Kotlin are dispatched on the same thread that initiated generation, avoiding cross-thread JNI issues.</li>
      </ul>

      <CodeBlock language="cpp">{`// Atomic abort flag in llama_jni.cpp
static std::atomic<bool> g_abort_generation{false};

// Called from Kotlin to cancel generation
JNIEXPORT void JNICALL Java_com_example_LlamaJni_cancelGeneration(
    JNIEnv* env, jobject obj
) {
    g_abort_generation.store(true, std::memory_order_release);
}

// Checked each iteration in the generation loop
while (n_cur < n_max) {
    if (g_abort_generation.load(std::memory_order_acquire)) {
        g_abort_generation.store(false);
        break;  // Clean exit, no resource leaks
    }
    // ... decode next token ...
}`}</CodeBlock>

      {/* ------------------------------------------------------------------ */}
      {/* 8. ERROR HANDLING                                                    */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Error Handling Strategy</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Errors are handled differently at each layer, following a principle of early detection and
        graceful degradation:
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Layer-by-Layer Error Strategy</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Layer</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Strategy</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Example</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Native</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Returns error codes or null pointers; never throws</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Model load returns nullptr on failure</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Engine</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Maps native errors to Boolean results or exceptions</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">loadModel() returns false on JNI failure</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Manager</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Pre-validates inputs; catches engine failures; updates UI state with error info</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Memory pre-check before load attempt</td></tr>
            <tr className="bg-surface-container/30"><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">ViewModel</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Wraps manager calls in try-catch; sets error state</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Catches CancellationException for cancelled jobs</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">UI</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Observes error state; displays Snackbar or dialog</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Shows "Insufficient memory" when pre-check fails</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="font-bold text-on-surface mb-2">Critical: Native Resource Leaks</p>
        <p className="text-on-surface-variant text-sm">
          The native layer allocates large memory regions for model weights and KV caches. Every
          error path in <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">llama_jni.cpp</code> must ensure
          these resources are freed. The Kotlin-side <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">unload()</code> method
          is always called in a <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">finally</code> block to
          prevent leaks even when exceptions propagate upward.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 9. DEVICE INFO UTIL                                                 */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Hardware Detection: DeviceInfoUtil</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">DeviceInfoUtil</code> provides hardware
        introspection used throughout the application for thread count defaults, backend availability,
        and Hexagon DSP gating.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Key Methods</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>getCpuCores()</strong> &mdash; Returns the number of available CPU cores via <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Runtime.getRuntime().availableProcessors()</code>. Used to set the default thread count.</li>
        <li><strong>getDeviceModel()</strong> &mdash; Returns <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">Build.MODEL</code> for display in the UI settings panel.</li>
        <li><strong>getRawChipsetIdentifier()</strong> &mdash; Reads the SoC identifier from system properties for chipset matching.</li>
        <li><strong>mapChipsetToFriendlyName()</strong> &mdash; Maps raw chipset identifiers to human-readable names across 40+ chipsets: Snapdragon (SM8750, SM8650, SM8550, etc.), Exynos (2400, 2200), Dimensity (9300, 9200), and Google Tensor (G4, G3).</li>
        <li><strong>getHexagonSupportInfo()</strong> &mdash; Returns a support descriptor gated to SM8750 (Snapdragon 8 Elite) and SM8650 (Snapdragon 8 Gen 3) only. All other chipsets return unsupported.</li>
      </ul>

      <CodeBlock language="kotlin">{`object DeviceInfoUtil {
    fun getHexagonSupportInfo(): HexagonSupport {
        val chipset = getRawChipsetIdentifier()
        return when {
            chipset.contains("SM8750") -> HexagonSupport(
                supported = true,
                chipName = "Snapdragon 8 Elite",
                dspVersion = "v75"
            )
            chipset.contains("SM8650") -> HexagonSupport(
                supported = true,
                chipName = "Snapdragon 8 Gen 3",
                dspVersion = "v73"
            )
            else -> HexagonSupport(supported = false)
        }
    }
}`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="font-bold text-on-surface mb-2">Why only SM8750 and SM8650?</p>
        <p className="text-on-surface-variant text-sm">
          Hexagon DSP offloading for LLM inference requires specific VTCM (Vector Tightly Coupled
          Memory) sizes and instruction set extensions that are only available on the latest
          Qualcomm flagship SoCs. Older Hexagon DSP versions lack the throughput needed to
          outperform CPU-only execution for transformer workloads.
        </p>
      </div>
    </div>
  );
}
