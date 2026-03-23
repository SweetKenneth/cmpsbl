/**
 * COMPASS Ultimate — System 19: Coordinate Gravity Model
 * 
 * Entity attraction/repulsion fields — which entities cluster
 * and which diverge over time. Gravitational force modeling
 * between coordinate-registered entities.
 * 
 * @module compass/ultimate/coordinateGravity
 */

// ── Types ────────────────────────────────────────────────────────

export interface GravityBody {
  id: string;
  entityId: string;
  mass: number;                // Importance/weight
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
  fixed: boolean;              // Anchored bodies don't move
  createdAt: number;
}

export interface GravityForce {
  fromId: string;
  toId: string;
  magnitude: number;
  direction: number;           // Radians
  type: 'attraction' | 'repulsion';
}

export interface GravityField {
  bodies: GravityBody[];
  forces: GravityForce[];
  totalEnergy: number;
  convergenceStep: number;
}

export interface GravityStats {
  totalBodies: number;
  fixedBodies: number;
  totalForces: number;
  totalEnergy: number;
  simulationSteps: number;
  avgClusterDistance: number;
}

// ── Constants ────────────────────────────────────────────────────

const G = 1.0;                // Gravitational constant (tunable)
const REPULSION_RANGE = 0.5;  // Below this distance, repulsion kicks in
const DAMPING = 0.95;         // Velocity damping per step
const MAX_BODIES = 1000;

// ── State ────────────────────────────────────────────────────────

const bodies: Map<string, GravityBody> = new Map();
let simulationSteps = 0;
let totalEnergy = 0;

// ── Core API ────────────────────────────────────────────────────

/** Add a gravity body */
export function addGravityBody(
  entityId: string,
  position: { x: number; y: number },
  mass: number = 1,
  fixed: boolean = false,
): GravityBody {
  const body: GravityBody = {
    id: `gb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, mass, position,
    velocity: { vx: 0, vy: 0 },
    fixed, createdAt: Date.now(),
  };

  bodies.set(body.id, body);
  if (bodies.size > MAX_BODIES) {
    const oldest = [...bodies.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest && !oldest.fixed) bodies.delete(oldest.id);
  }

  return body;
}

/** Remove a gravity body */
export function removeGravityBody(id: string): boolean { return bodies.delete(id); }

/** Simulate one step of gravitational interaction */
export function simulateStep(dt: number = 0.1): GravityField {
  const allBodies = [...bodies.values()];
  const forces: GravityForce[] = [];
  let energy = 0;

  // Calculate all pairwise forces
  for (let i = 0; i < allBodies.length; i++) {
    for (let j = i + 1; j < allBodies.length; j++) {
      const a = allBodies[i];
      const b = allBodies[j];

      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist < 0.001) continue; // Avoid division by zero

      const direction = Math.atan2(dy, dx);

      if (dist < REPULSION_RANGE) {
        // Repulsion at close range
        const magnitude = G * a.mass * b.mass / (distSq * 10);
        forces.push({ fromId: a.id, toId: b.id, magnitude, direction, type: 'repulsion' });

        if (!a.fixed) {
          a.velocity.vx -= Math.cos(direction) * magnitude * dt / a.mass;
          a.velocity.vy -= Math.sin(direction) * magnitude * dt / a.mass;
        }
        if (!b.fixed) {
          b.velocity.vx += Math.cos(direction) * magnitude * dt / b.mass;
          b.velocity.vy += Math.sin(direction) * magnitude * dt / b.mass;
        }
      } else {
        // Attraction
        const magnitude = G * a.mass * b.mass / distSq;
        forces.push({ fromId: a.id, toId: b.id, magnitude, direction, type: 'attraction' });

        if (!a.fixed) {
          a.velocity.vx += Math.cos(direction) * magnitude * dt / a.mass;
          a.velocity.vy += Math.sin(direction) * magnitude * dt / a.mass;
        }
        if (!b.fixed) {
          b.velocity.vx -= Math.cos(direction) * magnitude * dt / b.mass;
          b.velocity.vy -= Math.sin(direction) * magnitude * dt / b.mass;
        }
      }

      energy += 0.5 * a.mass * (a.velocity.vx ** 2 + a.velocity.vy ** 2);
    }
  }

  // Update positions with damping
  for (const body of allBodies) {
    if (body.fixed) continue;
    body.velocity.vx *= DAMPING;
    body.velocity.vy *= DAMPING;
    body.position.x += body.velocity.vx * dt;
    body.position.y += body.velocity.vy * dt;
  }

  simulationSteps++;
  totalEnergy = energy;

  return { bodies: allBodies, forces, totalEnergy: energy, convergenceStep: simulationSteps };
}

/** Run N simulation steps */
export function simulateN(steps: number, dt: number = 0.1): GravityField {
  let result: GravityField = { bodies: [], forces: [], totalEnergy: 0, convergenceStep: 0 };
  for (let i = 0; i < steps; i++) {
    result = simulateStep(dt);
  }
  return result;
}

/** Find clusters of bodies (groups within threshold distance) */
export function findGravityClusters(thresholdDist: number = 1.0): Array<{ centroid: { x: number; y: number }; members: string[]; radius: number }> {
  const allBodies = [...bodies.values()];
  const visited = new Set<string>();
  const clusters: Array<{ centroid: { x: number; y: number }; members: string[]; radius: number }> = [];

  for (const body of allBodies) {
    if (visited.has(body.id)) continue;

    const cluster = [body];
    visited.add(body.id);

    for (const other of allBodies) {
      if (visited.has(other.id)) continue;
      const dist = Math.sqrt((body.position.x - other.position.x) ** 2 + (body.position.y - other.position.y) ** 2);
      if (dist <= thresholdDist) {
        cluster.push(other);
        visited.add(other.id);
      }
    }

    if (cluster.length > 1) {
      const cx = cluster.reduce((s, b) => s + b.position.x, 0) / cluster.length;
      const cy = cluster.reduce((s, b) => s + b.position.y, 0) / cluster.length;
      const maxR = Math.max(...cluster.map(b => Math.sqrt((b.position.x - cx) ** 2 + (b.position.y - cy) ** 2)));

      clusters.push({
        centroid: { x: Math.round(cx * 1000) / 1000, y: Math.round(cy * 1000) / 1000 },
        members: cluster.map(b => b.entityId),
        radius: Math.round(maxR * 1000) / 1000,
      });
    }
  }

  return clusters;
}

// ── Query ────────────────────────────────────────────────────────

export function getGravityBody(id: string): GravityBody | undefined { return bodies.get(id); }
export function getAllGravityBodies(): GravityBody[] { return [...bodies.values()]; }

export function getGravityStats(): GravityStats {
  const allBodies = [...bodies.values()];
  const clusters = findGravityClusters();

  return {
    totalBodies: bodies.size,
    fixedBodies: allBodies.filter(b => b.fixed).length,
    totalForces: allBodies.length * (allBodies.length - 1) / 2,
    totalEnergy: Math.round(totalEnergy * 1000) / 1000,
    simulationSteps,
    avgClusterDistance: clusters.length > 0
      ? Math.round(clusters.reduce((s, c) => s + c.radius, 0) / clusters.length * 1000) / 1000
      : 0,
  };
}

export function resetGravityModel(): void {
  bodies.clear();
  simulationSteps = 0;
  totalEnergy = 0;
}
