import CodeBlock from '../CodeBlock';

export default function BuildFromSource() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Build from Source</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        A comprehensive guide to building QuantaLLM from source — covering environment setup, Gradle and CMake
        configuration, native library compilation, ONNX Runtime integration, signing, and troubleshooting.
      </p>

      {/* ─────────────────────── 1. Prerequisites ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Prerequisites</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Before you begin, make sure every tool listed below is installed at the <strong>exact version</strong> (or
        newer where noted). Version mismatches — especially for the NDK and CMake — are the single most common
        source of build failures.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Tool</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Required Version</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Download</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Notes</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Android Studio</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Hedgehog 2023.1.1+</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><a href="https://developer.android.com/studio" className="text-primary underline">developer.android.com/studio</a></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Includes Gradle wrapper, SDK Manager, and device emulator.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">JDK</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">17 (LTS)</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><a href="https://adoptium.net/" className="text-primary underline">adoptium.net</a></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Android Gradle Plugin 8.x requires JDK 17. JDK 21 also works.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Android SDK</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">API 36</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SDK Manager</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">compileSdk = 36</code> and <code className="font-mono text-primary">targetSdk = 36</code>.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">NDK</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">26.3.11579264</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SDK Manager &rarr; SDK Tools</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Must match exactly. Check "Show Package Details" in SDK Manager to pick this revision.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">CMake</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3.22.1</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">SDK Manager &rarr; SDK Tools</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Declared in <code className="font-mono text-primary">externalNativeBuild.cmake.version</code>.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Git</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2.30+</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><a href="https://git-scm.com/" className="text-primary underline">git-scm.com</a></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Needed for cloning and submodule operations.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-semibold">Physical Device</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">arm64-v8a, API 31+</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">—</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">x86 emulators will not work — native libs are arm64-only.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container border-l-4 border-tertiary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Tip</p>
        <p className="text-on-surface-variant text-sm">
          You can install the NDK and CMake without opening Android Studio by running{' '}
          <code className="font-mono text-primary">sdkmanager "ndk;26.3.11579264" "cmake;3.22.1"</code> from the
          command line. Make sure <code className="font-mono text-primary">ANDROID_HOME</code> is set first.
        </p>
      </div>

      {/* ─────────────────────── 2. Clone & Initial Setup ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Clone &amp; Initial Setup</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Cloning the Repository</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Start by cloning the main repository. The <code className="font-mono text-primary">--recurse-submodules</code> flag
        ensures the vendored llama.cpp headers are pulled in automatically.
      </p>
      <CodeBlock language="bash">{`git clone --recurse-submodules https://github.com/NaMan6122/QuantaLLM2.git
cd QuantaLLM2`}</CodeBlock>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        If you already cloned without submodules, initialize them manually:
      </p>
      <CodeBlock language="bash">{`git submodule update --init --recursive`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Opening in Android Studio</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Open Android Studio and select <strong>File &rarr; Open</strong>, then navigate to the cloned{' '}
        <code className="font-mono text-primary">QuantaLLM2</code> directory. Android Studio will detect the Gradle
        wrapper and begin syncing. During the first sync it may prompt you to install missing SDK components — accept
        all prompts.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Environment Variables</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Ensure the following environment variables are set in your shell profile
        (<code className="font-mono text-primary">~/.zshrc</code>, <code className="font-mono text-primary">~/.bashrc</code>, etc.):
      </p>
      <CodeBlock language="bash">{`export ANDROID_HOME="$HOME/Android/Sdk"        # Linux
export ANDROID_HOME="$HOME/Library/Android/sdk" # macOS
export NDK="$ANDROID_HOME/ndk/26.3.11579264"
export PATH="$ANDROID_HOME/platform-tools:$PATH"`}</CodeBlock>

      {/* ─────────────────────── 3. Project Structure ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Project Structure</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The annotated tree below explains the purpose of every significant directory and file in the repository.
      </p>
      <CodeBlock language="text">{`QuantaLLM2/
├── app/                                 # Application module
│   ├── src/main/
│   │   ├── java/com/naman/quantallm/   # Kotlin source code
│   │   │   ├── MainActivity.kt         # Entry point — hosts Compose UI
│   │   │   ├── LlamaViewModel.kt       # ViewModel managing inference state
│   │   │   ├── engine/                  # Inference engine abstraction layer
│   │   │   │   ├── InferenceEngine.kt   # Interface — common contract
│   │   │   │   ├── ModelEngine.kt       # Factory / routing logic
│   │   │   │   ├── LlamaCppEngine.kt    # llama.cpp backend via JNI
│   │   │   │   └── OnnxRuntimeEngine.kt # ONNX Runtime GenAI backend
│   │   │   ├── jni/
│   │   │   │   └── LlamaJni.kt         # Kotlin external declarations (JNI bridge)
│   │   │   └── service/
│   │   │       └── InferenceService.kt  # Foreground service for background inference
│   │   ├── aidl/com/naman/quantallm/   # AIDL interface definitions
│   │   ├── jni/                         # Native (C++) layer
│   │   │   ├── CMakeLists.txt           # CMake build script for JNI bridge
│   │   │   ├── llama_jni.cpp            # JNI implementation (C++ ↔ Kotlin)
│   │   │   ├── jniLibs/arm64-v8a/       # Prebuilt shared libraries
│   │   │   │   ├── libllama.so          # Core llama.cpp runtime
│   │   │   │   ├── libggml.so           # GGML tensor library
│   │   │   │   ├── libggml-base.so      # GGML base utilities
│   │   │   │   └── libggml-cpu.so       # GGML CPU backend
│   │   │   └── llama.cpp/               # llama.cpp submodule (headers only)
│   │   │       ├── include/             # Public headers (llama.h, etc.)
│   │   │       └── ggml/include/        # GGML headers (ggml.h, etc.)
│   │   ├── res/                         # Android resources (layouts, drawables, etc.)
│   │   └── AndroidManifest.xml          # App permissions & component declarations
│   ├── libs/
│   │   └── onnxruntime-genai-android-0.12.2.aar  # Local ONNX Runtime GenAI library
│   └── build.gradle.kts                 # App-level Gradle build script
├── build.gradle.kts                     # Root-level Gradle build script
├── settings.gradle.kts                  # Module & plugin repository declarations
├── gradle.properties                    # JVM args, AndroidX migration flags
├── gradle/
│   └── libs.versions.toml               # Version catalog (dependency versions)
└── docs/                                # Documentation assets`}</CodeBlock>

      {/* ─────────────────────── 4. Understanding the Build System ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Understanding the Build System</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM uses <strong>Gradle Kotlin DSL</strong> (<code className="font-mono text-primary">.gradle.kts</code>) for
        all build scripts. Compared to the older Groovy DSL, Kotlin DSL gives you full IDE autocompletion, type safety,
        and compile-time checking.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Version Catalog</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Dependency versions are centralized in <code className="font-mono text-primary">gradle/libs.versions.toml</code>.
        The <code className="font-mono text-primary">libs.plugins.*</code> and <code className="font-mono text-primary">libs.*</code> accessors
        you see in <code className="font-mono text-primary">build.gradle.kts</code> are generated from this file. This
        approach avoids scattering version strings across multiple build files.
      </p>
      <CodeBlock language="toml">{`# Example structure of gradle/libs.versions.toml
[versions]
agp = "8.7.0"
kotlin = "2.1.0"
compose-bom = "2024.12.01"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
# ... more libraries

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Plugin Ecosystem</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The project applies five Gradle plugins, each serving a distinct role:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><code className="font-mono text-primary">com.android.application</code> — Android application plugin; produces an APK/AAB.</li>
        <li><code className="font-mono text-primary">org.jetbrains.kotlin.android</code> — Kotlin compiler integration for Android.</li>
        <li><code className="font-mono text-primary">org.jetbrains.kotlin.plugin.compose</code> — Enables the Compose compiler plugin for <code className="font-mono text-primary">@Composable</code> functions.</li>
        <li><code className="font-mono text-primary">org.jetbrains.kotlin.plugin.serialization</code> — Generates serializers for <code className="font-mono text-primary">@Serializable</code> data classes.</li>
      </ul>

      {/* ─────────────────────── 5. Gradle Configuration Deep Dive ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Gradle Configuration Deep Dive</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Below is the complete app-level <code className="font-mono text-primary">build.gradle.kts</code> with every
        section annotated.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Plugins Block</h3>
      <CodeBlock language="kotlin">{`plugins {
    alias(libs.plugins.android.application)    // Android app plugin from version catalog
    alias(libs.plugins.kotlin.android)          // Kotlin Android compiler
    alias(libs.plugins.kotlin.compose)          // Compose compiler plugin
    alias(libs.plugins.kotlinx.serialization)   // kotlinx.serialization codegen
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The <code className="font-mono text-primary">alias()</code> function resolves plugin coordinates from the version
        catalog, keeping the build file free of hardcoded version strings.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Android Block — Namespace &amp; SDK Versions</h3>
      <CodeBlock language="kotlin">{`android {
    namespace = "com.naman.quantallm"   // R class package; replaces applicationId for resource namespacing
    compileSdk = 36                      // Compile against API 36 headers
    ndkVersion = "26.3.11579264"         // Pin exact NDK revision for reproducible native builds
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="font-mono text-primary">compileSdk</code> controls which Android APIs are visible at compile time.
        It does not affect runtime behavior — that is governed by <code className="font-mono text-primary">minSdk</code> and
        the device's OS version. Pinning <code className="font-mono text-primary">ndkVersion</code> to an exact string
        (not just the major version) ensures every developer and CI machine uses identical native toolchains.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">defaultConfig</h3>
      <CodeBlock language="kotlin">{`defaultConfig {
    applicationId = "com.naman.quantallm"  // Unique package name on Google Play
    minSdk = 31                             // Android 12 — minimum supported OS
    targetSdk = 36                          // Declare compliance with API 36 behavior changes
    versionCode = 10100                     // Integer version for Play Store ordering
    versionName = "1.1.0"                   // Human-readable version string
    ndk { abiFilters += listOf("arm64-v8a") }  // Ship only 64-bit ARM
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        <code className="font-mono text-primary">minSdk = 31</code> restricts installation to Android 12 and above.
        This is required because the app uses APIs introduced in API 31 (e.g., foreground service types).
        The <code className="font-mono text-primary">abiFilters</code> setting restricts the APK to arm64-v8a only,
        which reduces APK size by excluding x86/x86_64/armeabi-v7a libraries that would never run on the target hardware.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">CMake Flags (externalNativeBuild)</h3>
      <CodeBlock language="kotlin">{`externalNativeBuild {
    cmake {
        cppFlags += listOf(
            "-std=c++17",                               // C++17 standard
            "-O3",                                      // Maximum optimization
            "-DNDEBUG",                                 // Disable assert() in release
            "-ffast-math",                              // Aggressive FP optimizations
            "-flto",                                    // Link-time optimization
            "-march=armv8.6-a+dotprod+i8mm+bf16+fp16",  // Target ARMv8.6 ISA extensions
            "-mtune=cortex-a76",                        // Tune for Cortex-A76 micro-arch
            "-DLLAMA_NATIVE=ON"                         // Enable native CPU detection in llama.cpp
        )
        arguments += listOf(
            "-DANDROID_STL=c++_static",                 // Statically link libc++ (no runtime dep)
            "-DANDROID_PLATFORM=android-31",            // Match minSdk
            "-DANDROID_LD_FLAGS=-Wl,-z,max-page-size=16384",  // 16 KB page alignment
            "-DGGML_USE_ARM_DOTPROD=ON",                // ARM dot product instructions
            "-DGGML_USE_ARM_FP16=ON",                   // ARM half-precision float
            "-DGGML_USE_ARM_I8MM=ON",                   // ARM int8 matrix multiply
            "-DLLAMA_BLAS=ON",                          // Enable BLAS acceleration
            "-DLLAMA_BLAS_VENDOR=OpenBLAS"              // Use OpenBLAS as BLAS provider
        )
    }
}`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">C++ Flags Explained</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Flag</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-std=c++17</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">llama.cpp requires C++17 features (structured bindings, <code className="font-mono text-primary">std::optional</code>, etc.).</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-O3</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables aggressive loop unrolling, vectorization, and inlining for maximum throughput.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-DNDEBUG</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Disables <code className="font-mono text-primary">assert()</code> macros. Mandatory for production builds.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-ffast-math</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Allows the compiler to reorder FP operations. Improves performance at the cost of strict IEEE 754 compliance.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-flto</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Link-time optimization — enables cross-TU inlining and dead code elimination.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-march=armv8.6-a+...</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Targets ARMv8.6 with dot-product, int8 matrix multiply, bfloat16, and fp16 extensions for fast quantized inference.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">-mtune=cortex-a76</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Tunes instruction scheduling for the Cortex-A76 micro-architecture (common in Snapdragon 855+).</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">CMake Arguments Explained</h4>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Argument</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">ANDROID_STL=c++_static</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Statically links libc++ into each native library, avoiding runtime version conflicts.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">ANDROID_PLATFORM=android-31</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Matches <code className="font-mono text-primary">minSdk</code> — the native code only uses APIs available since API 31.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">max-page-size=16384</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Aligns ELF segments to 16 KB pages, required for devices that ship with 16 KB page kernels (Android 15+).</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">GGML_USE_ARM_DOTPROD</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables SDOT/UDOT instructions for faster int8 dot products during quantized matrix multiplies.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">GGML_USE_ARM_FP16</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Uses native half-precision arithmetic, doubling throughput for fp16 models.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">GGML_USE_ARM_I8MM</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables SMMLA/UMMLA instructions for 8-bit integer matrix multiplication (ARMv8.6).</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">LLAMA_BLAS=ON</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Enables BLAS-accelerated matrix operations for prompt processing.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Build Types</h3>
      <CodeBlock language="kotlin">{`buildTypes {
    release {
        isMinifyEnabled = false                // R8/ProGuard disabled — JNI + reflection sensitive
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
        signingConfig = signingConfigs.getByName("release")
    }
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Code shrinking (<code className="font-mono text-primary">isMinifyEnabled</code>) is intentionally disabled.
        R8 can strip JNI method signatures and <code className="font-mono text-primary">@Serializable</code> classes
        that are accessed reflectively. If you choose to enable it, you must add comprehensive ProGuard keep rules
        for all JNI entry points and serialization classes.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Build Features</h3>
      <CodeBlock language="kotlin">{`buildFeatures {
    compose = true    // Enable Jetpack Compose UI toolkit
    prefab = true     // Consume native libraries from AARs via CMake
    aidl = true       // Generate Java stubs from .aidl interface files
}`}</CodeBlock>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>compose</strong> — Activates the Compose compiler. Without this, <code className="font-mono text-primary">@Composable</code> annotations produce compile errors.</li>
        <li><strong>prefab</strong> — Allows CMake to find native libraries shipped inside AARs (used by ONNX Runtime).</li>
        <li><strong>aidl</strong> — Enables AIDL compilation so the build generates Java/Kotlin stubs for IPC interfaces.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Packaging</h3>
      <CodeBlock language="kotlin">{`packaging {
    jniLibs { useLegacyPackaging = true }
}`}</CodeBlock>
      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Why useLegacyPackaging?</p>
        <p className="text-on-surface-variant text-sm">
          By default, AGP 8+ compresses <code className="font-mono text-primary">.so</code> files inside the APK and
          extracts them at install time. Setting <code className="font-mono text-primary">useLegacyPackaging = true</code> stores
          them uncompressed on the filesystem instead. This is required for llama.cpp's <code className="font-mono text-primary">mmap()</code>-based
          model loading and for any DSP backend (e.g., Hexagon FastRPC) that needs direct filesystem access.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Dependencies</h3>
      <CodeBlock language="kotlin">{`dependencies {
    implementation(libs.androidx.core.ktx)                    // Kotlin extensions for Android APIs
    implementation(libs.androidx.lifecycle.runtime.ktx)       // Lifecycle-aware coroutine scopes
    implementation(libs.androidx.activity.compose)            // ComponentActivity integration for Compose
    implementation(platform(libs.androidx.compose.bom))       // Compose Bill of Materials (BOM)
    implementation(libs.androidx.compose.ui)                  // Core Compose UI
    implementation(libs.androidx.compose.ui.graphics)         // Graphics primitives
    implementation(libs.androidx.compose.ui.tooling.preview)  // @Preview support
    implementation(libs.androidx.compose.material3)           // Material 3 components
    implementation(libs.kotlinx.serialization.json)           // JSON serialization
    implementation(libs.onnxruntime.android)                  // ONNX Runtime (from Maven)
    implementation(files("libs/onnxruntime-genai-android-0.12.2.aar"))  // ONNX Runtime GenAI (local)
}`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The Compose BOM (<code className="font-mono text-primary">platform()</code>) pins all Compose library versions
        to a tested, compatible set. This means you never specify individual Compose artifact versions — the BOM
        handles it.
      </p>

      {/* ─────────────────────── 6. CMake Configuration Deep Dive ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">CMake Configuration Deep Dive</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The CMake script at <code className="font-mono text-primary">app/src/main/jni/CMakeLists.txt</code> builds only the
        JNI bridge library (<code className="font-mono text-primary">libllama_jni.so</code>). The heavy llama.cpp and GGML
        libraries are linked as prebuilt shared objects.
      </p>
      <CodeBlock language="cmake">{`cmake_minimum_required(VERSION 3.22.1)
project(llama_jni CXX)

# ── Resolve prebuilt library paths ──────────────────────────────
set(JNI_LIB_DIR \${CMAKE_SOURCE_DIR}/jniLibs/\${ANDROID_ABI})

# Import prebuilt shared libraries (no source compilation)
add_library(llama SHARED IMPORTED)
set_target_properties(llama PROPERTIES
    IMPORTED_LOCATION \${JNI_LIB_DIR}/libllama.so)

add_library(ggml SHARED IMPORTED)
set_target_properties(ggml PROPERTIES
    IMPORTED_LOCATION \${JNI_LIB_DIR}/libggml.so)

add_library(ggml-base SHARED IMPORTED)
set_target_properties(ggml-base PROPERTIES
    IMPORTED_LOCATION \${JNI_LIB_DIR}/libggml-base.so)

add_library(ggml-cpu SHARED IMPORTED)
set_target_properties(ggml-cpu PROPERTIES
    IMPORTED_LOCATION \${JNI_LIB_DIR}/libggml-cpu.so)

# ── JNI bridge library ─────────────────────────────────────────
add_library(llama_jni SHARED llama_jni.cpp)

target_include_directories(llama_jni PRIVATE
    \${CMAKE_SOURCE_DIR}/llama.cpp/include       # llama.h
    \${CMAKE_SOURCE_DIR}/llama.cpp/ggml/include  # ggml.h
)

target_link_libraries(llama_jni
    llama ggml ggml-base ggml-cpu   # Link prebuilt inference libs
    log                              # Android logging (android/log.h)
    dl                               # dlopen/dlsym for dynamic loading
)

# 16 KB page alignment for Android 15+ compatibility
target_link_options(llama_jni PRIVATE -Wl,-z,max-page-size=16384)`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Key Concepts</h4>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>IMPORTED libraries</strong> — CMake does not compile these; it just records their filesystem location so the linker can resolve symbols at link time.</li>
        <li><strong>JNI_LIB_DIR</strong> — Uses <code className="font-mono text-primary">ANDROID_ABI</code> (set by Gradle to <code className="font-mono text-primary">arm64-v8a</code>) to locate the correct prebuilt libraries.</li>
        <li><strong>Include paths</strong> — Point to the llama.cpp submodule headers. These must match the version used to compile the prebuilt <code className="font-mono text-primary">.so</code> files.</li>
        <li><strong>log and dl</strong> — <code className="font-mono text-primary">liblog</code> provides <code className="font-mono text-primary">__android_log_print()</code>; <code className="font-mono text-primary">libdl</code> provides <code className="font-mono text-primary">dlopen()</code> for optional runtime library loading.</li>
        <li><strong>16 KB page size</strong> — The <code className="font-mono text-primary">max-page-size=16384</code> linker flag ensures ELF segment alignment is compatible with 16 KB page-size kernels shipping on newer Android devices.</li>
      </ul>

      {/* ─────────────────────── 7. Native Library Management ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Native Library Management</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The four prebuilt <code className="font-mono text-primary">.so</code> files in{' '}
        <code className="font-mono text-primary">jniLibs/arm64-v8a/</code> are the compiled output of llama.cpp and GGML.
        They are checked into the repository for convenience so that contributors do not need to set up a native
        cross-compilation toolchain.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Library Roles</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Library</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Role</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">libllama.so</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Core inference engine — model loading, tokenization, sampling, KV cache management.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">libggml.so</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">GGML tensor library — graph construction, operator dispatch, memory management.</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">libggml-base.so</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Base utilities shared across all GGML backends (type conversions, quantization tables).</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">libggml-cpu.so</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">CPU compute backend — NEON/SVE kernels, thread pool, BLAS integration.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Updating Prebuilt Libraries</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When you rebuild llama.cpp (see next section), copy the resulting <code className="font-mono text-primary">.so</code> files
        into the correct location:
      </p>
      <CodeBlock language="bash">{`# After building llama.cpp (see below)
cp build-android/src/libllama.so         app/src/main/jni/jniLibs/arm64-v8a/
cp build-android/ggml/src/libggml.so     app/src/main/jni/jniLibs/arm64-v8a/
cp build-android/ggml/src/libggml-base.so app/src/main/jni/jniLibs/arm64-v8a/
cp build-android/ggml/src/libggml-cpu.so app/src/main/jni/jniLibs/arm64-v8a/`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-error p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Warning</p>
        <p className="text-on-surface-variant text-sm">
          The prebuilt <code className="font-mono text-primary">.so</code> files and the llama.cpp submodule headers must be
          from the <strong>same commit</strong>. Mismatched versions cause undefined behavior — symbol resolution may
          succeed but structs may have different layouts, leading to memory corruption.
        </p>
      </div>

      {/* ─────────────────────── 8. Building llama.cpp from Source ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Building llama.cpp from Source</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Follow these steps to cross-compile llama.cpp for Android using the NDK toolchain. This is only necessary
        if you want to modify llama.cpp, enable additional backends, or upgrade to a newer version.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 1: Set Environment Variables</h3>
      <CodeBlock language="bash">{`export ANDROID_HOME="$HOME/Library/Android/sdk"   # or $HOME/Android/Sdk on Linux
export NDK="$ANDROID_HOME/ndk/26.3.11579264"
export TOOLCHAIN="$NDK/build/cmake/android.toolchain.cmake"`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 2: Navigate to the llama.cpp Submodule</h3>
      <CodeBlock language="bash">{`cd app/src/main/jni/llama.cpp`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 3: Configure with CMake</h3>
      <CodeBlock language="bash">{`mkdir build-android && cd build-android

cmake .. \\
  -DCMAKE_TOOLCHAIN_FILE="$TOOLCHAIN" \\
  -DCMAKE_BUILD_TYPE=Release \\
  -DANDROID_ABI=arm64-v8a \\
  -DANDROID_PLATFORM=android-31 \\
  -DANDROID_STL=c++_static \\
  -DCMAKE_C_FLAGS="-march=armv8.6-a+dotprod+i8mm+bf16+fp16 -O3 -ffast-math -flto" \\
  -DCMAKE_CXX_FLAGS="-std=c++17 -march=armv8.6-a+dotprod+i8mm+bf16+fp16 -O3 -ffast-math -flto" \\
  -DCMAKE_EXE_LINKER_FLAGS="-Wl,-z,max-page-size=16384" \\
  -DCMAKE_SHARED_LINKER_FLAGS="-Wl,-z,max-page-size=16384" \\
  -DGGML_USE_ARM_DOTPROD=ON \\
  -DGGML_USE_ARM_FP16=ON \\
  -DGGML_USE_ARM_I8MM=ON \\
  -DLLAMA_NATIVE=ON \\
  -DLLAMA_BLAS=ON \\
  -DLLAMA_BLAS_VENDOR=OpenBLAS \\
  -DBUILD_SHARED_LIBS=ON`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 4: Build</h3>
      <CodeBlock language="bash">{`cmake --build . --config Release -j$(nproc)`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 5: Copy Libraries</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Copy the built <code className="font-mono text-primary">.so</code> files to the project's{' '}
        <code className="font-mono text-primary">jniLibs</code> directory (see "Updating Prebuilt Libraries" above).
        Then update the llama.cpp submodule pointer if you changed the commit:
      </p>
      <CodeBlock language="bash">{`cd ../..  # back to project root
git add app/src/main/jni/llama.cpp
git add app/src/main/jni/jniLibs/arm64-v8a/
git commit -m "Update llama.cpp to <commit-hash>"`}</CodeBlock>

      {/* ─────────────────────── 9. ONNX Runtime Setup ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">ONNX Runtime Setup</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM uses two ONNX Runtime packages:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>onnxruntime-android</strong> (from Maven) — The base ONNX Runtime inference engine, resolved via the version catalog.</li>
        <li><strong>onnxruntime-genai-android</strong> (local AAR) — The Generative AI extension for ONNX Runtime. This is a local file because the GenAI package is not yet published to Maven Central.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Why a Local AAR?</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The ONNX Runtime GenAI Android package (<code className="font-mono text-primary">onnxruntime-genai-android-0.12.2.aar</code>)
        is distributed as a standalone AAR from the{' '}
        <a href="https://github.com/microsoft/onnxruntime-genai/releases" className="text-primary underline">
          onnxruntime-genai GitHub releases page
        </a>. It is not published to Maven Central, so it must be included as a local file dependency.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Updating the ONNX Runtime GenAI Version</h3>
      <CodeBlock language="bash">{`# 1. Download the new AAR from GitHub releases
wget https://github.com/microsoft/onnxruntime-genai/releases/download/v0.13.0/onnxruntime-genai-android-0.13.0.aar

# 2. Replace the old AAR
mv onnxruntime-genai-android-0.13.0.aar app/libs/

# 3. Remove the old version
rm app/libs/onnxruntime-genai-android-0.12.2.aar

# 4. Update build.gradle.kts to reference the new filename
# Change: implementation(files("libs/onnxruntime-genai-android-0.12.2.aar"))
# To:     implementation(files("libs/onnxruntime-genai-android-0.13.0.aar"))`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Info</p>
        <p className="text-on-surface-variant text-sm">
          The base <code className="font-mono text-primary">onnxruntime-android</code> dependency from Maven and the local
          GenAI AAR must be version-compatible. Check the onnxruntime-genai release notes for the required base
          runtime version.
        </p>
      </div>

      {/* ─────────────────────── 10. AIDL Compilation ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">AIDL Compilation</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        AIDL (Android Interface Definition Language) defines IPC interfaces for communication between the app's
        main process and the <code className="font-mono text-primary">InferenceService</code> running in a separate process.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">How It Works</h3>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>AIDL files live in <code className="font-mono text-primary">app/src/main/aidl/com/naman/quantallm/</code>.</li>
        <li>When <code className="font-mono text-primary">aidl = true</code> is set in <code className="font-mono text-primary">buildFeatures</code>, the Android Gradle Plugin automatically invokes the <code className="font-mono text-primary">aidl</code> compiler during the build.</li>
        <li>The compiler generates Java stub classes (<code className="font-mono text-primary">Stub</code> and <code className="font-mono text-primary">Proxy</code>) that handle marshalling/unmarshalling of method arguments across process boundaries.</li>
        <li>Generated sources are placed in <code className="font-mono text-primary">app/build/generated/aidl_source_output_dir/</code>.</li>
      </ul>

      <div className="bg-surface-container border-l-4 border-tertiary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Tip</p>
        <p className="text-on-surface-variant text-sm">
          If you modify an AIDL file, run <code className="font-mono text-primary">./gradlew clean</code> before rebuilding.
          Incremental builds sometimes fail to regenerate AIDL stubs correctly.
        </p>
      </div>

      {/* ─────────────────────── 11. Build Variants ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Build Variants</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM ships with two standard build types: <strong>debug</strong> and <strong>release</strong>.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Property</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Debug</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Release</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Debuggable</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Yes</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">No</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Code Shrinking (R8)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Disabled</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Disabled (configurable)</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Signing</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Auto-generated debug keystore</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Custom release keystore required</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Native Optimization</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Same flags (always -O3)</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Same flags (always -O3)</td></tr>
            <tr><td className="border-b border-outline-variant/20 py-3 px-4 text-sm">APK Suffix</td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">app-debug.apk</code></td><td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">app-release.apk</code></td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">ProGuard / R8 Considerations</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        If you decide to enable R8 (<code className="font-mono text-primary">isMinifyEnabled = true</code>), you must
        add keep rules to prevent stripping of:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>JNI native method declarations in <code className="font-mono text-primary">LlamaJni.kt</code></li>
        <li><code className="font-mono text-primary">@Serializable</code> data classes used by kotlinx.serialization</li>
        <li>AIDL-generated stub and proxy classes</li>
        <li>ONNX Runtime internal reflection targets</li>
      </ul>
      <CodeBlock language="kotlin">{`# Example proguard-rules.pro additions
-keep class com.naman.quantallm.jni.LlamaJni { *; }
-keep class com.naman.quantallm.**.I*.** { *; }  # AIDL interfaces
-keepclassmembers class * {
    @kotlinx.serialization.Serializable *;
}`}</CodeBlock>

      {/* ─────────────────────── 12. Signing for Release ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Signing for Release</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Creating a Keystore</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Generate a new release keystore using <code className="font-mono text-primary">keytool</code>:
      </p>
      <CodeBlock language="bash">{`keytool -genkey -v \\
  -keystore quantallm-release.jks \\
  -keyalg RSA \\
  -keysize 2048 \\
  -validity 10000 \\
  -alias quantallm \\
  -storepass <your-store-password> \\
  -keypass <your-key-password>`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-error p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Warning</p>
        <p className="text-on-surface-variant text-sm">
          Never commit your keystore or passwords to version control. Add <code className="font-mono text-primary">*.jks</code> and
          <code className="font-mono text-primary">*.keystore</code> to your <code className="font-mono text-primary">.gitignore</code>.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Signing Config in Gradle</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The recommended approach uses environment variables so secrets never appear in source code:
      </p>
      <CodeBlock language="kotlin">{`android {
    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("QUANTALLM_KEYSTORE_PATH") ?: "keystore.jks")
            storePassword = System.getenv("QUANTALLM_STORE_PASSWORD") ?: ""
            keyAlias = System.getenv("QUANTALLM_KEY_ALIAS") ?: "quantallm"
            keyPassword = System.getenv("QUANTALLM_KEY_PASSWORD") ?: ""
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Setting Environment Variables</h3>
      <CodeBlock language="bash">{`# Add to ~/.zshrc or ~/.bashrc (do NOT commit this)
export QUANTALLM_KEYSTORE_PATH="/path/to/quantallm-release.jks"
export QUANTALLM_STORE_PASSWORD="your-store-password"
export QUANTALLM_KEY_ALIAS="quantallm"
export QUANTALLM_KEY_PASSWORD="your-key-password"`}</CodeBlock>

      {/* ─────────────────────── 13. Building and Installing ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Building and Installing</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Debug Build</h3>
      <CodeBlock language="bash">{`./gradlew assembleDebug`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Output: <code className="font-mono text-primary">app/build/outputs/apk/debug/app-debug.apk</code>
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Release Build</h3>
      <CodeBlock language="bash">{`./gradlew assembleRelease`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Output: <code className="font-mono text-primary">app/build/outputs/apk/release/app-release.apk</code>
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Release Bundle (for Play Store)</h3>
      <CodeBlock language="bash">{`./gradlew bundleRelease`}</CodeBlock>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Output: <code className="font-mono text-primary">app/build/outputs/bundle/release/app-release.aab</code>
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Installing via ADB</h3>
      <CodeBlock language="bash">{`# USB connection
adb install -r app/build/outputs/apk/debug/app-debug.apk

# If multiple devices are connected, specify the serial number
adb -s <device-serial> install -r app/build/outputs/apk/debug/app-debug.apk

# One-step build + install
./gradlew installDebug`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Wireless Debugging (Android 11+)</h3>
      <CodeBlock language="bash">{`# 1. Enable "Wireless debugging" in Developer Options on your device
# 2. Tap "Pair device with pairing code"
adb pair <ip>:<port>
# Enter the pairing code shown on the device

# 3. Connect
adb connect <ip>:<port>

# 4. Install normally
adb install -r app/build/outputs/apk/debug/app-debug.apk`}</CodeBlock>

      {/* ─────────────────────── 14. Running Tests ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Running Tests</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Run unit tests and instrumented tests with:
      </p>
      <CodeBlock language="bash">{`# Local unit tests (JVM)
./gradlew testDebugUnitTest

# Instrumented tests (requires connected device or emulator)
./gradlew connectedDebugAndroidTest

# Run a specific test class
./gradlew testDebugUnitTest --tests "com.naman.quantallm.SomeTestClass"`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-tertiary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Tip</p>
        <p className="text-on-surface-variant text-sm">
          Since QuantaLLM targets arm64-v8a only, instrumented tests must run on a physical arm64 device
          — x86 emulators will fail to load the native libraries.
        </p>
      </div>

      {/* ─────────────────────── 15. Customization Guide ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Customization Guide</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Changing Default Thread Count</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The number of inference threads is controlled in <code className="font-mono text-primary">LlamaCppEngine.kt</code>.
        Look for the thread parameter passed to the JNI call and adjust it to match your target device's core count.
        A good default is the number of performance cores (typically 4 on big.LITTLE SoCs).
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Adding a New Backend</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        To add a new inference backend:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Create a new class implementing <code className="font-mono text-primary">InferenceEngine</code>.</li>
        <li>Register it in <code className="font-mono text-primary">ModelEngine.kt</code>'s factory/routing logic.</li>
        <li>If the backend requires native code, add a new <code className="font-mono text-primary">.cpp</code> file alongside{' '}
          <code className="font-mono text-primary">llama_jni.cpp</code> and update <code className="font-mono text-primary">CMakeLists.txt</code>.</li>
        <li>If the backend ships as an AAR, place it in <code className="font-mono text-primary">app/libs/</code> and add a{' '}
          <code className="font-mono text-primary">files()</code> dependency.</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Modifying Native Code (llama_jni.cpp)</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The JNI bridge in <code className="font-mono text-primary">llama_jni.cpp</code> maps Kotlin{' '}
        <code className="font-mono text-primary">external fun</code> declarations to C++ implementations. When adding
        a new JNI method:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Add the <code className="font-mono text-primary">external fun</code> declaration in <code className="font-mono text-primary">LlamaJni.kt</code>.</li>
        <li>Implement the corresponding <code className="font-mono text-primary">JNIEXPORT</code> function in <code className="font-mono text-primary">llama_jni.cpp</code>. The function name must follow JNI naming conventions: <code className="font-mono text-primary">Java_com_naman_quantallm_jni_LlamaJni_methodName</code>.</li>
        <li>Rebuild by running <code className="font-mono text-primary">./gradlew assembleDebug</code> — Gradle will invoke CMake automatically.</li>
      </ul>

      {/* ─────────────────────── 16. CI/CD Considerations ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">CI/CD Considerations</h2>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Headless Builds</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        For CI environments (GitHub Actions, GitLab CI, etc.), use the following minimal setup:
      </p>
      <CodeBlock language="bash">{`# Install required SDK components (headless)
yes | sdkmanager --licenses
sdkmanager "platforms;android-36" "ndk;26.3.11579264" "cmake;3.22.1"

# Build
./gradlew assembleRelease --no-daemon --stacktrace`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">NDK Caching</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The NDK is approximately 1.5 GB. Cache it in CI to avoid downloading on every run:
      </p>
      <CodeBlock language="yaml">{`# GitHub Actions example
- name: Cache NDK
  uses: actions/cache@v4
  with:
    path: |
      $ANDROID_HOME/ndk/26.3.11579264
      $ANDROID_HOME/cmake/3.22.1
    key: ndk-26.3.11579264-cmake-3.22.1`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Signing in CI</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Store the keystore as a base64-encoded GitHub Actions secret and decode it at build time:
      </p>
      <CodeBlock language="bash">{`# Encode the keystore (run locally, once)
base64 -i quantallm-release.jks | pbcopy   # macOS — copies to clipboard

# In CI, decode and set env vars
echo "$KEYSTORE_BASE64" | base64 -d > /tmp/keystore.jks
export QUANTALLM_KEYSTORE_PATH="/tmp/keystore.jks"
export QUANTALLM_STORE_PASSWORD="$STORE_PASSWORD"
export QUANTALLM_KEY_PASSWORD="$KEY_PASSWORD"`}</CodeBlock>

      {/* ─────────────────────── 17. Troubleshooting ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Troubleshooting</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Common build errors and their solutions:
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-outline/30">
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Error</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Cause</th>
              <th className="border-b border-outline-variant/20 py-3 px-4 text-sm text-on-surface font-bold">Solution</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">NDK not configured</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">NDK 26.3.11579264 not installed or <code className="font-mono text-primary">ndkVersion</code> not set.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Open SDK Manager &rarr; SDK Tools &rarr; check "Show Package Details" &rarr; install NDK 26.3.11579264.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">CMake '3.22.1' was not found</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">CMake not installed via SDK Manager.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Install via SDK Manager or run <code className="font-mono text-primary">sdkmanager "cmake;3.22.1"</code>.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">undefined reference to 'llama_*'</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Prebuilt <code className="font-mono text-primary">.so</code> files missing or ABI mismatch.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Verify all four <code className="font-mono text-primary">.so</code> files exist in <code className="font-mono text-primary">jniLibs/arm64-v8a/</code>. Rebuild from the correct llama.cpp commit.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">java.lang.UnsatisfiedLinkError</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">JNI function name mismatch or library not loaded.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Ensure <code className="font-mono text-primary">System.loadLibrary("llama_jni")</code> is called and function names match JNI conventions exactly.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">AIDL compilation failed</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Stale generated sources or syntax error in <code className="font-mono text-primary">.aidl</code> file.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Run <code className="font-mono text-primary">./gradlew clean assembleDebug</code>. Check AIDL syntax — only primitive types, Strings, Lists, and Parcelables are supported.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">R8: Missing class</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">R8 stripped a class accessed via reflection.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Add <code className="font-mono text-primary">-keep</code> rules in <code className="font-mono text-primary">proguard-rules.pro</code> or disable R8 (<code className="font-mono text-primary">isMinifyEnabled = false</code>).</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">16KB page size warning</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">ELF segments not aligned to 16 KB.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Add <code className="font-mono text-primary">-Wl,-z,max-page-size=16384</code> to both <code className="font-mono text-primary">CMakeLists.txt</code> and <code className="font-mono text-primary">build.gradle.kts</code> linker flags.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">Duplicate class onnxruntime</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Both Maven and local AAR provide the same classes.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Ensure <code className="font-mono text-primary">onnxruntime-android</code> (Maven) and <code className="font-mono text-primary">onnxruntime-genai</code> (local) are version-compatible. Exclude transitive deps if needed.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">No matching variant for arm64-v8a</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Running on an x86 emulator.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Use a physical arm64 device. The app does not support x86/x86_64 ABIs.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">Gradle sync failed</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Version catalog or plugin version mismatch.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Run <code className="font-mono text-primary">./gradlew --refresh-dependencies</code>. Check that <code className="font-mono text-primary">libs.versions.toml</code> versions match your installed tools.</td>
            </tr>
            <tr>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm"><code className="font-mono text-primary">Keystore not found</code></td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Release signing config references a missing keystore file.</td>
              <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Create a keystore (see Signing section) or set the <code className="font-mono text-primary">QUANTALLM_KEYSTORE_PATH</code> environment variable.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Cleaning Build Artifacts</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When all else fails, a full clean build often resolves stale-state issues:
      </p>
      <CodeBlock language="bash">{`# Full clean
./gradlew clean

# Nuclear option — removes all build caches
./gradlew clean
rm -rf ~/.gradle/caches/
rm -rf .gradle/
rm -rf app/build/
rm -rf app/.cxx/       # CMake intermediate files

# Re-sync and rebuild
./gradlew assembleDebug`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-tertiary p-4 rounded-r-lg mb-6">
        <p className="text-on-surface font-semibold mb-1">Tip</p>
        <p className="text-on-surface-variant text-sm">
          The <code className="font-mono text-primary">.cxx/</code> directory contains CMake's intermediate build files.
          Deleting it forces a full native rebuild, which is useful when switching NDK versions or modifying CMake flags.
        </p>
      </div>
    </div>
  );
}
