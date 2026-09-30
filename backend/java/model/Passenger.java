package com.airline.overbooking.model;

/**
 * Passenger entity representing customer demographics and historical profile.
 * OOPJ Concept: Encapsulation, immutability of primary identifier, validation.
 */
public class Passenger {
    private final String passengerId;
    private String fullName;
    private FareClass fareClass;
    private int previousNoShowCount;
    private int totalPreviousBookings;

    public Passenger(String passengerId, String fullName, FareClass fareClass, int previousNoShowCount, int totalPreviousBookings) {
        if (passengerId == null || passengerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Passenger ID cannot be null or empty");
        }
        if (previousNoShowCount < 0 || totalPreviousBookings < 0 || previousNoShowCount > totalPreviousBookings) {
            throw new IllegalArgumentException("Invalid previous booking or no-show count");
        }
        this.passengerId = passengerId;
        this.fullName = fullName;
        this.fareClass = fareClass;
        this.previousNoShowCount = previousNoShowCount;
        this.totalPreviousBookings = totalPreviousBookings;
    }

    public String getPassengerId() {
        return passengerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public FareClass getFareClass() {
        return fareClass;
    }

    public void setFareClass(FareClass fareClass) {
        this.fareClass = fareClass;
    }

    public int getPreviousNoShowCount() {
        return previousNoShowCount;
    }

    public void recordPastNoShow() {
        this.previousNoShowCount++;
        this.totalPreviousBookings++;
    }

    public int getTotalPreviousBookings() {
        return totalPreviousBookings;
    }

    public double getPersonalNoShowRate() {
        if (totalPreviousBookings == 0) {
            return fareClass.getBaselineNoShowRate();
        }
        return (double) previousNoShowCount / totalPreviousBookings;
    }

    @Override
    public String toString() {
        return String.format("Passenger[ID=%s, Name=%s, Class=%s, PastNoShows=%d/%d]",
                passengerId, fullName, fareClass.getDisplayName(), previousNoShowCount, totalPreviousBookings);
    }
}
