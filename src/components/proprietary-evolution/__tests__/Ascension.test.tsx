import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test', email: 'test@test.com' } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
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
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }) },
    rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
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

const createUtf16LeFile = (name: string, content: string) => {
  const bytes = new Uint8Array(2 + content.length * 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;

  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    bytes[2 + i * 2] = code & 0xff;
    bytes[3 + i * 2] = code >> 8;
  }

  return new File([bytes], name, { type: 'text/plain' });
};

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: vi.fn(() => ({
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 120 })),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      globalAlpha: 1,
      lineWidth: 1,
      strokeStyle: '',
      fillStyle: '',
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      shadowBlur: 0,
      shadowColor: '',
    })),
    configurable: true,
  });
});

describe('Ascension Page Components', () => {
  describe('IngestPhase', () => {
    it('renders drop zone with source upload messaging', () => {
      render(<IngestPhase />, { wrapper });
      expect(screen.getByText(/Drop source files here/i)).toBeInTheDocument();
      expect(screen.getByText(/All languages accepted/i)).toBeInTheDocument();
      expect(screen.getByText(/click or drag to upload/i)).toBeInTheDocument();
    });

    it('shows upload quota', () => {
      render(<IngestPhase />, { wrapper });
      expect(screen.getByText('3/6 remaining')).toBeInTheDocument();
    });

    it('renders unrestricted multi-file input', () => {
      render(<IngestPhase />, { wrapper });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.multiple).toBe(true);
      expect(input.accept).toBe('');
    });

    it('analyzes a large PHP source file without skipping it as binary', async () => {
      render(<IngestPhase />, { wrapper });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const phpSource = `<?php\n${'function collide_$x() { return $x; }\n'.repeat(75000)}`;
      const file = new File([phpSource], 'collider.php', { type: 'application/x-httpd-php' });

      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/COLLIDER/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/skipped \(binary or unreadable text content\)/i)).not.toBeInTheDocument();
    });

    it('analyzes a UTF-16 Rust source file without skipping it as binary', async () => {
      render(<IngestPhase />, { wrapper });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createUtf16LeFile('engine.rs', 'pub fn collide() -> u32 { 41 }\n');

      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/ENGINE/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/skipped \(binary or unreadable text content\)/i)).not.toBeInTheDocument();
    });
  });

  describe('AscensionHero', () => {
    it('renders hero title and description', () => {
      render(<AscensionHero />, { wrapper });
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
      expect(screen.getByText(/Primitive #41/i)).toBeInTheDocument();
    });

    it('renders all 4 lifecycle steps', () => {
      render(<AscensionHero />, { wrapper });
      expect(screen.getByText('INGEST')).toBeInTheDocument();
      expect(screen.getByText('ASCENSION')).toBeInTheDocument();
      expect(screen.getAllByText(/Ascended Memories/i).length).toBeGreaterThan(0);
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
