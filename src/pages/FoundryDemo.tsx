/**
 * Foundry Demo — Cinematic proof of the Autonomous Software Foundry
 * Pure presentation layer. Zero substrate edits.
 * Engineer-testable. Investor-ready. Every number is real.
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { FoundryHero } from '@/components/foundry-demo/FoundryHero';
import { ProofNumbers } from '@/components/foundry-demo/ProofNumbers';
import { RecursiveLoop } from '@/components/foundry-demo/RecursiveLoop';
import { CrownJewelShowcase } from '@/components/foundry-demo/CrownJewelShowcase';
import { LiveDiscoveryStream } from '@/components/foundry-demo/LiveDiscoveryStream';
import { CategoryBreakdown } from '@/components/foundry-demo/CategoryBreakdown';
import { TierDistribution } from '@/components/foundry-demo/TierDistribution';
import { VerifyPanel } from '@/components/foundry-demo/VerifyPanel';
import { FoundryFooter } from '@/components/foundry-demo/FoundryFooter';

interface Discovery {
  name: string;
  cjpi: number;
  tier: string;
  category: string;
  module_chain: string[];
  created_at: string;
}

export default function FoundryDemo() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);

  useEffect(() => {
    async function load() {
      // Paginate to get all discoveries beyond the 1000-row limit
      const all: Discovery[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data } = await supabase
          .from('discoveries')
          .select('name, cjpi, tier, category, module_chain, created_at')
          .order('cjpi', { ascending: false })
          .range(from, from + pageSize - 1);
        if (!data || data.length === 0) break;
        all.push(...(data as Discovery[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setDiscoveries(all);
    }
    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>Autonomous Software Foundry — CMPSBL®</title>
        <meta name="description" content="A recursive discovery engine that prints high-quality software pipelines directly from silicon. 1,143 programs discovered in under 9 hours. Independently verifiable." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <FoundryHero />
        <ProofNumbers />
        <RecursiveLoop />
        <CrownJewelShowcase />
        <LiveDiscoveryStream discoveries={discoveries} />
        <CategoryBreakdown />
        <TierDistribution />
        <VerifyPanel />
        <FoundryFooter />
      </div>
    </>
  );
}
