import { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const scaleX = useSpring(0, { stiffness: 200, damping: 30 });

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    scaleX.set(progress);
  }, [progress, scaleX]);

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] thermal-gradient"
    />
  );
}
