package com.airline.overbooking.reservation;

import com.airline.overbooking.btree.BTree;
import com.airline.overbooking.dmgt.FareClassPartition;
import com.airline.overbooking.model.Booking;
import com.airline.overbooking.model.FareClass;
import com.airline.overbooking.model.Flight;
import com.airline.overbooking.model.Passenger;
import com.airline.overbooking.service.OverbookingCalculator;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

/**
 * OOPJ Concept: Reservation System Central Manager.
 * 
 * Encapsulates:
 * - Active Flight
 * - Passenger entity registry
 * - B-tree booking index (ADSA)
 * - Fare Class set partitions (DMGT)
 * - Historical CSV data export engine
 */
public class ReservationSystem {
    private Flight currentFlight;
    private final Map<String, Passenger> passengerDirectory;
    private final BTree bookingIndex; // ADSA B-tree
    private final FareClassPartition fareClassPartition; // DMGT partition
    private final List<Booking> bookingHistory;

    public ReservationSystem(Flight flight) {
        this.currentFlight = flight;
        this.passengerDirectory = new LinkedHashMap<>();
        this.bookingIndex = new BTree(3); // Degree t=3
        this.fareClassPartition = new FareClassPartition();
        this.bookingHistory = new ArrayList<>();
    }

    public Flight getCurrentFlight() {
        return currentFlight;
    }

    public void setCurrentFlight(Flight flight) {
        this.currentFlight = flight;
    }

    public synchronized void registerPassenger(Passenger passenger) {
        if (passenger == null) throw new IllegalArgumentException("Passenger cannot be null");
        passengerDirectory.put(passenger.getPassengerId(), passenger);
    }

    public Passenger getPassenger(String passengerId) {
        return passengerDirectory.get(passengerId);
    }

    /**
     * Creates a new booking, inserts into B-tree index, and updates DMGT partitions.
     */
    public synchronized Booking createBooking(String bookingId, String passengerId, Booking.Status initialStatus) {
        Passenger passenger = passengerDirectory.get(passengerId);
        if (passenger == null) {
            throw new NoSuchElementException("Passenger ID not found: " + passengerId);
        }

        // Check against absolute booking ceiling
        int currentConfirmed = getConfirmedBookingsCount();
        if (initialStatus == Booking.Status.CONFIRMED && currentConfirmed >= currentFlight.getAbsoluteBookingCeiling()) {
            throw new IllegalStateException("Flight booking ceiling reached (" + currentFlight.getAbsoluteBookingCeiling() + ")");
        }

        Booking booking = new Booking(bookingId, currentFlight.getFlightNumber(), passenger, initialStatus);
        
        // 1. Index in B-tree (ADSA)
        bookingIndex.insert(bookingId, booking);

        // 2. Partition in Fare Class sets (DMGT) if confirmed
        if (initialStatus == Booking.Status.CONFIRMED) {
            fareClassPartition.addPassenger(passenger);
        }

        bookingHistory.add(booking);
        return booking;
    }

    /**
     * Cancels an existing booking. Updates B-tree and removes from DMGT partition.
     */
    public synchronized boolean cancelBooking(String bookingId) {
        Booking booking = bookingIndex.search(bookingId);
        if (booking == null) {
            return false;
        }

        booking.setStatus(Booking.Status.CANCELLED);
        fareClassPartition.removePassenger(booking.getPassenger());
        return true;
    }

    /**
     * Searches booking by ID using B-tree O(log N) index.
     */
    public Booking searchBooking(String bookingId) {
        return bookingIndex.search(bookingId);
    }

    public List<Booking> getAllBookingsFromIndex() {
        return bookingIndex.getAllBookings();
    }

    public int getConfirmedBookingsCount() {
        return fareClassPartition.getTotalPartitionedCount();
    }

    public FareClassPartition getFareClassPartition() {
        return fareClassPartition;
    }

    public BTree getBookingIndex() {
        return bookingIndex;
    }

    /**
     * Exports historical booking records to CSV for Python no-show modeling.
     */
    public void exportHistoricalDataToCsv(String filePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath))) {
            // Header
            writer.println("passenger_id,fare_class,booking_status,previous_no_show_count,total_previous_bookings,no_show_outcome");

            for (Booking b : bookingHistory) {
                Passenger p = b.getPassenger();
                int outcome = (b.getStatus() == Booking.Status.NO_SHOW) ? 1 : 0;
                writer.printf("%s,%s,%s,%d,%d,%d%n",
                        p.getPassengerId(),
                        p.getFareClass().name(),
                        b.getStatus().name(),
                        p.getPreviousNoShowCount(),
                        p.getTotalPreviousBookings(),
                        outcome);
            }
        }
    }

    /**
     * Computes the safe overbooking limit using the Python estimated probability.
     */
    public OverbookingCalculator.OverbookingResult evaluateOverbookingLimit(double pythonEstimatedNoShowProb) {
        return OverbookingCalculator.calculate(
            currentFlight.getAircraftCapacity(),
            getConfirmedBookingsCount(),
            currentFlight.getMaxAllowedOverbooking(),
            pythonEstimatedNoShowProb,
            0.65 // 65% conservative confidence factor
        );
    }
}
