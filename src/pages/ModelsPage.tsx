import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Models from '../components/Models';
import Footer from '../components/Footer';

const HoloCardsBg = lazy(() => import('../components/HoloCardsBg'));

export default function ModelsPage() {
  return (
    <>
      <Helmet>
        <title>Supported Models — QuantaLLM</title>
        <meta name="description" content="Browse models supported by QuantaLLM: Llama 3, Mistral, Phi-3, Gemma 2, Qwen 2, and more. Filter by size, quantization, and hardware requirements." />
        <link rel="canonical" href="https://quanta-web-pi.vercel.app/models" />
        <meta property="og:url" content="https://quanta-web-pi.vercel.app/models" />
        <meta property="og:title" content="Supported Models — QuantaLLM" />
        <meta property="og:description" content="Browse models supported by QuantaLLM: Llama 3, Mistral, Phi-3, Gemma 2, Qwen 2, and more." />
      </Helmet>
      <Navbar />
      <main className="relative pt-20">
        <Suspense fallback={null}>
          <HoloCardsBg />
        </Suspense>
        <Models />
      </main>
      <Footer />
    </>
  );
}
