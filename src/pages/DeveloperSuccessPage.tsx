import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Copy, Download, ExternalLink, Mail, FileArchive, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SDK_VERSION = 'v1.0.0';
const SDK_RELEASE_URL = 'https://github.com/NaMan6122/QuantaLLM-SDK/releases/tag';

const aarDownloads = [
  { name: 'quantallm-core', label: 'Core SDK', desc: 'License validation + engine interface', size: '139 KB' },
  { name: 'quantallm-llamacpp', label: 'llama.cpp Engine', desc: 'GGUF inference with JNI native layer', size: '12 MB' },
  { name: 'quantallm-onnx', label: 'ONNX Engine', desc: 'ONNX Runtime CPU + QNN NPU', size: '25 MB' },
];

export default function DeveloperSuccessPage() {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLicenseKey(params.get('license_key'));
    setPaymentId(params.get('payment_id'));
    setStatus(params.get('status'));
  }, []);

  const handleCopy = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Failed state
  if (status === 'failed') {
    return (
      <>
        <Helmet><title>Purchase Error — QuantaLLM</title><meta name="robots" content="noindex" /></Helmet>
        <Navbar />
        <main className="min-h-screen bg-[#000000] pt-28 pb-20 px-6">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="font-headline text-3xl font-bold text-white mb-4">Payment Incomplete</h1>
            <p className="text-on-surface-variant text-base mb-8">
              The purchase didn't complete. If you were charged, please contact support.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/" className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm">Go Home</a>
              <a href="mailto:namang2510@gmail.com" className="px-6 py-3 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors text-sm">Contact Support</a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Developer Tier Purchase — QuantaLLM</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-[#000000] pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {licenseKey ? (
            <>
              {/* ── Header ── */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
                  Purchase Confirmed
                </h1>
                <p className="text-on-surface-variant text-base">
                  Your QuantaLLM Developer Tier license is ready.
                </p>
              </div>

              {/* ── License Key ── */}
              <div className="bg-surface-container rounded-xl border border-white/10 p-6 mb-8">
                <div className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mb-2 text-left">
                  License Key
                </div>
                <div className="flex items-center gap-2 bg-surface-container-high rounded-lg px-4 py-3 border border-white/5">
                  <code className="flex-1 text-sm font-mono text-primary text-left break-all select-all">
                    {licenseKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label="Copy license key"
                  >
                    <Copy className="w-4 h-4 text-on-surface-variant" />
                  </button>
                </div>
                {copied && (
                  <p className="text-emerald-400 text-xs mt-2 text-left">Copied to clipboard</p>
                )}
              </div>

              {/* ── SDK Downloads ── */}
              <div className="bg-surface-container rounded-xl border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="w-4 h-4 text-primary" />
                  <h2 className="font-headline text-base font-bold text-white">SDK Downloads</h2>
                  <span className="text-xs text-on-surface-variant font-mono ml-auto">{SDK_VERSION}</span>
                </div>
                <div className="space-y-3">
                  {aarDownloads.map((aar) => (
                    <a
                      key={aar.name}
                      href={`${SDK_RELEASE_URL}/${SDK_VERSION}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-surface-container-high rounded-lg px-4 py-3 border border-white/5 hover:border-primary/30 transition-colors group"
                    >
                      <FileArchive className="w-5 h-5 text-primary/60 group-hover:text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{aar.label}</div>
                        <div className="text-xs text-on-surface-variant truncate">{aar.desc}</div>
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant shrink-0">{aar.size}</span>
                      <Download className="w-4 h-4 text-on-surface-variant group-hover:text-primary shrink-0" />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant/50 mt-3">
                  Download all AARs from the SDK release page. Add them to your app's <code className="text-primary font-mono">libs/</code> directory.
                </p>
              </div>

              {/* ── Integration Guide ── */}
              <div className="bg-surface-container rounded-xl border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h2 className="font-headline text-base font-bold text-white">Integration Guide</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Step 1: Add to project</h3>
                    <div className="bg-surface-container-high rounded-lg p-4 border border-white/5">
                      <pre className="text-xs font-mono text-on-surface-variant leading-relaxed">{`// Copy AARs to app/libs/ then add to build.gradle.kts:
dependencies {
    implementation(files("libs/quantallm-core-${SDK_VERSION}.aar"))
    implementation(files("libs/quantallm-llamacpp-${SDK_VERSION}.aar"))
    // optional:
    // implementation(files("libs/quantallm-onnx-${SDK_VERSION}.aar"))
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Step 2: Initialize SDK</h3>
                    <div className="bg-surface-container-high rounded-lg p-4 border border-white/5">
                      <pre className="text-xs font-mono text-on-surface-variant leading-relaxed">{`// In your Application.onCreate() or Activity.onCreate():
import com.quantallm.QuantaLLM

QuantaLLM.initialize(
    context = applicationContext,
    licenseKey = "${licenseKey.substring(0, 20)}..."
)`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Step 3: Run inference</h3>
                    <div className="bg-surface-container-high rounded-lg p-4 border border-white/5">
                      <pre className="text-xs font-mono text-on-surface-variant leading-relaxed">{`// Detect available backends:
val caps = QuantaLLM.detectCapabilities()

// Create engine (auto-selects fastest backend):
val engine = QuantaLLM.createEngine(Backend.LLAMA_CPP)

// Load a GGUF model:
engine.loadModel("/path/to/model.gguf")

// Generate text:
val result = engine.generate(
    "What is quantum computing?",
    GenerationParams(maxTokens = 256, temperature = 0.7f)
)

// Stream tokens:
engine.generateStreaming("Explain AI", GenerationParams()) { tokensGenerated, partialText ->
    runOnUiThread { textView.text = partialText }
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={`${SDK_RELEASE_URL}/${SDK_VERSION}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg thermal-gradient text-black text-sm font-bold"
                >
                  <Download className="w-4 h-4" />
                  Download SDK {SDK_VERSION}
                </a>
                <a
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Documentation
                </a>
                <a
                  href="mailto:namang2510@gmail.com?subject=QuantaLLM%20Developer%20Tier%20Support"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Get Support
                </a>
              </div>

              {paymentId && (
                <p className="text-xs text-on-surface-variant/50 mt-8 text-center font-mono">
                  Payment ID: {paymentId}
                </p>
              )}
            </>
          ) : (
            /* ── No license key in URL ── */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
                Payment Successful
              </h1>
              <p className="text-on-surface-variant text-base mb-8">
                Thank you for your purchase. Your license key has been sent to your email.
              </p>
              <a
                href="mailto:namang2510@gmail.com?subject=QuantaLLM%20Developer%20Tier%20-%20Missing%20License"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <Mail className="w-4 h-4" />
                Didn't receive it? Contact support
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}