/**
 * Phase 9 — Per-finding policy override surface
 *
 * Locks the contract for V2ContractVerifiedPanel:
 *   • Drift findings render with three policy buttons (default / accept / block)
 *   • Clicking a policy fires onOverridesChange with a correct summary
 *   • The summary includes per-finding records carrying source + code + decision
 *   • The panel is purely informational — it never mutates inputs.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  V2ContractVerifiedPanel,
  type FindingsOverrideSummary,
} from '../V2ContractVerifiedPanel';
import type { ExportSelfCheckResult } from '@/lib/export/export-self-check';
import type { EnvelopeVerification } from '@/lib/export/envelope-verifier';

const failingSelfCheck: ExportSelfCheckResult = {
  ok: false,
  lang: 'python',
  mode: 'enforce',
  issues: [
    { token: 'cmpsbl_verify_envelope', message: 'verifier function missing' },
  ],
};

const failingEnvelope: EnvelopeVerification = {
  ok: false,
  issues: [
    {
      path: '_cmpsbl.mode',
      code: 'INVALID_ENUM',
      message: 'mode must be observe|soft|enforce',
    },
  ],
  summary: {
    capability: 'cap-x',
    mode: null,
    strategy: null,
    originalExecuted: null,
    verdict: null,
  },
};

function renderPanel(onOverridesChange?: (s: FindingsOverrideSummary) => void) {
  return render(
    <V2ContractVerifiedPanel
      lang="python"
      mode="enforce"
      capability="cap-x"
      chain={['DEFENSE', 'GOVERNANCE']}
      selfCheck={failingSelfCheck}
      envelope={failingEnvelope}
      onOverridesChange={onOverridesChange}
    />,
  );
}

describe('Phase 9 — V2ContractVerifiedPanel per-finding overrides', () => {
  it('renders both findings with three policy buttons each when expanded', () => {
    renderPanel();
    // Expand the panel
    fireEvent.click(screen.getByText(/Contract drift detected/i));
    // 2 findings × 3 buttons (default / accept / block) = 6 radio buttons
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(6);
  });

  it('fires onOverridesChange with a correct summary when user accepts a finding', () => {
    const cb = vi.fn();
    renderPanel(cb);
    fireEvent.click(screen.getByText(/Contract drift detected/i));

    // First finding's "accept" button — radios are ordered default, accept, block
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]); // first finding → accept

    expect(cb).toHaveBeenCalledTimes(1);
    const summary = cb.mock.calls[0][0] as FindingsOverrideSummary;
    expect(summary.totalFindings).toBe(2);
    expect(summary.accepted).toBe(1);
    expect(summary.blocked).toBe(0);
    expect(summary.defaulted).toBe(1);
    expect(summary.records).toHaveLength(2);
    // The accepted record carries its source + code + decision
    const accepted = summary.records.find((r) => r.decision === 'accept');
    expect(accepted).toBeDefined();
    expect(accepted!.source).toBe('self-check');
    expect(accepted!.code).toBe('cmpsbl_verify_envelope');
  });

  it('records a "block" decision and updates the summary header', () => {
    const cb = vi.fn();
    renderPanel(cb);
    fireEvent.click(screen.getByText(/Contract drift detected/i));

    const radios = screen.getAllByRole('radio');
    // Second finding's "block" button — index 5 (default=3, accept=4, block=5)
    fireEvent.click(radios[5]);

    const summary = cb.mock.calls.at(-1)![0] as FindingsOverrideSummary;
    expect(summary.blocked).toBe(1);
    const blocked = summary.records.find((r) => r.decision === 'block');
    expect(blocked).toBeDefined();
    expect(blocked!.source).toBe('envelope');
    expect(blocked!.code).toBe('INVALID_ENUM');

    // Header gets the live count
    expect(screen.getByText(/0 accepted · 1 blocked/)).toBeInTheDocument();
  });

  it('does not invoke onOverridesChange on initial render', () => {
    const cb = vi.fn();
    renderPanel(cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('omits the drift report entirely when both verifiers pass', () => {
    render(
      <V2ContractVerifiedPanel
        lang="typescript"
        mode="observe"
        capability="cap-y"
        chain={['DEFENSE']}
        selfCheck={{ ok: true, lang: 'typescript', mode: 'observe', issues: [] }}
        envelope={{
          ok: true,
          issues: [],
          summary: {
            capability: 'cap-y',
            mode: 'observe',
            strategy: 'native',
            originalExecuted: true,
            verdict: 'allow',
          },
        }}
      />,
    );
    fireEvent.click(screen.getByText(/Contract verified/i));
    expect(screen.queryByText(/Drift report/i)).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
  });
});
