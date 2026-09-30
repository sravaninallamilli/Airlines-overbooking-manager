package com.airline.overbooking.model;

import java.time.LocalDateTime;

/**
 * Booking entity representing a confirmed or waitlisted seat reservation
 * including ticket fare paid in flight destination currency.
 */
public class Booking implements Comparable<Booking> {
    public enum Status {
        CONFIRMED,
        STANDBY,
        CANCELLED,
        BOARDED,
        NO_SHOW
    }

    private final String bookingId;
    private final String flightNumber;
    private final Passenger passenger;
    private Status status;
    private final LocalDateTime bookingTime;
    private int seatNumber;
    private double ticketPrice;
    private String currencyCode;
    private String currencySymbol;

    public Booking(String bookingId, String flightNumber, Passenger passenger, Status status,
                   double ticketPrice, String currencyCode, String currencySymbol) {
        this.bookingId = bookingId;
        this.flightNumber = flightNumber;
        this.passenger = passenger;
        this.status = status;
        this.bookingTime = LocalDateTime.now();
        this.seatNumber = -1;
        this.ticketPrice = ticketPrice;
        this.currencyCode = currencyCode;
        this.currencySymbol = currencySymbol;
    }

    public Booking(String bookingId, String flightNumber, Passenger passenger, Status status) {
        this(bookingId, flightNumber, passenger, status, 480.0, "GBP", "£");
    }

    public String getBookingId() { return bookingId; }
    public String getFlightNumber() { return flightNumber; }
    public Passenger getPassenger() { return passenger; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getBookingTime() { return bookingTime; }
    public int getSeatNumber() { return seatNumber; }
    public void setSeatNumber(int seatNumber) { this.seatNumber = seatNumber; }

    public double getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(double ticketPrice) { this.ticketPrice = ticketPrice; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    @Override
    public int compareTo(Booking other) {
        return this.bookingId.compareTo(other.bookingId);
    }

    @Override
    public String toString() {
        return String.format("Booking[ID=%s, Flight=%s, Passenger=%s (%s), Fare=%s%.0f %s, Status=%s]",
                bookingId, flightNumber, passenger.getFullName(), passenger.getFareClass(),
                currencySymbol, ticketPrice, currencyCode, status);
    }
}
