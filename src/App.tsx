import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import InferencePipeline from './components/InferencePipeline';
import Stats from './components/Stats';
import Benchmarks from './components/Benchmarks';
import InteractiveDemo from './components/InteractiveDemo';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import CustomCursor from './components/CustomCursor';

const DocsLayout = lazy(() => import('./docs/DocsLayout'));
const ModelsPage = lazy(() => import('./pages/ModelsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const TutorialPage = lazy(() => import('./pages/TutorialPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Skeleton navbar */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center gap-4">
        <div className="w-28 h-5 rounded bg-white/5 animate-pulse" />
        <div className="flex-1" />
        <div className="w-16 h-4 rounded bg-white/5 animate-pulse" />
        <div className="w-16 h-4 rounded bg-white/5 animate-pulse" />
      </div>
      {/* Skeleton content */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <div className="w-2/3 h-8 rounded bg-white/5 animate-pulse" />
        <div className="w-full h-4 rounded bg-white/5 animate-pulse" />
        <div className="w-5/6 h-4 rounded bg-white/5 animate-pulse" />
        <div className="w-full h-4 rounded bg-white/5 animate-pulse" />
        <div className="w-3/4 h-4 rounded bg-white/5 animate-pulse" />
        <div className="w-full h-40 rounded-xl bg-white/5 animate-pulse mt-8" />
      </div>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is QuantaLLM?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuantaLLM is an Android application that lets you run large language models entirely on your device with no internet connection required. It leverages the Qualcomm AI Engine and Hexagon NPU to deliver fast, private, on-device inference for a wide range of open-weight models.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it really 100% offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Once you have downloaded a model, all inference happens locally on your device hardware. No data is ever sent to external servers, and the app requires zero network connectivity to generate responses. You can even enable airplane mode and everything works perfectly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I run AI on my phone without internet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. QuantaLLM runs AI models entirely on-device — no internet connection is needed at any point after downloading the model. It works in airplane mode, on planes, in areas with no signal, and anywhere else without connectivity.',
        },
      },
      {
        '@type': 'Question',
        name: 'What Android version do I need?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuantaLLM requires Android 12 (API 31) or later. We recommend Android 13+ for the best experience, as newer OS versions provide improved memory management and background process handling that benefit on-device inference workloads.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Community tier of QuantaLLM is completely free. It gives you full on-device inference, unlimited chat sessions, and support for 90+ model architectures — no account required, no cloud, no tracking.',
        },
      },
      {
        '@type': 'Question',
        name: 'What models are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuantaLLM supports a growing catalog of open-weight models including Llama 3, Mistral, Phi-3, Gemma 2, Qwen 2, and many more — over 90 GGUF architectures in total. Models can be loaded from Hugging Face or the in-app model browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'What quantization should I use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For most devices, we recommend Q4_K_M quantization as it offers the best balance between quality and performance. Devices with 12 GB+ RAM can run Q8 variants for higher accuracy. Lower quantizations like Q2 are available for very constrained devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much storage do models need?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Storage requirements vary by model and quantization level. A 7B-parameter model at Q4 quantization typically requires around 4 GB, while a 13B model at Q4 needs roughly 7–8 GB. Exact file sizes are shown in the model browser before downloading.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where do I get models?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Models can be downloaded directly within the QuantaLLM app from the curated model hub. You can also import compatible GGUF files from Hugging Face or other sources by placing them in the designated models directory on your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'What devices work best?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Devices with Qualcomm Snapdragon 8 Gen 2 or newer processors deliver the best experience thanks to their powerful Hexagon NPU. Flagship phones like the Samsung Galaxy S24 Ultra, OnePlus 12, and Xiaomi 14 Pro are excellent choices. Devices with at least 8 GB of RAM are recommended.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Hexagon NPU acceleration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Hexagon NPU (Neural Processing Unit) is a dedicated AI accelerator built into Qualcomm Snapdragon chipsets. QuantaLLM offloads matrix operations to this hardware for dramatically faster inference compared to CPU-only execution, often achieving a 2–5x speedup while using less power.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will running AI on my phone drain the battery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On-device inference does consume significant power during active generation, similar to gaming or video editing. However, NPU-accelerated inference is far more power-efficient than CPU-only. A typical 15–20 minute session uses roughly 5–8% battery on modern flagships.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it work on tablets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. QuantaLLM works on any Android tablet that meets the minimum hardware requirements. Tablets with Snapdragon processors and large RAM configurations are particularly well-suited, and the UI adapts to larger screen sizes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can other apps use QuantaLLM\'s inference?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. QuantaLLM exposes an AIDL service that other apps can bind to for on-device inference. This allows third-party developers to integrate local LLM capabilities into their own apps without bundling a separate inference engine.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Completely. All conversations and data stay on your device at all times. QuantaLLM collects no telemetry, logs no prompts, and transmits nothing over the network. Your chat history is stored in a local encrypted database that only you can access.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast is inference?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On a Snapdragon 8 Gen 3 device with a 7B Q4 model, you can expect 15–30 tokens per second for generation. Prompt processing typically runs at 100–300+ tokens per second. Smaller models on newer hardware can exceed 40 tokens per second.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to run an AI language model on your Android phone offline',
    description: 'Run a large language model completely on your Android phone with no internet connection using QuantaLLM.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Download QuantaLLM and a model',
        text: 'Download the QuantaLLM APK and install it on your Android device (Android 12+). Then pick a GGUF or ONNX model from the in-app browser or import one from Hugging Face.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Load the model on your device',
        text: 'Open the app and load your chosen model. QuantaLLM runs all inference locally — no internet connection is needed at this point or ever again for that model.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Chat privately, completely offline',
        text: 'Start a conversation. Responses are generated in real time, streamed token by token, entirely on your phone hardware. Your prompts never leave the device.',
      },
    ],
  };

  return (
    <PageWrapper>
      <Helmet>
        <title>QuantaLLM — Run AI on Your Phone Without Internet | On-Device LLM for Android</title>
        <meta name="description" content="Run AI on your Android phone with no internet. QuantaLLM runs large language models 100% offline — no cloud, no tracking, works in airplane mode. Free download. Powered by llama.cpp + Hexagon NPU." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/" />
        <meta property="og:title" content="QuantaLLM — Run AI on Your Phone Without Internet" />
        <meta property="og:description" content="Run AI models 100% offline on your Android phone. No internet, no cloud, no tracking. Free download. Powered by llama.cpp + Hexagon NPU." />
        <meta property="og:image" content="https://quanta-web-pi.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://quanta-web-pi.vercel.app/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <InferencePipeline />
        <Benchmarks />
        <InteractiveDemo />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </PageWrapper>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <BackToTop />
      <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/features"
            element={
              <PageWrapper>
                <FeaturesPage />
              </PageWrapper>
            }
          />
          <Route
            path="/docs/*"
            element={
              <PageWrapper>
                <DocsLayout />
              </PageWrapper>
            }
          />
          <Route
            path="/models"
            element={
              <PageWrapper>
                <ModelsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/faq"
            element={
              <PageWrapper>
                <FAQPage />
              </PageWrapper>
            }
          />
          <Route
            path="/compare"
            element={
              <PageWrapper>
                <ComparePage />
              </PageWrapper>
            }
          />
          <Route
            path="/changelog"
            element={
              <PageWrapper>
                <ChangelogPage />
              </PageWrapper>
            }
          />
          <Route
            path="/roadmap"
            element={
              <PageWrapper>
                <RoadmapPage />
              </PageWrapper>
            }
          />
          <Route
            path="/tutorial"
            element={
              <PageWrapper>
                <TutorialPage />
              </PageWrapper>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageWrapper>
                <PrivacyPage />
              </PageWrapper>
            }
          />
          <Route
            path="*"
            element={
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
    </>
  );
}
