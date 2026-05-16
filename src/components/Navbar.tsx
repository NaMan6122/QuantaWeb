import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Preload route chunks on hover
const preloadMap: Record<string, () => void> = {
  '/features': () => { import('../pages/FeaturesPage'); },
  '/docs': () => { import('../docs/DocsLayout'); },
  '/models': () => { import('../pages/ModelsPage'); },
  '/faq': () => { import('../pages/FAQPage'); },
  '/compare': () => { import('../pages/ComparePage'); },
  '/changelog': () => { import('../pages/ChangelogPage'); },
  '/roadmap': () => { import('../pages/RoadmapPage'); },
  '/tutorial': () => { import('../pages/TutorialPage'); },
};

const preloaded = new Set<string>();

function usePreload() {
  return useCallback((path: string) => {
    if (preloaded.has(path)) return;
    preloaded.add(path);
    preloadMap[path]?.();
  }, []);
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const preload = usePreload();

  const anchorLinks: { name: string; href: string }[] = [];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex justify-between items-center px-6 md:px-12 py-5 max-w-[1440px] mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter text-white uppercase font-headline hover:text-primary transition-colors"
          >
            QuantaLLM
          </Link>
          <span className="text-[10px] font-mono text-primary/80 border border-primary/30 rounded-full px-2 py-0.5 tracking-wide">
            v1.3.0
          </span>
        </motion.div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {anchorLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/features"
            onMouseEnter={() => preload('/features')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            Features
          </Link>
          <Link
            to="/docs"
            onMouseEnter={() => preload('/docs')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            Docs
          </Link>
          <Link
            to="/models"
            onMouseEnter={() => preload('/models')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            Models
          </Link>
          <Link
            to="/faq"
            onMouseEnter={() => preload('/faq')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            FAQ
          </Link>
          <Link
            to="/compare"
            onMouseEnter={() => preload('/compare')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            Compare
          </Link>
          <Link
            to="/roadmap"
            onMouseEnter={() => preload('/roadmap')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            Roadmap
          </Link>
          <Link
            to="/tutorial"
            onMouseEnter={() => preload('/tutorial')}
            className="font-headline text-sm font-medium tracking-tight text-on-surface-variant hover:text-white transition-colors duration-300"
          >
            Setup Guide
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <motion.a
            href="https://github.com/NaMan6122/QuantaLLM-Releases/releases/download/v1.3.0/QuantaLLM-v1.3.0.apk"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex thermal-gradient text-black px-6 py-2 rounded-lg font-bold font-headline text-sm tracking-tight items-center gap-2"
          >
            Download v1.3.0
            <Download className="w-4 h-4" />
          </motion.a>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-surface-container/95 backdrop-blur-xl"
          >
            <div className="flex flex-col px-6 py-6 gap-4">
              {anchorLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/features"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                to="/docs"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                to="/models"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                Models
              </Link>
              <Link
                to="/faq"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/compare"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                Compare
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                Roadmap
              </Link>
              <Link
                to="/tutorial"
                onClick={() => setMobileOpen(false)}
                className="font-headline text-base font-medium text-on-surface-variant hover:text-white transition-colors"
              >
                Setup Guide
              </Link>
              <a
                href="https://github.com/NaMan6122/QuantaLLM-Releases/releases/download/v1.3.0/QuantaLLM-v1.3.0.apk"
                onClick={() => setMobileOpen(false)}
                className="thermal-gradient text-black px-6 py-3 rounded-lg font-bold font-headline text-sm tracking-tight text-center mt-2 flex items-center justify-center gap-2"
              >
                Download v1.3.0
                <Download className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
