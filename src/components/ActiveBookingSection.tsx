import React from 'react';
import {
  Armchair,
  CheckCircle2,
  Eye,
  Plane,
  Download,
  GitFork,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Booking, Flight } from '../types';

interface ActiveBookingSectionProps {
  booking: Booking | null;
  flight: Flight;
  onViewTicket: (booking: Booking) => void;
  onBookAnother?: () => void;
  onTraceBTree?: (bookingId: string) => void;
}

export const ActiveBookingSection: React.FC<ActiveBookingSectionProps> = ({
  booking,
  flight,
  onViewTicket,
  onBookAnother,
  onTraceBTree,
}) => {
  if (!booking) {
    return null;
  }

  const destinationText = booking.destination || flight.destination;
  const flagText = booking.countryFlag || flight.countryFlag;
  const seatNum = booking.seatNumber
    ? String(booking.seatNumber).startsWith('Seat')
      ? String(booking.seatNumber)
      : `Seat ${booking.seatNumber}`
    : 'Auto-Assigned at Gate';

  const isBusiness = booking.passenger.fareClass === 'BUSINESS';
  const isPremium = booking.passenger.fareClass === 'PREMIUM';
  const classColor = isBusiness
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : isPremium
    ? 'text-violet-700 bg-violet-50 border-violet-300'
    : 'text-blue-700 bg-blue-50 border-blue-300';

  const seatBadgeColor = isBusiness
    ? 'bg-emerald-600 text-white'
    : isPremium
    ? 'bg-violet-600 text-white'
    : 'bg-blue-600 text-white';

  return (
    <div className="bg-linear-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-blue-900/60 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute right-0 top-0 bottom-0 w-96 pointer-events-none opacity-10 flex items-center justify-end pr-6">
        <Plane className="w-80 h-80 -rotate-12 text-white" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Active Passenger Reservation
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {booking.status} ✓
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
                <span>{booking.passenger.fullName}</span>
                <span className="text-xs font-mono font-normal text-sky-300">
                  ({booking.passenger.passengerId})
                </span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-sky-200">
              Booking Ref: <strong>{booking.bookingId}</strong>
            </span>
            <button
              type="button"
              onClick={() => onViewTicket(booking)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View Boarding Pass</span>
            </button>
            {onBookAnother && (
              <button
                type="button"
                onClick={onBookAnother}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Book Another</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Core Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Destination */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Destination
            </span>
            <div className="text-sm font-black text-white flex items-center space-x-1.5 mt-0.5">
              <span>{flagText}</span>
              <span className="truncate">{destinationText}</span>
            </div>
            <div className="text-[10px] text-sky-300 mt-0.5">Route Non-stop</div>
          </div>

          {/* Flight */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Flight No.
            </span>
            <div className="text-sm font-mono font-black text-sky-300 mt-0.5">
              {booking.flightNumber}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">From {flight.source}</div>
          </div>

          {/* Assigned Seat with Color Code */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Aircraft Seat
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs shadow-xs ${seatBadgeColor}`}>
                {seatNum}
              </span>
              <span className="text-[10px] font-bold text-neutral-300">
                {isBusiness ? '🟢' : isPremium ? '🟣' : '🔵'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Confirmed Seat Map</div>
          </div>

          {/* Cabin Class */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Fare Class
            </span>
            <div className="text-xs font-black text-white uppercase mt-0.5 flex items-center space-x-1">
              <span>{booking.passenger.fareClass}</span>
              <span className="text-[10px]">
                {isBusiness ? '🟢 Green' : isPremium ? '🟣 Violet' : '🔵 Blue'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Partitioned DMGT</div>
          </div>

          {/* Fare Paid */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Total Fare Paid
            </span>
            <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">
              {booking.currencySymbol || flight.currencySymbol}
              {(booking.ticketPrice || flight.economyPrice).toLocaleString()}{' '}
              <span className="text-[10px] font-normal text-neutral-300">
                {booking.currencyCode || flight.currencyCode}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Protected Fare</div>
          </div>

          {/* Gate & Status */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Boarding Gate
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              Gate B14 <span className="text-xs text-neutral-400">(T3)</span>
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Ready for Departure</div>
          </div>
        </div>

        {/* Footer Actions Strip */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-neutral-400 text-[11px]">
            <span>Booked: {new Date(booking.bookingTime).toLocaleDateString()}</span>
            <span>•</span>
            <span>Overbooking Buffer Checked ✓</span>
          </div>

          <div className="flex items-center space-x-2">
            {onTraceBTree && (
              <button
                type="button"
                onClick={() => onTraceBTree(booking.bookingId)}
                className="text-[11px] text-sky-300 hover:text-white flex items-center space-x-1 cursor-pointer underline"
              >
                <GitFork className="h-3 w-3" />
                <span>Trace in B-Tree</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onViewTicket(booking)}
              className="text-[11px] font-bold text-white hover:text-sky-200 bg-white/15 px-3 py-1 rounded-lg border border-white/20 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Print / Download Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
