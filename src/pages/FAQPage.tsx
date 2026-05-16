import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const PurpleAmbientBg = lazy(() => import('../components/PurpleAmbientBg'));

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>FAQ — QuantaLLM On-Device LLM Inference</title>
        <meta name="description" content="Answers to common questions about QuantaLLM — hardware compatibility, model formats, battery usage, privacy, and the AIDL cross-app inference API." />
        <link rel="canonical" href="https://quantallm.dev/faq" />
        <meta property="og:url" content="https://quantallm.dev/faq" />
        <meta property="og:title" content="FAQ — QuantaLLM On-Device LLM Inference" />
        <meta property="og:description" content="Answers to common questions about QuantaLLM — hardware compatibility, model formats, battery usage, privacy, and the AIDL cross-app inference API." />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {"@type":"Question","name":"What is QuantaLLM?","acceptedAnswer":{"@type":"Answer","text":"QuantaLLM is an Android application that lets you run large language models entirely on your device with no internet connection required. It leverages the Qualcomm AI Engine and Hexagon NPU to deliver fast, private, on-device inference for a wide range of open-weight models."}},
              {"@type":"Question","name":"Is it really 100% offline?","acceptedAnswer":{"@type":"Answer","text":"Yes. Once you have downloaded a model, all inference happens locally on your device hardware. No data is ever sent to external servers, and the app requires zero network connectivity to generate responses."}},
              {"@type":"Question","name":"What Android version do I need?","acceptedAnswer":{"@type":"Answer","text":"QuantaLLM requires Android 12 (API 31) or later. We recommend Android 13+ for the best experience."}},
              {"@type":"Question","name":"What models are supported?","acceptedAnswer":{"@type":"Answer","text":"QuantaLLM supports Llama 3, Mistral, Phi-3, Gemma 2, Qwen 2, and many more open-weight models in GGUF and ONNX formats."}},
              {"@type":"Question","name":"What is Hexagon NPU acceleration?","acceptedAnswer":{"@type":"Answer","text":"The Hexagon NPU is a dedicated AI accelerator in Qualcomm Snapdragon chipsets. QuantaLLM offloads matrix operations to it for 2-5x faster inference compared to CPU-only execution."}},
              {"@type":"Question","name":"Can other apps use QuantaLLM inference?","acceptedAnswer":{"@type":"Answer","text":"Yes. QuantaLLM exposes an AIDL service that other apps can bind to for on-device inference, enabling a shared-service model across your Android device."}},
              {"@type":"Question","name":"Is my data private?","acceptedAnswer":{"@type":"Answer","text":"Completely. All conversations and data stay on your device. QuantaLLM collects no telemetry, logs no prompts, and transmits nothing over the network."}},
              {"@type":"Question","name":"How fast is inference?","acceptedAnswer":{"@type":"Answer","text":"On a Snapdragon 8 Gen 3 device with a 7B Q4 model, you can expect 12-15 tokens per second. Smaller models on newer hardware can exceed 40 tokens per second."}}
            ]
          }
        `}</script>
      </Helmet>
      <Suspense fallback={null}>
        <PurpleAmbientBg />
      </Suspense>
      <Navbar />
      <main className="pt-20">
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
