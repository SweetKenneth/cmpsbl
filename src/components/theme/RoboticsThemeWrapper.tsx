/**
 * RoboticsThemeWrapper — Applies the CMPSBL ROBOTICS™ titanium/electric-blue theme
 * when loaded on robotics.cmpsbl.com.
 *
 * Adds the `robotics-theme` CSS class to <html> which overrides all
 * design tokens to the titanium/electric-blue palette.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useEffect } from 'react';
import { getVerticalSubdomain } from '@/config/domains';

export function useRoboticsTheme(): boolean {
  const isRobotics = getVerticalSubdomain() === 'robotics';

  useEffect(() => {
    if (!isRobotics) return;

    const root = document.documentElement;
    root.classList.add('robotics-theme');
    root.style.colorScheme = 'dark';

    return () => {
      root.classList.remove('robotics-theme');
      root.style.colorScheme = '';
    };
  }, [isRobotics]);

  return isRobotics;
}

export function RoboticsThemeWrapper({ children }: { children: React.ReactNode }) {
  const isRobotics = useRoboticsTheme();

  return (
    <>
      {isRobotics && <div className="robotics-scanline" aria-hidden="true" />}
      {children}
    </>
  );
}
