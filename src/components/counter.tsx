import { useEffect, useState } from 'react';

interface CounterProps {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  isVisible: boolean;
  delay?: number;
}

export function Counter({
  target,
  label,
  prefix = '',
  suffix = '',
  isVisible,
  delay = 0,
}: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    const timer = setTimeout(() => {
      let currentCount = 0;
      const increment = target / 50;
      const countInterval = setInterval(() => {
        currentCount += increment;
        if (currentCount >= target) {
          setCount(target);
          clearInterval(countInterval);
        } else {
          setCount(Math.floor(currentCount));
        }
      }, 30);

      return () => clearInterval(countInterval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, target, delay]);

  const displayValue = count.toLocaleString();

  return (
    <div className="space-y-2 text-center">
      <p className="text-5xl sm:text-6xl font-serif font-bold text-primary">
        {prefix}
        {displayValue}
        {suffix}
      </p>
      <p className="text-sm sm:text-base text-foreground/70 font-light">{label}</p>
    </div>
  );
}
