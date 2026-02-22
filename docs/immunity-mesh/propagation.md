# Immunity Mesh — Propagation

## How Rules Propagate

1. An executor discovers a repair strategy during shadow probing
2. The strategy is recorded as a `learned` rule in `immunity_rules`
3. When another executor encounters a similar failure signature, the shared rule registry checks for applicable rules
4. If a match is found, the rule is adopted → recorded in `immunity_rule_propagation`
5. Adoption confidence tracks how well the rule performs in the new context

## Metrics

- **Propagation Breadth**: Count of distinct executors that adopted a rule
- **Spread Velocity**: Breadth / days since first adoption
- **Average Breadth**: Mean breadth across all active promoted rules
- **Most Spread Rule**: Rule with highest breadth
- **Fastest Spreading**: Rule with highest velocity

## Auto-Propagation

The shadow batch runner calls `autoPropagateRules()` after each cycle, which:
1. Finds promoted rules with high confidence
2. Identifies compatible executors via category matching
3. Adopts rules where category is compatible
4. Records propagation events for tracking

## Lineage

Rules can have parent-child relationships:
- **Refinement**: Child is a more specific version
- **Generalization**: Child is a broader version
- **Fork**: Child diverged from parent
- **Merge**: Child combines two parent rules
