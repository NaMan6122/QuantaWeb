import { Link } from 'react-router-dom';

const GITHUB_URL = "https://github.com/NaMan6122/QuantaLLM2";

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
          </div>

          {/* Developers */}
          <div className="flex flex-col gap-4">
            <span className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">Developers</span>
            <Link to="/docs" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Documentation
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
            >
              GitHub
            </a>
            <Link to="/docs/aidl-service" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              AIDL Guide
            </Link>
          </div>

          {/* Project */}
          <div className="flex flex-col gap-4">
            <span className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">Project</span>
            <Link to="/faq" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              Privacy
            </Link>
            <a
              href={`${GITHUB_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
            >
              License
            </a>
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-on-surface-variant text-xs font-medium tracking-wide">
            &copy; 2025 QuantaLLM. Open Source. Local. Private.
          </div>
          <div className="flex gap-8">
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Coming Soon</span>
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Cloud Latency: 0ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
