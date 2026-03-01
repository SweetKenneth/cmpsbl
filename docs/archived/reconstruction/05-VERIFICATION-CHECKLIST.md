# RECONSTRUCTION — 05 Verification Checklist

## Core Validation

- [ ] 24 modules boot in order
- [ ] `Σ(weight) = 1.000`
- [ ] Matrix integrity computes correctly
- [ ] Breakers isolate failures

## Persistence Validation

- [ ] Snapshot commit completes atomically
- [ ] Rehydrate restores expected state
- [ ] WAL replay is deterministic
- [ ] Leader lease prevents dual periodic writers

## Evolution Validation

- [ ] Governance can veto risky proposals
- [ ] Evolution rollback succeeds after induced failure
- [ ] Audit records remain tamper-evident

## Build-On Notes

Extend this checklist with automated test IDs as verification coverage grows.