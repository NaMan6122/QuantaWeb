import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

const DocsLayout = lazy(() => import('./docs/DocsLayout'));
const ModelsPage = lazy(() => import('./pages/ModelsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
    <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
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
  );
}
