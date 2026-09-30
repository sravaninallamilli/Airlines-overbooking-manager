package com.airline.overbooking.model;

import java.time.LocalDate;

/**
 * Flight entity representing flight metadata, physical aircraft capacity,
 * destination country flag, destination currency, and tiered class prices.
 */
public class Flight {
    private final String flightNumber;
    private final String source;
    private final String destination;
    private final LocalDate flightDate;
    private final int aircraftCapacity;
    private int maxAllowedOverbooking;
    
    // Destination Currency & Country Flag
    private String countryFlag;
    private String currencyCode;
    private String currencySymbol;
    private double economyPrice;
    private double premiumPrice;
    private double businessPrice;

    public Flight(String flightNumber, String source, String destination, LocalDate flightDate,
                  int aircraftCapacity, int maxAllowedOverbooking,
                  String countryFlag, String currencyCode, String currencySymbol,
                  double economyPrice, double premiumPrice, double businessPrice) {
        if (aircraftCapacity <= 0) {
            throw new IllegalArgumentException("Aircraft capacity must be greater than zero");
        }
        if (maxAllowedOverbooking < 0) {
            throw new IllegalArgumentException("Maximum allowed overbooking cannot be negative");
        }
        this.flightNumber = flightNumber;
        this.source = source;
        this.destination = destination;
        this.flightDate = flightDate;
        this.aircraftCapacity = aircraftCapacity;
        this.maxAllowedOverbooking = maxAllowedOverbooking;
        this.countryFlag = countryFlag;
        this.currencyCode = currencyCode;
        this.currencySymbol = currencySymbol;
        this.economyPrice = economyPrice;
        this.premiumPrice = premiumPrice;
        this.businessPrice = businessPrice;
    }

    public Flight(String flightNumber, String source, String destination, LocalDate flightDate,
                  int aircraftCapacity, int maxAllowedOverbooking) {
        this(flightNumber, source, destination, flightDate, aircraftCapacity, maxAllowedOverbooking,
             "🇬🇧", "GBP", "£", 480.0, 950.0, 2400.0);
    }

    public String getFlightNumber() { return flightNumber; }
    public String getSource() { return source; }
    public String getDestination() { return destination; }
    public LocalDate getFlightDate() { return flightDate; }
    public int getAircraftCapacity() { return aircraftCapacity; }
    public int getMaxAllowedOverbooking() { return maxAllowedOverbooking; }
    public void setMaxAllowedOverbooking(int maxAllowedOverbooking) { this.maxAllowedOverbooking = maxAllowedOverbooking; }

    public String getCountryFlag() { return countryFlag; }
    public void setCountryFlag(String countryFlag) { this.countryFlag = countryFlag; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public double getEconomyPrice() { return economyPrice; }
    public void setEconomyPrice(double economyPrice) { this.economyPrice = economyPrice; }

    public double getPremiumPrice() { return premiumPrice; }
    public void setPremiumPrice(double premiumPrice) { this.premiumPrice = premiumPrice; }

    public double getBusinessPrice() { return businessPrice; }
    public void setBusinessPrice(double businessPrice) { this.businessPrice = businessPrice; }

    public double getPriceForClass(FareClass fareClass) {
        switch (fareClass) {
            case BUSINESS: return businessPrice;
            case PREMIUM:  return premiumPrice;
            case ECONOMY:
            default:       return economyPrice;
        }
    }

    public int getAbsoluteBookingCeiling() {
        return aircraftCapacity + maxAllowedOverbooking;
    }

    @Override
    public String toString() {
        return String.format("Flight[%s: %s -> %s %s on %s | %s %s | Eco:%s%.0f, Prem:%s%.0f, Biz:%s%.0f]",
                flightNumber, source, destination, countryFlag, flightDate,
                currencyCode, currencySymbol,
                currencySymbol, economyPrice, currencySymbol, premiumPrice, currencySymbol, businessPrice);
    }
}
