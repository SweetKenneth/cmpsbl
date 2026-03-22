/**
 * useSovereign Hook — SOVEREIGN module operations
 * Data Sovereignty, Jurisdictional Compliance, Consent Lifecycle
 * Full capability surface: compliance, consent, residency, retention, CLM
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initSovereign,
  registerJurisdiction,
  addResidencyRule,
  checkCompliance,
  recordConsent,
  addRetentionPolicy,
  classifyData,
  getSovereignState,
  getSovereignHealth,
  getSovereignResilience,
  getSovereignHardening,
  upgradeSovereignEngine,
  type Jurisdiction,
  type ComplianceFramework,
  type ConsentStatus,
  type DataResidencyRule,
  type DataRetentionPolicy,
} from '@/lib/substrate/sovereign-module';
import { runSovereignCLMCycle } from '@/lib/substrate/sovereign/clm';

export interface UseSovereignReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  checkCompliance: ReturnType<typeof useMutation>;
  recordConsent: ReturnType<typeof useMutation>;
  classifyData: ReturnType<typeof useMutation>;
  registerJurisdiction: ReturnType<typeof useMutation>;
  addResidencyRule: ReturnType<typeof useMutation>;
  addRetentionPolicy: ReturnType<typeof useMutation>;
}

export function useSovereign(): UseSovereignReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'sovereign'] });

  const state = useQuery({
    queryKey: ['substrate', 'sovereign', 'state'],
    queryFn: () => Promise.resolve(getSovereignState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'sovereign', 'health'],
    queryFn: () => Promise.resolve(getSovereignHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'sovereign', 'resilience'],
    queryFn: () => Promise.resolve(getSovereignResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'sovereign', 'hardening'],
    queryFn: () => Promise.resolve(getSovereignHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const init = useMutation({
    mutationFn: () => Promise.resolve(initSovereign()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeSovereignEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runSovereignCLMCycle()),
  });

  const checkComplianceMut = useMutation({
    mutationFn: (params: { framework: ComplianceFramework; jurisdiction: Jurisdiction; context?: Record<string, unknown> }) =>
      Promise.resolve(checkCompliance(params.framework, params.jurisdiction, params.context)),
    onSuccess: invalidate,
  });

  const recordConsentMut = useMutation({
    mutationFn: (params: { subjectId: string; purpose: string; status: ConsentStatus; framework: ComplianceFramework }) =>
      Promise.resolve(recordConsent(params.subjectId, params.purpose, params.status, params.framework)),
    onSuccess: invalidate,
  });

  const classifyDataMut = useMutation({
    mutationFn: (params: { dataType: string; content?: string }) =>
      Promise.resolve(classifyData(params.dataType, params.content)),
  });

  const registerJurisdictionMut = useMutation({
    mutationFn: (params: { jurisdiction: Jurisdiction; frameworks: ComplianceFramework[] }) =>
      Promise.resolve(registerJurisdiction(params.jurisdiction, params.frameworks)),
    onSuccess: invalidate,
  });

  const addResidencyRuleMut = useMutation({
    mutationFn: (rule: Omit<DataResidencyRule, 'id'>) =>
      Promise.resolve(addResidencyRule(rule)),
    onSuccess: invalidate,
  });

  const addRetentionPolicyMut = useMutation({
    mutationFn: (policy: Omit<DataRetentionPolicy, 'id'>) =>
      Promise.resolve(addRetentionPolicy(policy)),
    onSuccess: invalidate,
  });

  return {
    state, health, resilience, hardening: hardeningQuery,
    init, upgradeEngine, runCLM,
    checkCompliance: checkComplianceMut, recordConsent: recordConsentMut, classifyData: classifyDataMut,
    registerJurisdiction: registerJurisdictionMut, addResidencyRule: addResidencyRuleMut, addRetentionPolicy: addRetentionPolicyMut,
  };
}

export default useSovereign;
