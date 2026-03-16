import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }), onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        }),
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [] }),
          }),
        }),
      }),
    }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }) },
  },
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test', email: 'test@test.com' }, signOut: vi.fn() }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock hooks
vi.mock('@/hooks/useEvolutionLimits', () => ({
  useEvolutionLimits: () => ({
    canUpload: true,
    canExport: true,
    uploadsRemaining: 3,
    evolutionUploadsPerDay: 6,
    productTier: 'studio',
    isLoading: false,
    refreshUsage: vi.fn(),
  }),
}));

vi.mock('@/hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ tier: 'studio', isLoading: false }),
}));

vi.mock('@/hooks/useArtifactSlots', () => ({
  useArtifactSlots: () => ({ activeCount: 0, maxSlots: 3 }),
}));

// Import components after mocks
import { IngestPhase } from '@/components/proprietary-evolution/IngestPhase';
import { AscensionHero } from '@/components/proprietary-evolution/AscensionHero';
import { ExportPhase } from '@/components/proprietary-evolution/ExportPhase';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('Ascension Page Components', () => {
  describe('IngestPhase', () => {
    it('renders drop zone with 25-language support text', () => {
      render(<IngestPhase />, { wrapper });
      expect(screen.getByText(/All 25 export languages supported/i)).toBeTruthy();
      expect(screen.getByText(/or click to browse/i)).toBeTruthy();
    });

    it('shows upload quota', () => {
      render(<IngestPhase />, { wrapper });
      expect(screen.getByText('3/6 remaining')).toBeTruthy();
    });

    it('renders file input with correct accept attribute', () => {
      render(<IngestPhase />, { wrapper });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      // Should accept HDL extensions
      expect(input.accept).toContain('.sv');
      expect(input.accept).toContain('.vhd');
      expect(input.accept).toContain('.spice');
    });
  });

  describe('AscensionHero', () => {
    it('renders hero title and description', () => {
      render(<AscensionHero />, { wrapper });
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
      expect(screen.getByText(/Bring your software into the substrate/i)).toBeTruthy();
    });

    it('renders all 4 lifecycle steps', () => {
      render(<AscensionHero />, { wrapper });
      expect(screen.getByText('Ingest')).toBeTruthy();
      expect(screen.getByText('Crystallize')).toBeTruthy();
      expect(screen.getAllByText('Ascended Memory').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the orbital canvas', () => {
      render(<AscensionHero />, { wrapper });
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });
  });

  describe('ExportPhase', () => {
    it('renders empty state when no capabilities', async () => {
      render(<ExportPhase />, { wrapper });
      const emptyMsg = await screen.findByText(/No export-ready capabilities/i);
      expect(emptyMsg).toBeTruthy();
    });
  });
});
