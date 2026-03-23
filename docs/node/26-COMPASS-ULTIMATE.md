# COMPASS — Universal Spatial-Temporal Intelligence

> **Primitive ID:** `compass` · **Category:** EPZ (Expansion Perception Zone) · **Generation:** Ultimate · **Primitive #26 of 40**
> **Codename:** *Navigator Prime* · **Classification:** FOUNDER EYES ONLY
> **Ultimate Form:** v10.0.0 "Navigator Prime"

---

## Executive Summary

COMPASS v10.0.0 "Navigator Prime" is the substrate's universal spatial-temporal intelligence engine. It provides 20 systems spanning N-dimensional coordinate addressing, geospatial indexing, multi-projection transformations, geofence event triggering, trajectory analysis, isochrone generation, spatiotemporal pattern fusion, spatial anomaly detection, corridor route optimization, gravitational entity modeling, and unified spatial telemetry.

---

## Architecture Overview

```
Entity Position Update
        │
        ▼
[11] Spatial R-Tree Index    ← O(log n) range/nearest queries
        │
   ┌────┴────┐
   ▼         ▼
[1] Coordinate     [12] Multi-Projection
    Registry            Engine (WGS84/UTM/Mercator)
        │
        ▼
[13] Geofence Engine        ← Enter/exit/dwell event triggers
        │
        ▼
[14] Trajectory Analyzer    ← Speed, heading, stops, DBSCAN clusters
        │
   ┌────┴────┐
   ▼         ▼
[15] Isochrone      [16] Temporal Fusion
     Generator           Engine (space+time co-occurrence)
        │
        ▼
[17] Spatial Anomaly Detector ← Z-score density deviation
        │
        ▼
[18] Route Corridor Optimizer ← Multi-constraint corridor planning
        │
        ▼
[19] Coordinate Gravity Model ← Attraction/repulsion fields
        │
        ▼
[20] Spatial Telemetry Dashboard ← Unified health from all 20 systems
```

---

## Original Systems (v9.0.0 "Meridian")

### System 1: Coordinate Registry
- N-dimensional position vectors for every entity (nodes, records, artifacts, users, intents)
- Euclidean distance calculation, K-nearest-neighbor search, density statistics
- 5000-entity capacity with automatic LRU eviction

### System 2: Contextual Waypoint Engine
- Journey tracking with waypoint-to-waypoint efficiency measurement
- Pattern learning from movement sequences
- Multi-journey comparison and efficiency scoring

### System 3: Semantic Proximity Graph
- Weighted edges between entities based on semantic similarity
- Graph traversal for relationship discovery
- Connected component and clustering analysis

### System 4: Temporal Cartography
- Time-series event mapping with anomaly rate tracking
- Temporal pattern detection (cycles, bursts, decay)
- Event stream visualization support

### System 5: Route Optimizer
- Multi-edge route planning with reliability scoring
- 2-opt improvement for locally optimal paths
- Edge weight management with EMA reliability decay

### System 6: Drift Compass
- Positional drift measurement over time
- Critical drift alerting with configurable thresholds
- Drift trend analysis (stable, drifting, diverging)

### System 7: Landmark Registry
- Named spatial landmarks with category tagging
- Proximity search from any coordinate
- Activity-rate tracking per landmark

### System 8: Exploration Frontier
- Grid-based coverage tracking for explored vs unexplored regions
- Frontier cell identification for directed exploration
- Coverage rate and progress reporting

### System 9: Bearing Calculator
- Directional bearing between any two entities
- Confidence-weighted bearing with decay
- Compass-rose categorization (N, NE, E, etc.)

### System 10: Compass Telemetry
- System-wide health snapshots across all COMPASS systems
- Trend detection (improving, stable, degrading)
- Historical snapshot storage (200-entry rolling buffer)

---

## Geospatial Systems (v10.0.0 "Navigator Prime")

### System 11: Geospatial R-Tree Index
- **Grid-cell spatial indexing** for O(log n) range and nearest queries
- **Bounding box insertion** with centroid calculation
- **Range queries**: Find all entries overlapping a bounding box with cell-filtered candidate selection
- **K-nearest-neighbor**: Distance-sorted nearest entities from any point with type filtering
- **10,000-entry capacity** with LRU eviction
- **Query performance tracking**: Total queries, avg query time, range vs nearest breakdown

### System 12: Multi-Projection Engine
- **4 built-in projections**: WGS84 (base), Mercator, UTM (simplified transverse), Equirectangular
- **Haversine distance**: True geodesic distance between WGS84 points in meters
- **Batch transformation**: Convert arrays of points in one call
- **Custom projection registry**: Register domain-specific projections with named parameters
- **Per-type transformation tracking**: Count and timing per projection type

### System 13: Geofence Engine
- **Circle and polygon fences**: Circular (center + radius) and polygonal (ray-casting algorithm)
- **Entity position tracking**: Real-time enter/exit/dwell event generation
- **Dwell detection**: Triggers after 30+ seconds within a fence boundary
- **Event cascade**: Exit old fence → enter new fence on transition
- **500-fence capacity** with 3000-event rolling buffer
- **Enable/disable controls**: Per-fence activation without deletion

### System 14: Trajectory Analyzer
- **Movement segmentation**: Distance, speed (m/s), heading (degrees), duration per segment
- **Stop detection**: Stationary periods (within 50m for 2+ minutes) with centroid and dwell time
- **DBSCAN-inspired clustering**: Spatial point clusters (200m radius, 3+ point minimum)
- **500-entity tracking** with 1000 points per entity (rolling)
- **Full analysis**: Total distance, avg/max speed, segments, stops, and clusters per entity

