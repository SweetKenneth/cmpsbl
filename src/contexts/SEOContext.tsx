import { createContext, useContext } from 'react';
import { HelmetProvider } from 'react-helmet-async';

const SEOContext = createContext(null);

export function SEOProvider({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <SEOContext.Provider value={null}>
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
}

export const useSEO = () => useContext(SEOContext);
