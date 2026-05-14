import { useState, useEffect, useRef, useCallback } from 'react';

interface TypewriterTextProps {
  /** Array of strings to cycle through (type → pause → erase → next) */
  texts: string[];
  /** Static prefix rendered before the animated text */
  prefix?: string;
  /** Typing speed in ms per character */
  typeSpeed?: number;
  /** Erasing speed in ms per character */
  eraseSpeed?: number;
  /** Pause after fully typed (ms) */
  pauseAfterType?: number;
  /** Pause after fully erased before next word (ms) */
  pauseAfterErase?: number;
  /** CSS class for the animated text span */
  className?: string;
  /** CSS class for the blinking cursor */
  cursorClassName?: string;
}

export default function TypewriterText({
  texts,
  prefix,
  typeSpeed = 80,
  eraseSpeed = 40,
  pauseAfterType = 2000,
  pauseAfterErase = 400,
  className = '',
  cursorClassName = '',
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const tick = useCallback(() => {
    const current = texts[textIndex];

    if (!isErasing) {
      // Typing
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, typeSpeed);
      } else {
        // Fully typed — pause then start erasing
        timeoutRef.current = setTimeout(() => {
          setIsErasing(true);
        }, pauseAfterType);
      }
    } else {
      // Erasing
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, eraseSpeed);
      } else {
        // Fully erased — move to next text
        timeoutRef.current = setTimeout(() => {
          setIsErasing(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, pauseAfterErase);
      }
    }
  }, [displayed, textIndex, isErasing, texts, typeSpeed, eraseSpeed, pauseAfterType, pauseAfterErase]);

  useEffect(() => {
    tick();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tick]);

  return (
    <span>
      {prefix}
      <span className={className}>{displayed}</span>
      <span
        className={`inline-block w-[3px] h-[0.85em] align-middle ml-1 animate-pulse ${
          cursorClassName || 'bg-primary'
        }`}
      />
    </span>
  );
}