### System 15: Isochrone Generator
- **4 travel modes**: Walk (5 km/h), bike (15 km/h), drive (40 km/h urban), transit (30 km/h)
- **Grid-based reachability**: Configurable resolution (default 20 cells/degree)
- **Boundary extraction**: 36-sector angular sweep for convex hull approximation
- **Area estimation**: πr² with 85% fill factor correction
- **200-contour history** with generation time tracking per mode

### System 16: Temporal Fusion Engine
- **Spatiotemporal co-occurrence**: Detect events of different types near each other in space AND time
- **Hotspot detection**: High-density spatial areas with peak-hour identification
- **Pattern classification**: co_occurrence, recurring, hotspot, cold_zone, migration
- **Confidence scoring**: Distance-weighted confidence (closer = higher confidence)
- **5000-event buffer** with 300-pattern rolling storage

### System 17: Spatial Anomaly Detector
- **Density-based detection**: Z-score deviation from expected spatial density per grid cell
- **Welford's online stats**: Running mean, variance, stdDev per cell without storing history
- **Anomaly types**: density_spike, cold_zone, distribution_shift, outlier_position
- **Severity tiers**: warning (Z ≥ 2.0), critical (Z ≥ 3.0) — requires 10+ observations
- **Outlier position detection**: Centroid-relative distance Z-scores for point sets
- **500-anomaly rolling buffer** with 50-cell/degree grid resolution

### System 18: Route Corridor Optimizer
- **Priority-layered waypoints**: required → preferred → optional with intelligent insertion
- **Nearest-neighbor + insertion heuristic**: Required waypoints ordered first, optional inserted within corridor width
- **Time window constraints**: Per-waypoint start/end windows with satisfaction tracking
- **Dwell time modeling**: Per-waypoint stop duration factored into total time
- **Efficiency metric**: Straight-line / actual distance ratio
- **200-plan history** with constraint satisfaction and efficiency analytics

### System 19: Coordinate Gravity Model
- **N-body gravitational simulation**: Attraction at distance, repulsion at close range (< 0.5 units)
- **Fixed anchors**: Immovable bodies for reference points
- **Velocity damping**: 0.95 damping per step prevents runaway oscillation
- **Cluster detection**: Groups of bodies within threshold distance
- **Energy tracking**: Total kinetic energy as convergence indicator
- **1000-body capacity** with configurable G constant and timestep

### System 20: Spatial Telemetry Dashboard
- **Unified health composite**: Index perf (20%) + geofence accuracy (15%) + gravity (20%) + anomaly precision (20%) + corridor efficiency (25%)
- **Trend analysis**: Comparing last 5 vs previous 5 snapshots for improving/stable/degrading
- **200-snapshot rolling buffer** with per-system stats
- **Cross-system aggregation**: Stats from all 9 geospatial subsystems in one snapshot

---

## Unified Health Assessment

```
overallHealth = (
  spatialIndexQueryPerf × 0.20 +    // Sub-5ms spatial lookups
  geofenceAccuracy × 0.15 +          // Enter/exit event precision
  gravityConvergence × 0.20 +        // Simulation stability
  anomalyPrecision × 0.20 +          // True positive rate
  corridorEfficiency × 0.25           // Route optimality
)
```

---

## Integration Chain

```
ORACLE    ──→ COMPASS (spatial predictions feeding forecasts)
NERVE     ──→ COMPASS (location-tagged signals trigger geofences)
REFLEX    ──→ COMPASS (edge decisions need spatial context)
SIMULATE  ──→ COMPASS (scenario modeling with spatial constraints)
IMMUNITY  ←── COMPASS (spatial anomaly alerts → resilience triggers)
ATLAS     ←── COMPASS (capability topology gets spatial dimensions)
BRAIN     ──→ COMPASS (reasoning queries spatial relationships)
ECHO      ──→ COMPASS (digital twins need position data)
```

---

## Trade Secrets

### 1. Grid-Cell Spatial Indexing
The R-Tree-inspired grid-cell approach divides coordinate space into a 100×100 grid. Range queries only scan relevant cells, avoiding brute-force O(n) scans. For 10,000 entities, this reduces search space by ~90%.

### 2. Ray-Casting Geofence
Polygon containment uses the ray-casting algorithm — cast a horizontal ray from the test point and count fence boundary intersections. Odd count = inside. O(n) per polygon vertex but constant for fixed-size fences.

### 3. DBSCAN-Inspired Clustering
Trajectory clusters use density-based scanning: for each unvisited point, find neighbors within 200m. If 3+ neighbors exist, form a cluster. No need to specify cluster count in advance.

### 4. Vector Clock Gravity
The gravity model's attraction/repulsion duality creates natural entity grouping. High-mass entities (important nodes) attract nearby entities while repelling at close range, preventing collapse. The resulting equilibrium positions reveal structural relationships.

### 5. Temporal Fusion
Most systems do space OR time. COMPASS does both simultaneously — detecting that event A happens near event B within 1 hour is fundamentally different from detecting spatial proximity alone. The co-occurrence confidence decays with distance.

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `spatial_query_slow` | Avg query time > 5ms | Medium |
| `geofence_silent` | 0 events in 5 minutes with active fences | Low |
| `trajectory_stale` | No position updates in 10 minutes | Low |
| `anomaly_storm` | ≥5 critical anomalies in 1 minute | High |
| `corridor_inefficient` | Avg efficiency < 0.4 | Medium |
| `gravity_divergent` | Total energy increasing over 10 steps | Medium |
| `fusion_cold` | 0 patterns detected after 100+ events | Low |

---

*CMPSBL® Substrate — COMPASS "Navigator Prime" v10.0.0 · Founder Eyes Only*
