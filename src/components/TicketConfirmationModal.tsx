import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  Plane,
  X,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  QrCode,
  ArrowRight,
  GitFork,
  User,
  ShieldCheck,
  Check,
  Share2,
} from 'lucide-react';
import { Booking, Flight } from '../types';

interface TicketConfirmationModalProps {
  booking: Booking;
  flight: Flight;
  onClose: () => void;
  onBookAnother: () => void;
  onSearchBookingId?: (bookingId: string) => void;
}

export const TicketConfirmationModal: React.FC<TicketConfirmationModalProps> = ({
  booking,
  flight,
  onClose,
  onBookAnother,
  onSearchBookingId,
}) => {
  const [activeView, setActiveView] = useState<'confirmation' | 'boarding_pass'>('confirmation');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const gate = 'B14';
  const terminal = 'T3';
  const boardingGroup =
    booking.passenger.fareClass === 'BUSINESS'
      ? 'Group 1 (Priority)'
      : booking.passenger.fareClass === 'PREMIUM'
      ? 'Group 2 (Early)'
      : 'Group 3 (General)';
  const seatNum = booking.seatNumber
    ? String(booking.seatNumber).startsWith('Seat')
      ? String(booking.seatNumber)
      : `Seat ${booking.seatNumber}`
    : 'Auto-Assigned at Gate';

  const originCode = flight.source.split('(')[1]?.replace(')', '') || 'JFK';
  const destCode = flight.destination.split('(')[1]?.replace(')', '') || 'DEL';

  // Download printable e-ticket / boarding pass HTML
  const handleDownloadTicket = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Boarding Pass - ${booking.bookingId} - ${booking.passenger.fullName}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      padding: 30px 15px;
      margin: 0;
      color: #0f172a;
    }
    .ticket-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.15);
      border: 1px solid #cbd5e1;
    }
    .ticket-header {
      background: linear-gradient(135deg, #091e3a 0%, #1e3a8a 60%, #2563eb 100%);
      color: #ffffff;
      padding: 28px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .airline-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .airline-logo {
      font-size: 26px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 6px 12px;
    }
    .airline-brand h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 0.5px;
      font-weight: 800;
    }
    .airline-brand p {
      margin: 3px 0 0;
      font-size: 12px;
      color: #bfdbfe;
    }
    .class-badge {
      background: #ffffff;
      color: #1e3a8a;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .ticket-body {
      padding: 36px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }
    .route-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 2px dashed #e2e8f0;
    }
    .route-point {
      display: flex;
      flex-direction: column;
    }
    .airport-code {
      font-size: 38px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -1px;
      line-height: 1;
    }
    .airport-city {
      font-size: 13px;
      color: #64748b;
      margin-top: 5px;
      font-weight: 600;
    }
    .flight-flightpath {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      padding: 0 20px;
    }
    .flight-flightpath .flight-no {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 3px 12px;
      border-radius: 9999px;
      margin-bottom: 6px;
    }
    .flight-flightpath .vector-line {
      width: 100%;
      height: 2px;
      background: #cbd5e1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .flight-flightpath .vector-icon {
      position: absolute;
      color: #2563eb;
      font-size: 18px;
      background: #fff;
      padding: 0 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }
    .info-cell {
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }
    .info-cell .label {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .info-cell .val {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .ticket-stub {
      border-left: 2px dashed #cbd5e1;
      padding-left: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .barcode {
      background: repeating-linear-gradient(to right, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 9px);
      height: 60px;
      width: 100%;
      margin-top: 15px;
      border-radius: 4px;
    }
    .footer-note {
      text-align: center;
      padding: 18px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .ticket-container { box-shadow: none; border: 1px solid #000; }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <div class="airline-brand">
        <div class="airline-logo">✈️</div>
        <div>
          <h1>AIRLINE BOARDING PASS</h1>
          <p>Global Scheduled Passenger Service • Ticket & Itinerary Confirmation</p>
        </div>
      </div>
      <div class="class-badge">${booking.passenger.fareClass} CLASS</div>
    </div>
    <div class="ticket-body">
      <div>
        <div class="route-bar">
          <div class="route-point">
            <span class="airport-code">${originCode}</span>
            <span class="airport-city">${flight.source}</span>
          </div>
          <div class="flight-flightpath">
            <span class="flight-no">${booking.flightNumber}</span>
            <div class="vector-line">
              <span class="vector-icon">✈</span>
            </div>
          </div>
          <div class="route-point" style="text-align: right;">
            <span class="airport-code">${flight.countryFlag} ${destCode}</span>
            <span class="airport-city">${flight.destination}</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-cell">
            <div class="label">Passenger Full Name</div>
            <div class="val">${booking.passenger.fullName}</div>
          </div>
          <div class="info-cell">
            <div class="label">Passenger ID</div>
            <div class="val" style="font-family: monospace;">${booking.passenger.passengerId}</div>
          </div>
          <div class="info-cell">
            <div class="label">Flight Number</div>
            <div class="val" style="color: #2563eb;">${booking.flightNumber}</div>
          </div>
          <div class="info-cell">
            <div class="label">Seat Assigned</div>
            <div class="val" style="color: #0f172a;">${seatNum}</div>
          </div>
          <div class="info-cell">
            <div class="label">Boarding Gate & Terminal</div>
            <div class="val">${gate} (${terminal})</div>
          </div>
          <div class="info-cell">
            <div class="label">Total Fare Paid</div>
            <div class="val" style="color: #059669;">${booking.currencySymbol}${booking.ticketPrice.toLocaleString()} ${booking.currencyCode}</div>
          </div>
        </div>
      </div>

      <div class="ticket-stub">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Booking Reference</div>
          <div style="font-size: 20px; font-weight: 900; color: #1e3a8a; font-family: monospace; margin-top: 4px;">${booking.bookingId}</div>

          <div style="margin-top: 16px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Status</div>
          <div style="font-size: 14px; font-weight: 800; color: #059669; margin-top: 2px;">CONFIRMED & ISSUED</div>

          <div style="margin-top: 16px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Boarding Group</div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${boardingGroup}</div>

          <div style="margin-top: 16px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Flight Date</div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${flight.flightDate || 'Today'}</div>
        </div>

        <div>
          <div class="barcode"></div>
          <div style="font-size: 10px; text-align: center; color: #94a3b8; margin-top: 6px; font-family: monospace;">
            *${booking.bookingId}-${booking.passenger.passengerId}*
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">
      Please present this boarding pass along with valid government photo identification at Gate ${gate}. Gate closes 15 minutes before departure.
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BoardingPass_${booking.bookingId}_${booking.passenger.passengerId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 text-neutral-400 hover:text-neutral-900 bg-white/90 hover:bg-neutral-100 rounded-full transition-all cursor-pointer shadow-xs"
          title="Close Confirmation"
        >
          <X className="h-5 w-5" />
        </button>

        {/* TOP ANIMATED FLIGHT / BOARDING HERO BANNER */}
        <div className="relative bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 p-6 sm:p-7 text-white overflow-hidden shrink-0">
          {/* Subtle Ambient Nebulas / Star Glow */}
          <div className="absolute -top-12 -right-12 w-56 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Clouds in Background */}
          <div className="absolute top-2 left-6 opacity-25 text-3xl pointer-events-none animate-[cloudDrift_14s_ease-in-out_infinite_alternate]">
            ☁️
          </div>
          <div className="absolute top-5 right-16 opacity-20 text-2xl pointer-events-none animate-[cloudDrift_10s_ease-in-out_infinite_alternate-reverse]">
            ☁️
          </div>

          {/* Smooth Flight Corridor Animation Across Screen */}
          <div className="relative h-12 w-full max-w-lg mx-auto flex items-center justify-between px-4 sm:px-8 mb-2">
            {/* Origin Dot */}
            <div className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-blue-400 ring-4 ring-blue-500/30"></span>
              <span className="text-[10px] font-mono font-bold text-blue-200 mt-1">{originCode}</span>
            </div>

            {/* Flight Path with Flying Airplane */}
            <div className="relative flex-1 mx-3 flex items-center justify-center">
              {/* Dashed Vector Corridor */}
              <div className="w-full border-t-2 border-dashed border-blue-400/40" />

              {/* Cruising Airplane with contrail */}
              <div className="absolute left-0 right-0 flex items-center animate-[flightGlider_6s_ease-in-out_infinite]">
                <div className="flex items-center space-x-1 -translate-y-0.5">
                  <span className="text-xl transform rotate-12 drop-shadow-[0_2px_8px_rgba(59,130,246,0.8)]">
                    ✈️
                  </span>
                  <div className="w-12 sm:w-20 h-0.5 bg-gradient-to-r from-blue-300/80 via-white/40 to-transparent rounded-full" />
                </div>
              </div>
            </div>

            {/* Destination Dot with Flag */}
            <div className="flex flex-col items-center">
              <span className="text-base leading-none drop-shadow-sm">{flight.countryFlag}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-300 mt-0.5">{destCode}</span>
            </div>
          </div>

          {/* Success Checkmark & Confirmation Announcement */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-2 mt-1">
            <div className="relative flex items-center justify-center">
              {/* Animated pulsating halo */}
              <div className="w-14 h-14 rounded-full bg-emerald-500/25 flex items-center justify-center animate-ping duration-1000 opacity-75 absolute" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 relative z-10 border-2 border-emerald-300/50">
                <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
                <span>Thank You! Ticket Successfully Booked</span>
                <span className="animate-bounce">✈️</span>
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 font-medium max-w-md mx-auto">
                Your flight reservation to <strong>{flight.destination}</strong> has been successfully confirmed and indexed.
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Summary vs Full Boarding Pass */}
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveView('confirmation')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeView === 'confirmation'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>📋 Booking Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('boarding_pass')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeView === 'boarding_pass'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>🎫 View Boarding Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Download Success Alert */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Official Boarding Pass successfully generated and downloaded!</span>
            </div>
          )}

          {/* VIEW 1: BOOKING CONFIRMATION & TICKET DETAILS SUMMARY */}
          {activeView === 'confirmation' && (
            <div className="space-y-4">
              {/* Route Card Preview */}
              <div className="bg-gradient-to-br from-neutral-50 via-blue-50/30 to-indigo-50/20 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Departure City
                    </span>
                    <span className="text-base sm:text-lg font-black text-neutral-900">
                      {flight.source}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-3">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-100/80 px-2.5 py-0.5 rounded-full mb-1">
                      {booking.flightNumber}
                    </span>
                    <div className="flex items-center space-x-1.5 text-neutral-400">
                      <div className="w-6 sm:w-12 h-0.5 bg-neutral-300" />
                      <Plane className="h-4 w-4 text-blue-600" />
                      <div className="w-6 sm:w-12 h-0.5 bg-neutral-300" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Arrival Destination
                    </span>
                    <span className="text-base sm:text-lg font-black text-neutral-900 flex items-center justify-end space-x-1.5">
                      <span>{flight.countryFlag}</span>
                      <span>{flight.destination}</span>
                    </span>
                  </div>
                </div>

                {/* Key Booking Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">
                      Passenger Name
                    </span>
                    <span className="font-extrabold text-neutral-900 text-sm truncate block mt-0.5">
                      {booking.passenger.fullName}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      ID: {booking.passenger.passengerId}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">
                      Booking Reference
                    </span>
                    <span className="font-mono font-black text-blue-700 text-sm block mt-0.5">
                      {booking.bookingId}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      CONFIRMED ✓
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">
                      Class & Seat
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs mt-0.5 ${
                        booking.passenger.fareClass === 'BUSINESS'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : booking.passenger.fareClass === 'PREMIUM'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-sky-100 text-sky-900 border border-sky-300'
                      }`}
                    >
                      {booking.passenger.fareClass}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-700 block mt-0.5">
                      {seatNum}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-neutral-200/60">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">
                      Ticket Fare Paid
                    </span>
                    <span className="font-mono font-black text-neutral-900 text-sm block mt-0.5">
                      {booking.currencySymbol}{booking.ticketPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold">
                      {booking.currencyCode}
                    </span>
                  </div>
                </div>

                {/* Boarding Info & Barcode Strip */}
                <div className="mt-3.5 pt-3 border-t border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200/80">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Terminal</span>
                      <span className="font-bold text-neutral-900 font-mono">{terminal}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Gate</span>
                      <span className="font-bold text-blue-700 font-mono">{gate}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Boarding</span>
                      <span className="font-bold text-neutral-900">{boardingGroup}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Date</span>
                      <span className="font-bold text-neutral-900">{flight.flightDate || 'Today'}</span>
                    </div>
                  </div>

                  {/* High-fidelity Barcode */}
                  <div className="flex flex-col items-center">
                    <div className="h-7 w-36 bg-[repeating-linear-gradient(to_right,#0f172a_0px,#0f172a_2px,#fff_2px,#fff_4px,#0f172a_4px,#0f172a_7px,#fff_7px,#fff_9px)] rounded-xs" />
                    <span className="text-[9px] font-mono text-neutral-400 mt-1">
                      {booking.bookingId} • {booking.passenger.passengerId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: COMPLETE DIGITAL BOARDING PASS */}
          {activeView === 'boarding_pass' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="border border-neutral-300 rounded-2xl overflow-hidden shadow-xs">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <Plane className="h-4 w-4 text-blue-300" />
                    </div>
                    <div>
                      <div className="font-black text-sm tracking-wide">DIGITAL BOARDING PASS</div>
                      <div className="text-[10px] text-blue-200">Electronic Passenger Ticket • Gate Check Ready</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/40 rounded-full text-[11px] font-mono font-bold text-white uppercase">
                    {booking.passenger.fareClass}
                  </span>
                </div>

                {/* Pass Details */}
                <div className="p-5 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Passenger Name</span>
                      <div className="text-base font-black text-neutral-900">{booking.passenger.fullName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">ID: {booking.passenger.passengerId}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Flight No.</span>
                      <div className="text-base font-black text-blue-600 font-mono">{booking.flightNumber}</div>
                      <div className="text-[11px] text-neutral-500">{flight.flightDate || 'Today'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-xl">
                    <div>
                      <div className="text-2xl font-black text-neutral-900">{originCode}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-[120px]">{flight.source}</div>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <div className="text-xs font-bold text-blue-600 mb-0.5">Non-stop</div>
                      <div className="text-xl text-blue-500 font-bold">✈</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-neutral-900 flex items-center justify-end space-x-1">
                        <span>{flight.countryFlag}</span>
                        <span>{destCode}</span>
                      </div>
                      <div className="text-xs text-neutral-500 truncate max-w-[140px]">{flight.destination}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-neutral-50 rounded-xl text-center border border-neutral-200">
                    <div>
                      <span className="text-[9px] text-neutral-400 uppercase font-bold block">Gate</span>
                      <span className="font-mono font-bold text-neutral-900 text-sm">{gate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 uppercase font-bold block">Boarding</span>
                      <span className="font-mono font-bold text-blue-700 text-sm">08:00 AM</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 uppercase font-bold block">Seat</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">{seatNum}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 uppercase font-bold block">Group</span>
                      <span className="font-mono font-bold text-neutral-900 text-xs">{boardingGroup.split(' ')[0]}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-dashed border-neutral-300">
                    <div className="text-xs text-neutral-600 space-y-0.5">
                      <div>Booking Ref: <strong className="font-mono text-neutral-900">{booking.bookingId}</strong></div>
                      <div>Total Paid: <strong className="text-emerald-700 font-mono">{booking.currencySymbol}{booking.ticketPrice.toLocaleString()} {booking.currencyCode}</strong></div>
                    </div>
                    <div className="h-8 w-40 bg-[repeating-linear-gradient(to_right,#000_0px,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_9px)] rounded-xs" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS: VIEW TICKET, DOWNLOAD TICKET & BOOK ANOTHER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* View / Toggle Ticket Button */}
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'boarding_pass' ? 'confirmation' : 'boarding_pass')}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Eye className="h-4 w-4 text-blue-600" />
              <span>{activeView === 'boarding_pass' ? 'View Summary' : 'View Full Ticket'}</span>
            </button>

            {/* Download Ticket Button */}
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Ticket</span>
            </button>

            {/* Book Another Flight Button */}
            <button
              type="button"
              onClick={onBookAnother}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plane className="h-4 w-4 text-blue-300" />
              <span>Book Another Flight</span>
            </button>
          </div>

          {/* B-Tree Trace Link */}
          {onSearchBookingId && (
            <div className="text-center pt-1 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearchBookingId(booking.bookingId);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
              >
                <GitFork className="h-3.5 w-3.5" />
                <span>Trace {booking.bookingId} in ADSA B-Tree Index ➔</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS Keyframe Animations for Airplane & Clouds */}
      <style>{`
        @keyframes flightGlider {
          0% {
            left: 0%;
            transform: translateY(2px) scale(0.95);
          }
          50% {
            transform: translateY(-4px) scale(1.05);
          }
          100% {
            left: 78%;
            transform: translateY(2px) scale(0.95);
          }
        }
        @keyframes cloudDrift {
          0% {
            transform: translateX(-10px);
          }
          100% {
            transform: translateX(15px);
          }
        }
      `}</style>
    </div>
  );
};
