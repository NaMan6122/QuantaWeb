import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FolderOpen, Shield, Cpu, MessageSquare, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MorphGeoBg = lazy(() => import('../components/MorphGeoBg'));

interface Step {
  icon: typeof Download;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  tip?: string;
  // image filenames under /screenshots/ — single: ['1.png'], multi: ['1.1.png','1.2.png']
  images: string[];
  imageBg: string;
}

const steps: Step[] = [
  {
    icon: Download,
    title: 'Download & Install the APK',
    subtitle: 'Step 1 — Installation',
    description:
      'QuantaLLM is distributed as a standalone APK — no Play Store required. You install it directly on your device.',
    details: [
      'Download QuantaLLM-v1.3.0.apk from the link below',
      'Open your device Settings → Security (or Privacy)',
      'Enable "Install from unknown sources" or "Install unknown apps"',
      'Open the downloaded APK from your notification bar or Files app',
      'Tap Install and wait for the process to complete',
    ],
    tip: 'On Android 12+ you can grant this permission per-app. When prompted, allow your browser or Files app to install.',
    images: ['screenshot-1.1.png', 'screenshot-1.2.png'],
    imageBg: 'from-primary/20 to-primary/5',
  },
  {
    icon: Shield,
    title: 'Grant Storage Permission',
    subtitle: 'Step 2 — Permissions',
    description:
      'QuantaLLM needs access to your device storage to scan for GGUF model files. This is a one-time setup.',
    details: [
      'Launch QuantaLLM after installation & click on the Scan Models button',
      'A permission dialog will appear requesting storage access',
      'Tap "Allow" — this lets the app scan your Downloads and Documents folders',
      'On Android 13+ select "Allow access to media" and grant Files access',
      'You can also go to Settings → Apps → QuantaLLM → Permissions to grant it manually',
    ],
    tip: 'QuantaLLM only reads model files — it never uploads anything. All inference is fully offline.',
    images: ['screenshot-2.png'],
    imageBg: 'from-secondary/20 to-secondary/5',
  },
  {
    icon: FolderOpen,
    title: 'Add a Model to Your Device',
    subtitle: 'Step 3 — Model Setup',
    description:
      'QuantaLLM runs GGUF models from your local storage. Download a model from HuggingFace and place it in a scanned directory.',
    details: [
      'Open your browser and go to huggingface.co',
      'Search for a model + "GGUF" (e.g. "Phi-3 Mini GGUF" or "Llama 3.2 3B GGUF")',
      'Pick a Q4_K_M quantization for the best balance of quality and speed',
      'Download the .gguf file directly to your Downloads folder',
      'QuantaLLM scans: Downloads/, Documents/, and models/ on internal + SD card storage',
    ],
    tip: 'Start with a small model — Phi-3 Mini Q4_K_M (~2.2 GB) or LLaMA 3.2 3B Q4_K_M (~1.9 GB) — to verify everything works before trying larger ones.',
    images: ['screenshot-3.png'],
    imageBg: 'from-primary/15 to-secondary/10',
  },
  {
    icon: Cpu,
    title: 'Load the Model',
    subtitle: 'Step 4 — Model Loading',
    description:
      'Once the .gguf file is in a scanned directory, QuantaLLM will detect it automatically and show it in the model list.',
    details: [
      'Open QuantaLLM and tap the model selector at the top of the screen',
      'Your downloaded model will appear with its name, size, and quantization type',
      'Models flagged in red may exceed available RAM — choose a smaller quantization if needed',
      "Tap the model to load it — you'll see a progress indicator as it initialises",
      'On Snapdragon 8 Gen 2/3/Elite devices, Hexagon NPU offload activates automatically',
    ],
    tip: "If your model doesn't appear, tap the refresh icon in the model list to trigger a rescan.",
    images: ['screenshot-4.1.png', 'screenshot-4.2.png'],
    imageBg: 'from-primary/20 to-primary/5',
  },
  {
    icon: MessageSquare,
    title: 'Start Chatting',
    subtitle: 'Step 5 — Inference',
    description:
      'With the model loaded you can start sending messages. Responses stream token by token — entirely on your device, no internet required.',
    details: [
      'Tap the chat input at the bottom and type your first message',
      'Tokens stream in real time — you\'ll see the t/s speed in the status bar',
      'Adjust temperature, top-k, top-p, and other parameters from the settings panel',
      'Use the system prompt field to set a persona or instructions for the model',
      'Chat sessions are saved automatically — swipe left on a session to delete it',
    ],
    tip: 'For best results with instruction-following models, use the correct prompt format. QuantaLLM auto-detects the chat template from the GGUF metadata when available.',
    images: ['screenshot-5.1.png', 'screenshot-5.2.png'],
    imageBg: 'from-secondary/20 to-primary/10',
  },
];

