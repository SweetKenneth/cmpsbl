/**
 * DeferredMotionConfig — Renders children immediately, loads MotionConfig lazily.
 * This prevents the ~47KB framer-motion chunk from blocking initial render.
 */
import { ReactNode, useEffect, useState, ComponentType } from 'react';

interface MotionConfigProps {
  reducedMotion?: 'always' | 'never' | 'user';
  children: ReactNode;
}

export default function DeferredMotionConfig({ reducedMotion, children }: MotionConfigProps) {
  const [Wrapper, setWrapper] = useState<ComponentType<MotionConfigProps> | null>(null);

  useEffect(() => {
    import('framer-motion').then(m => {
      setWrapper(() => m.MotionConfig as unknown as ComponentType<MotionConfigProps>);
    });
  }, []);

  if (Wrapper) {
    return <Wrapper reducedMotion={reducedMotion}>{children}</Wrapper>;
  }

  return <>{children}</>;
}
