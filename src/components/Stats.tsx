import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';

interface StatDef {
  value: string;
  numericEnd?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color: string;
}

const stats: StatDef[] = [
  { value: '0ms', numericEnd: 0, suffix: 'ms', label: 'Cloud Latency', color: 'text-primary' },
  { value: '2', numericEnd: 2, label: 'Inference Engines', color: 'text-secondary' },
  { value: '6', numericEnd: 6, label: 'HTP Versions (v68-v81)', color: 'text-primary' },
  { value: '90+', numericEnd: 90, suffix: '+', label: 'GGUF Architectures', color: 'text-white' },
  { value: 'Q4_K_M', label: 'Recommended Quantization', color: 'text-secondary' },
  { value: 'ARM64', label: 'Target Architecture', color: 'text-primary' },
];

function AnimatedStat({ stat, inView }: { stat: StatDef; inView: boolean }) {
  const [displayed, setDisplayed] = useState(stat.numericEnd !== undefined ? '0' : '');
  const [visible, setVisible] = useState(false);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Non-numeric: just fade in
    if (stat.numericEnd === undefined) {
      setVisible(true);
      return;
    }

    setVisible(true);
    const end = stat.numericEnd;
    if (end === 0) {
      setDisplayed('0');
      return;
    }

    const duration = 1200;
    let start: number | null = null;

    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(String(Math.round(eased * end)));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [stat.numericEnd]);

  useEffect(() => {
    if (inView) animate();
  }, [inView, animate]);

  const isNumeric = stat.numericEnd !== undefined;
  const text = isNumeric ? `${stat.prefix ?? ''}${displayed}${stat.suffix ?? ''}` : stat.value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group cursor-default"
    >
      <div
        className={`font-headline text-5xl font-bold ${stat.color} mb-2 transition-all duration-300 group-hover:scale-110`}
      >
        {text}
      </div>
      <div className="font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold transition-colors group-hover:text-white">
        {stat.label}
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 border-y border-outline-variant/10 bg-black/40">
      <div
        ref={ref}
        className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 text-center"
      >
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} stat={stat} inView={inView} />
        ))}
      </div>
    </section>
  );
}
