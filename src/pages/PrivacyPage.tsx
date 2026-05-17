import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — QuantaLLM</title>
        <meta name="description" content="QuantaLLM's privacy policy. All inference is 100% on-device. No data is collected, stored, or transmitted. Your conversations never leave your phone." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/privacy" />
      </Helmet>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 md:px-12 pt-40 pb-32">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">Privacy Policy</h1>
        <p className="text-on-surface-variant text-sm font-mono mb-12">Last updated: May 17, 2026 · v1.3.0</p>

        <section className="space-y-10 font-body text-on-surface-variant leading-relaxed">
          <div>
            <h2 className="font-headline text-xl font-bold text-white mb-3">The short version</h2>
            <p>
              QuantaLLM collects <strong className="text-white">nothing</strong>. No conversations, no prompts, no device identifiers, no analytics. All AI inference runs entirely on your phone. Nothing is ever sent to any server.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl font-bold text-white mb-3">Data we do not collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Your conversations or prompts</li>
              <li>Model outputs or responses</li>
              <li>Device identifiers, IP addresses, or location</li>
              <li>Usage analytics, crash reports, or telemetry</li>
              <li>Account information (no account is required)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline text-xl font-bold text-white mb-3">How inference works</h2>
            <p>
              Every inference request is processed by the llama.cpp engine running natively on your device. The app requires no network permission to run models. You can verify this by enabling airplane mode — QuantaLLM continues to work perfectly.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl font-bold text-white mb-3">Local storage</h2>
            <p>
              Chat history is stored in a local database on your device only. You can delete all data at any time by clearing the app's storage in Android settings. We have no access to this data.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl font-bold text-white mb-3">This website</h2>
            <p>
              The QuantaLLM website (<a href="https://quanta-web-pi.vercel.app" className="text-primary hover:underline">quanta-web-pi.vercel.app</a>) uses no cookies and no third-party analytics. Standard server access logs may be retained by the hosting provider (Vercel) per their own privacy policy.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl font-bold text-white mb-3">Contact</h2>
            <p>
              Questions about privacy?{' '}
              <a href="mailto:namang2510@gmail.com" className="text-primary hover:underline">
                namang2510@gmail.com
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
