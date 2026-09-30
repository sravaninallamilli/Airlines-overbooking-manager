import { Booking, FareClass, Passenger } from '../types';

export interface SetPartitionResult {
  economySet: Passenger[];
  premiumSet: Passenger[];
  businessSet: Passenger[];
  totalConfirmed: number;
  isPairwiseDisjoint: boolean;
  isExhaustiveUnion: boolean;
  proofStatements: string[];
}

/**
 * DMGT Unit 2: Passenger Partitioning by Fare Class (Set Theory)
 * Universal Set S = Confirmed Passengers
 * Subsets: E (Economy), P (Premium), B (Business)
 */
export function computeFareClassPartition(bookings: Booking[]): SetPartitionResult {
  // Only confirmed passengers participate in flight seat partition S
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'BOARDED');
  
  const economyMap = new Map<string, Passenger>();
  const premiumMap = new Map<string, Passenger>();
  const businessMap = new Map<string, Passenger>();

  for (const b of confirmedBookings) {
    const p = b.passenger;
    if (p.fareClass === 'ECONOMY') {
      economyMap.set(p.passengerId, p);
    } else if (p.fareClass === 'PREMIUM') {
      premiumMap.set(p.passengerId, p);
    } else if (p.fareClass === 'BUSINESS') {
      businessMap.set(p.passengerId, p);
    }
  }

  const economySet = Array.from(economyMap.values());
  const premiumSet = Array.from(premiumMap.values());
  const businessSet = Array.from(businessMap.values());

  // Verify pairwise disjoint: E ∩ P = ∅, E ∩ B = ∅, P ∩ B = ∅
  const eIds = new Set(economySet.map(p => p.passengerId));
  const pIds = new Set(premiumSet.map(p => p.passengerId));
  const bIds = new Set(businessSet.map(p => p.passengerId));

  const epOverlap = [...eIds].filter(id => pIds.has(id)).length === 0;
  const ebOverlap = [...eIds].filter(id => bIds.has(id)).length === 0;
  const pbOverlap = [...pIds].filter(id => bIds.has(id)).length === 0;

  const isPairwiseDisjoint = epOverlap && ebOverlap && pbOverlap;
  const totalPartitioned = economySet.length + premiumSet.length + businessSet.length;
  const isExhaustiveUnion = totalPartitioned === confirmedBookings.length;

  const proofStatements = [
    `1. Equivalence Relation: x ~ y ⇔ fareClass(x) = fareClass(y) (Reflexive, Symmetric, Transitive)`,
    `2. Quotient Set: S / ~ = { E, P, B }`,
    `3. Exhaustive Union: E ∪ P ∪ B = S (|E ∪ P ∪ B| = ${totalPartitioned}, |S| = ${confirmedBookings.length})`,
    `4. Pairwise Disjoint: E ∩ P = ∅ (${epOverlap}), E ∩ B = ∅ (${ebOverlap}), P ∩ B = ∅ (${pbOverlap})`,
    `5. Additive Cardinality Principle: |S| = |E| + |P| + |B| (${confirmedBookings.length} = ${economySet.length} + ${premiumSet.length} + ${businessSet.length})`
  ];

  return {
    economySet,
    premiumSet,
    businessSet,
    totalConfirmed: confirmedBookings.length,
    isPairwiseDisjoint,
    isExhaustiveUnion,
    proofStatements,
  };
}
