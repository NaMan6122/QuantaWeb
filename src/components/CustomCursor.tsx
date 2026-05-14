import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Custom cursor with space-time distortion ring + click shockwave    */
/*  ----------------------------------------------------------------  */
/*  - Small dot follows the mouse precisely                            */
/*  - Outer ring lags behind with spring physics                       */
/*  - On hover over interactive elements: ring expands + warps         */
/*  - On click: expanding shockwave ripple from cursor position        */
/*  - Hidden on mobile / touch devices                                 */
/* ------------------------------------------------------------------ */

interface Ripple {
  id: number;
  x: number;
  y: number;
  startTime: number;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);
  const isPressed = useRef(false);
  const ripples = useRef<Ripple[]>([]);
  const rippleId = useRef(0);
  const rafRef = useRef<number>(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    // Hide default cursor globally
    document.documentElement.style.cursor = 'none';
    return () => {
      document.documentElement.style.cursor = '';
    };
  }, []);

  // Track hover over interactive elements
  useEffect(() => {
    if (isTouchDevice) return;

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]');
      isHovering.current = !!interactive;
    };

    document.addEventListener('mouseover', handleOver, { passive: true });
    return () => document.removeEventListener('mouseover', handleOver);
  }, [isTouchDevice]);

  // Mouse move
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isTouchDevice]);

  // Mouse down/up for press state + ripple spawn
  useEffect(() => {
    if (isTouchDevice) return;

    const handleDown = (e: MouseEvent) => {
      isPressed.current = true;
      ripples.current.push({
        id: rippleId.current++,
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
      });
    };

    const handleUp = () => {
      isPressed.current = false;
    };

    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isTouchDevice]);

  // Resize canvas
  useEffect(() => {
    if (isTouchDevice) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isTouchDevice]);

  // Animation loop
  useEffect(() => {
    if (isTouchDevice) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Spring-follow for ring
      const dx = mouse.current.x - ringPos.current.x;
      const dy = mouse.current.y - ringPos.current.y;
      ringPos.current.x += dx * 0.15;
      ringPos.current.y += dy * 0.15;

      // Dot — direct follow
      dot.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px)`;

      // Ring — lagged follow with hover/press expansion
      const baseSize = isHovering.current ? 56 : 32;
      const size = isPressed.current ? baseSize * 0.8 : baseSize;
      const borderWidth = isHovering.current ? 2 : 1.5;
      const opacity = isHovering.current ? 0.8 : 0.4;

      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.borderWidth = `${borderWidth}px`;
      ring.style.opacity = `${opacity}`;
      ring.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;

      // Distortion effect on hover — slight skew
      if (isHovering.current) {
        const skewX = dx * 0.08;
        const skewY = dy * 0.08;
        ring.style.transform += ` skew(${skewX}deg, ${skewY}deg)`;
      }

      // Draw ripples on canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();

      ripples.current = ripples.current.filter((r) => {
        const elapsed = now - r.startTime;
        const duration = 600;
        if (elapsed > duration) return false;

        const progress = elapsed / duration;
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const radius = eased * 120;
        const ringAlpha = (1 - progress) * 0.5;
        const ringWidth = 2 * (1 - progress) + 0.5;

        // Outer shockwave ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 159, 74, ${ringAlpha})`;
        ctx.lineWidth = ringWidth;
        ctx.stroke();

        // Inner secondary ring (tighter, faster)
        const innerRadius = eased * 60;
        const innerAlpha = (1 - progress) * 0.3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 115, 76, ${innerAlpha})`;
        ctx.lineWidth = ringWidth * 0.6;
        ctx.stroke();

        // Faint radial glow
        const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius * 0.6);
        gradient.addColorStop(0, `rgba(255, 159, 74, ${0.08 * (1 - progress)})`);
        gradient.addColorStop(1, 'rgba(255, 159, 74, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Ripple canvas — full viewport */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        aria-hidden="true"
      />

      {/* Dot — small solid circle */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none"
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#ff9f4a',
          boxShadow: '0 0 8px rgba(255, 159, 74, 0.6)',
          willChange: 'transform',
        }}
      />

      {/* Ring — outer distortion ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 159, 74, 0.4)',
          transition: 'width 0.25s ease, height 0.25s ease, border-width 0.25s ease, opacity 0.25s ease',
          willChange: 'transform',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}
