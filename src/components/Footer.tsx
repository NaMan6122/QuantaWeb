import { Link } from 'react-router-dom';
import { Mail, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/90 backdrop-blur-sm w-full py-20 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1">
            <div className="text-xl font-bold text-white mb-6 uppercase tracking-tighter font-headline">QuantaLLM</div>
            <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
              On-device LLM inference for Android. Private by design. Powered by llama.cpp.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <span className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">Product</span>
            <Link to="/features" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Features
            </Link>
            <Link to="/models" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Models
            </Link>
            <Link to="/changelog" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Changelog
            </Link>
            <Link to="/compare" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Compare
            </Link>
            <Link to="/roadmap" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Roadmap
            </Link>
            <Link to="/tutorial" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Setup Guide
            </Link>
          </div>

          {/* Developers */}
          <div className="flex flex-col gap-4">
            <span className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">Developers</span>
            <Link to="/docs" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Documentation
            </Link>
            <Link to="/docs/aidl-service" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              AIDL Guide
            </Link>
            <Link to="/faq" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              FAQ
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <span className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">Contact</span>
            <a
              href="mailto:namang2510@gmail.com"
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              namang2510@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/namangupta2510/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
            >
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn
            </a>
            <a
              href="https://github.com/NaMan6122"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-on-surface-variant text-xs font-medium tracking-wide">
            &copy; 2026 QuantaLLM. Local. Private.
          </div>
          <div className="flex gap-8">
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-[0.2em] font-bold">v1.3.0 Live</span>
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Cloud Latency: 0ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
