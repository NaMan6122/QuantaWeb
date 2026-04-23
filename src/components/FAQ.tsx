import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'General',
    items: [
      {
        question: 'What is QuantaLLM?',
        answer:
          'QuantaLLM is an Android application that lets you run large language models entirely on your device with no internet connection required. It leverages the Qualcomm AI Engine and Hexagon NPU to deliver fast, private, on-device inference for a wide range of open-weight models.',
      },
      {
        question: 'Is it really 100% offline?',
        answer:
          'Yes. Once you have downloaded a model, all inference happens locally on your device hardware. No data is ever sent to external servers, and the app requires zero network connectivity to generate responses. You can even enable airplane mode and everything works perfectly.',
      },
      {
        question: 'What Android version do I need?',
        answer:
          'QuantaLLM requires Android 12 (API 31) or later. We recommend Android 13+ for the best experience, as newer OS versions provide improved memory management and background process handling that benefit on-device inference workloads.',
      },
      {
        question: 'Is it free or open source?',
        answer:
          'QuantaLLM offers a free tier that lets you run smaller models with no restrictions. The Pro tier unlocks larger models, higher context lengths, and priority support. The inference engine core is open source under the Apache 2.0 license, and community contributions are welcome.',
      },
    ],
  },
  {
    title: 'Models',
    items: [
      {
        question: 'What models are supported?',
        answer:
          'QuantaLLM supports a growing catalog of open-weight models including Llama 3, Mistral, Phi-3, Gemma 2, Qwen 2, and many more. We regularly add new models as they are released and optimized for on-device execution through our QNN compilation pipeline.',
      },
      {
        question: 'What quantization should I use?',
        answer:
          'For most devices, we recommend 4-bit (Q4) quantization as it offers the best balance between quality and performance. Devices with 12 GB+ RAM can comfortably run 8-bit (Q8) variants for higher accuracy. Lower quantizations like Q2 are available for very constrained devices but may reduce output quality.',
      },
      {
        question: 'How much storage do models need?',
        answer:
          'Storage requirements vary by model and quantization level. A 7B-parameter model at Q4 quantization typically requires around 4 GB, while a 13B model at Q4 needs roughly 7-8 GB. We display exact file sizes in the model browser before you download anything.',
      },
      {
        question: 'Where do I get models?',
        answer:
          'Models can be downloaded directly within the QuantaLLM app from our curated model hub, which hosts pre-optimized and verified variants. You can also import compatible GGUF files from Hugging Face or other sources by placing them in the designated models directory on your device.',
      },
    ],
  },
  {
    title: 'Hardware',
    items: [
      {
        question: 'What devices work best?',
        answer:
          'Devices with Qualcomm Snapdragon 8 Gen 2 or newer processors deliver the best experience thanks to their powerful Hexagon NPU. Flagship phones like the Samsung Galaxy S24 Ultra, OnePlus 12, and Xiaomi 14 Pro are excellent choices. Devices with at least 8 GB of RAM are recommended for smooth operation.',
      },
      {
        question: 'What is Hexagon NPU acceleration?',
        answer:
          'The Hexagon NPU (Neural Processing Unit) is a dedicated AI accelerator built into Qualcomm Snapdragon chipsets. QuantaLLM offloads matrix operations to this hardware for dramatically faster inference compared to CPU-only execution, often achieving 2-5x speedup while using less power.',
      },
      {
        question: 'Will it drain my battery?',
        answer:
          'On-device inference does consume significant power during active generation, similar to gaming or video editing. However, NPU-accelerated inference is far more power-efficient than running on the CPU alone. A typical conversation session of 15-20 minutes uses roughly 5-8% battery on modern flagships.',
      },
      {
        question: 'Does it work on tablets?',
        answer:
          'Absolutely. QuantaLLM works on any Android tablet that meets the minimum hardware requirements. Tablets with Snapdragon processors and large RAM configurations are particularly well-suited, and the UI adapts to larger screen sizes for a comfortable experience.',
      },
    ],
  },
  {
    title: 'Technical',
    items: [
      {
        question: 'Can other apps use QuantaLLM\'s inference?',
        answer:
          'Yes. QuantaLLM exposes an AIDL (Android Interface Definition Language) service that other apps can bind to for on-device inference. This allows third-party developers to integrate local LLM capabilities into their own apps without bundling a separate inference engine, enabling a shared-service model across your device.',
      },
      {
        question: 'Is my data private?',
        answer:
          'Completely. All conversations and data stay on your device at all times. QuantaLLM collects no telemetry, logs no prompts, and transmits nothing over the network. Your chat history is stored in a local encrypted database that only you can access.',
      },
      {
        question: 'How fast is inference?',
        answer:
          'Inference speed depends on your hardware and model choice. On a Snapdragon 8 Gen 3 device with a 7B Q4 model, you can expect 15-30 tokens per second for generation. Prompt processing (prefill) typically runs at 100-300+ tokens per second. Smaller models on newer hardware can exceed 40 tokens per second.',
      },
    ],
  },
];

function AccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 rounded-2xl bg-surface-container overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-container-high"
      >
        <span className="font-headline text-base md:text-lg text-white">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-primary"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 pb-5 font-body text-sm md:text-base leading-relaxed text-on-surface-variant">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="bg-[#000000] py-32 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
            Everything you need to know about running LLMs on your device.
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <div className="grid gap-16 max-w-3xl mx-auto">
          {faqData.map((category, catIdx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: catIdx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h3 className="font-headline text-sm font-semibold uppercase tracking-widest text-primary mb-6">
                {category.title}
              </h3>
              <div className="grid gap-3">
                {category.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
