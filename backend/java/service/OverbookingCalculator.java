package com.airline.overbooking.service;

/**
 * Service to compute safe overbooking limits based on Python no-show estimates.
 * 
 * Uses statistical safety margin and binomial risk modeling:
 * Let C = Aircraft Capacity
 * Let N = Confirmed Bookings
 * Let p = No-show probability estimated by Python module
 * Let q = 1 - p (Show-up probability)
 * 
 * Expected No-Shows = N * p
 * Safe Overbooking buffer incorporates a conservative safety factor (typically 0.60 to 0.75)
 * or ensures P(Boarding Denied) <= riskTolerance (e.g. 5%).
 */
public class OverbookingCalculator {

    public static class OverbookingResult {
        private final int aircraftCapacity;
        private final int confirmedBookings;
        private final double noShowProbability;
        private final double expectedNoShows;
        private final int recommendedAdditionalBookings;
        private final int maxSafeBookings;
        private final double bumpingRiskPercentage;
        private final String riskTier;

        public OverbookingResult(int aircraftCapacity, int confirmedBookings, double noShowProbability,
                                 double expectedNoShows, int recommendedAdditionalBookings,
                                 int maxSafeBookings, double bumpingRiskPercentage, String riskTier) {
            this.aircraftCapacity = aircraftCapacity;
            this.confirmedBookings = confirmedBookings;
            this.noShowProbability = noShowProbability;
            this.expectedNoShows = expectedNoShows;
            this.recommendedAdditionalBookings = recommendedAdditionalBookings;
            this.maxSafeBookings = maxSafeBookings;
            this.bumpingRiskPercentage = bumpingRiskPercentage;
            this.riskTier = riskTier;
        }

        public int getAircraftCapacity() { return aircraftCapacity; }
        public int getConfirmedBookings() { return confirmedBookings; }
        public double getNoShowProbability() { return noShowProbability; }
        public double getExpectedNoShows() { return expectedNoShows; }
        public int getRecommendedAdditionalBookings() { return recommendedAdditionalBookings; }
        public int getMaxSafeBookings() { return maxSafeBookings; }
        public double getBumpingRiskPercentage() { return bumpingRiskPercentage; }
        public String getRiskTier() { return riskTier; }

        @Override
        public String toString() {
            return String.format(
                "Aircraft capacity: %d\nConfirmed bookings: %d\nEstimated no-show probability: %.1f%%\n" +
                "Estimated no-shows: %.1f\nRecommended additional bookings: %d\nMaximum safe bookings: %d\nRisk tier: %s",
                aircraftCapacity, confirmedBookings, noShowProbability * 100, expectedNoShows,
                recommendedAdditionalBookings, maxSafeBookings, riskTier
            );
        }
    }

    /**
     * Calculates the safe overbooking limits based on flight parameters and no-show probability.
     * 
     * @param capacity Physical seat capacity of the aircraft
     * @param confirmedBookings Current confirmed seat reservations
     * @param maxAllowedOverbooking Cap configured by airline operations
     * @param noShowProbability Estimated probability from Python module (0.0 to 1.0)
     * @param safetyFactor Buffer factor to protect against cluster no-shows (default ~0.65)
     */
    public static OverbookingResult calculate(int capacity, int confirmedBookings, int maxAllowedOverbooking,
                                              double noShowProbability, double safetyFactor) {
        if (capacity <= 0) throw new IllegalArgumentException("Capacity must be positive");
        if (noShowProbability < 0 || noShowProbability > 1) throw new IllegalArgumentException("Probability must be in [0, 1]");

        double expectedNoShows = confirmedBookings * noShowProbability;

        // Conservative buffer: accept a fraction of expected no-shows to prevent involuntary bumping
        int rawBuffer = (int) Math.floor(expectedNoShows * safetyFactor);
        int recommendedAdditional = Math.min(rawBuffer, maxAllowedOverbooking);
        if (recommendedAdditional < 0) recommendedAdditional = 0;

        int maxSafeBookings = capacity + recommendedAdditional;

        // Calculate theoretical bumping risk using normal approximation to Binomial(totalBooked, 1-p)
        int totalTarget = Math.max(confirmedBookings, maxSafeBookings);
        double meanShowUps = totalTarget * (1.0 - noShowProbability);
        double stdDev = Math.sqrt(totalTarget * (1.0 - noShowProbability) * noShowProbability);

        double z = stdDev > 0 ? (capacity + 0.5 - meanShowUps) / stdDev : 0;
        double bumpingRisk = (1.0 - standardNormalCdf(z)) * 100.0;

        String riskTier;
        if (noShowProbability < 0.08) {
            riskTier = "Low probability";
        } else if (noShowProbability <= 0.16) {
            riskTier = "Medium probability";
        } else {
            riskTier = "High probability";
        }

        return new OverbookingResult(
            capacity,
            confirmedBookings,
            noShowProbability,
            expectedNoShows,
            recommendedAdditional,
            maxSafeBookings,
            Math.max(0.01, Math.min(99.9, bumpingRisk)),
            riskTier
        );
    }

    private static double standardNormalCdf(double z) {
        // Abramowitz and Stegun approximation for standard normal CDF
        double t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
        double d = 0.3989422804014327 * Math.exp(-z * z / 2.0);
        double prob = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
        return z > 0 ? 1.0 - prob : prob;
    }
}