const fadeSlide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

// Auto-scrolling image panel — cycles through images with a smooth scroll
function ImagePanel({ images, imageBg, stepIndex }: { images: string[]; imageBg: string; stepIndex: number }) {
  const [imgIndex, setImgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset to first image whenever the step changes
  useEffect(() => {
    setImgIndex(0);
  }, [stepIndex]);

  // Auto-advance when there are multiple images
  useEffect(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setImgIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images, stepIndex]);

  const hasReal = (src: string) => {
    // treated as "real" once the file actually exists — we try to load it
    return true;
  };

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${imageBg} border border-outline-variant/15 flex flex-col items-center justify-center overflow-hidden`}
      style={{ minHeight: '420px' }}>

      {/* Image area */}
      <div className="relative w-52 flex-1 flex items-center justify-center my-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stepIndex}-${imgIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Phone frame wrapper */}
            <div className="relative w-52 mx-auto bg-surface-container rounded-[2rem] border-2 border-outline-variant/30 shadow-2xl overflow-hidden"
              style={{ aspectRatio: '9/19' }}>
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-7 bg-black/40 flex items-center px-4 z-10">
                <div className="w-14 h-1.5 bg-white/20 rounded-full mx-auto" />
              </div>
              {/* Screenshot or placeholder */}
              <img
                src={`/screenshots/${images[imgIndex]}`}
                alt={`Step screenshot ${images[imgIndex]}`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
              />
              {/* Fallback placeholder — shown if image missing */}
              <div className="absolute inset-0 flex-col items-center justify-center gap-3 p-6 hidden">
                <div className="w-10 h-10 rounded-full bg-outline-variant/20 flex items-center justify-center">
                  <span className="text-on-surface-variant/40 font-mono text-xs">{images[imgIndex]}</span>
                </div>
                <div className="space-y-2 w-full mt-2">
                  <div className="h-2 bg-outline-variant/15 rounded-full" />
                  <div className="h-2 bg-outline-variant/10 rounded-full w-3/4 mx-auto" />
                  <div className="h-2 bg-outline-variant/8 rounded-full w-1/2 mx-auto" />
                </div>
                <p className="text-[9px] text-on-surface-variant/30 font-mono text-center">Screenshot pending</p>
              </div>
              {/* Home bar */}
              <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center">
                <div className="w-20 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators — only shown for multi-image steps */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 pb-5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setImgIndex(i);
              }}
              className={`rounded-full transition-all ${i === imgIndex ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-outline-variant/40'}`}
              aria-label={`View screenshot ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TutorialPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => current > 0 && go(current - 1);
  const next = () => current < steps.length - 1 && go(current + 1);

  const step = steps[current];
  const Icon = step.icon;

  return (
    <>
      <Helmet>
        <title>How to Run AI on Android Offline — QuantaLLM Setup Guide</title>
        <meta name="description" content="Step-by-step guide to install QuantaLLM and run AI models 100% offline on your Android phone. Download APK, add a GGUF model, and start chatting — no internet needed." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/tutorial" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/tutorial" />
        <meta property="og:title" content="How to Run AI on Android Offline — QuantaLLM Setup Guide" />
        <meta property="og:description" content="Install QuantaLLM, grant storage access, download a GGUF model, and start chatting — fully offline on your Android device." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Run AI on Your Android Phone Offline with QuantaLLM",
          "description": "Install QuantaLLM and run large language models 100% offline on your Android device in five steps. No internet required.",
          "totalTime": "PT10M",
          "supply": [
            { "@type": "HowToSupply", "name": "Android 12+ device with 8 GB RAM" },
            { "@type": "HowToSupply", "name": "QuantaLLM APK (v1.3.0)" },
            { "@type": "HowToSupply", "name": "GGUF model file (e.g. Phi-3 Mini Q4_K_M)" }
          ],
          "step": [
            {
              "@type": "HowToStep",
              "name": "Download & Install the APK",
              "text": "Download QuantaLLM-v1.3.0.apk, enable 'Install from unknown sources' in Settings → Security, then open the APK from your Files app and tap Install.",
              "position": 1
            },
            {
              "@type": "HowToStep",
              "name": "Grant Storage Permission",
              "text": "Launch QuantaLLM and tap 'Scan Models'. When the permission dialog appears, tap Allow to let the app scan your Downloads and Documents folders for model files.",
              "position": 2
            },
            {
              "@type": "HowToStep",
              "name": "Add a GGUF Model to Your Device",
              "text": "Open huggingface.co in your browser, search for a model with 'GGUF' (e.g. 'Phi-3 Mini GGUF'), pick a Q4_K_M quantization, and download the .gguf file to your Downloads folder.",
              "position": 3
            },
            {
              "@type": "HowToStep",
              "name": "Load the Model in QuantaLLM",
              "text": "Open QuantaLLM and tap the model selector. Your downloaded model will appear — tap it to load. On Snapdragon 8 Gen 2/3/Elite devices, Hexagon NPU acceleration activates automatically.",
              "position": 4
            },
            {
              "@type": "HowToStep",
              "name": "Start Chatting Offline",
              "text": "Tap the chat input and type your first message. Responses stream token by token entirely on your device — no internet required. Adjust temperature, top-k, and top-p from the settings panel.",
              "position": 5
            }
          ]
        })}</script>
      </Helmet>
      <Navbar />
      <main className="relative min-h-screen bg-[#000000] pt-28 pb-24 px-6">
        <Suspense fallback={null}><MorphGeoBg /></Suspense>

        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <span className="text-[10px] font-mono text-primary/80 border border-primary/30 rounded-full px-3 py-1 tracking-widest uppercase mb-6 inline-block">
              Setup Guide
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              Get Started with QuantaLLM
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
              From zero to running a local LLM on your Android device in five steps.
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="flex items-center gap-2 group"
                aria-label={`Go to step ${i + 1}: ${s.title}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border text-xs font-mono font-bold transition-all ${
                  i < current
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : i === current
                    ? 'bg-primary border-primary text-black'
                    : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                }`}>
                  {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-px transition-colors ${i < current ? 'bg-primary/40' : 'bg-outline-variant/20'}`} />
                )}
              </button>
            ))}
          </div>

          {/* Main card — height is fully auto, no clipping */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 items-start">

            {/* Content — no fixed height, grows with content */}
            <div className="relative overflow-hidden">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={fadeSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{step.subtitle}</p>
                      <h2 className="font-headline text-2xl font-bold text-white leading-tight">{step.title}</h2>
                    </div>
                  </div>

                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{step.description}</p>

                  <ul className="space-y-3 mb-6">
                    {step.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-on-surface-variant leading-relaxed">{d}</span>
                      </li>
                    ))}
                  </ul>

                  {step.tip && (
                    <div className="bg-surface-container border-l-4 border-secondary p-4 rounded-r-lg text-sm text-on-surface-variant leading-relaxed">
                      <span className="font-bold text-secondary">Tip: </span>{step.tip}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Image panel — auto-scrolling when multiple images */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ImagePanel images={step.images} imageBg={step.imageBg} stepIndex={current} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed font-headline font-bold text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-on-surface-variant/50 text-xs font-mono">
              {current + 1} / {steps.length}
            </span>

            {current < steps.length - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-3 rounded-lg thermal-gradient text-black font-headline font-bold text-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <a
                href="https://github.com/NaMan6122/QuantaLLM-Releases/releases/download/v1.3.0/QuantaLLM-v1.3.0.apk"
                className="flex items-center gap-2 px-5 py-3 rounded-lg thermal-gradient text-black font-headline font-bold text-sm"
              >
                <Download className="w-4 h-4" /> Download APK
              </a>
            )}
          </div>

          {/* Quick links */}
          <div className="mt-16 pt-10 border-t border-outline-variant/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/models"
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-container border border-outline-variant/15 hover:border-primary/30 transition-colors text-sm font-medium text-on-surface-variant hover:text-white"
            >
              <Cpu className="w-4 h-4 text-primary shrink-0" />
              Browse compatible models
            </Link>
            <Link
              to="/docs/model-formats"
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-container border border-outline-variant/15 hover:border-secondary/30 transition-colors text-sm font-medium text-on-surface-variant hover:text-white"
            >
              <FolderOpen className="w-4 h-4 text-secondary shrink-0" />
              Model formats & quantization
            </Link>
            <Link
              to="/docs"
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-container border border-outline-variant/15 hover:border-white/20 transition-colors text-sm font-medium text-on-surface-variant hover:text-white"
            >
              <MessageSquare className="w-4 h-4 text-white/50 shrink-0" />
              Full documentation
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
