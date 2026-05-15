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
  return (
    <PageWrapper>
      <Helmet>
        <title>QuantaLLM — On-Device LLM Inference for Android</title>
        <meta name="description" content="Run large language models entirely on your Android phone. Powered by llama.cpp with Hexagon NPU acceleration and ONNX Runtime — 100% offline, fully private inference on ARM64." />
        <link rel="canonical" href="https://quantallm.dev/" />
        <meta property="og:url" content="https://quantallm.dev/" />
        <meta property="og:title" content="QuantaLLM — On-Device LLM Inference for Android" />
        <meta property="og:description" content="Run LLMs entirely on your phone. Powered by llama.cpp, Hexagon NPU, and ONNX Runtime. 100% offline, fully private." />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <InferencePipeline />
        <Stats />
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
