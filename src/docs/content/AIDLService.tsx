import CodeBlock from '../CodeBlock';

export default function AIDLService() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">AIDL Cross-App Service</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        Expose QuantaLLM's inference capabilities to any Android application via Android Interface Definition Language (AIDL).
        This guide covers the full architecture, every interface method, integration steps, and production best practices.
      </p>

      {/* ──────────────────────────── 1. What is AIDL? ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">What is AIDL?</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Android Interface Definition Language (AIDL) is a mechanism that allows two separate Android processes to
        communicate using <span className="font-mono text-primary">Inter-Process Communication (IPC)</span>. When an
        application binds to a service running in another app, method calls cross process boundaries through the
        Linux kernel's Binder driver. AIDL provides a type-safe contract so both sides agree on method signatures,
        parameter types, and return values at compile time.
      </p>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Unlike simpler IPC mechanisms, AIDL supports synchronous method calls with return values, streaming callbacks,
        and complex data types. This makes it ideal for QuantaLLM's use case: a client app sends a prompt and receives
        generated tokens either as a single blocking result or streamed in real time.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">IPC Mechanisms Compared</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left">
              <th className="py-3 pr-4 text-on-surface font-headline">Mechanism</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Direction</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Return Values</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Streaming</th>
              <th className="py-3 text-on-surface font-headline">Best For</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">Intent</td>
              <td className="py-3 pr-4">One-way (fire & forget)</td>
              <td className="py-3 pr-4">No (requires result callback)</td>
              <td className="py-3 pr-4">No</td>
              <td className="py-3">Starting activities, broadcasts</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">ContentProvider</td>
              <td className="py-3 pr-4">Request/Response</td>
              <td className="py-3 pr-4">Yes (Cursor)</td>
              <td className="py-3 pr-4">No</td>
              <td className="py-3">Structured data queries</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">Messenger</td>
              <td className="py-3 pr-4">Two-way (message-based)</td>
              <td className="py-3 pr-4">No (async messages only)</td>
              <td className="py-3 pr-4">Limited</td>
              <td className="py-3">Simple message passing</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">AIDL</td>
              <td className="py-3 pr-4">Two-way (method calls)</td>
              <td className="py-3 pr-4">Yes (typed)</td>
              <td className="py-3 pr-4">Yes (callbacks)</td>
              <td className="py-3">Complex APIs, streaming, low latency</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        AIDL is the only mechanism that gives QuantaLLM both synchronous return values (for simple generation)
        and real-time streaming callbacks (for token-by-token updates). The Binder driver handles thread
        pooling, serialization, and lifecycle automatically.
      </p>

      {/* ──────────────────────────── 2. Architecture ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Architecture Overview</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The following diagram shows how a client app communicates with QuantaLLM's inference service through the
        Binder IPC layer:
      </p>
      <CodeBlock language="bash">{`┌─────────────────────────┐         ┌─────────────────────────────────────────┐
│      Client App         │         │          QuantaLLM Process              │
│                         │         │                                         │
│  ┌───────────────────┐  │  Binder │  ┌───────────────────────────────────┐  │
│  │ ILlamaInference   │──┼─────────┼──│ ILlamaInference.Stub (Binder)    │  │
│  │ .Stub.asInterface()│  │   IPC   │  │                                   │  │
│  └───────────────────┘  │         │  │  ┌─────────────────────────────┐  │  │
│                         │         │  │  │  LlamaInferenceService      │  │  │
│  ┌───────────────────┐  │         │  │  │  (Foreground Service)       │  │  │
│  │ IInferenceCallback│◄─┼─────────┼──│  │                             │  │  │
│  │ .Stub (receives)  │  │ Callback│  │  │  ┌───────────────────────┐  │  │  │
│  └───────────────────┘  │         │  │  │  │    ModelEngine         │  │  │  │
│                         │         │  │  │  │  (ReentrantLock)       │  │  │  │
└─────────────────────────┘         │  │  │  │                       │  │  │  │
                                    │  │  │  │  ┌─────────────────┐  │  │  │  │
                                    │  │  │  │  │  llama.cpp JNI  │  │  │  │  │
                                    │  │  │  │  │  (Native C++)   │  │  │  │  │
                                    │  │  │  │  └─────────────────┘  │  │  │  │
                                    │  │  │  └───────────────────────┘  │  │  │
                                    │  │  └─────────────────────────────┘  │  │
                                    │  └───────────────────────────────────┘  │
                                    └─────────────────────────────────────────┘`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The client app holds a proxy object (<span className="font-mono text-primary">ILlamaInference.Stub.asInterface()</span>)
        that transparently marshals method calls across process boundaries. The service's Binder implementation
        receives these calls on a thread from the Binder thread pool, delegates to{' '}
        <span className="font-mono text-primary">ModelEngine</span>, which in turn invokes the native llama.cpp
        library via JNI. For asynchronous generation, the service calls back into the client's{' '}
        <span className="font-mono text-primary">IInferenceCallback.Stub</span> implementation, again through Binder IPC.
      </p>

      {/* ──────────────────────────── 3. Service Interface ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Service Interface — ILlamaInference</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The primary AIDL interface defines all methods a client can invoke on the inference service.
        Every method call is synchronous from the caller's perspective (the calling thread blocks until the
        service returns), with the exception of <span className="font-mono text-primary">generateAsync</span> which
        returns immediately and delivers results via callback.
      </p>
      <CodeBlock language="aidl">{`// ILlamaInference.aidl
package com.naman.quantallm;
import com.naman.quantallm.IInferenceCallback;

interface ILlamaInference {
    int loadModel(String modelPath, int threads);
    boolean isModelLoaded();
    String getModelInfo();
    String generate(String prompt, int maxTokens, float temperature);
    int generateAsync(String prompt, int maxTokens, float temperature, IInferenceCallback callback);
    void cancelInference(int requestId);
    int unloadModel();
    String getVersion();
    boolean ping();
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Method Reference</h3>

      {/* loadModel */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">loadModel</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Loads a GGUF model file into memory and initializes the llama.cpp context. This is a heavyweight operation
        that may take several seconds depending on model size. The method delegates to{' '}
        <span className="font-mono text-primary">ModelEngine.loadModel()</span> internally and blocks the calling
        Binder thread until complete.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left">
              <th className="py-3 pr-4 text-on-surface font-headline">Parameter</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Type</th>
              <th className="py-3 text-on-surface font-headline">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">modelPath</td>
              <td className="py-3 pr-4 font-mono">String</td>
              <td className="py-3">Absolute path to the GGUF model file on the device filesystem</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">threads</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">Number of CPU threads for inference (0 = auto-detect optimal count)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Returns:</strong> <span className="font-mono text-primary">0</span> on success, non-zero error code on failure.
        Common error codes: <span className="font-mono text-primary">-1</span> (file not found),{' '}
        <span className="font-mono text-primary">-2</span> (invalid model format),{' '}
        <span className="font-mono text-primary">-3</span> (insufficient memory).
      </p>
      <div className="bg-surface-container border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> This call blocks the Binder thread. If called from the main thread of your
          client app, it will block the UI. Always call from a background thread or coroutine.
        </p>
      </div>

      {/* isModelLoaded */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">isModelLoaded</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returns <span className="font-mono text-primary">true</span> if a model is currently loaded and ready for
        inference, <span className="font-mono text-primary">false</span> otherwise. This is a lightweight query that
        does not block on any locks — safe to call from any thread including the main thread.
      </p>

      {/* getModelInfo */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">getModelInfo</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Returns a JSON string containing metadata about the currently loaded model, including name, parameter count,
        quantization type, context length, and vocabulary size. Returns <span className="font-mono text-primary">null</span> if
        no model is loaded.
      </p>

      {/* generate */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">generate</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Performs synchronous (blocking) text generation. The calling thread blocks until the entire response
        is generated or an error occurs. Internally calls{' '}
        <span className="font-mono text-primary">ModelEngine.generate()</span> directly on the Binder thread.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left">
              <th className="py-3 pr-4 text-on-surface font-headline">Parameter</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Type</th>
              <th className="py-3 text-on-surface font-headline">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">prompt</td>
              <td className="py-3 pr-4 font-mono">String</td>
              <td className="py-3">The input prompt text to send to the model</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">maxTokens</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">Maximum number of tokens to generate (e.g. 128, 256, 512)</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">temperature</td>
              <td className="py-3 pr-4 font-mono">float</td>
              <td className="py-3">Sampling temperature (0.0 = greedy, 1.0+ = creative)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Returns:</strong> The full generated text as a <span className="font-mono text-primary">String</span>,
        or <span className="font-mono text-primary">null</span> on error.
      </p>
      <div className="bg-surface-container border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Danger:</strong> This method blocks the Binder thread for the entire duration of generation,
          which can be tens of seconds for long outputs. The Binder thread pool is limited (typically 16 threads).
          For production use, prefer <span className="font-mono text-primary">generateAsync</span> to avoid
          exhausting the thread pool with long-running calls.
        </p>
      </div>

      {/* generateAsync */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">generateAsync</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Starts asynchronous text generation. Returns immediately with a request ID, then delivers progress and
        results through the provided callback. Internally, the service launches a coroutine on{' '}
        <span className="font-mono text-primary">Dispatchers.IO</span> that calls{' '}
        <span className="font-mono text-primary">ModelEngine.generateStreaming()</span> and invokes callback
        methods as tokens are produced.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left">
              <th className="py-3 pr-4 text-on-surface font-headline">Parameter</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Type</th>
              <th className="py-3 text-on-surface font-headline">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">prompt</td>
              <td className="py-3 pr-4 font-mono">String</td>
              <td className="py-3">The input prompt text</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">maxTokens</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">Maximum number of tokens to generate</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">temperature</td>
              <td className="py-3 pr-4 font-mono">float</td>
              <td className="py-3">Sampling temperature</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">callback</td>
              <td className="py-3 pr-4 font-mono">IInferenceCallback</td>
              <td className="py-3">Callback interface for receiving streaming results</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Returns:</strong> A unique <span className="font-mono text-primary">int</span> request ID that can
        be passed to <span className="font-mono text-primary">cancelInference()</span>. The service tracks active
        callbacks in a <span className="font-mono text-primary">Map&lt;Int, IInferenceCallback&gt;</span>.
      </p>

      {/* cancelInference */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">cancelInference</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Cancels an in-progress asynchronous generation. Calls{' '}
        <span className="font-mono text-primary">ModelEngine.abortGeneration()</span>, removes the callback from the
        active map, and delivers <span className="font-mono text-primary">onCancelled</span> to the client. If the
        request ID is not found (already completed or never existed), this is a no-op.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left">
              <th className="py-3 pr-4 text-on-surface font-headline">Parameter</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Type</th>
              <th className="py-3 text-on-surface font-headline">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">requestId</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">The request ID returned by generateAsync</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* unloadModel */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">unloadModel</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Releases the currently loaded model from memory. Frees the native llama.cpp context and all associated
        GPU/CPU memory. Returns <span className="font-mono text-primary">0</span> on success. Any in-progress
        inference will be aborted before unloading.
      </p>

      {/* getVersion & ping */}
      <h4 className="text-lg font-bold font-headline mt-8 mb-3">getVersion / ping</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <span className="font-mono text-primary">getVersion()</span> returns the service version string
        (e.g. <span className="font-mono text-primary">"1.2.0"</span>).{' '}
        <span className="font-mono text-primary">ping()</span> returns <span className="font-mono text-primary">true</span> if
        the service is alive and responsive — useful for health checks before attempting model load or generation.
      </p>

      {/* ──────────────────────────── 4. Callback Interface ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Callback Interface — IInferenceCallback</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The callback interface is implemented by the client app and passed to{' '}
        <span className="font-mono text-primary">generateAsync()</span>. The service invokes these methods through
        Binder IPC on a Binder thread in the client process — <strong>not</strong> the main/UI thread.
      </p>
      <CodeBlock language="aidl">{`// IInferenceCallback.aidl
package com.naman.quantallm;

interface IInferenceCallback {
    void onStart(int requestId);
    void onProgress(int requestId, int tokensGenerated, int totalTokens, String partialText);
    void onComplete(int requestId, String result, long timeMs);
    void onError(int requestId, String errorMessage);
    void onCancelled(int requestId);
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Callback Lifecycle</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Every async generation follows one of these paths:
      </p>
      <CodeBlock language="bash">{`onStart ──► onProgress (repeated) ──► onComplete    (success)
onStart ──► onProgress (repeated) ──► onError       (failure)
onStart ──► onProgress (optional) ──► onCancelled   (user cancelled)`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">onStart</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Called once when the service begins processing the request. The <span className="font-mono text-primary">requestId</span> matches
        the value returned by <span className="font-mono text-primary">generateAsync()</span>. Use this to show a loading indicator.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">onProgress</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Called repeatedly as tokens are generated. Provides the count of tokens generated so far, the total
        expected tokens, and the accumulated partial text. The service wraps each callback invocation in a
        try-catch for <span className="font-mono text-primary">RemoteException</span> — if the client process
        dies, the service silently removes the callback and continues (or aborts) generation.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left">
              <th className="py-3 pr-4 text-on-surface font-headline">Parameter</th>
              <th className="py-3 pr-4 text-on-surface font-headline">Type</th>
              <th className="py-3 text-on-surface font-headline">Description</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">requestId</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">Identifies which generation request this progress belongs to</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">tokensGenerated</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">Number of tokens produced so far</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">totalTokens</td>
              <td className="py-3 pr-4 font-mono">int</td>
              <td className="py-3">Maximum tokens requested (same as maxTokens parameter)</td>
            </tr>
            <tr className="border-b border-outline-variant/20">
              <td className="py-3 pr-4 font-mono text-primary">partialText</td>
              <td className="py-3 pr-4 font-mono">String</td>
              <td className="py-3">Accumulated generated text up to this point</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">onComplete</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Called once when generation finishes successfully. The <span className="font-mono text-primary">result</span> contains
        the final generated text and <span className="font-mono text-primary">timeMs</span> is the total wall-clock time
        in milliseconds for the generation.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">onError</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Called if generation fails for any reason (out of memory, model corruption, native crash caught by JNI).
        The <span className="font-mono text-primary">errorMessage</span> is a human-readable description.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">onCancelled</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Called after <span className="font-mono text-primary">cancelInference(requestId)</span> is invoked by
        the client. The service calls <span className="font-mono text-primary">ModelEngine.abortGeneration()</span>,
        removes the callback from the active map, and then delivers this notification.
      </p>

      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Threading note:</strong> All callback methods are invoked on a Binder thread in the client
          process. To update UI, you must marshal to the main thread using{' '}
          <span className="font-mono text-primary">runOnUiThread</span>,{' '}
          <span className="font-mono text-primary">Handler(Looper.getMainLooper())</span>, or{' '}
          <span className="font-mono text-primary">withContext(Dispatchers.Main)</span>.
        </p>
      </div>

      {/* ──────────────────────────── 5. Integration Guide ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Integration Guide</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Follow these steps to integrate QuantaLLM inference into your own Android application.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 1: Copy AIDL Files</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Copy both AIDL files into your project. The package directory structure must match exactly:
      </p>
      <CodeBlock language="bash">{`your-app/
├── src/
│   └── main/
│       ├── aidl/
│       │   └── com/
│       │       └── naman/
│       │           └── quantallm/
│       │               ├── ILlamaInference.aidl
│       │               └── IInferenceCallback.aidl
│       ├── java/
│       │   └── ...
│       └── AndroidManifest.xml
└── build.gradle.kts`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> The <span className="font-mono text-primary">aidl/</span> directory sits alongside{' '}
          <span className="font-mono text-primary">java/</span> (or <span className="font-mono text-primary">kotlin/</span>)
          under <span className="font-mono text-primary">src/main/</span>. The Android build system automatically
          generates Java interface stubs from these files.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 2: Enable AIDL in build.gradle.kts</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        In your app-level <span className="font-mono text-primary">build.gradle.kts</span>, enable AIDL support
        in the <span className="font-mono text-primary">buildFeatures</span> block:
      </p>
      <CodeBlock language="kotlin">{`android {
    // ...
    buildFeatures {
        aidl = true
    }
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Sync your project. The build system will generate{' '}
        <span className="font-mono text-primary">ILlamaInference.java</span> and{' '}
        <span className="font-mono text-primary">IInferenceCallback.java</span> in the build output directory.
        You can find them under{' '}
        <span className="font-mono text-primary">build/generated/aidl_source_output_dir/</span>.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 3: Create ServiceConnection</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Implement <span className="font-mono text-primary">ServiceConnection</span> to receive the binder when
        the connection is established and handle disconnections:
      </p>
      <CodeBlock language="kotlin">{`private var inferenceService: ILlamaInference? = null
private var isBound = false

private val serviceConnection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
        inferenceService = ILlamaInference.Stub.asInterface(binder)
        isBound = true
        Log.d(TAG, "Connected to QuantaLLM inference service")
    }

    override fun onServiceDisconnected(name: ComponentName?) {
        // Called when the service process crashes or is killed by the system.
        // NOT called when you call unbindService().
        inferenceService = null
        isBound = false
        Log.w(TAG, "Disconnected from QuantaLLM inference service")
    }
}`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> <span className="font-mono text-primary">onServiceDisconnected</span> is called
          only when the hosting process crashes or is killed — it is <strong>not</strong> called when you voluntarily
          unbind. Always set your service reference to null here and implement reconnection logic.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 4: Bind to the Service</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Create an explicit <span className="font-mono text-primary">Intent</span> targeting the QuantaLLM service
        by its component name and bind:
      </p>
      <CodeBlock language="kotlin">{`private fun bindInferenceService() {
    val intent = Intent().apply {
        component = ComponentName(
            "com.naman.quantallm",
            "com.naman.quantallm.service.LlamaInferenceService"
        )
    }

    // BIND_AUTO_CREATE starts the service if not already running
    val success = bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
    if (!success) {
        Log.e(TAG, "Failed to bind — is QuantaLLM installed?")
    }
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Call this in <span className="font-mono text-primary">onCreate()</span> or when you need the service.
        The <span className="font-mono text-primary">BIND_AUTO_CREATE</span> flag tells Android to start the
        service if it is not already running.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 5: Unbind on Cleanup</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Always unbind when you no longer need the service (typically in{' '}
        <span className="font-mono text-primary">onDestroy()</span>) to avoid leaked service connections:
      </p>
      <CodeBlock language="kotlin">{`override fun onDestroy() {
    super.onDestroy()
    if (isBound) {
        unbindService(serviceConnection)
        isBound = false
        inferenceService = null
    }
}`}</CodeBlock>

      {/* ──────────────────────────── 6. Synchronous Generation ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Synchronous Generation</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The simplest way to generate text. The <span className="font-mono text-primary">generate()</span> call
        blocks until the full response is ready. You must call this from a background thread.
      </p>
      <CodeBlock language="kotlin">{`// Always call from a background thread — never the main thread!
lifecycleScope.launch(Dispatchers.IO) {
    val service = inferenceService ?: run {
        Log.e(TAG, "Service not connected")
        return@launch
    }

    try {
        // Check if model is loaded first
        if (!service.isModelLoaded()) {
            val loadResult = service.loadModel(
                "/storage/emulated/0/Models/phi-3-mini-Q4_K_M.gguf",
                4  // 4 threads
            )
            if (loadResult != 0) {
                Log.e(TAG, "Failed to load model, error code: \$loadResult")
                return@launch
            }
        }

        // Blocking generation — thread waits until complete
        val result = service.generate(
            "Explain quantum computing in simple terms",
            256,   // max tokens
            0.7f   // temperature
        )

        // Switch to main thread to update UI
        withContext(Dispatchers.Main) {
            textView.text = result
        }
    } catch (e: RemoteException) {
        Log.e(TAG, "Service communication failed", e)
    } catch (e: DeadObjectException) {
        Log.e(TAG, "Service process died", e)
        // Trigger reconnection
    }
}`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> The Binder thread pool is limited (default 16 threads). A blocking{' '}
          <span className="font-mono text-primary">generate()</span> call occupies one Binder thread for the entire
          duration. If many clients call <span className="font-mono text-primary">generate()</span> simultaneously,
          subsequent calls will queue. For production apps, use{' '}
          <span className="font-mono text-primary">generateAsync()</span> instead.
        </p>
      </div>

      {/* ──────────────────────────── 7. Asynchronous Generation ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Asynchronous Generation with Streaming</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Asynchronous generation returns immediately and delivers tokens through a callback. This is the recommended
        approach for production apps — it does not block the Binder thread pool and provides real-time streaming.
      </p>
      <CodeBlock language="kotlin">{`private var currentRequestId: Int = -1

private val inferenceCallback = object : IInferenceCallback.Stub() {
    override fun onStart(requestId: Int) {
        runOnUiThread {
            progressBar.visibility = View.VISIBLE
            textView.text = "Generating..."
        }
    }

    override fun onProgress(
        requestId: Int,
        tokensGenerated: Int,
        totalTokens: Int,
        partialText: String
    ) {
        // Called on a Binder thread — marshal to UI thread
        runOnUiThread {
            textView.text = partialText
            progressBar.progress = (tokensGenerated * 100) / totalTokens
        }
    }

    override fun onComplete(requestId: Int, result: String, timeMs: Long) {
        runOnUiThread {
            textView.text = result
            progressBar.visibility = View.GONE
            statsView.text = "Generated in \${timeMs}ms"
        }
    }

    override fun onError(requestId: Int, errorMessage: String) {
        runOnUiThread {
            progressBar.visibility = View.GONE
            Toast.makeText(this@MainActivity, "Error: \$errorMessage", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCancelled(requestId: Int) {
        runOnUiThread {
            progressBar.visibility = View.GONE
            textView.append("\\n[Generation cancelled]")
        }
    }
}

// Start async generation
fun startGeneration(prompt: String) {
    val service = inferenceService ?: return
    try {
        currentRequestId = service.generateAsync(
            prompt,
            512,    // max tokens
            0.8f,   // temperature
            inferenceCallback
        )
    } catch (e: RemoteException) {
        Log.e(TAG, "Failed to start generation", e)
    }
}

// Cancel if needed
fun cancelGeneration() {
    if (currentRequestId != -1) {
        try {
            inferenceService?.cancelInference(currentRequestId)
        } catch (e: RemoteException) {
            Log.e(TAG, "Failed to cancel", e)
        }
        currentRequestId = -1
    }
}`}</CodeBlock>

      {/* ──────────────────────────── 8. Complete Example ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Complete Integration Example</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        A full Activity that binds to QuantaLLM, loads a model, performs async generation, and handles the
        complete lifecycle:
      </p>
      <CodeBlock language="kotlin">{`class InferenceActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "InferenceActivity"
        private const val MODEL_PATH = "/storage/emulated/0/Models/phi-3-mini-Q4_K_M.gguf"
    }

    private lateinit var textView: TextView
    private lateinit var generateButton: Button
    private lateinit var cancelButton: Button
    private lateinit var promptInput: EditText

    private var inferenceService: ILlamaInference? = null
    private var isBound = false
    private var currentRequestId = -1

    // ── ServiceConnection ──────────────────────────────────────
    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            inferenceService = ILlamaInference.Stub.asInterface(binder)
            isBound = true
            generateButton.isEnabled = true

            // Load model in background
            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val service = inferenceService ?: return@launch
                    if (!service.isModelLoaded()) {
                        val result = service.loadModel(MODEL_PATH, 0)
                        withContext(Dispatchers.Main) {
                            if (result == 0) {
                                textView.text = "Model loaded. Ready to generate."
                            } else {
                                textView.text = "Failed to load model (error \$result)"
                            }
                        }
                    }
                } catch (e: RemoteException) {
                    Log.e(TAG, "Failed to load model", e)
                }
            }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            inferenceService = null
            isBound = false
            generateButton.isEnabled = false
            textView.text = "Service disconnected. Reconnecting..."

            // Auto-reconnect after delay
            lifecycleScope.launch {
                delay(2000)
                bindInferenceService()
            }
        }
    }

    // ── Callback ───────────────────────────────────────────────
    private val callback = object : IInferenceCallback.Stub() {
        override fun onStart(requestId: Int) {
            runOnUiThread {
                generateButton.isEnabled = false
                cancelButton.isEnabled = true
                textView.text = ""
            }
        }

        override fun onProgress(
            requestId: Int, tokensGenerated: Int,
            totalTokens: Int, partialText: String
        ) {
            runOnUiThread { textView.text = partialText }
        }

        override fun onComplete(requestId: Int, result: String, timeMs: Long) {
            runOnUiThread {
                textView.text = result
                generateButton.isEnabled = true
                cancelButton.isEnabled = false
                currentRequestId = -1
            }
        }

        override fun onError(requestId: Int, errorMessage: String) {
            runOnUiThread {
                textView.text = "Error: \$errorMessage"
                generateButton.isEnabled = true
                cancelButton.isEnabled = false
                currentRequestId = -1
            }
        }

        override fun onCancelled(requestId: Int) {
            runOnUiThread {
                textView.append("\\n[Cancelled]")
                generateButton.isEnabled = true
                cancelButton.isEnabled = false
                currentRequestId = -1
            }
        }
    }

    // ── Lifecycle ──────────────────────────────────────────────
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_inference)

        textView = findViewById(R.id.textView)
        generateButton = findViewById(R.id.generateButton)
        cancelButton = findViewById(R.id.cancelButton)
        promptInput = findViewById(R.id.promptInput)

        generateButton.isEnabled = false
        cancelButton.isEnabled = false

        generateButton.setOnClickListener {
            val prompt = promptInput.text.toString()
            if (prompt.isNotBlank()) {
                try {
                    currentRequestId = inferenceService?.generateAsync(
                        prompt, 512, 0.7f, callback
                    ) ?: -1
                } catch (e: RemoteException) {
                    textView.text = "Communication error: \${e.message}"
                }
            }
        }

        cancelButton.setOnClickListener {
            if (currentRequestId != -1) {
                try { inferenceService?.cancelInference(currentRequestId) }
                catch (_: RemoteException) {}
            }
        }

        bindInferenceService()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (currentRequestId != -1) {
            try { inferenceService?.cancelInference(currentRequestId) }
            catch (_: RemoteException) {}
        }
        if (isBound) {
            unbindService(connection)
            isBound = false
        }
    }

    private fun bindInferenceService() {
        val intent = Intent().apply {
            component = ComponentName(
                "com.naman.quantallm",
                "com.naman.quantallm.service.LlamaInferenceService"
            )
        }
        bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }
}`}</CodeBlock>

      {/* ──────────────────────────── 9. Service Lifecycle ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Service Lifecycle</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <span className="font-mono text-primary">LlamaInferenceService</span> extends{' '}
        <span className="font-mono text-primary">Service</span> and runs as a foreground service to prevent the
        system from killing it during inference.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Foreground Service & Notification</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        On creation, the service creates a notification channel with{' '}
        <span className="font-mono text-primary">IMPORTANCE_LOW</span> (no sound or vibration) and starts itself
        as a foreground service with a persistent notification. The notification updates to reflect current state
        — idle, model loading, or actively generating. This is required by Android for{' '}
        <span className="font-mono text-primary">foregroundServiceType="specialUse"</span>.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Notification channel created in <span className="font-mono text-primary">onCreate()</span></li>
        <li>Foreground service started with persistent notification showing service status</li>
        <li>Notification content updates during model loading and generation</li>
        <li>Channel uses <span className="font-mono text-primary">IMPORTANCE_LOW</span> to avoid disturbing the user</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">START_STICKY Restart Policy</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The service returns <span className="font-mono text-primary">START_STICKY</span> from{' '}
        <span className="font-mono text-primary">onStartCommand()</span>. If the system kills the service
        process (e.g. under memory pressure), Android will automatically restart it. However, the model will
        need to be reloaded — in-memory state is lost on restart. Clients should handle{' '}
        <span className="font-mono text-primary">onServiceDisconnected</span> and re-bind.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Process Priority</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        As a foreground service, the QuantaLLM process runs at a higher priority than background processes
        and is much less likely to be killed by Android's low-memory killer. When clients bind with{' '}
        <span className="font-mono text-primary">BIND_AUTO_CREATE</span>, the service's importance is further
        elevated to match the client's importance level.
      </p>

      {/* ──────────────────────────── 10. HeadlessInferenceActivity ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">HeadlessInferenceActivity</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Starting with Android 10+ (API 26+), apps cannot start foreground services from the background. The{' '}
        <span className="font-mono text-primary">HeadlessInferenceActivity</span> provides a workaround: an
        invisible, no-history Activity that immediately starts the foreground service and finishes itself.
      </p>
      <CodeBlock language="xml">{`<activity
    android:name=".service.HeadlessInferenceActivity"
    android:exported="true"
    android:noHistory="true">
    <intent-filter>
        <action android:name="com.naman.quantallm.LAUNCH_INFERENCE_SERVICE" />
    </intent-filter>
</activity>`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        To use it from a client app, launch the Activity before binding:
      </p>
      <CodeBlock language="kotlin">{`// Launch the headless activity to ensure the service starts as foreground
val launchIntent = Intent().apply {
    action = "com.naman.quantallm.LAUNCH_INFERENCE_SERVICE"
    component = ComponentName(
        "com.naman.quantallm",
        "com.naman.quantallm.service.HeadlessInferenceActivity"
    )
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}
startActivity(launchIntent)

// Then bind to the service after a brief delay
Handler(Looper.getMainLooper()).postDelayed({
    bindInferenceService()
}, 500)`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> The <span className="font-mono text-primary">android:noHistory="true"</span> attribute
          ensures the Activity does not appear in the recents screen. It starts the service in{' '}
          <span className="font-mono text-primary">onCreate()</span> and calls{' '}
          <span className="font-mono text-primary">finish()</span> immediately — the user never sees it.
        </p>
      </div>

      {/* ──────────────────────────── 11. Manifest Configuration ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Manifest Configuration</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The complete service and activity declarations in QuantaLLM's{' '}
        <span className="font-mono text-primary">AndroidManifest.xml</span>:
      </p>
      <CodeBlock language="xml">{`<service
    android:name=".service.LlamaInferenceService"
    android:exported="true"
    android:foregroundServiceType="specialUse">
    <intent-filter>
        <action android:name="com.naman.quantallm.LLAMA_INFERENCE" />
    </intent-filter>
</service>

<activity
    android:name=".service.HeadlessInferenceActivity"
    android:exported="true"
    android:noHistory="true">
    <intent-filter>
        <action android:name="com.naman.quantallm.LAUNCH_INFERENCE_SERVICE" />
    </intent-filter>
</activity>`}</CodeBlock>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><span className="font-mono text-primary">android:exported="true"</span> — allows other apps to bind to the service</li>
        <li><span className="font-mono text-primary">android:foregroundServiceType="specialUse"</span> — required for foreground service on Android 14+</li>
        <li>The intent filter action <span className="font-mono text-primary">com.naman.quantallm.LLAMA_INFERENCE</span> can be used for implicit binding (though explicit is recommended)</li>
      </ul>

      {/* ──────────────────────────── 12. Thread Safety ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Thread Safety</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        AIDL calls arrive on threads from the Binder thread pool, meaning multiple clients can invoke
        service methods concurrently. QuantaLLM handles this at multiple levels:
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ModelEngine ReentrantLock</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <span className="font-mono text-primary">ModelEngine</span> uses a{' '}
        <span className="font-mono text-primary">ReentrantLock</span> to serialize access to the native
        llama.cpp context. Only one thread can perform inference at a time. Additional callers block on the
        lock until the current operation completes. This guarantees no data races in native memory.
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <span className="font-mono text-primary">loadModel()</span> acquires the lock for the duration of model loading
        </li>
        <li>
          <span className="font-mono text-primary">generate()</span> and <span className="font-mono text-primary">generateStreaming()</span> acquire
          the lock for the entire generation
        </li>
        <li>
          <span className="font-mono text-primary">abortGeneration()</span> sets an atomic flag checked by the
          native loop — does not require the lock
        </li>
        <li>
          <span className="font-mono text-primary">unloadModel()</span> acquires the lock and frees all native resources
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Callback Delivery Guarantees</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The service wraps every callback invocation in a try-catch block for{' '}
        <span className="font-mono text-primary">RemoteException</span>. If the client process dies mid-generation,
        the callback delivery fails silently — the service logs the error, removes the dead callback, and
        continues or aborts the current generation. This prevents the service from crashing due to a dead client.
      </p>
      <CodeBlock language="kotlin">{`// Inside LlamaInferenceService — safe callback delivery pattern
private fun deliverCallback(requestId: Int, block: (IInferenceCallback) -> Unit) {
    val callback = activeCallbacks[requestId] ?: return
    try {
        block(callback)
    } catch (e: RemoteException) {
        Log.w(TAG, "Client died, removing callback for request \$requestId")
        activeCallbacks.remove(requestId)
    }
}`}</CodeBlock>

      {/* ──────────────────────────── 13. Error Handling ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Error Handling</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Cross-process communication introduces failure modes that do not exist in single-process apps.
        You must handle these errors in every AIDL call:
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">RemoteException</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Thrown when the IPC call fails. This is the base exception for all Binder communication errors.
        Wrap every service method call in a try-catch:
      </p>
      <CodeBlock language="kotlin">{`try {
    val result = inferenceService?.generate(prompt, maxTokens, temp)
    // handle result
} catch (e: RemoteException) {
    Log.e(TAG, "IPC communication failed", e)
    // The service may still be alive — retry is usually safe
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">DeadObjectException</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        A subclass of <span className="font-mono text-primary">RemoteException</span> thrown when the service
        process has died. The Binder proxy is now invalid. You must re-bind to get a new connection:
      </p>
      <CodeBlock language="kotlin">{`try {
    inferenceService?.ping()
} catch (e: DeadObjectException) {
    Log.e(TAG, "Service process died — reconnecting")
    inferenceService = null
    isBound = false
    bindInferenceService()  // re-bind
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Service Disconnection Recovery</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Implement automatic reconnection with exponential backoff:
      </p>
      <CodeBlock language="kotlin">{`private var reconnectAttempts = 0
private val maxReconnectDelay = 30_000L  // 30 seconds

override fun onServiceDisconnected(name: ComponentName?) {
    inferenceService = null
    isBound = false

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s...
    val delay = minOf(1000L * (1L shl reconnectAttempts), maxReconnectDelay)
    reconnectAttempts++

    lifecycleScope.launch {
        delay(delay)
        if (!isBound) bindInferenceService()
    }
}

// Reset on successful connection
override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
    reconnectAttempts = 0
    // ... normal setup
}`}</CodeBlock>

      {/* ──────────────────────────── 14. Permissions & Security ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Permissions & Security</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The service is currently declared with <span className="font-mono text-primary">android:exported="true"</span> and
        no permission restrictions. This means <strong>any app</strong> on the device can bind to QuantaLLM and
        run inference.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Current Security Model</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>No custom permission is required to bind — any app can connect</li>
        <li>The service accepts any model path, including paths the calling app may not have access to</li>
        <li>No rate limiting is enforced on the AIDL interface</li>
        <li>The intent filter allows implicit binding via the action string</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Future Security Considerations</h3>
      <div className="bg-surface-container border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> For production deployments, consider adding signature-level permission
          checks, validating model file paths, rate limiting requests per UID, and implementing a custom
          permission in the manifest to restrict which apps can bind.
        </p>
      </div>
      <CodeBlock language="xml">{`<!-- Future: Restrict binding to apps signed with the same key -->
<service
    android:name=".service.LlamaInferenceService"
    android:exported="true"
    android:permission="com.naman.quantallm.permission.BIND_INFERENCE"
    android:foregroundServiceType="specialUse">
    ...
</service>

<!-- Declare the permission -->
<permission
    android:name="com.naman.quantallm.permission.BIND_INFERENCE"
    android:protectionLevel="signature" />`}</CodeBlock>

      {/* ──────────────────────────── 15. Best Practices ──────────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Best Practices</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Connection Management</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Bind early, unbind late:</strong> Bind in <span className="font-mono text-primary">onCreate()</span> and
          unbind in <span className="font-mono text-primary">onDestroy()</span>. Do not bind/unbind in onResume/onPause
          as this causes excessive service restarts.
        </li>
        <li>
          <strong>Check binding state:</strong> Always check <span className="font-mono text-primary">isBound</span> and
          null-check the service reference before calling methods.
        </li>
        <li>
          <strong>Handle disconnection:</strong> Implement automatic reconnection with backoff in{' '}
          <span className="font-mono text-primary">onServiceDisconnected</span>.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Model Lifecycle</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Preload models:</strong> Call <span className="font-mono text-primary">loadModel()</span> as
          soon as the service is connected, not when the user taps "Generate".
        </li>
        <li>
          <strong>Check before loading:</strong> Call <span className="font-mono text-primary">isModelLoaded()</span> first
          to avoid redundant loads.
        </li>
        <li>
          <strong>Unload when done:</strong> If your app goes to the background for extended periods, consider calling{' '}
          <span className="font-mono text-primary">unloadModel()</span> to free memory for other apps.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generation</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Prefer async:</strong> Use <span className="font-mono text-primary">generateAsync()</span> over{' '}
          <span className="font-mono text-primary">generate()</span> to avoid blocking the Binder thread pool and
          to get streaming token updates.
        </li>
        <li>
          <strong>Cancel on exit:</strong> Always cancel in-progress generation when the user navigates away or
          the Activity is destroyed.
        </li>
        <li>
          <strong>Respect the lock:</strong> If <span className="font-mono text-primary">generate()</span> seems
          to hang, it may be waiting on the <span className="font-mono text-primary">ReentrantLock</span> because
          another client is generating. Use <span className="font-mono text-primary">ping()</span> to verify service
          health before assuming a deadlock.
        </li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Memory Management</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Monitor memory:</strong> Large GGUF models can consume 2-8 GB of RAM. Ensure the device has
          sufficient available memory before loading.
        </li>
        <li>
          <strong>Use appropriate thread count:</strong> Pass <span className="font-mono text-primary">0</span> to{' '}
          <span className="font-mono text-primary">loadModel()</span> for auto-detection, or limit threads on
          lower-end devices to avoid thermal throttling.
        </li>
        <li>
          <strong>Handle OOM gracefully:</strong> If <span className="font-mono text-primary">loadModel()</span> returns
          a memory error, try a smaller quantization (e.g. Q2_K instead of Q4_K_M).
        </li>
      </ul>

      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> Use <span className="font-mono text-primary">getVersion()</span> to check
          the service version at connection time. This allows your client app to handle API differences
          between QuantaLLM versions gracefully.
        </p>
      </div>
    </div>
  );
}
