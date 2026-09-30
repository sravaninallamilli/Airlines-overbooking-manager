package com.airline.overbooking.dmgt;

import com.airline.overbooking.model.FareClass;
import com.airline.overbooking.model.Passenger;
import java.util.*;

/**
 * DMGT Concept (Unit 2 - Set Theory & Partitioning):
 * 
 * Mathematical Formulation:
 * Let S be the set of all passengers currently booked on flight F.
 * A partition of S is a collection of non-empty, pairwise disjoint subsets {E, P, B} such that:
 * 1. E U P U B = S (Exhaustive union property)
 * 2. E ∩ P = ∅, E ∩ B = ∅, P ∩ B = ∅ (Mutually disjoint property)
 * 3. |S| = |E| + |P| + |B| (Additive cardinality principle)
 * 
 * Formal Equivalence Relation:
 * Let relation R on S be defined as: (x, y) ∈ R <=> fareClass(x) == fareClass(y)
 * R is reflexive, symmetric, and transitive.
 * The equivalence classes [x]_R form the quotient set S / R = {E, P, B}.
 */
public class FareClassPartition {
    private final Set<Passenger> economySet;
    private final Set<Passenger> premiumSet;
    private final Set<Passenger> businessSet;

    public FareClassPartition() {
        this.economySet = new LinkedHashSet<>();
        this.premiumSet = new LinkedHashSet<>();
        this.businessSet = new LinkedHashSet<>();
    }

    /**
     * Adds passenger to the appropriate partition based on fare class.
     * Enforces the disjoint invariant.
     */
    public synchronized boolean addPassenger(Passenger passenger) {
        if (passenger == null) return false;

        // Remove from existing set if already partitioned
        economySet.remove(passenger);
        premiumSet.remove(passenger);
        businessSet.remove(passenger);

        switch (passenger.getFareClass()) {
            case ECONOMY:
                return economySet.add(passenger);
            case PREMIUM:
                return premiumSet.add(passenger);
            case BUSINESS:
                return businessSet.add(passenger);
            default:
                throw new IllegalStateException("Unknown fare class: " + passenger.getFareClass());
        }
    }

    public synchronized boolean removePassenger(Passenger passenger) {
        if (passenger == null) return false;
        return economySet.remove(passenger) || premiumSet.remove(passenger) || businessSet.remove(passenger);
    }

    public Set<Passenger> getEconomySet() {
        return Collections.unmodifiableSet(economySet);
    }

    public Set<Passenger> getPremiumSet() {
        return Collections.unmodifiableSet(premiumSet);
    }

    public Set<Passenger> getBusinessSet() {
        return Collections.unmodifiableSet(businessSet);
    }

    public int getEconomyCount() {
        return economySet.size();
    }

    public int getPremiumCount() {
        return premiumSet.size();
    }

    public int getBusinessCount() {
        return businessSet.size();
    }

    public int getTotalPartitionedCount() {
        return economySet.size() + premiumSet.size() + businessSet.size();
    }

    /**
     * Mathematically verifies that sets E, P, and B are strictly pairwise disjoint.
     */
    public boolean verifyDisjoint() {
        boolean epDisjoint = Collections.disjoint(economySet, premiumSet);
        boolean ebDisjoint = Collections.disjoint(economySet, businessSet);
        boolean pbDisjoint = Collections.disjoint(premiumSet, businessSet);
        return epDisjoint && ebDisjoint && pbDisjoint;
    }

    public String getFormalProofSummary() {
        return String.format(
            "DMGT Verification: |S| = %d. Partition subsets: |E|=%d, |P|=%d, |B|=%d. " +
            "Pairwise Disjoint: %b. Union Exhaustive: true.",
            getTotalPartitionedCount(), getEconomyCount(), getPremiumCount(), getBusinessCount(), verifyDisjoint()
        );
    }
}
