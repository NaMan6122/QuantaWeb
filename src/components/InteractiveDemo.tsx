import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { motion, useInView } from 'motion/react';
import { Smartphone, Sparkles, Download, Wifi, WifiOff, Bell } from 'lucide-react';

const WaveformBg = lazy(() => import('./WaveformBg'));

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const exchanges: [string, string][] = [
  [
    'Explain quantum computing in simple terms',
    'Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously, unlike classical bits which are either 0 or 1. This allows quantum computers to process many possibilities at once, making them powerful for specific problems like cryptography, drug discovery, and optimization.',
  ],
  [
    'What makes it faster than regular computers?',
    "It's not universally faster — quantum computers excel at parallel exploration of possibilities through superposition and entanglement. For tasks like factoring large numbers or simulating molecules, they can solve in minutes what would take classical computers thousands of years. But for everyday tasks like browsing the web, your phone is still faster.",
  ],
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function randomBetween(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

/* ------------------------------------------------------------------ */
/*  Sub‑components                                                     */
/* ------------------------------------------------------------------ */

function BlinkingCursor() {
  return (
    <span className="inline-block w-[2px] h-[1.1em] align-middle bg-primary ml-0.5 animate-pulse" />
  );
}

function ChatBubble({ msg, streaming }: { msg: Message; streaming?: boolean }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-body ${
          isUser
            ? 'bg-primary/15 text-white rounded-br-md'
            : 'bg-surface-container-high text-white/90 rounded-bl-md'
        }`}
      >
        {msg.text}
        {streaming && <BlinkingCursor />}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function InteractiveDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokensPerSec, setTokensPerSec] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const hasStarted = useRef(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat (within the chat container only, not the page)
  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingText]);

  // Token counter fluctuation
  useEffect(() => {
    if (!isStreaming) {
      setTokensPerSec(null);
      return;
    }
    setTokensPerSec(randomBetween(10, 14));
    const id = setInterval(() => setTokensPerSec(randomBetween(10, 14)), 400);
    return () => clearInterval(id);
  }, [isStreaming]);

  /* ---- playback engine ---- */
  const play = useCallback(async () => {
    for (let i = 0; i < exchanges.length; i++) {
      const [userText, aiText] = exchanges[i];

      // User message — instant
      setMessages((prev) => [...prev, { role: 'user', text: userText }]);

      // Pause before AI starts
      await wait(600);

      // AI message — stream character by character
      setIsStreaming(true);
      let buffer = '';
      for (let c = 0; c < aiText.length; c++) {
        buffer += aiText[c];
        setStreamingText(buffer);
        await wait(30);
      }

      // Commit the AI message
      setIsStreaming(false);
      setStreamingText('');
      setMessages((prev) => [...prev, { role: 'assistant', text: aiText }]);

      // Pause between exchanges
      if (i < exchanges.length - 1) await wait(1500);
    }

    setDone(true);
  }, []);

  useEffect(() => {
    if (isInView && !hasStarted.current) {
      hasStarted.current = true;
      play();
    }
  }, [isInView, play]);

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative py-32 px-6 md:px-12 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,10,12,1) 0%, rgba(16,16,20,1) 50%, rgba(10,10,12,1) 100%)',
      }}
    >
      <Suspense fallback={null}>
        <WaveformBg active={isStreaming} />
      </Suspense>
      <div className="max-w-[1440px] mx-auto">
        {/* ---- Section header ---- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="font-body text-on-surface-variant text-lg max-w-xl mx-auto">
            Real-time on-device inference, simulated
          </p>
        </motion.div>

        {/* ---- Demo frame ---- */}
        <div className="flex flex-col items-center gap-6">
          {/* Local badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-container-low px-4 py-1.5 text-xs font-mono text-white/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Running locally&nbsp;&middot;&nbsp;No internet
            <WifiOff className="w-3 h-3 text-white/40" />
          </motion.div>

          {/* Phone / chat frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md md:max-w-lg rounded-3xl border border-white/5 bg-surface-container shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/30 bg-surface-container-high/60 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/15">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-headline font-semibold text-white leading-none">
                    QuantaLLM
                  </p>
                  <p className="text-[11px] font-mono text-white/40 mt-0.5">
                    Llama 3.2 1B&nbsp;&middot;&nbsp;Q4_K_M
                  </p>
                </div>
              </div>

              {/* Tokens/sec */}
              <div className="text-right">
                {tokensPerSec !== null ? (
                  <motion.p
                    key={tokensPerSec}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-mono text-primary tabular-nums"
                  >
                    {tokensPerSec.toFixed(1)}&nbsp;tok/s
                  </motion.p>
                ) : (
                  <p className="text-xs font-mono text-white/20">idle</p>
                )}
              </div>
            </div>

            {/* Chat body */}
            <div ref={chatBodyRef} className="flex flex-col gap-3 p-4 min-h-[340px] max-h-[420px] overflow-y-auto scroll-smooth">
              {messages.map((msg, i) => (
                <ChatBubble key={i} msg={msg} />
              ))}

              {/* Currently streaming message */}
              {isStreaming && streamingText && (
                <ChatBubble
                  msg={{ role: 'assistant', text: streamingText }}
                  streaming
                />
              )}
            </div>

            {/* Input bar (decorative) */}
            <div className="px-4 py-3 border-t border-white/5">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/25 font-body">
                <span>Message QuantaLLM...</span>
              </div>
            </div>
          </motion.div>

          {/* CTA after completion */}
          {done && (
            <motion.a
              href="https://github.com/NaMan6122/QuantaLLM2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mt-4 rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3 text-sm font-headline font-semibold text-black hover:brightness-110 transition-all"
            >
              <Bell className="w-4 h-4" />
              Coming soon — star us on GitHub
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
