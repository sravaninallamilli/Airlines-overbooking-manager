package com.airline.overbooking.model;

/**
 * Represents fare classes for airline passengers.
 * Used in DMGT set partitioning:
 * S = E U P U B where E, P, B are pairwise disjoint.
 */
public enum FareClass {
    ECONOMY("Economy", 0.16),
    PREMIUM("Premium", 0.08),
    BUSINESS("Business", 0.03);

    private final String displayName;
    private final double baselineNoShowRate;

    FareClass(String displayName, double baselineNoShowRate) {
        this.displayName = displayName;
        this.baselineNoShowRate = baselineNoShowRate;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getBaselineNoShowRate() {
        return baselineNoShowRate;
    }
}
