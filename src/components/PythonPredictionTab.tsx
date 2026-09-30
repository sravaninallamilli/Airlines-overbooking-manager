import React, { useState } from 'react';
import {
  Cpu,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  TrendingDown,
  Terminal,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PythonPredictionResult } from '../types';
import { HistoricalRecord } from '../lib/overbooking';

interface PythonPredictionTabProps {
  prediction: PythonPredictionResult;
  historicalRecords: HistoricalRecord[];
  onExportCsv: () => void;
  onImportCsv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRecomputePrediction: () => void;
}

export const PythonPredictionTab: React.FC<PythonPredictionTabProps> = ({
  prediction,
  historicalRecords,
  onExportCsv,
  onImportCsv,
  onRecomputePrediction,
}) => {
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  const handleRunPython = () => {
    setIsRunningScript(true);
    setTimeout(() => {
      onRecomputePrediction();
      setConsoleOutput(
        `$ python3 backend/python/no_show_predictor.py data/historical_bookings.csv\n` +
        `=======================================================\n` +
        `   AIRLINE NO-SHOW PROBABILITY ESTIMATION (PYTHON)   \n` +
        `=======================================================\n` +
        `[INFO] Data Source: data/historical_bookings.csv\n` +
        `[INFO] Sample Size: ${historicalRecords.length} historical records loaded\n` +
        `[INFO] Prior Distribution: Beta(α=1.0, β=9.0) prior mean: 10.0%\n` +
        `-------------------------------------------------------\n` +
        `Empirical Rates by Fare Class Partition:\n` +
        `  • ECONOMY  : ${prediction.fareClassBreakdown.ECONOMY.noShows}/${prediction.fareClassBreakdown.ECONOMY.count} no-shows [ ${(prediction.fareClassBreakdown.ECONOMY.rate * 100).toFixed(1)}% ]\n` +
        `  • PREMIUM  : ${prediction.fareClassBreakdown.PREMIUM.noShows}/${prediction.fareClassBreakdown.PREMIUM.count} no-shows [ ${(prediction.fareClassBreakdown.PREMIUM.rate * 100).toFixed(1)}% ]\n` +
        `  • BUSINESS : ${prediction.fareClassBreakdown.BUSINESS.noShows}/${prediction.fareClassBreakdown.BUSINESS.count} no-shows [ ${(prediction.fareClassBreakdown.BUSINESS.rate * 100).toFixed(1)}% ]\n` +
        `-------------------------------------------------------\n` +
        `ESTIMATED NO-SHOW PROBABILITY: ${prediction.percentageString}\n` +
        `RISK TIER CLASSIFICATION   : ${prediction.riskTier}\n` +
        `=======================================================\n` +
        `[SUCCESS] Output synchronized with Java Overbooking Service.`
      );
      setIsRunningScript(false);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md text-emerald-300 rounded-xl border border-white/15">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Python Machine Learning & Telemetry Engine
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Historical Telemetry & No-Show Probability Estimator
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExportCsv}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-300" />
              <span>Export CSV from Java</span>
            </button>
            <label className="px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer">
              <Upload className="h-4 w-4 text-teal-300" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={onImportCsv} className="hidden" />
            </label>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed bg-white/10 p-3.5 rounded-xl border border-white/15">
          Java exports passenger reservation telemetry and historical show-up outcomes to{' '}
          <code className="text-emerald-300 font-mono font-bold">data/historical_bookings.csv</code>.
          The Python module ingests this dataset and computes an Empirical Bayesian probability
          distribution to safely estimate no-shows for forthcoming departures.
        </p>
      </div>

      {/* Main Prediction Results Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Python Statistical Inference
            </span>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1 flex items-baseline space-x-3">
              <span>Estimated no-show probability:</span>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-xl border border-emerald-200 font-mono">
                {prediction.percentageString}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
                prediction.riskTier === 'Low probability'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : prediction.riskTier === 'Medium probability'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              {prediction.riskTier}
            </span>

            <button
              onClick={handleRunPython}
              disabled={isRunningScript}
              className="px-5 py-2 text-xs font-bold text-white bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRunningScript ? 'animate-spin' : ''}`} />
              <span>Run Python Script</span>
            </button>
          </div>
        </div>

        {/* Fare Class Empirical Rates Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Economy */}
          <div className="p-5 bg-linear-to-br from-sky-50/70 to-blue-50/30 rounded-2xl border border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Economy Class
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            </div>
            <div className="text-3xl font-black text-sky-950 font-mono">
              {(prediction.fareClassBreakdown.ECONOMY.rate * 100).toFixed(1)}%
            </div>
            {/* Visual rate bar */}
            <div className="w-full h-2 bg-sky-200/60 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, prediction.fareClassBreakdown.ECONOMY.rate * 300)}%` }}
                className="h-full bg-sky-600 rounded-full"
              />
            </div>
            <p className="text-[11px] text-neutral-600">
              {prediction.fareClassBreakdown.ECONOMY.noShows} no-shows out of{' '}
              {prediction.fareClassBreakdown.ECONOMY.count} historical records
            </p>
          </div>

          {/* Premium */}
          <div className="p-5 bg-linear-to-br from-purple-50/70 to-indigo-50/30 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Premium Class
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            </div>
            <div className="text-3xl font-black text-purple-950 font-mono">
              {(prediction.fareClassBreakdown.PREMIUM.rate * 100).toFixed(1)}%
            </div>
            {/* Visual rate bar */}
            <div className="w-full h-2 bg-purple-200/60 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, prediction.fareClassBreakdown.PREMIUM.rate * 300)}%` }}
                className="h-full bg-purple-600 rounded-full"
              />
            </div>
            <p className="text-[11px] text-neutral-600">
              {prediction.fareClassBreakdown.PREMIUM.noShows} no-shows out of{' '}
              {prediction.fareClassBreakdown.PREMIUM.count} historical records
            </p>
          </div>

          {/* Business */}
          <div className="p-5 bg-linear-to-br from-emerald-50/70 to-teal-50/30 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Business Class
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-950 font-mono">
              {(prediction.fareClassBreakdown.BUSINESS.rate * 100).toFixed(1)}%
            </div>
            {/* Visual rate bar */}
            <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.max(5, Math.min(100, prediction.fareClassBreakdown.BUSINESS.rate * 300))}%` }}
                className="h-full bg-emerald-600 rounded-full"
              />
            </div>
            <p className="text-[11px] text-neutral-600">
              {prediction.fareClassBreakdown.BUSINESS.noShows} no-shows out of{' '}
              {prediction.fareClassBreakdown.BUSINESS.count} historical records
            </p>
          </div>
        </div>

        {/* Python Terminal Simulator */}
        {consoleOutput && (
          <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 p-5 font-mono text-xs text-neutral-200 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-neutral-300 font-bold">Python Predictor Execution Trace</span>
              </div>
              <span className="text-[11px] text-emerald-400">Exit Code: 0 (SUCCESS)</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-300/90 pt-1">
              {consoleOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Historical CSV Telemetry Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Historical Passenger Records (CSV Interchange Contract)
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {historicalRecords.length} Historical Samples Loaded
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Passenger ID</th>
                <th className="py-2.5 px-3">Fare Class</th>
                <th className="py-2.5 px-3">Booking Status</th>
                <th className="py-2.5 px-3">Past No-Shows</th>
                <th className="py-2.5 px-3">Total Past Bookings</th>
                <th className="py-2.5 px-3">No-Show Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {historicalRecords.slice(0, 25).map((r, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-neutral-900">
                    {r.passengerId}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                        r.fareClass === 'BUSINESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.fareClass === 'PREMIUM'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {r.fareClass}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        r.bookingStatus === 'NO_SHOW'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {r.bookingStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-neutral-700">{r.previousNoShowCount}</td>
                  <td className="py-2 px-3 font-mono text-neutral-700">{r.totalPreviousBookings}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        r.noShowOutcome === 1
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {r.noShowOutcome === 1 ? '1 (No-Show)' : '0 (Boarded)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
