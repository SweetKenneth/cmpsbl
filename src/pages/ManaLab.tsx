/**
 * ManaLab — Interactive Mana Layer 2 Attachment Lab
 * Upload → Merge → Configure Lex → Attach → Export
 * 
 * Patent Pending: U.S. App. No. 64/031,637
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PublicNav } from '@/components/PublicNav';
import { ManaLabStepper } from '@/components/mana/ManaLabStepper';
import { ManaUploadPhase, type ManaUploadResult } from '@/components/mana/ManaUploadPhase';
import { ManaMergePhase, type ManaMergeResult } from '@/components/mana/ManaMergePhase';
import { LexRuleSelector, type LexRuleConfig } from '@/components/mana/LexRuleSelector';
import { ManaAttachPhase, type AttachmentResult } from '@/components/mana/ManaAttachPhase';
import { ManaExportPhase } from '@/components/mana/ManaExportPhase';
import { motion } from 'framer-motion';
import { Award, Construction, Lock } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PATENT_APP_NO = '64/031,637';

export default function ManaLab() {
  const { isGovernor, loading: roleLoading } = useUserRole();
  const [step, setStep] = useState(0);
  const [upload, setUpload] = useState<ManaUploadResult | null>(null);
  const [mergeResult, setMergeResult] = useState<ManaMergeResult | null>(null);
  const [lexRules, setLexRules] = useState<LexRuleConfig[] | null>(null);
  const [attachResult, setAttachResult] = useState<AttachmentResult | null>(null);

  const handleUploadComplete = (result: ManaUploadResult) => {
    setUpload(result);
    setStep(1);
  };

  const handleMergeComplete = (result: ManaMergeResult) => {
    setMergeResult(result);
    setStep(2);
  };

  const handleLexComplete = (rules: LexRuleConfig[]) => {
    setLexRules(rules);
    setStep(3);
  };

  const handleAttachComplete = (result: AttachmentResult) => {
    setAttachResult(result);
    setStep(4);
  };

  const handleStepClick = (index: number) => {
    if (index <= step) setStep(index);
  };

  return (
    <>
      <Helmet>
        <title>Mana Lab — Layer 2 Attachment Engine | CMPSBL®</title>
        <meta name="description" content="Upload software, merge substrate capabilities, configure Lex governance rules, and attach Mana's Layer 2. Download a complete export pack with SHA-256 proof." />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen pt-24 pb-20">
        {/* Header */}
        <section className="container mx-auto px-4 lg:px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/80 text-sm font-bold backdrop-blur-sm">
                <Award className="w-4 h-4 text-primary" />
                Patent Pending · U.S. App. No. {PATENT_APP_NO}
              </span>
              {!isGovernor && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-400">
                  <Construction className="w-3.5 h-3.5" />
                  Under Construction
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Mana Lab
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Upload any software. Merge capabilities. Configure Lex governance. Attach Layer 2.
              Download a complete export pack with cryptographic proof.
            </p>
          </motion.div>
        </section>

        {/* Gate: Governor-only access */}
        {roleLoading ? (
          <section className="container mx-auto px-4 lg:px-6">
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          </section>
        ) : !isGovernor ? (
          <section className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 sm:p-10 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold mb-3">Governor Access Only</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Mana Lab is currently under construction and restricted to Governor-level access.
                  The deployment engine will be available to all tiers once the runtime is production-ready.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/mana">Learn About Mana</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/software-symbiosis">Read the Vision</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </section>
        ) : (
          <>
            {/* Stepper */}
            <section className="container mx-auto px-4 lg:px-6 mb-12">
              <ManaLabStepper activeStep={step} onStepClick={handleStepClick} />
            </section>

            {/* Phase content */}
            <section className="container mx-auto px-4 lg:px-6">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
                  {step === 0 && (
                    <ManaUploadPhase onComplete={handleUploadComplete} />
                  )}

                  {step === 1 && upload && (
                    <ManaMergePhase
                      hostName={upload.name}
                      onComplete={handleMergeComplete}
                    />
                  )}

                  {step === 2 && upload && (
                    <LexRuleSelector
                      functionCount={upload.functionCount}
                      hostName={upload.name}
                      onComplete={handleLexComplete}
                    />
                  )}

                  {step === 3 && upload && lexRules && (
                    <ManaAttachPhase
                      upload={upload}
                      rules={lexRules}
                      mergeResult={mergeResult}
                      onComplete={handleAttachComplete}
                    />
                  )}

                  {step === 4 && attachResult && (
                    <ManaExportPhase result={attachResult} mergeResult={mergeResult} />
                  )}
                </div>
              </motion.div>
            </section>
          </>
        )}

        {/* Footer */}
        <section className="container mx-auto px-4 lg:px-6 mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              © 2025–2026 CMPSBL®. A PromptFluid™ Product. All rights reserved.
              <br />
              Mana™, Lex™ are trademarks of PromptFluid™ TX.
              <br />
              Protected by U.S. Patent Applications No. 64/029,678 and No. {PATENT_APP_NO}.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
