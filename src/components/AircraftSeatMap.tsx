import React, { useState, useMemo } from 'react';
import {
  Armchair,
  Check,
  Lock,
  Info,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Plane,
  X,
} from 'lucide-react';
import { AvailableFlightOption, Booking, FareClass, Flight } from '../types';

export interface SeatData {
  code: string;
  row: number;
  letter: string;
  cabin: FareClass;
  type: 'Window' | 'Aisle' | 'Middle';
  isExitRow?: boolean;
}

interface AircraftSeatMapProps {
  flight: AvailableFlightOption;
  bookings: Booking[];
  selectedSeatCode: string;
  onSelectSeat: (seatCode: string, cabin: FareClass) => void;
  selectedCabinFilter?: FareClass | 'ALL';
}

export const AircraftSeatMap: React.FC<AircraftSeatMapProps> = ({
  flight,
  bookings,
  selectedSeatCode,
  onSelectSeat,
  selectedCabinFilter = 'ALL',
}) => {
  const [activeFilter, setActiveFilter] = useState<FareClass | 'ALL'>(selectedCabinFilter);
  const [occupiedAlert, setOccupiedAlert] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<SeatData | null>(null);

  // Generate aircraft layout
  // Business: Rows 1 - 3 (2-2 configuration: A, C || D, F)
  // Premium Economy: Rows 4 - 7 (3-3 configuration: A, B, C || D, E, F)
  // Main Economy: Rows 8 - 20 (3-3 configuration: A, B, C || D, E, F, with Row 12 as Exit Row)
  const allSeats: SeatData[] = useMemo(() => {
    const list: SeatData[] = [];

    // Business Class (Rows 1-3)
    for (let r = 1; r <= 3; r++) {
      const letters = ['A', 'C', 'D', 'F'];
      letters.forEach(letter => {
        list.push({
          code: `${r}${letter}`,
          row: r,
          letter,
          cabin: 'BUSINESS',
          type: letter === 'A' || letter === 'F' ? 'Window' : 'Aisle',
        });
      });
    }

    // Premium Economy (Rows 4-7)
    for (let r = 4; r <= 7; r++) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      letters.forEach(letter => {
        list.push({
          code: `${r}${letter}`,
          row: r,
          letter,
          cabin: 'PREMIUM',
          type: letter === 'A' || letter === 'F' ? 'Window' : letter === 'C' || letter === 'D' ? 'Aisle' : 'Middle',
        });
      });
    }

    // Economy Class (Rows 8-20)
    for (let r = 8; r <= 20; r++) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      letters.forEach(letter => {
        list.push({
          code: `${r}${letter}`,
          row: r,
          letter,
          cabin: 'ECONOMY',
          type: letter === 'A' || letter === 'F' ? 'Window' : letter === 'C' || letter === 'D' ? 'Aisle' : 'Middle',
          isExitRow: r === 12,
        });
      });
    }

    return list;
  }, []);

  // Set of occupied seats for the selected flight
  const occupiedSeatCodes = useMemo(() => {
    const set = new Set<string>();

    bookings
      .filter(b => b.flightNumber === flight.flightNumber && b.status === 'CONFIRMED')
      .forEach((b, idx) => {
        if (typeof b.seatNumber === 'string' && b.seatNumber.trim()) {
          const clean = b.seatNumber.replace(/^Seat\s+/i, '').toUpperCase().trim();
          if (clean) {
            set.add(clean);
          }
        } else if (typeof b.seatNumber === 'number') {
          const seatCandidate = allSeats[(b.seatNumber - 1) % allSeats.length];
          if (seatCandidate) {
            set.add(seatCandidate.code);
          }
        } else {
          // Map numeric index to seat codes in order
          const seatCandidate = allSeats[idx % allSeats.length];
          if (seatCandidate) {
            set.add(seatCandidate.code);
          }
        }
      });

    return set;
  }, [bookings, flight.flightNumber, allSeats]);

  const handleSeatClick = (seat: SeatData) => {
    if (occupiedSeatCodes.has(seat.code)) {
      setOccupiedAlert(`Seat ${seat.code} is Overbooked / Unavailable (Red 🔴). Please select an open seat in Green 🟢 (Business), Violet 🟣 (Premium), or Blue 🔵 (Economy).`);
      setTimeout(() => setOccupiedAlert(null), 4500);
      return;
    }

    setOccupiedAlert(null);
    onSelectSeat(seat.code, seat.cabin);
  };

  const getSeatClasses = (seat: SeatData, isSelected: boolean, isOccupied: boolean) => {
    if (isSelected) {
      // Highlighted separately with brilliant Gold/Amber halo and ring
      return 'bg-amber-400 text-amber-950 border-2 border-white ring-4 ring-amber-400 shadow-lg scale-110 z-20 font-black animate-pulse';
    }
    if (isOccupied) {
      // Overbooked / Unavailable = Red 🔴
      return 'bg-red-500 hover:bg-red-600 text-white border-red-600 cursor-not-allowed opacity-90 shadow-2xs';
    }
    if (seat.cabin === 'BUSINESS') {
      // Business Class = Green 🟢
      return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-sm hover:scale-105 active:scale-95';
    }
    if (seat.cabin === 'PREMIUM') {
      // Premium Class = Violet 🟣
      return 'bg-violet-600 hover:bg-violet-700 text-white border-violet-700 shadow-sm hover:scale-105 active:scale-95';
    }
    // Economy Class = Blue 🔵
    return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm hover:scale-105 active:scale-95';
  };

  const getSeatPrice = (cabin: FareClass) => {
    if (cabin === 'BUSINESS') return flight.businessPrice;
    if (cabin === 'PREMIUM') return flight.premiumPrice;
    return flight.economyPrice;
  };

  // Group seats by row for rendering
  const rows = useMemo(() => {
    const map = new Map<number, SeatData[]>();
    allSeats.forEach(s => {
      if (!map.has(s.row)) map.set(s.row, []);
      map.get(s.row)!.push(s);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [allSeats]);

  const filteredRows = useMemo(() => {
    if (activeFilter === 'ALL') return rows;
    return rows.filter(([_, seats]) => seats.some(s => s.cabin === activeFilter));
  }, [rows, activeFilter]);

  const selectedSeatObj = allSeats.find(s => s.code === selectedSeatCode) || allSeats[0];

  return (
    <div className="space-y-4">
      {/* Seat Map Header & Cabin Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
        <div>
          <div className="flex items-center space-x-2">
            <Armchair className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-extrabold text-neutral-900">
              Interactive Aircraft Seat Map
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
              {flight.aircraftType}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Click any open seat to choose your preferred spot. Window, aisle, and cabin class are shown.
          </p>
        </div>

        {/* Cabin View Selector */}
        <div className="inline-flex p-1 bg-white border border-neutral-200 rounded-xl text-xs font-bold shadow-2xs">
          {(['ALL', 'BUSINESS', 'PREMIUM', 'ECONOMY'] as const).map(cab => (
            <button
              key={cab}
              type="button"
              onClick={() => setActiveFilter(cab)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeFilter === cab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {cab === 'ALL' ? 'All Cabins' : cab.charAt(0) + cab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SEAT MAP COLOR AVAILABILITY LEGEND */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
          <div className="flex items-center space-x-2">
            <Armchair className="h-4 w-4 text-neutral-700" />
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Aircraft Seat Availability & Cabin Color Legend
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Click any open seat to choose • Overbooked/Unavailable seats cannot be selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Business Class Green */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🟢
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-emerald-950 truncate">Business Class</div>
              <div className="text-[10px] text-emerald-700 font-bold">Green 🟢 Available</div>
            </div>
          </div>

          {/* Premium Class Violet */}
          <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-300 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🟣
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-violet-950 truncate">Premium Class</div>
              <div className="text-[10px] text-violet-700 font-bold">Violet 🟣 Available</div>
            </div>
          </div>

          {/* Economy Class Blue */}
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-300 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🔵
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-blue-950 truncate">Economy Class</div>
              <div className="text-[10px] text-blue-700 font-bold">Blue 🔵 Available</div>
            </div>
          </div>

          {/* Overbooked / Unavailable Red */}
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🔴
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-red-950 truncate">Overbooked / Full</div>
              <div className="text-[10px] text-red-700 font-bold">Red 🔴 Unavailable</div>
            </div>
          </div>

          {/* Selected Seat Amber/Gold */}
          <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center space-x-2.5 col-span-2 sm:col-span-1 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-400 border border-amber-500 text-amber-950 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              ★
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-amber-950 truncate">Selected Seat</div>
              <div className="text-[10px] text-amber-800 font-bold">Highlighted Choice</div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupied Alert Toast */}
      {occupiedAlert && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{occupiedAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setOccupiedAlert(null)}
            className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AIRCRAFT CABIN CONTAINER */}
      <div className="relative bg-gradient-to-b from-neutral-100 via-neutral-50 to-neutral-100 border border-neutral-300 rounded-3xl p-4 sm:p-8 max-w-2xl mx-auto shadow-inner overflow-hidden">
        {/* Cockpit Nose Graphic */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 sm:w-44 h-16 bg-neutral-300/80 rounded-t-full border-t-2 border-x-2 border-neutral-400 flex items-center justify-center shadow-xs">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-neutral-600">
              <span className="text-sm">👨‍✈️</span>
              <span>Cockpit</span>
            </div>
          </div>
          <div className="w-48 sm:w-64 h-3 bg-neutral-200 border-x border-neutral-300" />
          <div className="text-[10px] uppercase font-bold text-neutral-400 mt-1">
            Galley & Front Exit Doors 🚪
          </div>
        </div>

        {/* Cabin Seating Grid */}
        <div className="space-y-3">
          {filteredRows.map(([rowNum, rowSeats]) => {
            const cabin = rowSeats[0]?.cabin;
            const isFirstOfCabin =
              rowNum === 1 ||
              rowNum === 4 ||
              rowNum === 8;

            const isExit = rowNum === 12;

            // Separate into Left and Right sides for aisle
            const leftSeats = rowSeats.filter(s => s.letter === 'A' || s.letter === 'B' || s.letter === 'C');
            const rightSeats = rowSeats.filter(s => s.letter === 'D' || s.letter === 'E' || s.letter === 'F');

            return (
              <React.Fragment key={rowNum}>
                {/* Cabin Section Divider Banner */}
                {isFirstOfCabin && (
                  <div className="pt-2 pb-1">
                    <div
                      className={`text-center py-1.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase border flex items-center justify-between shadow-xs ${
                        cabin === 'BUSINESS'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : cabin === 'PREMIUM'
                          ? 'bg-violet-600 text-white border-violet-700'
                          : 'bg-blue-600 text-white border-blue-700'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <span>{cabin === 'BUSINESS' ? '🟢' : cabin === 'PREMIUM' ? '🟣' : '🔵'}</span>
                        <span>{cabin} CABIN (ROWS {cabin === 'BUSINESS' ? '1-3' : cabin === 'PREMIUM' ? '4-7' : '8-20'})</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold">
                        {flight.currencySymbol}{getSeatPrice(cabin).toLocaleString()} {flight.currencyCode}
                      </span>
                    </div>
                  </div>
                )}

                {/* Exit Row Indicator */}
                {isExit && (
                  <div className="text-center py-1 bg-amber-100/70 border border-amber-300 rounded-lg text-[10px] font-bold text-amber-900 flex items-center justify-center space-x-2">
                    <span>🚪 EMERGENCY EXIT ROW • Extra Legroom</span>
                  </div>
                )}

                {/* The Row of Seats */}
                <div className="flex items-center justify-between gap-1 sm:gap-2">
                  {/* Left Window Indicator */}
                  <span className="text-[10px] font-bold text-neutral-300 w-3 text-center">
                    W
                  </span>

                  {/* Left Side Seats (A, B, C or A, C) */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 justify-end">
                    {leftSeats.map(seat => {
                      const isOccupied = occupiedSeatCodes.has(seat.code);
                      const isSelected = selectedSeatCode === seat.code;

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`relative w-8 h-9 sm:w-10 sm:h-11 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${getSeatClasses(
                            seat,
                            isSelected,
                            isOccupied
                          )}`}
                          title={
                            isOccupied
                              ? `Seat ${seat.code} - Overbooked / Unavailable (Red 🔴)`
                              : isSelected
                              ? `Seat ${seat.code} - Your Selected Seat (${seat.cabin} Class)`
                              : `Seat ${seat.code} - Available ${seat.cabin} Class (${
                                  seat.cabin === 'BUSINESS' ? 'Green 🟢' : seat.cabin === 'PREMIUM' ? 'Violet 🟣' : 'Blue 🔵'
                                })`
                          }
                        >
                          <span className="text-[10px] sm:text-xs font-black font-mono leading-none">
                            {seat.code}
                          </span>
                          <span className="text-[8px] font-bold tracking-tight mt-0.5 leading-none">
                            {isSelected ? '★' : isOccupied ? '🔴' : seat.cabin === 'BUSINESS' ? '🟢' : seat.cabin === 'PREMIUM' ? '🟣' : '🔵'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Center Aisle with Row Number */}
                  <div className="w-8 sm:w-10 text-center font-mono font-bold text-xs text-neutral-400 select-none py-1">
                    {rowNum}
                  </div>

                  {/* Right Side Seats (D, E, F or D, F) */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 justify-start">
                    {rightSeats.map(seat => {
                      const isOccupied = occupiedSeatCodes.has(seat.code);
                      const isSelected = selectedSeatCode === seat.code;

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`relative w-8 h-9 sm:w-10 sm:h-11 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${getSeatClasses(
                            seat,
                            isSelected,
                            isOccupied
                          )}`}
                          title={
                            isOccupied
                              ? `Seat ${seat.code} - Overbooked / Unavailable (Red 🔴)`
                              : isSelected
                              ? `Seat ${seat.code} - Your Selected Seat (${seat.cabin} Class)`
                              : `Seat ${seat.code} - Available ${seat.cabin} Class (${
                                  seat.cabin === 'BUSINESS' ? 'Green 🟢' : seat.cabin === 'PREMIUM' ? 'Violet 🟣' : 'Blue 🔵'
                                })`
                          }
                        >
                          <span className="text-[10px] sm:text-xs font-black font-mono leading-none">
                            {seat.code}
                          </span>
                          <span className="text-[8px] font-bold tracking-tight mt-0.5 leading-none">
                            {isSelected ? '★' : isOccupied ? '🔴' : seat.cabin === 'BUSINESS' ? '🟢' : seat.cabin === 'PREMIUM' ? '🟣' : '🔵'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Window Indicator */}
                  <span className="text-[10px] font-bold text-neutral-300 w-3 text-center">
                    W
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Aircraft Tail & Galley Graphic */}
        <div className="flex flex-col items-center mt-6 pt-4 border-t border-neutral-200">
          <div className="text-[10px] uppercase font-bold text-neutral-400">
            Aft Galley & Lavatories 🚻
          </div>
          <div className="w-24 h-6 bg-neutral-200 rounded-b-xl border border-neutral-300 mt-1" />
        </div>
      </div>

      {/* Selected Seat Detail Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-mono font-black text-xl text-sky-300 shadow-xs">
            {selectedSeatObj.code}
          </div>
          <div>
            <div className="text-sm sm:text-base font-black flex items-center space-x-2">
              <span>Selected Seat: {selectedSeatObj.code}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-sky-200 border border-blue-400/40">
                {selectedSeatObj.cabin} Class
              </span>
            </div>
            <div className="text-xs text-blue-200/90 flex items-center space-x-2 mt-0.5">
              <span>{selectedSeatObj.type} Seat</span>
              <span>•</span>
              <span>Flight {flight.flightNumber}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold font-mono">
                {flight.currencySymbol}{getSeatPrice(selectedSeatObj.cabin).toLocaleString()} {flight.currencyCode}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold block">
            Seat Selection Status
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
            Confirmed & Ready for Reservation ✓
          </span>
        </div>
      </div>
    </div>
  );
};
