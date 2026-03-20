/**
 * useEconomy Hook — ECONOMY module operations v11.0.0 "Treasury"
 * 
 * Exposes: cost recording, budget management, forecasting, ROI tracking,
 * spend intelligence, and optimization recommendations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as economyModule from '@/lib/substrate/economy-module';

export interface UseEconomyReturn {
  // State & Health
  state: ReturnType<typeof useQuery>;
  ledgerStats: ReturnType<typeof useQuery>;
  roiStats: ReturnType<typeof useQuery>;
  intelligenceStats: ReturnType<typeof useQuery>;
  balances: ReturnType<typeof useQuery>;
  recommendations: ReturnType<typeof useQuery>;

  // Cost Recording
  recordCost: ReturnType<typeof useMutation>;
  recordDebit: ReturnType<typeof useMutation>;
  recordCredit: ReturnType<typeof useMutation>;

  // Budget Management
  setBudget: ReturnType<typeof useMutation>;
  allocateBudget: ReturnType<typeof useMutation>;
  simulateBudget: ReturnType<typeof useMutation>;

  // Forecasting & Analytics
  forecast: ReturnType<typeof useMutation>;
  analyzePattern: ReturnType<typeof useMutation>;
  generateOptimizations: ReturnType<typeof useMutation>;

  // ROI & Chargeback
  recordROI: ReturnType<typeof useMutation>;
  allocateChargeback: ReturnType<typeof useMutation>;
  calculateEfficiency: ReturnType<typeof useMutation>;
}

export function useEconomy(): UseEconomyReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidateEconomy = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'economy'] });

  // ═══ QUERIES ═══

  const state = useQuery({
    queryKey: ['substrate', 'economy', 'state'],
    queryFn: () => economyModule.getEconomyState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const ledgerStats = useQuery({
    queryKey: ['substrate', 'economy', 'ledger'],
    queryFn: () => economyModule.getLedgerStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const roiStats = useQuery({
    queryKey: ['substrate', 'economy', 'roi'],
    queryFn: () => economyModule.getROIStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const intelligenceStats = useQuery({
    queryKey: ['substrate', 'economy', 'intelligence'],
    queryFn: () => economyModule.getSpendIntelligenceStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const balances = useQuery({
    queryKey: ['substrate', 'economy', 'balances'],
    queryFn: () => economyModule.getAllBalances(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const recommendations = useQuery({
    queryKey: ['substrate', 'economy', 'recommendations'],
    queryFn: () => economyModule.getRecommendations(),
    refetchInterval: pollingEnabled ? 120000 : false,
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  // ═══ COST RECORDING ═══

  const recordCost = useMutation({
    mutationFn: (params: { module: string; action: string; tokenCount: number; computeMs: number; costMillicents: number }) =>
      Promise.resolve(economyModule.recordCost(params.module, params.action, params.tokenCount, params.computeMs, params.costMillicents)),
    onSuccess: invalidateEconomy,
  });

  const recordDebit = useMutation({
    mutationFn: (params: { module: string; action: string; amountMillicents: number; tokensUsed?: number; computeMs?: number }) =>
      economyModule.recordDebit(params.module, params.action, params.amountMillicents, {
        tokensUsed: params.tokensUsed,
        computeMs: params.computeMs,
      }),
    onSuccess: invalidateEconomy,
  });

  const recordCredit = useMutation({
    mutationFn: (params: { module: string; action: string; amountMillicents: number; reason: string }) =>
      economyModule.recordCredit(params.module, params.action, params.amountMillicents, params.reason),
    onSuccess: invalidateEconomy,
  });

  // ═══ BUDGET MANAGEMENT ═══

  const setBudget = useMutation({
    mutationFn: (params: { module: string; dailyLimitMillicents: number }) => {
      economyModule.setBudget(params.module, params.dailyLimitMillicents);
      return Promise.resolve();
    },
    onSuccess: invalidateEconomy,
  });

  const allocateBudget = useMutation({
    mutationFn: (params: { module: string; amountMillicents: number }) =>
      Promise.resolve(economyModule.allocateLedgerBudget(params.module, params.amountMillicents)),
    onSuccess: invalidateEconomy,
  });

  const simulateBudget = useMutation({
    mutationFn: (params: { module: string; currentSpend: number; newBudget: number; growthRatePct?: number }) =>
      Promise.resolve(economyModule.simulateBudgetChange(params.module, params.currentSpend, params.newBudget, params.growthRatePct)),
  });

  // ═══ FORECASTING & ANALYTICS ═══

  const forecast = useMutation({
    mutationFn: (params: { daysAhead?: number }) =>
      Promise.resolve(economyModule.forecastCosts(params.daysAhead)),
  });

  const analyzePattern = useMutation({
    mutationFn: (params: { module: string }) =>
      Promise.resolve(economyModule.analyzeSpendPattern(params.module)),
  });

  const generateOptimizations = useMutation({
    mutationFn: (params: { module: string; currentSpend: number; tokenCount: number; operationCount: number }) =>
      Promise.resolve(economyModule.generateRecommendations(params.module, params.currentSpend, params.tokenCount, params.operationCount)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'economy', 'recommendations'] }),
  });

  // ═══ ROI & CHARGEBACK ═══

  const recordROIMutation = useMutation({
    mutationFn: (params: { module: string; costMillicents: number; valueMillicents: number; capability?: string }) =>
      Promise.resolve(economyModule.recordROI(params.module, params.costMillicents, params.valueMillicents, params.capability)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'economy', 'roi'] }),
  });

  const allocateChargebackMutation = useMutation({
    mutationFn: (params: { tenantId: string; module: string; costMillicents: number; method?: 'usage' | 'fixed' | 'proportional' }) =>
      Promise.resolve(economyModule.allocateChargeback(params.tenantId, params.module, params.costMillicents, params.method)),
  });

  const calculateEfficiencyMutation = useMutation({
    mutationFn: (params: { module: string; totalCost: number; totalTokens: number; totalOperations: number; totalValue: number }) =>
      Promise.resolve(economyModule.calculateEfficiency(params.module, params.totalCost, params.totalTokens, params.totalOperations, params.totalValue)),
  });

  return {
    state,
    ledgerStats,
    roiStats,
    intelligenceStats,
    balances,
    recommendations,
    recordCost,
    recordDebit,
    recordCredit,
    setBudget,
    allocateBudget,
    simulateBudget,
    forecast,
    analyzePattern,
    generateOptimizations,
    recordROI: recordROIMutation,
    allocateChargeback: allocateChargebackMutation,
    calculateEfficiency: calculateEfficiencyMutation,
  };
}
