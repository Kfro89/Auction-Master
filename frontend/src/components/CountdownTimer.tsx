import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string | null;
  className?: string;
  endedText?: string;
  endedClassName?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endTime, 
  className = "", 
  endedText = "Ended",
  endedClassName = "" 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('Unknown');
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      
      if (isNaN(end)) {
        setTimeLeft('Unknown');
        return;
      }

      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(endedText);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${secs}s`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime, endedText]);

  const combinedClassName = `${className} ${timeLeft === endedText ? endedClassName : ''}`.trim();

  return <span className={combinedClassName || undefined}>{timeLeft}</span>;
};
