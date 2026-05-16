import CodeBlock from '../CodeBlock';

export default function GettingStarted() {
  return (
    <div>
      {/* ───────────────────────────── 1. INTRO ───────────────────────────── */}
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-4">Getting Started</h1>
      <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
        Get QuantaLLM running on your Android device in minutes. This guide walks you through
        installation, loading your first model, and running your first inference — everything you
        need to go from zero to on-device AI.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM is an Android application that runs large language models entirely
        on your device. There is no cloud, no API key, no data leaving your phone. Once installed,
        the app works fully offline — on a plane, in a subway, or anywhere else without
        connectivity. This guide assumes no prior experience with on-device inference and will
        walk you through every step in detail.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        By the end of this page you will have a working model loaded and will have generated your
        first tokens. The entire process typically takes under ten minutes, most of which is spent
        downloading the model file itself.
      </p>

      {/* ─────────────────────── 2. SYSTEM REQUIREMENTS ─────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">System Requirements</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Before installing QuantaLLM, make sure your device meets the following requirements.
        These are hard requirements — the app will not install or function correctly on devices
        that do not satisfy them.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Operating System</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM requires <strong>Android 12 (API level 31)</strong> or higher. This is not an
        arbitrary choice — Android 12 introduced scoped storage enforcement, foreground service
        type declarations, and the exact alarm permission model that QuantaLLM depends on.
        Specifically, the app uses{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          foregroundServiceType="dataSync"
        </code>{' '}
        to keep the inference engine alive during long generations, and the scoped storage APIs
        to safely access model files placed in shared directories. Older Android versions lack
        these APIs entirely.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">CPU Architecture</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Only <strong>ARM64 (arm64-v8a)</strong> devices are supported. QuantaLLM ships native
        C++ libraries compiled with{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          llama.cpp
        </code>{' '}
        that target ARMv8-A exclusively. There are no x86 or x86_64 binaries — this means Android
        emulators on Intel/AMD host machines and the small number of x86-based Android tablets
        will not work. Practically speaking, every Android phone and tablet sold since 2017 uses
        ARM64, so this is unlikely to be an issue.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">RAM</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The amount of RAM your device has determines the largest model you can run. When a model
        is loaded, its weights are memory-mapped into the process address space. The operating
        system also needs RAM for itself and other apps, so you cannot dedicate 100% of your
        device's memory to the model. The table below provides practical guidance.
      </p>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Device RAM</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Max Model Size</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Example Models</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Experience</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">4 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1-3B parameters</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Qwen2-1.5B, Gemma-2-2B</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Minimum viable. May experience OOM kills.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">6 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3-7B parameters</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Phi-3-mini, Llama-3.2-3B</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Recommended minimum. Good balance.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">8 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">7B parameters</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Mistral-7B, Llama-3.1-8B</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Comfortable headroom for 7B models.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">12 GB+</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">13B parameters</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Llama-2-13B, CodeLlama-13B</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Flagship devices only. Best quality.</td>
          </tr>
        </tbody>
      </table>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Info:</strong> These estimates assume Q4_K_M quantization. Higher quantizations
          (Q5, Q6, Q8) require proportionally more RAM. Lower quantizations (Q2, Q3) use less RAM
          but produce noticeably worse output quality.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Storage</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Each model file ranges from roughly 1 GB to 8 GB depending on the model size and
        quantization level. You should have at least 3 GB of free storage for your first model,
        with additional space if you want to keep multiple models available. Model files are
        stored in user-accessible directories — they are standard{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .gguf
        </code>{' '}
        files that you can manage with any file manager.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Supported Chipsets</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM runs on any ARM64-based Android SoC. This includes the full range of mobile
        processors from all major vendors:
      </p>
      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Qualcomm Snapdragon</strong> — all 600/700/800 series and newer Gen-branded chips</li>
        <li><strong>Samsung Exynos</strong> — 980, 990, 1080, 2100, 2200, 2400 and newer</li>
        <li><strong>MediaTek Dimensity</strong> — 700, 800, 900, 1000, 8000, 9000 series</li>
        <li><strong>Google Tensor</strong> — G1, G2, G3, G4 (Pixel 6 through Pixel 9)</li>
      </ul>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        For devices with Qualcomm Snapdragon 8 Gen 1 or newer, QuantaLLM can optionally offload
        computation to the <strong>Hexagon NPU</strong> for significant performance gains. This
        is not required — CPU inference works on all supported devices. See the{' '}
        <strong>Hexagon NPU</strong> documentation page for setup instructions.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Network Requirements</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM requires an internet connection only to download the APK and model files. After
        that, the app is <strong>fully offline</strong>. No telemetry is collected, no API calls
        are made, and no data leaves your device. This makes QuantaLLM suitable for
        privacy-sensitive use cases and environments with restricted connectivity.
      </p>

      {/* ──────────────────────── 3. INSTALLATION ──────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Installation</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM is distributed as a standalone APK through GitHub Releases. It is not
        available on the Google Play Store. Follow these steps carefully to install the app on
        your device.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 1: Download the APK</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Navigate to the QuantaLLM releases page on GitHub and download the latest{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .apk
        </code>{' '}
        file. You can do this directly from your phone's browser.
      </p>

      <CodeBlock language="text">{`https://github.com/NaMan6122/QuantaLLM-Releases/releases/download/v1.3.0/QuantaLLM-v1.3.0.apk`}</CodeBlock>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Look for the asset named{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          QuantaLLM-vX.Y.Z-release.apk
        </code>{' '}
        under the latest release. The file is approximately 15-20 MB. Download it to your
        device's default Downloads folder.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 2: Enable Installation from Unknown Sources</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Because QuantaLLM is not distributed through the Play Store, Android requires you to
        explicitly allow your browser (or file manager) to install APKs. The exact path varies
        slightly by device manufacturer, but the general steps are:
      </p>

      <ol className="list-decimal list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          Open <strong>Settings</strong> on your device.
        </li>
        <li>
          Navigate to <strong>Apps</strong> (or <strong>Apps &amp; notifications</strong>).
        </li>
        <li>
          Tap <strong>Special app access</strong> (you may need to tap the three-dot menu or
          scroll to find it).
        </li>
        <li>
          Tap <strong>Install unknown apps</strong>.
        </li>
        <li>
          Find your browser (e.g., Chrome, Firefox) and toggle <strong>Allow from this
          source</strong> on.
        </li>
      </ol>

      <CodeBlock language="text">{`Settings → Apps → Special app access → Install unknown apps → Chrome → Allow`}</CodeBlock>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> You can (and should) disable this permission again after
          installing QuantaLLM. Leaving "Install unknown apps" enabled for your browser is a
          minor security risk. Return to the same settings screen and toggle it off once
          installation is complete.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 3: Install the APK</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Open your Downloads folder (either via the browser's download notification or a file
        manager) and tap the APK file. Android will display a confirmation dialog showing the
        permissions the app requests. Tap <strong>Install</strong>. Installation typically
        completes in a few seconds.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Step 4: Grant Permissions on First Launch</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When you open QuantaLLM for the first time, the app will request several permissions.
        Each one serves a specific purpose — here is what they are and why they are needed.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Storage Permission (Required)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM requests the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          MANAGE_EXTERNAL_STORAGE
        </code>{' '}
        permission (also known as "All files access" on Android 11+). This is the most
        important permission and the app cannot function without it.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        The reason this broad permission is needed — rather than the more limited{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          READ_EXTERNAL_STORAGE
        </code>{' '}
        — is that QuantaLLM needs to scan multiple directories for{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .gguf
        </code>{' '}
        model files. Users typically download models to the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          Downloads/
        </code>{' '}
        directory, but some prefer{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          Documents/
        </code>{' '}
        or a custom{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          models/
        </code>{' '}
        folder. Android's scoped storage restrictions (enforced from Android 11 onward) prevent
        apps from reading arbitrary files without this permission. The Storage Access Framework
        (SAF) picker is not viable here because it requires the user to manually select each
        file, which defeats the purpose of automatic model discovery.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        When prompted, you will be taken to the system Settings screen. Toggle{' '}
        <strong>"Allow access to manage all files"</strong> for QuantaLLM and then press the
        back button to return to the app.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Media Permissions (Android 13+, Optional)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        On Android 13 (API 33) and above, the system introduced granular media permissions such
        as{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          READ_MEDIA_IMAGES
        </code>
        ,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          READ_MEDIA_VIDEO
        </code>
        , and{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          READ_MEDIA_AUDIO
        </code>
        . QuantaLLM does not need any of these for its core functionality — model files are not
        classified as media. If you see these permissions requested, they can be safely denied
        without affecting the app.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Notification Permission (Recommended)</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Android 13+ requires explicit permission to post notifications. QuantaLLM uses a
        foreground service notification to keep the inference engine alive while generating
        tokens. If you deny this permission, the app will still work, but Android may
        aggressively kill the inference process during long generations when the app is in the
        background. We strongly recommend granting this permission.
      </p>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> If you accidentally denied a permission, you can grant it later
          from <strong>Settings → Apps → QuantaLLM → Permissions</strong>. For the storage
          permission specifically, go to <strong>Settings → Apps → Special app access → All
          files access</strong> and enable QuantaLLM.
        </p>
      </div>

      {/* ──────────────────── 4. DOWNLOADING A MODEL ──────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Downloading a Model</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM does not ship with any models bundled. You need to download a model file in
        the <strong>GGUF format</strong> before you can run inference. GGUF is the standard
        format used by the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          llama.cpp
        </code>{' '}
        ecosystem and is supported by virtually all modern open-weight LLMs.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Where to Find Models</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The best source for GGUF models is <strong>HuggingFace Hub</strong>. You can filter
        the model hub by the "gguf" tag to find compatible files. Many community members
        (notably <strong>TheBloke</strong> and <strong>bartowski</strong>) maintain repositories
        of pre-quantized GGUF files for popular models.
      </p>

      <CodeBlock language="text">{`https://huggingface.co/models?sort=trending&search=gguf`}</CodeBlock>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        When browsing a model repository, look for files ending in{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .gguf
        </code>{' '}
        in the "Files and versions" tab. Each file typically includes the quantization type in
        its name (e.g.,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          model-Q4_K_M.gguf
        </code>
        ).
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Recommended Starter Models</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        If this is your first time using QuantaLLM, we recommend starting with one of the models
        below. These have been tested extensively and offer a good balance of quality, speed, and
        memory usage on mobile devices.
      </p>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Model</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">File Size</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">RAM Needed</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">
              <strong>Qwen2-1.5B-Instruct</strong> Q4_K_M
            </td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1.1 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Lightweight, fast responses. Good for low-RAM devices.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">
              <strong>Gemma-2-2B-IT</strong> Q4_K_M
            </td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1.6 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Google's efficient model. Strong for its size class.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">
              <strong>Llama-3.2-3B-Instruct</strong> Q4_K_M
            </td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2.0 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">4 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Excellent instruction following. Meta's latest small model.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">
              <strong>Phi-3-mini-4k-instruct</strong> Q4_K_M
            </td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2.3 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">4 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Strong reasoning and general tasks. Microsoft's best small model.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">
              <strong>Mistral-7B-Instruct-v0.3</strong> Q4_K_M
            </td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">4.1 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">6 GB</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">High quality output. Needs 6+ GB RAM device.</td>
          </tr>
        </tbody>
      </table>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> For your very first test, we recommend{' '}
          <strong>Phi-3-mini-4k-instruct Q4_K_M</strong>. It offers the best quality-to-size
          ratio and works well on most mid-range and flagship devices with 6+ GB of RAM. If your
          device has only 4 GB of RAM, start with Qwen2-1.5B instead.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Understanding Quantization</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Quantization is the process of reducing the precision of model weights to decrease file
        size and memory usage. The original model weights are stored in 16-bit floating point
        (FP16), which is impractical for mobile devices. Quantized versions use fewer bits per
        weight, trading a small amount of quality for dramatically reduced resource requirements.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        The naming convention encodes the quantization level. Here is what the common suffixes
        mean:
      </p>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Quantization</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Bits/Weight</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Quality</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Q2_K</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">2.6</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Poor</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Avoid. Severe quality degradation.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Q3_K_M</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3.9</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Acceptable</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Use only if RAM is very tight.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Q4_K_M</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">4.8</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Good</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Best balance. Recommended for mobile.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Q5_K_M</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">5.7</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Very Good</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Use if you have RAM to spare.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Q6_K</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">6.6</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Excellent</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Near-original quality. Large files.</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Q8_0</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">8.5</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Near-lossless</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Desktop-class RAM required. Not for mobile.</td>
          </tr>
        </tbody>
      </table>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        <strong>Q4_K_M is the sweet spot for mobile inference.</strong> It uses approximately
        4.8 bits per weight, which is roughly 3.3x smaller than the original FP16 model while
        retaining the vast majority of the model's capabilities. Unless you have a specific
        reason to choose otherwise, always start with Q4_K_M.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">How to Download</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        There are several ways to get the model file onto your device:
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Option A: Direct Browser Download</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Navigate to the model page on HuggingFace in your phone's browser, go to the
        "Files and versions" tab, and tap the download arrow next to the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .gguf
        </code>{' '}
        file. The download will proceed in the background. Note that large files (4+ GB) may
        take a while on mobile data — Wi-Fi is recommended.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Option B: Termux with wget</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        If you have <strong>Termux</strong> installed, you can use{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          wget
        </code>{' '}
        for more reliable downloads with resume support:
      </p>

      <CodeBlock language="bash">{`# Install wget if you haven't already
pkg install wget

# Download a model (example: Phi-3-mini Q4_K_M)
cd /storage/emulated/0/Download
wget https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf`}</CodeBlock>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Option C: Download on PC and Transfer</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Download the model on your computer (where you likely have a faster connection) and
        transfer it to your phone via USB cable, ADB, or cloud storage. Place the file in one
        of the supported directories listed below.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Where to Place Model Files</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM scans the following directories for{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .gguf
        </code>{' '}
        files:
      </p>

      <CodeBlock language="text">{`/storage/emulated/0/Download/          ← Recommended (default download location)
/storage/emulated/0/Documents/         ← Alternative
/storage/emulated/0/models/            ← Custom directory (create if needed)`}</CodeBlock>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        The recommended location is the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          Download/
        </code>{' '}
        directory, since that is where browsers save files by default. If you prefer to keep
        your models organized separately, create a{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          models/
        </code>{' '}
        directory at the root of your internal storage.
      </p>

      <div className="bg-surface-container border-l-4 border-secondary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Warning:</strong> Model files <strong>must</strong> have the{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            .gguf
          </code>{' '}
          extension. QuantaLLM filters by file extension when scanning. If your file was renamed
          during download (e.g., to{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            .gguf.part
          </code>{' '}
          or{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            .bin
          </code>
          ), rename it back to{' '}
          <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            .gguf
          </code>{' '}
          before scanning.
        </p>
      </div>

      {/* ─────────────────── 5. LOADING YOUR FIRST MODEL ─────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Loading Your First Model</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        With a model file on your device, you are ready to load it into QuantaLLM. This section
        walks through the app's main interface and the model loading process.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Main Screen Overview</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When you open QuantaLLM, the main screen presents the following controls:
      </p>

      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Model Selector</strong> — a dropdown showing discovered model files</li>
        <li><strong>Thread Count</strong> — a numeric control for setting CPU thread count</li>
        <li><strong>Backend Selector</strong> — choose between CPU and Hexagon NPU (if available)</li>
        <li><strong>Prompt Input</strong> — a multiline text field for entering your prompt</li>
        <li><strong>Generation Controls</strong> — max tokens, temperature, and other sampling parameters</li>
        <li><strong>Generate Button</strong> — starts inference</li>
        <li><strong>Output Card</strong> — displays generated text and performance metrics</li>
      </ul>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Scanning for Models</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Tap the <strong>"Scan for Models"</strong> button (or pull down to refresh on some
        screen layouts). QuantaLLM will scan the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          Downloads/
        </code>
        ,{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          Documents/
        </code>
        , and{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          models/
        </code>{' '}
        directories for files with the{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          .gguf
        </code>{' '}
        extension. Scanning is fast — typically under one second — because it only checks file
        extensions, not file contents.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Under the hood, the scan uses Android's{' '}
        <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          File.listFiles()
        </code>{' '}
        API with a filename filter. The discovered files are displayed in the model selector
        dropdown, showing the filename and file size. If no models are found, double-check that
        your file has the correct extension and is in one of the supported directories.
      </p>

      <CodeBlock language="kotlin">{`// Simplified model scanning logic
val scanDirs = listOf(
    File(Environment.getExternalStorageDirectory(), "Download"),
    File(Environment.getExternalStorageDirectory(), "Documents"),
    File(Environment.getExternalStorageDirectory(), "models")
)

val models = scanDirs
    .filter { it.exists() && it.isDirectory }
    .flatMap { dir ->
        dir.listFiles { file -> file.extension == "gguf" }?.toList() ?: emptyList()
    }`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Selecting a Model</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        After scanning, tap the model selector dropdown and choose the model you downloaded.
        The dropdown displays each model's filename and size, making it easy to identify which
        file is which if you have multiple models.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Configuring Thread Count</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The thread count determines how many CPU cores are used for inference. More threads
        generally means faster token generation, but there are diminishing returns — and using
        too many threads can actually slow things down due to thermal throttling and thread
        contention. Here is a guide for choosing the right value:
      </p>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Threads</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Speed</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Battery Impact</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">4</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Slower</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Low</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Battery-conscious usage, background tasks</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">6</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Balanced</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Moderate</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Recommended default for most devices</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">8</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Fast</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Higher</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">When you want faster responses, device plugged in</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">12</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Maximum</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">High</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">Flagships only (Snapdragon 8 Gen series, Tensor G3+)</td>
          </tr>
        </tbody>
      </table>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Info:</strong> Most mobile SoCs use a heterogeneous core layout (e.g., 4
          performance cores + 4 efficiency cores). Setting the thread count to 6 typically
          utilizes all performance cores plus 2 efficiency cores, which is the optimal
          configuration for sustained workloads. Setting it higher than your total core count
          will not help and will cause contention.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Selecting a Backend</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        QuantaLLM supports two inference backends:
      </p>

      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>CPU</strong> — the default backend. Works on all supported devices. Uses
          ARM NEON SIMD instructions for optimized matrix operations. This is the safest choice
          and provides solid performance on all modern chips.
        </li>
        <li>
          <strong>Hexagon NPU</strong> — available on Qualcomm Snapdragon 8 Gen 1 and newer.
          Offloads tensor operations to the dedicated neural processing unit for significantly
          faster inference. Requires additional setup — see the Hexagon NPU documentation page.
        </li>
      </ul>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        For your first model load, leave the backend set to <strong>CPU</strong>. You can
        experiment with Hexagon acceleration later once you have confirmed everything works.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Loading the Model</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        With your model selected, thread count configured, and backend chosen, tap the{' '}
        <strong>"Load Model"</strong> button. The app will begin loading the model into memory.
        This involves:
      </p>

      <ol className="list-decimal list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>Reading and validating the GGUF file header</li>
        <li>Memory-mapping the model weights into the process address space</li>
        <li>Initializing the inference context with your chosen thread count</li>
        <li>Allocating the KV cache for context management</li>
      </ol>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Loading typically takes <strong>2 to 10 seconds</strong> depending on the model size
        and your device's storage speed (UFS 3.1+ is noticeably faster than eMMC). A progress
        indicator will show the loading status.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Once the model is loaded, QuantaLLM displays the model's metadata:
      </p>

      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Architecture</strong> — the model family (e.g., LlamaForCausalLM, PhiForCausalLM)</li>
        <li><strong>Parameters</strong> — total parameter count (e.g., 3.8B)</li>
        <li><strong>Context Window</strong> — maximum sequence length in tokens (e.g., 4096)</li>
        <li><strong>Quantization</strong> — the quantization type detected from the file (e.g., Q4_K_M)</li>
      </ul>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> If loading fails with an out-of-memory error, try a smaller
          model or a more aggressive quantization (e.g., Q3_K_M instead of Q4_K_M). You can
          also close other apps to free up RAM before loading.
        </p>
      </div>

      {/* ─────────────────── 6. RUNNING YOUR FIRST INFERENCE ─────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Running Your First Inference</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        With a model loaded, you are ready to generate text. This section covers the inference
        workflow, generation parameters, and how to interpret the output.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Entering a Prompt</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Tap the prompt text field and enter your input. For instruction-tuned models (which is
        what we recommended above), you can write natural language instructions directly. The
        model's chat template is applied automatically — you do not need to manually format
        special tokens.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Here is a good first prompt to try:
      </p>

      <CodeBlock language="text">{`Explain what a large language model is in simple terms. Keep your answer to three sentences.`}</CodeBlock>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Configuring Generation Parameters</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Before generating, you can adjust the sampling parameters that control the model's
        output behavior. Here are the key parameters and their effects:
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Max Tokens</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        The maximum number of tokens to generate in the response. The default is{' '}
        <strong>64</strong>, which is quite short — fine for testing but too low for real use.
        For general-purpose responses, set this to <strong>256-512</strong>. For longer-form
        content like stories, explanations, or code, increase to <strong>1024</strong> or
        higher. Note that longer generations take proportionally more time — at 10 tokens/sec,
        generating 1024 tokens takes about 100 seconds.
      </p>

      <h4 className="text-lg font-bold font-headline mt-8 mb-3">Temperature</h4>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Temperature controls the randomness of the model's output. It is a floating-point value
        that scales the logits before sampling:
      </p>

      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>0.0</strong> — Deterministic (greedy decoding). The model always picks the
          most likely next token. Produces consistent, predictable output. Best for factual
          Q&A, classification, and structured extraction.
        </li>
        <li>
          <strong>0.7</strong> — Balanced (recommended default). Introduces enough randomness
          to produce natural-sounding text while keeping output coherent. Good for most tasks.
        </li>
        <li>
          <strong>1.0</strong> — Full randomness. Samples directly from the model's learned
          distribution. Output is more creative and varied but may be less focused.
        </li>
        <li>
          <strong>1.5+</strong> — High creativity. Amplifies unlikely token choices. Useful for
          brainstorming and creative writing but can produce incoherent output. Use with
          caution.
        </li>
      </ul>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Info:</strong> For your first inference, leave temperature at{' '}
          <strong>0.7</strong> and max tokens at <strong>256</strong>. These defaults produce
          good results across a wide range of prompts. You can fine-tune these values as you
          gain experience with the model's behavior.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Generating Output</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Tap the <strong>"Generate"</strong> button to start inference. Tokens will stream into
        the output card in real-time — you will see them appear one by one (or in small
        batches) as the model produces them. A real-time speed indicator shows the current
        tokens-per-second rate.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        The generation process has two distinct phases:
      </p>

      <ol className="list-decimal list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Prefill (prompt processing)</strong> — the model reads and processes your
          input prompt. This phase processes all input tokens in parallel and is compute-bound.
          For short prompts this takes a fraction of a second; for longer prompts it can take
          several seconds.
        </li>
        <li>
          <strong>Decode (token generation)</strong> — the model generates output tokens one at
          a time, each conditioned on all previous tokens. This is the phase where you see
          text streaming in. Speed is measured in tokens per second (tok/s).
        </li>
      </ol>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Understanding the Output</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        When generation completes (either by reaching the max token limit or producing an
        end-of-sequence token), the output card displays a summary of the generation:
      </p>

      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li><strong>Generated Text</strong> — the model's full response</li>
        <li><strong>Tokens/sec</strong> — average token generation speed during the decode phase</li>
        <li><strong>Total Tokens</strong> — number of tokens generated (prompt + completion)</li>
        <li><strong>Elapsed Time</strong> — wall-clock time for the entire generation</li>
      </ul>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Typical performance on modern mid-range to flagship devices:
      </p>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Model Size</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">CPU (6 threads)</th>
            <th className="border-b border-outline-variant/20 py-3 px-4 text-sm font-bold">Hexagon NPU</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">1.5B Q4_K_M</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">15-25 tok/s</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">30-50 tok/s</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3B Q4_K_M</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">8-15 tok/s</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">20-35 tok/s</td>
          </tr>
          <tr>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">7B Q4_K_M</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">3-8 tok/s</td>
            <td className="border-b border-outline-variant/20 py-3 px-4 text-sm">10-20 tok/s</td>
          </tr>
        </tbody>
      </table>

      <div className="bg-surface-container border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Tip:</strong> The first inference after loading a model is typically slower
          than subsequent ones. This is because the first run populates the CPU cache and the
          OS finishes paging in memory-mapped model data. Run your prompt a second time and
          you will likely see a noticeable speed improvement.
        </p>
      </div>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Example Session</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Here is what a typical first inference session looks like end-to-end:
      </p>

      <CodeBlock language="text">{`Model:       Phi-3-mini-4k-instruct-Q4_K_M.gguf (2.3 GB)
Backend:     CPU
Threads:     6
Max Tokens:  256
Temperature: 0.7

Prompt:
"What is the capital of France? Explain why it became the capital."

Output:
"The capital of France is Paris. Paris became the capital due to its
strategic location along the Seine River, which made it a natural hub
for trade and commerce dating back to Roman times. The city's central
position in the Ile-de-France region allowed it to consolidate political
power during the medieval period, particularly under the Capetian dynasty
who established their court there in the 10th century..."

Performance:
  Prefill:     0.3s (42 tokens)
  Decode:      12.4 tok/s
  Total:       187 tokens in 14.8s`}</CodeBlock>

      {/* ──────────────────────── 7. CHAT MODE ──────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Chat Mode</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Beyond single-turn prompt/completion, QuantaLLM supports a full chat mode for
        multi-turn conversations with the model. Chat mode maintains conversation context
        across multiple exchanges, enabling more natural and coherent interactions.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Enabling Chat Mode</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Switch to chat mode using the toggle in the app's navigation. In chat mode, the
        interface changes to a familiar messaging layout with a scrollable conversation history
        and a message input at the bottom.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Creating a Session</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Create a new chat session by tapping the "New Chat" button. You can optionally set a{' '}
        <strong>system prompt</strong> that defines the assistant's persona and behavior for
        the entire conversation. For example:
      </p>

      <CodeBlock language="text">{`System prompt:
"You are a helpful coding assistant. You specialize in Kotlin and Android development.
Keep your answers concise and include code examples when relevant."`}</CodeBlock>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        The system prompt is prepended to every inference call and persists for the duration of
        the session. Choose it carefully — a well-crafted system prompt significantly improves
        the quality and consistency of the model's responses.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Conversation Context</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Chat mode uses <strong>KV cache persistence</strong> to maintain conversation state
        efficiently. Instead of re-processing the entire conversation history for each new
        message, the KV cache from previous turns is preserved in memory. This means that
        subsequent messages in the same session are processed much faster than the first one,
        since only the new user message needs to go through prefill.
      </p>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        Be aware of the model's context window limit. For a model with a 4096-token context
        window, once the total conversation length (system prompt + all messages) exceeds this
        limit, older messages are truncated. The model will lose access to early parts of the
        conversation. If you notice the model "forgetting" things you discussed earlier, this
        is likely why.
      </p>

      <h3 className="text-xl font-bold font-headline mt-10 mb-4">Saving and Resuming Sessions</h3>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Chat sessions are automatically saved to device storage. You can close the app and
        return later to continue a conversation. The conversation text history is restored,
        though the KV cache will need to be rebuilt from the conversation history on the first
        new message, which may take a few extra seconds.
      </p>

      {/* ──────────────────────── 8. NEXT STEPS ──────────────────────── */}
      <h2 className="text-2xl font-bold font-headline tracking-tight mt-16 mb-6">Next Steps</h2>

      <p className="text-on-surface-variant leading-relaxed mb-4">
        You now have QuantaLLM installed, a model loaded, and have run your first inference.
        From here, there are several directions you can explore depending on your goals:
      </p>

      <ul className="list-disc list-inside space-y-2 text-on-surface-variant mb-6 ml-4">
        <li>
          <strong>Architecture Overview</strong> — understand how QuantaLLM is structured under
          the hood, from the Kotlin UI layer through the JNI bridge to the native C++ inference
          engine. Recommended if you plan to contribute or want to understand performance
          characteristics.
        </li>
        <li>
          <strong>Hexagon NPU</strong> — enable hardware-accelerated inference on Qualcomm
          Snapdragon devices. Can deliver 2-3x speed improvements over CPU-only inference.
          Covers driver setup, model compatibility, and troubleshooting.
        </li>
        <li>
          <strong>Model Formats</strong> — deep dive into GGUF format internals, quantization
          methods, and how to choose the right model for your specific use case and hardware
          constraints.
        </li>
        <li>
          <strong>AIDL Service</strong> — learn how to expose QuantaLLM's inference capabilities
          as an Android service that other apps on your device can bind to. Enables building
          AI-powered features into your own apps without bundling a separate inference engine.
        </li>
        <li>
          <strong>Build from Source</strong> — set up the development environment, compile
          QuantaLLM from source, and customize the app. Covers the NDK toolchain setup,
          llama.cpp integration, and the Gradle build system.
        </li>
      </ul>

      <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <p className="text-on-surface-variant leading-relaxed">
          <strong>Info:</strong> QuantaLLM is actively developed. If you
          encounter bugs or have feature requests, reach out via the FAQ page or contact us directly.
        </p>
      </div>
    </div>
  );
}
