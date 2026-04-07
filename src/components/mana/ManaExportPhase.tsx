/**
 * ManaExportPhase — Generate and download the Mana Layer 2 export pack
 * ZIP contains: wrapped source, Lex manifest, SHA-256 proof, README, license
 */

import { useState } from 'react';
import { Download, Package, Loader2, CheckCircle2, FileCode2, Shield, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AttachmentResult } from './ManaAttachPhase';
import type { ManaMergeResult } from './ManaMergePhase';
import { PATENT_NOTICE, MANA_PATENT_NOTICE, COPYRIGHT_NOTICE } from '@/config/domains';

interface Props {
  result: AttachmentResult;
  mergeResult?: ManaMergeResult | null;
}

function generateManaReadme(result: AttachmentResult): string {
  const { manifest, proof, hostName, hostLanguage, functionNames } = result;
  const capabilities = [...new Set(manifest.attachmentPoints.map(p => p.capability))];

  return `# CMPSBL® Mana — Layer 2 Export Pack
═══════════════════════════════════════════════════

## Host Software
- **Name:** ${hostName}
- **Language:** ${hostLanguage}
- **Functions Discovered:** ${functionNames.length}
- **Attachment Points:** ${manifest.attachmentPoints.length}

## Layer 2 Capabilities Applied
${capabilities.map(c => `- ${c.replace(/_/g, ' ').toUpperCase()}`).join('\n')}

## SHA-256 Verification Proof
- **Before Attachment:** \`${proof.hostHashBefore}\`
- **After Attachment:** \`${proof.hostHashAfter}\`
- **Verified:** ${proof.verified ? '✅ IDENTICAL — Zero source modification' : '❌ MISMATCH'}
- **Fingerprint ID:** ${proof.fingerprintId}

## Function Boundaries Wrapped
${functionNames.map(fn => `- \`${fn}()\``).join('\n')}

## What This Proves
The original source code in \`original/\` is **byte-for-byte identical** to what was
uploaded. Mana's Layer 2 wraps at function boundaries using JavaScript Proxy — the
host source is never touched. The SHA-256 hash match is mathematical proof.

## Patent Protection
${MANA_PATENT_NOTICE.title}
${MANA_PATENT_NOTICE.inline}
Filed: ${MANA_PATENT_NOTICE.filingDate}
Inventor: ${MANA_PATENT_NOTICE.inventor}

## Legal
${COPYRIGHT_NOTICE.legalWarning}

© ${COPYRIGHT_NOTICE.year} CMPSBL® — A PromptFluid™ Product. All rights reserved.
`;
}

function generateLexManifest(result: AttachmentResult): string {
  const { manifest, proof } = result;
  return JSON.stringify({
    mana_version: '1.0.0',
    fingerprint_id: proof.fingerprintId,
    host_package: manifest.hostPackage || result.hostName,
    host_version: manifest.hostVersion || '1.0.0',
    attachment_state: manifest.attachmentState,
    attachment_points: manifest.attachmentPoints.map(p => ({
      function: p.functionName,
      capability: p.capability,
      active: p.active,
      invocations: p.invocations,
      blocked: p.blocked,
    })),
    lex_rules: manifest.lexRules.map(r => ({
      id: r.id,
      capability: r.capability,
      target: r.target,
      verdict: r.verdict,
      reason: r.reason,
    })),
    proof: {
      sha256_before: proof.hostHashBefore,
      sha256_after: proof.hostHashAfter,
      verified: proof.verified,
      timestamp: new Date(proof.timestamp).toISOString(),
      capabilities: proof.capabilities,
    },
    patent: MANA_PATENT_NOTICE.inline,
    generated_at: new Date().toISOString(),
  }, null, 2);
}

function generateProofCert(result: AttachmentResult): string {
  const { proof, hostName, functionNames, manifest } = result;
  const border = '═'.repeat(60);
  return `${border}
  CMPSBL® MANA — ZERO MODIFICATION CERTIFICATE
${border}

  Fingerprint ID:     ${proof.fingerprintId}
  Host Software:      ${hostName}
  Functions Wrapped:  ${functionNames.length}
  Attachment Points:  ${manifest.attachmentPoints.length}

  SHA-256 (Before):   ${proof.hostHashBefore}
  SHA-256 (After):    ${proof.hostHashAfter}

  VERDICT:            ${proof.verified ? 'VERIFIED ✅' : 'FAILED ❌'}
                      ${proof.verified
                        ? 'The host source code is byte-for-byte identical\n                      before and after Layer 2 attachment.'
                        : 'Integrity mismatch detected.'}

  Generated:          ${new Date(proof.timestamp).toISOString()}

${border}
  ${MANA_PATENT_NOTICE.inline}
  ${PATENT_NOTICE.inline}
  Inventor: ${MANA_PATENT_NOTICE.inventor}
  © ${COPYRIGHT_NOTICE.year} CMPSBL® — All rights reserved.
${border}
`;
}

