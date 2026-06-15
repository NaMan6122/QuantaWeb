import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#000000] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-lg"
      >
        <p className="font-mono text-primary text-sm tracking-widest uppercase mb-4">
          Error 404
        </p>
        <h1 className="font-headline text-7xl md:text-9xl font-bold tracking-tighter text-white mb-4">
          4
          <span className="thermal-text">0</span>
          4
        </h1>
        <p className="font-body text-on-surface-variant text-lg mb-2">
          This page doesn't exist on-device either.
        </p>
        <p className="font-body text-on-surface-variant/60 text-sm mb-12">
          Cloud latency: 0ms — because there's nothing here.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 thermal-gradient text-black px-6 py-3 rounded-lg font-bold font-headline text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center justify-center gap-2 bg-surface-container text-white border border-outline-variant/30 px-6 py-3 rounded-lg font-bold font-headline text-sm hover:bg-surface-container-high transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Read the Docs
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-1.5 text-on-surface-variant text-sm hover:text-white transition-colors font-body"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go back
        </button>
      </motion.div>
    </div>
  );
}
