/**
 * ManaStats — Animated counters for the Mana hero section
 */
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const STATS = [
  { value: 14, suffix: '', label: 'Attachment Points' },
  { value: 0, suffix: '', label: 'Lines Modified' },
  { value: 54, suffix: '+', label: 'Languages' },
  { value: 100, suffix: '%', label: 'Hash Match' },
];

function AnimatedNumber({ target, suffix, duration = 1.5 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / (duration * 1000);
      if (elapsed >= 1) {
        setCount(target);
        return;
      }
      setCount(Math.round(target * elapsed));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function ManaStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            <AnimatedNumber target={stat.value} suffix={stat.suffix} />
          </p>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
