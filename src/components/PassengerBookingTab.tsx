import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Code,
  Sparkles,
  Plane,
  Banknote,
  Globe2,
  Clock,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  Download,
  Armchair,
  Filter,
  GitFork,
} from 'lucide-react';
import { AvailableFlightOption, Booking, BookingStatus, DestinationPreset, FareClass, Flight, Passenger } from '../types';
import { destinationPresets, getAvailableFlightsForDestination, getDestinationPreset } from '../data/initialData';
import { TicketConfirmationModal } from './TicketConfirmationModal';
import { AircraftSeatMap } from './AircraftSeatMap';

interface PassengerBookingTabProps {
  flight: Flight;
  bookings: Booking[];
  onAddBooking: (
    passenger: Passenger,
    status: BookingStatus,
    flightOverride?: { flightNumber: string; currencyCode: string; currencySymbol: string; ticketPrice: number; seatNumber?: string | number }
  ) => Booking;
  onCancelBooking: (bookingId: string) => void;
  onSearchBookingId: (bookingId: string) => void;
  onUpdateFlight?: (newFlight: Flight) => void;
}

export const PassengerBookingTab: React.FC<PassengerBookingTabProps> = ({
  flight,
  bookings,
  onAddBooking,
  onCancelBooking,
  onSearchBookingId,
  onUpdateFlight,
}) => {
  // 4-Step Booking Wizard State: 1: Destination -> 2: Flight -> 3: Seat Selection -> 4: Passenger Details
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSeatCode, setSelectedSeatCode] = useState<string>('18E');
  const [selectedDestText, setSelectedDestText] = useState<string>(flight.destination);
  const [destinationSearch, setDestinationSearch] = useState<string>('');

  const selectedPreset: DestinationPreset = useMemo(() => {
    return getDestinationPreset(selectedDestText);
  }, [selectedDestText]);

  // Compute live confirmed bookings for current flight to update available seats in real-time
  const confirmedCountForFlight = useMemo(() => {
    return bookings.filter(b => b.status === 'CONFIRMED' && b.flightNumber === flight.flightNumber).length;
  }, [bookings, flight.flightNumber]);

  const availableFlights: AvailableFlightOption[] = useMemo(() => {
    return getAvailableFlightsForDestination(selectedDestText, flight, confirmedCountForFlight);
  }, [selectedDestText, flight, confirmedCountForFlight]);

  const [selectedFlight, setSelectedFlight] = useState<AvailableFlightOption>(availableFlights[0]);

  // Keep selectedFlight synced with availableFlights when available seats change
  useEffect(() => {
    setSelectedFlight(prev => {
      const match = availableFlights.find(f => f.flightNumber === prev.flightNumber);
      return match || availableFlights[0];
    });
  }, [availableFlights]);

  // Form State
  const [passengerId, setPassengerId] = useState(
    `PAX-${(bookings.length + 1).toString().padStart(3, '0')}`
  );
  const [fullName, setFullName] = useState('');
  const [fareClass, setFareClass] = useState<FareClass>('ECONOMY');
  const [status, setStatus] = useState<BookingStatus>('CONFIRMED');
  const [pastNoShows, setPastNoShows] = useState(0);
  const [totalPast, setTotalPast] = useState(3);
  const [selectedSeat, setSelectedSeat] = useState<string>('Seat 18E (Economy Class)');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Post-booking Confirmation Modal State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Table Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [fareFilter, setFareFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Details Modal state
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Filtered destination presets for Step 1
  const filteredPresets = useMemo(() => {
    if (!destinationSearch.trim()) return destinationPresets;
    const q = destinationSearch.toLowerCase();
    return destinationPresets.filter(
      p =>
        p.destination.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.airportCode.toLowerCase().includes(q)
    );
  }, [destinationSearch]);

  const getPriceForClass = (fc: FareClass, flightOpt?: AvailableFlightOption): number => {
    const targetFlight = flightOpt || selectedFlight;
    if (fc === 'BUSINESS') return targetFlight.businessPrice;
    if (fc === 'PREMIUM') return targetFlight.premiumPrice;
    return targetFlight.economyPrice;
  };

  const currentPrice = getPriceForClass(fareClass, selectedFlight);

  // Step 1 Handler: Select Destination
  const handleSelectDestination = (preset: DestinationPreset) => {
    setSelectedDestText(preset.destination);
    const newFlights = getAvailableFlightsForDestination(preset.destination, flight, confirmedCountForFlight);
    setSelectedFlight(newFlights[0]);
    setBookingStep(2);
  };

  // Step 2 Handler: Select Flight
  const handleSelectFlight = (flt: AvailableFlightOption) => {
    setSelectedFlight(flt);
    // Sync with app flight if desired
    if (onUpdateFlight) {
      onUpdateFlight({
        ...flight,
        flightNumber: flt.flightNumber,
        destination: flt.destination,
        countryFlag: flt.countryFlag,
        currencyCode: flt.currencyCode,
        currencySymbol: flt.currencySymbol,
        economyPrice: flt.economyPrice,
        premiumPrice: flt.premiumPrice,
        businessPrice: flt.businessPrice,
      });
    }
    setBookingStep(3);
  };

  // Step 3 Handler: Select Seat from interactive seat map
  const handleSelectSeat = (seatCode: string, cabin: FareClass) => {
    setSelectedSeatCode(seatCode);
    setFareClass(cabin);
    setSelectedSeat(`Seat ${seatCode} (${cabin.charAt(0) + cabin.slice(1).toLowerCase()} Class)`);
  };

  // Handler for Fare Class toggle (keeps seat synchronized with cabin)
  const handleFareClassChange = (fc: FareClass) => {
    setFareClass(fc);
    const rowNum = parseInt(selectedSeatCode, 10);
    const isCurrentSeatInCabin =
      fc === 'BUSINESS'
        ? rowNum >= 1 && rowNum <= 3
        : fc === 'PREMIUM'
        ? rowNum >= 4 && rowNum <= 7
        : rowNum >= 8 && rowNum <= 20;

    if (!isCurrentSeatInCabin) {
      if (fc === 'BUSINESS') {
        setSelectedSeatCode('3D');
        setSelectedSeat('Seat 3D (Business Class)');
      } else if (fc === 'PREMIUM') {
        setSelectedSeatCode('7E');
        setSelectedSeat('Seat 7E (Premium Class)');
      } else {
        setSelectedSeatCode('18E');
        setSelectedSeat('Seat 18E (Economy Class)');
      }
    }
  };

  // Step 3 Handler: Submit Booking
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!passengerId.trim()) {
      setFormError('Passenger ID is required.');
      return;
    }
    if (!fullName.trim()) {
      setFormError('Passenger Full Name is required.');
      return;
    }
    if (pastNoShows > totalPast) {
      setFormError('Previous no-shows cannot exceed total previous bookings.');
      return;
    }

    const passenger: Passenger = {
      passengerId: passengerId.trim(),
      fullName: fullName.trim(),
      fareClass,
      previousNoShowCount: Number(pastNoShows),
      totalPreviousBookings: Number(totalPast),
    };

    try {
      const createdBooking = onAddBooking(passenger, status, {
        flightNumber: selectedFlight.flightNumber,
        currencyCode: selectedFlight.currencyCode,
        currencySymbol: selectedFlight.currencySymbol,
        ticketPrice: currentPrice,
        seatNumber: selectedSeatCode,
      });

      // Show Thank You Confirmation Animation & Modal
      setConfirmedBooking(createdBooking);
      setFormSuccess(
        `Successfully booked ${passenger.fullName} on ${selectedFlight.flightNumber} to ${selectedFlight.destination}!`
      );

      // Increment next passenger ID
      const nextNum = bookings.length + 2;
      setPassengerId(`PAX-${nextNum.toString().padStart(3, '0')}`);
      setFullName('');
      setPastNoShows(0);
      setTotalPast(3);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create booking.');
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passenger.passengerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passenger.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFare = fareFilter === 'ALL' || b.passenger.fareClass === fareFilter;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesFare && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Confirmation Modal with Airplane Animation & Boarding Pass */}
      {confirmedBooking && (
        <TicketConfirmationModal
          booking={confirmedBooking}
          flight={{
            ...flight,
            flightNumber: confirmedBooking.flightNumber || selectedFlight.flightNumber,
            destination: selectedDestText || flight.destination,
            countryFlag: selectedPreset.countryFlag || flight.countryFlag,
            currencyCode: confirmedBooking.currencyCode || selectedFlight.currencyCode,
            currencySymbol: confirmedBooking.currencySymbol || selectedFlight.currencySymbol,
          }}
          onClose={() => setConfirmedBooking(null)}
          onBookAnother={() => {
            setConfirmedBooking(null);
            setBookingStep(1);
          }}
          onSearchBookingId={onSearchBookingId}
        />
      )}

      {/* Top Banner with Destination Flag and Currency */}
      <div className="bg-linear-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md text-sky-300 rounded-xl border border-white/15">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Passenger Ticket Reservation System
                </span>
                <span className="text-lg">{selectedPreset.countryFlag}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Select Destination, Flight & Book Ticket</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 font-mono text-sky-200">
                  {selectedPreset.currencyCode} ({selectedPreset.currencySymbol})
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-xs backdrop-blur-md">
            <div className="text-right">
              <div className="text-[11px] text-neutral-300">Active Route Selection</div>
              <div className="font-bold text-white flex items-center space-x-1.5">
                <span className="text-base">{selectedPreset.countryFlag}</span>
                <span>{selectedPreset.destination}</span>
                <span className="text-sky-300 font-mono">[{selectedPreset.currencyCode}]</span>
              </div>
              <div className="text-[11px] text-emerald-300 font-bold mt-0.5 flex items-center justify-end space-x-1.5">
                <Armchair className="h-3.5 w-3.5 text-emerald-400" />
                <span>Flight {selectedFlight.flightNumber}: {selectedFlight.availableSeats} Seats Available ({selectedFlight.aircraftCapacity} Total)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-STEP BOOKING WIZARD HEADER */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setBookingStep(1)}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all cursor-pointer text-left ${
              bookingStep === 1
                ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-200'
                : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                bookingStep === 1 ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-neutral-900 truncate">1. Destination</div>
              <div className="text-[11px] text-neutral-500 truncate flex items-center space-x-1">
                <span>{selectedPreset.countryFlag}</span>
                <span>{selectedPreset.destination}</span>
              </div>
            </div>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => setBookingStep(2)}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all cursor-pointer text-left ${
              bookingStep === 2
                ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-200'
                : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                bookingStep === 2 ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-neutral-900 truncate">2. Select Flight</div>
              <div className="text-[11px] text-neutral-500 truncate flex items-center space-x-1">
                <span>✈ {selectedFlight.flightNumber}</span>
                <span>•</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/90 px-1 py-0.2 rounded text-[10px]">
                  {selectedFlight.availableSeats} Open
                </span>
              </div>
            </div>
          </button>

          {/* Step 3 Pill: Seat Selection */}
          <button
            type="button"
            onClick={() => setBookingStep(3)}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all cursor-pointer text-left ${
              bookingStep === 3
                ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-200'
                : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                bookingStep === 3 ? 'bg-purple-600 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-neutral-900 truncate">3. Select Seat</div>
              <div className="text-[11px] text-neutral-500 truncate flex items-center space-x-1">
                <Armchair className="h-3 w-3 text-purple-600" />
                <span className="font-bold text-purple-800 font-mono">Seat {selectedSeatCode}</span>
                <span className="text-[10px] text-neutral-400">({fareClass})</span>
              </div>
            </div>
          </button>

          {/* Step 4 Pill */}
          <button
            type="button"
            onClick={() => setBookingStep(4)}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all cursor-pointer text-left ${
              bookingStep === 4
                ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-200'
                : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                bookingStep === 4 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              4
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-neutral-900 truncate">4. Passenger & Book</div>
              <div className="text-[11px] text-neutral-500 truncate">
                {fullName || 'Enter Passenger Info'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* STEP 1: SELECT DESTINATION */}
      {bookingStep === 1 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">
                  Step 1: Choose Your Flight Destination
                </h2>
                <p className="text-xs text-neutral-500">
                  Select where you want to fly. Country flags and destination currencies (🇮🇳 India, 🇦🇪 UAE, 🇸🇬 Singapore, 🇯🇵 Japan, 🇫🇷 France, 🇺🇸 USA, 🇬🇧 UK) update dynamically.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={destinationSearch}
                onChange={e => setDestinationSearch(e.target.value)}
                placeholder="Search city, country, airport..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {filteredPresets.map(preset => {
              const isSelected = selectedPreset.airportCode === preset.airportCode;
              return (
                <button
                  key={preset.airportCode}
                  type="button"
                  onClick={() => handleSelectDestination(preset)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-300 shadow-xs'
                      : 'bg-neutral-50/60 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl leading-none" role="img" aria-label={preset.country}>
                        {preset.countryFlag}
                      </span>
                      <div>
                        <div className="text-sm font-extrabold text-neutral-900 group-hover:text-blue-700 flex items-center space-x-1.5">
                          <span>{preset.destination}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500">{preset.country}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 font-mono">
                      {preset.currencyCode}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Economy from</span>
                      <span className="text-sm font-black text-neutral-900 font-mono">
                        {preset.currencySymbol}{preset.economyPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Armchair className="h-3 w-3 text-emerald-600" />
                        <span>{preset.availableSeats || 18} Seats Available</span>
                      </span>
                      <div className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform mt-1">
                        <span>Choose Flight</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT AVAILABLE FLIGHT */}
      {bookingStep === 2 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 flex items-center space-x-2">
                  <span>Step 2: Select an Available Flight</span>
                  <span>{selectedPreset.countryFlag}</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Route: <strong>{flight.source}</strong> ➔ <strong>{selectedPreset.destination}</strong> ({selectedPreset.country})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBookingStep(1)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Destination</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {availableFlights.map(flt => {
              const isChosen = selectedFlight.flightNumber === flt.flightNumber;
              return (
                <div
                  key={flt.flightNumber}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isChosen
                      ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-300 shadow-md'
                      : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-extrabold bg-blue-600 text-white">
                        {flt.flightNumber}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-2xs">
                        <Armchair className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{flt.availableSeats} Seats Available</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm font-black text-neutral-900">
                        <span>{flt.departureTime}</span>
                        <div className="flex items-center space-x-1 text-neutral-400 text-xs font-normal">
                          <div className="w-6 h-0.5 bg-neutral-300" />
                          <span>{flt.duration}</span>
                          <div className="w-6 h-0.5 bg-neutral-300" />
                        </div>
                        <span>{flt.arrivalTime}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-500">
                        <span>{flt.source.split('(')[1]?.replace(')', '') || 'JFK'}</span>
                        <span className="text-indigo-600 font-medium">Non-stop</span>
                        <span>{flt.destination.split('(')[1]?.replace(')', '') || 'LHR'}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 text-xs space-y-1.5">
                      <div className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                        <span>Aircraft:</span>
                        <span className="text-neutral-900">{flt.aircraftType}</span>
                      </div>
                      <div className="text-[11px] text-neutral-600 flex items-center justify-between">
                        <span>Total Aircraft Capacity:</span>
                        <span className="font-mono font-bold text-neutral-900">{flt.aircraftCapacity} Seats</span>
                      </div>
                      <div className="text-[11px] text-neutral-700 flex items-center justify-between bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-950 flex items-center space-x-1">
                          <Armchair className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Seats Available to Book:</span>
                        </span>
                        <span className="font-mono font-extrabold text-emerald-700">{flt.availableSeats} Seats Left</span>
                      </div>
                      {/* Visual Seat Progress Bar */}
                      <div className="space-y-0.5 pt-0.5">
                        <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                          <span>{flt.aircraftCapacity - flt.availableSeats} Booked</span>
                          <span className="text-emerald-700 font-bold">{flt.availableSeats} Open</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round(((flt.aircraftCapacity - flt.availableSeats) / flt.aircraftCapacity) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Class Fares Preview with Seats Available per Class */}
                    <div className="grid grid-cols-3 gap-1 text-center pt-1">
                      <div className="bg-sky-50 rounded-lg py-1 px-1 border border-sky-100">
                        <div className="text-[9px] font-bold text-sky-800 uppercase">Eco</div>
                        <div className="text-[11px] font-black text-sky-950 font-mono">
                          {flt.currencySymbol}{flt.economyPrice.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-sky-700 font-bold mt-0.5">
                          {flt.availableEconomySeats} seats avlbl
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg py-1 px-1 border border-purple-100">
                        <div className="text-[9px] font-bold text-purple-800 uppercase">Prem</div>
                        <div className="text-[11px] font-black text-purple-950 font-mono">
                          {flt.currencySymbol}{flt.premiumPrice.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">
                          {flt.availablePremiumSeats} seats avlbl
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg py-1 px-1 border border-emerald-100">
                        <div className="text-[9px] font-bold text-emerald-800 uppercase">Biz</div>
                        <div className="text-[11px] font-black text-emerald-950 font-mono">
                          {flt.currencySymbol}{flt.businessPrice.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                          {flt.availableBusinessSeats} seats avlbl
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => handleSelectFlight(flt)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        isChosen
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-neutral-200 text-neutral-900 border border-neutral-300'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>
                        {isChosen
                          ? `Selected Flight ✓ (${flt.availableSeats} Seats Available)`
                          : `Select Flight (${flt.availableSeats} Seats Available)`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: INTERACTIVE AIRCRAFT SEAT MAP SELECTION */}
      {bookingStep === 3 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Armchair className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 flex items-center space-x-2">
                  <span>Step 3: Select Your Preferred Aircraft Seat</span>
                  <span>{selectedPreset.countryFlag}</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Interactive cabin seat map for Flight <strong>{selectedFlight.flightNumber}</strong> ({flight.source} ➔ {selectedPreset.destination}). Click any available seat.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBookingStep(2)}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center space-x-1 cursor-pointer px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Flights</span>
              </button>
              <button
                type="button"
                onClick={() => setBookingStep(4)}
                className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center space-x-1.5 cursor-pointer px-4 py-2 rounded-xl shadow-xs transition-all"
              >
                <span>Confirm Seat ({selectedSeatCode}) & Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Flight Summary & Selected Seat Status Strip */}
          <div className="p-3.5 bg-linear-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                <Plane className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-neutral-900 flex items-center space-x-2">
                  <span className="font-mono">{selectedFlight.flightNumber}</span>
                  <span className="text-neutral-400">•</span>
                  <span>{flight.source} ➔ {selectedPreset.destination}</span>
                  <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold text-[11px]">
                    {selectedFlight.availableSeats} Open Seats
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 mt-0.5">
                  Aircraft: <strong>{selectedFlight.aircraftType}</strong> ({selectedFlight.aircraftCapacity} Physical Capacity) • Non-stop
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-neutral-500 font-medium">Currently Selected:</span>
              <div className="px-3 py-1 rounded-xl bg-white border border-purple-200 font-mono font-black text-purple-900 text-sm flex items-center space-x-1.5 shadow-2xs">
                <Armchair className="h-3.5 w-3.5 text-purple-600" />
                <span>Seat {selectedSeatCode}</span>
                <span className="text-[10px] font-sans font-bold text-purple-600 uppercase bg-purple-100 px-1.5 py-0.2 rounded">
                  {fareClass}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Aircraft Seat Map Component */}
          <AircraftSeatMap
            flight={selectedFlight}
            bookings={bookings}
            selectedSeatCode={selectedSeatCode}
            onSelectSeat={handleSelectSeat}
          />

          {/* Bottom Step Navigation Bar */}
          <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setBookingStep(2)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Flight Selection (Step 2)</span>
            </button>

            <div className="flex items-center space-x-3 text-xs bg-purple-50/90 border border-purple-200 px-4 py-2 rounded-xl">
              <span className="text-purple-950 font-bold flex items-center space-x-1.5">
                <Armchair className="h-4 w-4 text-purple-600" />
                <span>Selected Seat: <strong className="font-mono text-purple-950 text-sm font-black">{selectedSeatCode}</strong></span>
              </span>
              <span className="text-neutral-400">•</span>
              <span className="font-bold text-purple-800 uppercase text-[11px]">{fareClass} Class</span>
              <span className="text-neutral-400">•</span>
              <span className="font-mono font-black text-purple-950">
                {selectedFlight.currencySymbol}{currentPrice.toLocaleString()} {selectedFlight.currencyCode}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setBookingStep(4)}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-purple-500/25 transition-all"
            >
              <span>Proceed to Passenger Details (Step 4)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PASSENGER RESERVATION & CONFIRMATION */}
      {bookingStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reservation Form */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Step 4: Enter Passenger & Ticket Details
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Finalize reservation for Flight <strong>{selectedFlight.flightNumber}</strong> with seat <strong>{selectedSeatCode}</strong> ({fareClass} Class).
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setBookingStep(3)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1 cursor-pointer px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change Seat ({selectedSeatCode})</span>
                </button>
              </div>
            </div>

            {/* Selected Seat Callout Banner */}
            <div className="p-3.5 bg-linear-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-mono font-black text-sm shadow-xs shrink-0">
                  {selectedSeatCode}
                </div>
                <div>
                  <div className="font-extrabold text-neutral-900 flex items-center space-x-2">
                    <span>Selected Seat: {selectedSeatCode}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                      {fareClass} Class
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      Seat Reserved ✓
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    Flight <strong>{selectedFlight.flightNumber}</strong> • {flight.source} ➔ {selectedPreset.destination} ({selectedPreset.countryFlag})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingStep(3)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer self-start sm:self-auto shrink-0 flex items-center space-x-1"
              >
                <Armchair className="h-3.5 w-3.5 text-purple-600" />
                <span>Change Seat on Map</span>
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center space-x-2">
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Passenger ID */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Passenger ID (OOPJ Primary Key)
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerId}
                    onChange={e => setPassengerId(e.target.value.toUpperCase())}
                    placeholder="e.g. PAX-101"
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Passenger Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Marie Curie"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  />
                </div>
              </div>

              {/* Fare Class selection with Destination Pricing & Symbols */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Select Fare Class (DMGT Partition Partitioning)
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 font-mono">
                    Currency: {selectedFlight.currencyCode} ({selectedFlight.currencySymbol})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['ECONOMY', 'PREMIUM', 'BUSINESS'] as FareClass[]).map(fc => {
                    const price = getPriceForClass(fc, selectedFlight);
                    const isSelected = fareClass === fc;
                    const seatsInClass =
                      fc === 'ECONOMY'
                        ? selectedFlight.availableEconomySeats
                        : fc === 'PREMIUM'
                        ? selectedFlight.availablePremiumSeats
                        : selectedFlight.availableBusinessSeats;

                    return (
                      <button
                        key={fc}
                        type="button"
                        onClick={() => handleFareClassChange(fc)}
                        className={`p-3 rounded-xl text-center transition-all cursor-pointer border ${
                          isSelected
                            ? fc === 'BUSINESS'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                              : fc === 'PREMIUM'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                              : 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        <div className="text-[11px] uppercase font-bold">{fc}</div>
                        <div className="text-sm font-black font-mono mt-1">
                          {selectedFlight.currencySymbol}{price.toLocaleString()}
                        </div>
                        <div
                          className={`text-[10px] mt-1.5 font-bold flex items-center justify-center space-x-1 ${
                            isSelected ? 'text-white/95' : 'text-neutral-500'
                          }`}
                        >
                          <Armchair className="h-3 w-3" />
                          <span>{seatsInClass} seats available</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Booking Status & Selected Seat Summary Tile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Booking Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as BookingStatus)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="CONFIRMED">CONFIRMED (Subject to Overbooking Safety)</option>
                    <option value="STANDBY">STANDBY (Waitlist / Overbooking Buffer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Selected Aircraft Seat</span>
                    <button
                      type="button"
                      onClick={() => setBookingStep(3)}
                      className="text-[11px] text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer"
                    >
                      Change Seat on Map
                    </button>
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 text-xs bg-purple-50 border border-purple-200 rounded-xl text-purple-950 font-bold flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Armchair className="h-4 w-4 text-purple-600" />
                        <span className="font-mono font-black text-sm bg-purple-600 text-white px-2 py-0.5 rounded-md">
                          Seat {selectedSeatCode}
                        </span>
                        <span className="text-purple-800 text-[11px] font-semibold">({fareClass})</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                        Selected ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Past No-Show History (Python Predictor Feature) */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                  Historical Passenger Telemetry (Used by Python Model)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-600 mb-1">
                      Previous No-Shows
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={pastNoShows}
                      onChange={e => setPastNoShows(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-600 mb-1">
                      Total Past Bookings
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={totalPast}
                      onChange={e => setTotalPast(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 text-xs sm:text-sm font-black text-white bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Plane className="h-4 w-4" />
                <span>
                  Confirm & Book Ticket (Seat {selectedSeatCode} • {selectedFlight.currencySymbol}{currentPrice.toLocaleString()} {selectedFlight.currencyCode})
                </span>
              </button>
            </form>
          </div>

          {/* Right Summary Card */}
          <div className="space-y-4">
            <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xs space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Selected Itinerary Summary
                </span>
                <span className="text-xl">{selectedPreset.countryFlag}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Flight:</span>
                  <span className="font-mono font-bold text-white">{selectedFlight.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Route:</span>
                  <span className="font-semibold text-white">{flight.source} ➔ {selectedPreset.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Departure:</span>
                  <span className="font-semibold text-white">{selectedFlight.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Arrival:</span>
                  <span className="font-semibold text-white">{selectedFlight.arrivalTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Aircraft:</span>
                  <span className="font-semibold text-white">{selectedFlight.aircraftType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Aircraft Capacity:</span>
                  <span className="font-semibold text-white">{selectedFlight.aircraftCapacity} Seats Total</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-neutral-400">Available Seats:</span>
                  <span className="font-bold text-emerald-400 font-mono bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md text-xs">
                    {selectedFlight.availableSeats} Seats Available
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-y border-white/10 my-1 bg-white/5 px-2 rounded-lg">
                  <span className="text-neutral-300 font-bold flex items-center space-x-1.5">
                    <Armchair className="h-3.5 w-3.5 text-purple-400" />
                    <span>Selected Seat:</span>
                  </span>
                  <span className="font-mono font-black text-sky-300 bg-sky-950 border border-sky-400/40 px-2.5 py-0.5 rounded-md text-sm">
                    Seat {selectedSeatCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Selected Class:</span>
                  <span className="font-bold text-sky-300">{fareClass}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-400">Class Availability:</span>
                  <span className="text-sky-300 font-semibold">
                    {fareClass === 'ECONOMY'
                      ? `${selectedFlight.availableEconomySeats} Economy seats left`
                      : fareClass === 'PREMIUM'
                      ? `${selectedFlight.availablePremiumSeats} Premium seats left`
                      : `${selectedFlight.availableBusinessSeats} Business seats left`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-xs text-neutral-300 font-bold uppercase">Total Fare</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {selectedFlight.currencySymbol}{currentPrice.toLocaleString()} {selectedFlight.currencyCode}
                </span>
              </div>
            </div>

            {/* OOPJ Concept Reminder */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-xs space-y-1.5 shadow-2xs">
              <span className="font-bold text-neutral-900 flex items-center space-x-1.5">
                <Code className="h-4 w-4 text-indigo-600" />
                <span>OOPJ Architecture Active</span>
              </span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Reservations are instantiated as strongly-typed <code>Booking</code> and <code>Passenger</code> domain objects and directly indexed into the ADSA B-Tree structure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE BOOKINGS TABLE (B-Tree Indexed) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Active Passenger Bookings (B-Tree Indexed)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search booking ID, passenger..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none"
              />
            </div>

            <select
              value={fareFilter}
              onChange={e => setFareFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-800 focus:outline-none"
            >
              <option value="ALL">All Classes</option>
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM">Premium</option>
              <option value="BUSINESS">Business</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-800 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="STANDBY">Standby</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-y border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Passenger</th>
                <th className="py-2.5 px-3">Fare Class</th>
                <th className="py-2.5 px-3">Seat</th>
                <th className="py-2.5 px-3">Ticket Price</th>
                <th className="py-2.5 px-3">No-Show History</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredBookings.map(b => (
                <tr key={b.bookingId} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                    {b.bookingId}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-neutral-900">{b.passenger.fullName}</span>
                    <span className="text-[11px] font-mono text-neutral-400 ml-1.5">
                      ({b.passenger.passengerId})
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.passenger.fareClass === 'BUSINESS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : b.passenger.fareClass === 'PREMIUM'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}
                    >
                      {b.passenger.fareClass}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center space-x-1 font-mono font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-[11px]">
                      <Armchair className="h-3 w-3 text-neutral-500" />
                      <span>{b.seatNumber ? (String(b.seatNumber).startsWith('Seat') ? b.seatNumber : `Seat ${b.seatNumber}`) : '—'}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                    {b.currencySymbol || flight.currencySymbol}
                    {(b.ticketPrice || getPriceForClass(b.passenger.fareClass)).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600">
                    <span className="font-medium">{b.passenger.previousNoShowCount}</span> /{' '}
                    {b.passenger.totalPreviousBookings} past
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-neutral-100 text-neutral-900 border border-neutral-300'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedBookingDetails(b)}
                      title="View Details"
                      className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onSearchBookingId(b.bookingId)}
                      title="Trace in B-Tree Index"
                      className="p-1 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <GitFork className="h-3.5 w-3.5" />
                    </button>
                    {b.status !== 'CANCELLED' && (
                      <button
                        onClick={() => onCancelBooking(b.bookingId)}
                        title="Cancel Booking"
                        className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
                  <span>OOPJ Booking Details</span>
                  <span className="text-xl ml-1">{flight.countryFlag}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Booking ID</span>
                <span className="font-mono font-bold text-neutral-900 text-sm">
                  {selectedBookingDetails.bookingId}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Flight Route</span>
                <span className="font-mono font-bold text-blue-700 text-sm flex items-center space-x-1">
                  <span>{selectedBookingDetails.flightNumber}</span>
                  <span className="text-neutral-400 font-sans">•</span>
                  <span>{flight.countryFlag} {flight.destination}</span>
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Passenger Name</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {selectedBookingDetails.passenger.fullName}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Ticket Fare Paid</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {selectedBookingDetails.currencySymbol || flight.currencySymbol}
                  {(selectedBookingDetails.ticketPrice || getPriceForClass(selectedBookingDetails.passenger.fareClass)).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-neutral-500">
                    {selectedBookingDetails.currencyCode || flight.currencyCode}
                  </span>
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Fare Class</span>
                <span className="font-bold text-neutral-900">
                  {selectedBookingDetails.passenger.fareClass}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Assigned Seat</span>
                <span className="font-mono font-bold text-purple-900 flex items-center space-x-1.5 text-sm">
                  <Armchair className="h-4 w-4 text-purple-600" />
                  <span>
                    {selectedBookingDetails.seatNumber
                      ? String(selectedBookingDetails.seatNumber).startsWith('Seat')
                        ? selectedBookingDetails.seatNumber
                        : `Seat ${selectedBookingDetails.seatNumber}`
                      : 'Unassigned'}
                  </span>
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 col-span-2">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="font-bold text-neutral-900">{selectedBookingDetails.status}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const b = selectedBookingDetails;
                  setSelectedBookingDetails(null);
                  setConfirmedBooking(b);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View & Download Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBookingDetails(null)}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
