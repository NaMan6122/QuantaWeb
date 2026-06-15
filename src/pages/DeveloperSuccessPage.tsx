import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Copy, ExternalLink, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DeveloperSuccessPage() {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLicenseKey(params.get('license_key'));
    setPaymentId(params.get('payment_id'));
  }, []);

  const handleCopy = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Developer Tier Purchase — QuantaLLM</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-[#000000] pt-28 pb-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          {licenseKey ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
                Purchase Confirmed
              </h1>
              <p className="text-on-surface-variant text-base mb-8">
                Your QuantaLLM Developer Tier license is ready. Use the key below to activate the SDK.
              </p>

              <div className="bg-surface-container rounded-xl border border-white/10 p-6 mb-8">
                <div className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mb-2 text-left">
                  License Key
                </div>
                <div className="flex items-center gap-2 bg-surface-container-high rounded-lg px-4 py-3 border border-white/5">
                  <code className="flex-1 text-sm font-mono text-primary text-left break-all">
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

              <div className="space-y-4">
                <h2 className="font-headline text-lg font-bold text-white">Getting Started</h2>
                <ol className="text-left space-y-3 text-sm text-on-surface-variant">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold shrink-0">1.</span>
                    <span>Add the SDK dependency to your Android project.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold shrink-0">2.</span>
                    <span>
                      Call <code className="text-primary font-mono text-xs">QuantaLLM.initialize(context, licenseKey)</code> with the key above.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold shrink-0">3.</span>
                    <span>
                      Create an engine via <code className="text-primary font-mono text-xs">QuantaLLM.createEngine(backend)</code> and start inferring.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/NaMan6122/QuantaLLM-SDK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  SDK Documentation
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
                <p className="text-xs text-on-surface-variant/50 mt-8 font-mono">
                  Payment ID: {paymentId}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
                Payment Successful
              </h1>
              <p className="text-on-surface-variant text-base mb-8">
                Thank you for your purchase. If you don't see your license key above, check your email — it was sent there as well.
              </p>
              <p className="text-on-surface-variant/50 text-sm">
                Didn't receive it? <a href="mailto:namang2510@gmail.com" className="text-primary hover:underline">Contact support</a>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}