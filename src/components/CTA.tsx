import { motion } from 'motion/react';
import { Smartphone, Github, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-32 px-6 md:px-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[800px] h-[800px] bg-secondary/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-headline text-6xl font-bold tracking-tighter mb-8"
        >
          Your Models. Your Hardware. Your Privacy.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-body text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Download QuantaLLM and run state-of-the-art language models right on your Android phone — completely offline, completely private, completely free.
        </motion.p>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {/* Get APK */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3 items-center"
          >
            <motion.a
              href="https://github.com/NaMan6122/QuantaLLM2/releases"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="w-64 py-5 rounded-xl font-bold font-headline text-xl flex items-center justify-center gap-3 transition-all thermal-gradient text-black"
            >
              <Smartphone className="w-6 h-6" />
              Get APK
            </motion.a>
            <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">
              Android 12+ · ARM64
            </span>
          </motion.div>

          {/* GitHub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 items-center"
          >
            <motion.a
              href="https://github.com/NaMan6122/QuantaLLM2"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="w-64 py-5 rounded-xl font-bold font-headline text-xl flex items-center justify-center gap-3 transition-all bg-surface-container text-white border border-outline-variant/30 hover:bg-surface-container-high hover:border-white/20"
            >
              <Github className="w-6 h-6" />
              GitHub
            </motion.a>
            <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">
              Source · MIT License
            </span>
          </motion.div>

          {/* Docs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 items-center"
          >
            <Link to="/docs">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-64 py-5 rounded-xl font-bold font-headline text-xl flex items-center justify-center gap-3 transition-all bg-surface-container text-white border border-outline-variant/30 hover:bg-surface-container-high hover:border-white/20"
              >
                <BookOpen className="w-6 h-6" />
                Docs
              </motion.div>
            </Link>
            <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">
              Architecture & Guides
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
