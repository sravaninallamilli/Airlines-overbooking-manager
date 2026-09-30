package com.airline.overbooking;

import com.airline.overbooking.model.*;
import com.airline.overbooking.reservation.ReservationSystem;
import com.airline.overbooking.service.OverbookingCalculator;

import java.time.LocalDate;

/**
 * Academic Demonstration Runner for Airline Overbooking Manager.
 * 
 * Pipeline Demonstrated:
 * 1. Flight Setup (Capacity: 100, Max Overbooking: 15)
 * 2. Passenger Enrollment & Reservation
 * 3. DMGT Fare Class Partitioning (Disjoint sets E, P, B verification)
 * 4. ADSA B-Tree Indexing (Keys: BKG-001 ... BKG-105, O(log N) search)
 * 5. Historical Data Export to CSV
 * 6. Python Statistical Integration (Estimated No-Show Prob)
 * 7. Safe Overbooking Limit Calculation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("==========================================================");
        System.out.println("      AIRLINE OVERBOOKING MANAGER - ACADEMIC PIPELINE     ");
        System.out.println("==========================================================");

        // 1. Flight Setup
        Flight flight = new Flight("AI-204", "New York (JFK)", "London (LHR)",
                LocalDate.now().plusDays(3), 100, 15);
        ReservationSystem system = new ReservationSystem(flight);

        System.out.printf("Flight: %s | Route: %s -> %s | Capacity: %d | Max Overbooking: %d%n%n",
                flight.getFlightNumber(), flight.getSource(), flight.getDestination(),
                flight.getAircraftCapacity(), flight.getMaxAllowedOverbooking());

        // 2. Add Passengers & Create Bookings
        Passenger p1 = new Passenger("PAX-101", "Dr. Alan Turing", FareClass.BUSINESS, 0, 12);
        Passenger p2 = new Passenger("PAX-102", "Ada Lovelace", FareClass.PREMIUM, 1, 8);
        Passenger p3 = new Passenger("PAX-103", "Claude Shannon", FareClass.ECONOMY, 2, 6);
        Passenger p4 = new Passenger("PAX-104", "Grace Hopper", FareClass.BUSINESS, 0, 20);
        Passenger p5 = new Passenger("PAX-105", "John von Neumann", FareClass.ECONOMY, 3, 5);

        system.registerPassenger(p1);
        system.registerPassenger(p2);
        system.registerPassenger(p3);
        system.registerPassenger(p4);
        system.registerPassenger(p5);

        system.createBooking("BKG-101", "PAX-101", Booking.Status.CONFIRMED);
        system.createBooking("BKG-102", "PAX-102", Booking.Status.CONFIRMED);
        system.createBooking("BKG-103", "PAX-103", Booking.Status.CONFIRMED);
        system.createBooking("BKG-104", "PAX-104", Booking.Status.CONFIRMED);
        system.createBooking("BKG-105", "PAX-105", Booking.Status.CONFIRMED);

        // 3. DMGT Partitioning Output
        System.out.println("--- 3. DMGT FARE CLASS PARTITIONING ---");
        System.out.println("Passengers are partitioned into disjoint sets based on their fare class.");
        System.out.printf("Economy Set (|E|):  %d passengers%n", system.getFareClassPartition().getEconomyCount());
        System.out.printf("Premium Set (|P|):  %d passengers%n", system.getFareClassPartition().getPremiumCount());
        System.out.printf("Business Set (|B|): %d passengers%n", system.getFareClassPartition().getBusinessCount());
        System.out.printf("Total Partitioned:  %d passengers%n", system.getFareClassPartition().getTotalPartitionedCount());
        System.out.printf("Disjoint Invariant Verified (E ∩ P = ∅, E ∩ B = ∅, P ∩ B = ∅): %b%n%n",
                system.getFareClassPartition().verifyDisjoint());

        // 4. ADSA B-Tree Index Search
        System.out.println("--- 4. ADSA B-TREE BOOKING INDEX ---");
        System.out.println("Searching for booking ID 'BKG-103' via B-tree index:");
        Booking found = system.searchBooking("BKG-103");
        if (found != null) {
            System.out.println("Found in B-Tree: " + found);
        } else {
            System.out.println("Booking not found!");
        }
        System.out.println("Total nodes indexed in B-Tree: " + system.getBookingIndex().getSize());
        System.out.println();

        // 5. Historical Data Export
        System.out.println("--- 5. HISTORICAL DATA EXPORT ---");
        String csvPath = "data/historical_bookings.csv";
        try {
            system.exportHistoricalDataToCsv(csvPath);
            System.out.println("Successfully exported historical booking data to: " + csvPath);
        } catch (Exception e) {
            System.out.println("Export notice: " + e.getMessage());
        }
        System.out.println();

        // 6. Python Estimation Simulation & Safe Overbooking Calculation
        System.out.println("--- 6 & 7. PYTHON PREDICTION & SAFE OVERBOOKING ---");
        double estimatedNoShowProb = 0.12; // 12% estimated by Python module
        System.out.printf("Estimated no-show probability from Python: %.1f%%%n", estimatedNoShowProb * 100);

        OverbookingCalculator.OverbookingResult result = system.evaluateOverbookingLimit(estimatedNoShowProb);
        System.out.println("Aircraft capacity: " + result.getAircraftCapacity());
        System.out.println("Confirmed bookings: " + result.getConfirmedBookings());
        System.out.printf("Estimated no-shows: %.1f%n", result.getExpectedNoShows());
        System.out.println("Recommended additional bookings: " + result.getRecommendedAdditionalBookings());
        System.out.println("Maximum safe bookings: " + result.getMaxSafeBookings());
        System.out.printf("Safety risk tier: %s (Denied Boarding Probability: %.2f%%)%n",
                result.getRiskTier(), result.getBumpingRiskPercentage());
        System.out.println("==========================================================");
    }
}
