import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { FlightSetupTab } from './components/FlightSetupTab';
import { PassengerBookingTab } from './components/PassengerBookingTab';
import { FareClassPartitionTab } from './components/FareClassPartitionTab';
import { BTreeIndexTab } from './components/BTreeIndexTab';
import { PythonPredictionTab } from './components/PythonPredictionTab';
import { SafeOverbookingTab } from './components/SafeOverbookingTab';
import { CodeDocsTab } from './components/CodeDocsTab';
import { AirplaneLandingIntro } from './components/AirplaneLandingIntro';
import { TicketConfirmationModal } from './components/TicketConfirmationModal';

import { Booking, BookingStatus, Flight, Passenger } from './types';
import {
  initialFlight,
  getInitialBookings,
  getInitialHistoricalRecords,
} from './data/initialData';
import { BTreeIndex } from './lib/btree';
import { computeFareClassPartition } from './lib/dmgt';
import {
  calculateSafeOverbooking,
  HistoricalRecord,
  runPythonPredictor,
} from './lib/overbooking';

const BOOKINGS_STORAGE_KEY = 'airline_manager_bookings_v3';
const ACTIVE_BOOKING_KEY = 'airline_manager_last_active_booking_v3';

export default function App() {
  const [showLandingIntro, setShowLandingIntro] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [flight, setFlight] = useState<Flight>(initialFlight);

  // Persistent bookings from localStorage
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load bookings from storage:', e);
    }
    return getInitialBookings(initialFlight);
  });

  // Persistent Active Booking (displayed whenever the website is opened)
  const [activeBooking, setActiveBooking] = useState<Booking | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_BOOKING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.bookingId) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load active booking from storage:', e);
    }
    const initialList = getInitialBookings(initialFlight);
    return initialList[0] || null;
  });

  const [modalTicket, setModalTicket] = useState<Booking | null>(null);

  // Save bookings to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings to storage:', e);
    }
  }, [bookings]);

  // Save activeBooking to localStorage whenever updated
  useEffect(() => {
    if (activeBooking) {
      try {
        localStorage.setItem(ACTIVE_BOOKING_KEY, JSON.stringify(activeBooking));
      } catch (e) {
        console.error('Failed to save active booking to storage:', e);
      }
    }
  }, [activeBooking]);

  const [historicalRecords, setHistoricalRecords] = useState<HistoricalRecord[]>(() =>
    getInitialHistoricalRecords()
  );
  const [safetyFactor, setSafetyFactor] = useState<number>(0.65);
  const [quickTraceKey, setQuickTraceKey] = useState<string>('');

  // Synchronous B-Tree Index construction
  const bTree = useMemo(() => {
    const tree = new BTreeIndex(3);
    for (const b of bookings) {
      tree.insert(b.bookingId, b);
    }
    return tree;
  }, [bookings]);

  // DMGT Fare Class Partitioning
  const partition = useMemo(() => {
    return computeFareClassPartition(bookings);
  }, [bookings]);

  // Python No-Show Statistical Prediction
  const prediction = useMemo(() => {
    return runPythonPredictor(historicalRecords);
  }, [historicalRecords]);

  // Java Safe Overbooking Service Metrics
  const metrics = useMemo(() => {
    return calculateSafeOverbooking(
      flight.aircraftCapacity,
      partition.totalConfirmed,
      flight.maxAllowedOverbooking,
      prediction.overallProbability,
      safetyFactor
    );
  }, [flight, partition.totalConfirmed, prediction.overallProbability, safetyFactor]);

  // Handlers
  const handleUpdateFlight = (newFlight: Flight) => {
    setFlight(newFlight);
    // Update existing bookings with the new destination currency and class prices
    setBookings(prev =>
      prev.map(b => {
        const ticketPrice =
          b.passenger.fareClass === 'BUSINESS'
            ? newFlight.businessPrice
            : b.passenger.fareClass === 'PREMIUM'
            ? newFlight.premiumPrice
            : newFlight.economyPrice;
        return {
          ...b,
          flightNumber: newFlight.flightNumber,
          ticketPrice,
          currencyCode: newFlight.currencyCode,
          currencySymbol: newFlight.currencySymbol,
        };
      })
    );
  };

  const handleResetToDemo = () => {
    try {
      localStorage.removeItem(BOOKINGS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_BOOKING_KEY);
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    setFlight(initialFlight);
    const initialList = getInitialBookings(initialFlight);
    setBookings(initialList);
    setActiveBooking(initialList[0] || null);
    setHistoricalRecords(getInitialHistoricalRecords());
    setSafetyFactor(0.65);
  };

  const handleAddBooking = (
    passenger: Passenger,
    status: BookingStatus,
    flightOverride?: {
      flightNumber: string;
      destination?: string;
      countryFlag?: string;
      currencyCode: string;
      currencySymbol: string;
      ticketPrice: number;
      seatNumber?: string | number;
    }
  ): Booking => {
    // Check flight booking ceiling
    const ceiling = flight.aircraftCapacity + flight.maxAllowedOverbooking;
    if (status === 'CONFIRMED' && partition.totalConfirmed >= ceiling) {
      throw new Error(
        `Flight booking limit reached. Physical seats: ${flight.aircraftCapacity}, Max Overbooking: ${flight.maxAllowedOverbooking} (Total: ${ceiling}).`
      );
    }

    const ticketPrice =
      flightOverride?.ticketPrice ??
      (passenger.fareClass === 'BUSINESS'
        ? flight.businessPrice
        : passenger.fareClass === 'PREMIUM'
        ? flight.premiumPrice
        : flight.economyPrice);

    const nextIdNum = bookings.length + 1;
    const seatNumber =
      flightOverride?.seatNumber !== undefined
        ? flightOverride.seatNumber
        : status === 'CONFIRMED'
        ? partition.totalConfirmed + 1
        : undefined;

    const newBooking: Booking = {
      bookingId: `BKG-${nextIdNum.toString().padStart(3, '0')}`,
      flightNumber: flightOverride?.flightNumber || flight.flightNumber,
      destination: flightOverride?.destination || flight.destination,
      countryFlag: flightOverride?.countryFlag || flight.countryFlag,
      passenger,
      status,
      seatNumber,
      bookingTime: new Date().toISOString(),
      ticketPrice,
      currencyCode: flightOverride?.currencyCode || flight.currencyCode,
      currencySymbol: flightOverride?.currencySymbol || flight.currencySymbol,
    };

    setBookings(prev => [newBooking, ...prev]);
    setActiveBooking(newBooking);

    // Also add to historical telemetry pool
    const newHistRecord: HistoricalRecord = {
      passengerId: passenger.passengerId,
      fareClass: passenger.fareClass,
      bookingStatus: status === 'CONFIRMED' ? 'BOARDED' : 'CANCELLED',
      previousNoShowCount: passenger.previousNoShowCount,
      totalPreviousBookings: passenger.totalPreviousBookings,
      noShowOutcome: 0,
    };
    setHistoricalRecords(prev => [newHistRecord, ...prev]);

    return newBooking;
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.bookingId === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
  };

  const handleSearchTrace = (key: string) => {
    return bTree.search(key);
  };

  const handleNavigateToBTreeTrace = (bookingId: string) => {
    setQuickTraceKey(bookingId);
    setCurrentTab('btree');
  };

  const handleExportCsv = () => {
    const headers = [
      'passenger_id',
      'fare_class',
      'booking_status',
      'previous_no_show_count',
      'total_previous_bookings',
      'no_show_outcome',
    ];

    const rows = historicalRecords.map(r => [
      r.passengerId,
      r.fareClass,
      r.bookingStatus,
      r.previousNoShowCount,
      r.totalPreviousBookings,
      r.noShowOutcome,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'historical_bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsed: HistoricalRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 6) {
          parsed.push({
            passengerId: parts[0],
            fareClass: (parts[1].toUpperCase() as any) || 'ECONOMY',
            bookingStatus: (parts[2].toUpperCase() as any) || 'BOARDED',
            previousNoShowCount: Number(parts[3]) || 0,
            totalPreviousBookings: Number(parts[4]) || 1,
            noShowOutcome: Number(parts[5]) || 0,
          });
        }
      }

      if (parsed.length > 0) {
        setHistoricalRecords(parsed);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-neutral-100/40 text-neutral-900 flex flex-col font-sans antialiased">
      {/* Airplane Landing Opening Animation */}
      {showLandingIntro && (
        <AirplaneLandingIntro
          flight={flight}
          onComplete={() => setShowLandingIntro(false)}
        />
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        flight={flight}
        confirmedCount={partition.totalConfirmed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {modalTicket && (
          <TicketConfirmationModal
            booking={modalTicket}
            flight={{
              ...flight,
              flightNumber: modalTicket.flightNumber || flight.flightNumber,
              destination: modalTicket.destination || flight.destination,
              countryFlag: modalTicket.countryFlag || flight.countryFlag,
              currencyCode: modalTicket.currencyCode || flight.currencyCode,
              currencySymbol: modalTicket.currencySymbol || flight.currencySymbol,
            }}
            onClose={() => setModalTicket(null)}
            onBookAnother={() => {
              setModalTicket(null);
              setCurrentTab('booking');
            }}
            onSearchBookingId={handleNavigateToBTreeTrace}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardTab
            flight={flight}
            bookings={bookings}
            activeBooking={activeBooking}
            onViewActiveTicket={b => setModalTicket(b)}
            partition={partition}
            prediction={prediction}
            metrics={metrics}
            onNavigate={setCurrentTab}
            onQuickBookModal={() => setCurrentTab('booking')}
            onUpdateFlight={handleUpdateFlight}
          />
        )}

        {currentTab === 'flight-setup' && (
          <FlightSetupTab
            flight={flight}
            onUpdateFlight={handleUpdateFlight}
            onResetToDemo={handleResetToDemo}
          />
        )}

        {currentTab === 'booking' && (
          <PassengerBookingTab
            flight={flight}
            bookings={bookings}
            activeBooking={activeBooking}
            onSetActiveBooking={setActiveBooking}
            onAddBooking={handleAddBooking}
            onCancelBooking={handleCancelBooking}
            onSearchBookingId={handleNavigateToBTreeTrace}
            onUpdateFlight={handleUpdateFlight}
          />
        )}

        {currentTab === 'partitioning' && (
          <FareClassPartitionTab partition={partition} flight={flight} />
        )}

        {currentTab === 'btree' && (
          <BTreeIndexTab
            bTree={bTree}
            bookings={bookings}
            onSearchTrace={handleSearchTrace}
            defaultSearchKey={quickTraceKey}
          />
        )}

        {currentTab === 'python' && (
          <PythonPredictionTab
            prediction={prediction}
            historicalRecords={historicalRecords}
            onExportCsv={handleExportCsv}
            onImportCsv={handleImportCsv}
            onRecomputePrediction={() => {
              setHistoricalRecords(prev => [...prev]);
            }}
          />
        )}

        {currentTab === 'overbooking' && (
          <SafeOverbookingTab
            metrics={metrics}
            prediction={prediction}
            safetyFactor={safetyFactor}
            onSafetyFactorChange={setSafetyFactor}
            flight={flight}
          />
        )}

        {currentTab === 'code' && <CodeDocsTab />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <div>
            <strong>Airline Overbooking Manager</strong> — Academic prototype demonstrating DMGT (Set
            Theory), ADSA (B-Tree), OOPJ (Reservation System), and Python ML.
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowLandingIntro(true)}
              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center space-x-1"
              title="Replay opening airplane landing animation"
            >
              <span>🛬 Replay Landing</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('code')}
              className="text-neutral-700 hover:text-neutral-900 font-medium underline cursor-pointer"
            >
              View Java & Python Code
            </button>
            <span>•</span>
            <button
              onClick={handleResetToDemo}
              className="text-neutral-700 hover:text-neutral-900 font-medium cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