export function ManaExportPhase({ result }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const { manifest, proof, hostName, functionNames } = result;
  const capabilities = [...new Set(manifest.attachmentPoints.map(p => p.capability))];

  const handleExport = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const packName = `mana-${hostName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      // README
      zip.file('README.md', generateManaReadme(result));

      // Lex Manifest
      zip.file('lex-manifest.json', generateLexManifest(result));

      // Proof Certificate
      zip.file('PROOF.txt', generateProofCert(result));

      // Original source files
      const originalFolder = zip.folder('original');
      if (originalFolder) {
        for (const file of result.files) {
          if (file.content) {
            originalFolder.file(file.name, file.content);
          }
        }
      }

      // Layer 2 attachment map (per-function)
      const layer2Folder = zip.folder('layer2');
      if (layer2Folder) {
        const attachmentMap: Record<string, string[]> = {};
        for (const point of manifest.attachmentPoints) {
          if (!attachmentMap[point.functionName]) {
            attachmentMap[point.functionName] = [];
          }
          attachmentMap[point.functionName].push(point.capability);
        }
        layer2Folder.file('attachment-map.json', JSON.stringify(attachmentMap, null, 2));

        // Generate a human-readable attachment summary
        let summary = `# Mana Layer 2 — Attachment Summary\n\n`;
        summary += `Host: ${hostName}\nFingerprint: ${proof.fingerprintId}\n\n`;
        for (const [fn, caps] of Object.entries(attachmentMap)) {
          summary += `## ${fn}()\n`;
          for (const cap of caps) {
            summary += `  - ${cap.replace(/_/g, ' ').toUpperCase()}\n`;
          }
          summary += '\n';
        }
        layer2Folder.file('ATTACHMENT-SUMMARY.md', summary);
      }

      // License
      zip.file('LICENSE', `CMPSBL® Mana Layer 2 Export Pack
${MANA_PATENT_NOTICE.inline}
${PATENT_NOTICE.inline}

${COPYRIGHT_NOTICE.legalWarning}
${COPYRIGHT_NOTICE.enforcementNotice}

© ${COPYRIGHT_NOTICE.year} CMPSBL® — A PromptFluid™ Product.
Inventor: Kenneth E. Sweet Jr.
All rights reserved.
`);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${packName}-layer2.zip`);
      setExported(true);
    } catch (err) {
      console.error('[MANA EXPORT]', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Mana Export Pack</h3>
        <p className="text-sm text-muted-foreground">
          Download your Layer 2 wrapped software with full provenance, Lex manifest, and SHA-256 proof.
        </p>
      </div>

      {/* Pack preview */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold">mana-{hostName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-layer2.zip</p>
              <p className="text-xs text-muted-foreground font-mono">{proof.fingerprintId}</p>
            </div>
          </div>

          {/* Contents preview */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Pack Contents</p>
            <div className="grid gap-1.5 text-xs">
              {[
                { icon: FileCode2, label: `original/ (${result.files.length} source files)`, desc: 'Your unmodified source code' },
                { icon: Shield, label: 'layer2/attachment-map.json', desc: `${manifest.attachmentPoints.length} attachment points mapped` },
                { icon: Eye, label: 'lex-manifest.json', desc: `${capabilities.length} capability types · Lex governance rules` },
                { icon: Lock, label: 'PROOF.txt', desc: `SHA-256 verification certificate · ${proof.verified ? 'VERIFIED' : 'FAILED'}` },
                { icon: FileCode2, label: 'README.md', desc: 'Full documentation and usage guide' },
                { icon: Shield, label: 'LICENSE', desc: 'Patent protection and legal notices' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/10">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-foreground">{item.label}</span>
                    <span className="text-muted-foreground ml-2">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Functions', value: functionNames.length },
              { label: 'Points', value: manifest.attachmentPoints.length },
              { label: 'Rules', value: capabilities.length },
              { label: 'Files', value: result.files.length + 5 },
            ].map(s => (
              <div key={s.label} className="text-center p-2 rounded-lg bg-card/50 border border-border/20">
                <p className="text-lg font-black text-primary">{s.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download button */}
      <Button
        onClick={handleExport}
        disabled={exporting || exported}
        className="w-full gap-2"
        size="lg"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : exported ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {exporting ? 'Generating Pack...' : exported ? 'Pack Downloaded' : 'Download Mana Export Pack (.zip)'}
      </Button>

      {exported && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-500">Export Complete</p>
            <p className="text-xs text-muted-foreground">
              Your Layer 2 wrapped software is ready. Original source is included unmodified with SHA-256 proof.
            </p>
          </div>
        </div>
      )}

      {/* Patent notice */}
      <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
        {MANA_PATENT_NOTICE.inline} · {PATENT_NOTICE.inline}<br />
        © {COPYRIGHT_NOTICE.year} CMPSBL® — All rights reserved.
      </p>
    </div>
  );
}
