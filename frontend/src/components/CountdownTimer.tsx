import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  endTime: string | null;
  className?: string;
  endedText?: string;
  endedClassName?: string;
  /** Show urgent style (color + pulse) when under 1h; critical when under 10s */
  urgent?: boolean;
  /** Show as inline pill */
  pill?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  className = '',
  endedText = 'Ended',
  endedClassName = '',
  urgent = true,
  pill = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!endTime) {
      setTimeout(() => setTimeLeft('—'), 0);
      return;
    }

    const calculateTime = () => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      if (isNaN(end)) {
        setTimeLeft('—');
        return;
      }
      const diff = end - now;
      const seconds = Math.max(0, Math.floor(diff / 1000));
      setSecondsLeft(seconds);

      if (diff <= 0) {
        setTimeLeft(endedText);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else if (mins > 0) setTimeLeft(`${mins}m ${secs}s`);
      else setTimeLeft(`${secs}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime, endedText]);

  const isEnded = timeLeft === endedText;
  const isCritical = urgent && !isEnded && secondsLeft > 0 && secondsLeft <= 10;
  const isHot = urgent && !isEnded && secondsLeft > 10 && secondsLeft < 3600; // < 1h
  const isWarm = urgent && !isEnded && secondsLeft >= 3600 && secondsLeft < 24 * 3600; // < 24h

  const color = isCritical
    ? 'var(--color-loss)'
    : isHot
    ? 'var(--color-pending)'
    : isWarm
    ? 'var(--color-fg)'
    : 'var(--color-fg-muted)';

  if (pill) {
    return (
      <motion.span
        animate={isCritical ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${className}`.trim()}
        style={{
          background: isCritical
            ? 'var(--color-loss-soft)'
            : isHot
            ? 'var(--color-pending-soft)'
            : 'var(--color-surface-2)',
          color,
        }}
      >
        {isCritical && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
        {timeLeft}
      </motion.span>
    );
  }

  const combinedClass = `${className} ${isEnded ? endedClassName : ''}`.trim();
  return (
    <motion.span
      animate={isCritical ? { scale: [1, 1.08, 1] } : undefined}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      className={`tabular-nums ${combinedClass}`}
      style={{ color: isEnded ? undefined : color }}
    >
      {timeLeft}
    </motion.span>
  );
};
