/**
 * Vitest v4 type augmentation — restore `.not` chainable on Assertion<T>
 * 
 * Vitest 4.x narrowed the Assertion type; `.not` must be declared
 * explicitly for TypeScript to see it on generic Assertion<T>.
 */
import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    not: Assertion<T>;
  }
}
