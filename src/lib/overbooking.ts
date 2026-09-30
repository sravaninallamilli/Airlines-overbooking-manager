import { OverbookingMetrics, PythonPredictionResult } from '../types';

export interface HistoricalRecord {
  passengerId: string;
  fareClass: 'ECONOMY' | 'PREMIUM' | 'BUSINESS';
  bookingStatus: 'BOARDED' | 'NO_SHOW' | 'CANCELLED';
  previousNoShowCount: number;
  totalPreviousBookings: number;
  noShowOutcome: number;
}

/**
 * Computes Python Empirical Bayesian No-Show Prediction from historical records.
 */
export function runPythonPredictor(records: HistoricalRecord[]): PythonPredictionResult {
  if (records.length === 0) {
    return {
      overallProbability: 0.12,
      percentageString: '12.0%',
      riskTier: 'Medium probability',
      sampleSize: 0,
      totalHistoricalNoShows: 0,
      fareClassBreakdown: {
        ECONOMY: { count: 0, noShows: 0, rate: 0.15 },
        PREMIUM: { count: 0, noShows: 0, rate: 0.08 },
        BUSINESS: { count: 0, noShows: 0, rate: 0.03 },
      },
    };
  }

  let totalNoShows = 0;
  const breakdown = {
    ECONOMY: { count: 0, noShows: 0, rate: 0 },
    PREMIUM: { count: 0, noShows: 0, rate: 0 },
    BUSINESS: { count: 0, noShows: 0, rate: 0 },
  };

  for (const r of records) {
    const outcome = r.noShowOutcome === 1 || r.bookingStatus === 'NO_SHOW' ? 1 : 0;
    totalNoShows += outcome;
    if (breakdown[r.fareClass]) {
      breakdown[r.fareClass].count += 1;
      breakdown[r.fareClass].noShows += outcome;
    }
  }

  for (const key of ['ECONOMY', 'PREMIUM', 'BUSINESS'] as const) {
    const item = breakdown[key];
    item.rate = item.count > 0 ? Number((item.noShows / item.count).toFixed(4)) : 0;
  }

  // Empirical Bayes with prior mean 0.10 and weight 10
  const priorWeight = 10;
  const priorMean = 0.10;
  const overallProb = (totalNoShows + priorWeight * priorMean) / (records.length + priorWeight);

  let riskTier: 'Low probability' | 'Medium probability' | 'High probability';
  if (overallProb < 0.08) {
    riskTier = 'Low probability';
  } else if (overallProb <= 0.16) {
    riskTier = 'Medium probability';
  } else {
    riskTier = 'High probability';
  }

  return {
    overallProbability: Number(overallProb.toFixed(4)),
    percentageString: `${(overallProb * 100).toFixed(1)}%`,
    riskTier,
    sampleSize: records.length,
    totalHistoricalNoShows: totalNoShows,
    fareClassBreakdown: breakdown,
  };
}

/**
 * Normal CDF approximation for risk estimation.
 */
function normalCdf(z: number): number {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2.0);
  const prob = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1.0 - prob : prob;
}

/**
 * Java OverbookingCalculator logic:
 * Safe Overbooking Limit = Aircraft Capacity + Recommended Additional Bookings
 */
export function calculateSafeOverbooking(
  capacity: number,
  confirmedBookings: number,
  maxAllowedOverbooking: number,
  noShowProbability: number,
  safetyFactor: number = 0.65
): OverbookingMetrics {
  const safeCapacity = Math.max(1, capacity);
  const expectedNoShows = confirmedBookings * noShowProbability;

  // Recommended additional bookings: floor(expected no-shows * safety factor)
  const rawAdditional = Math.floor(expectedNoShows * safetyFactor);
  const recommendedAdditional = Math.max(0, Math.min(rawAdditional, maxAllowedOverbooking));
  const maxSafeBookings = safeCapacity + recommendedAdditional;

  // Risk evaluation: P(Show-ups > Capacity)
  const totalTarget = Math.max(confirmedBookings, maxSafeBookings);
  const showUpProb = 1.0 - noShowProbability;
  const meanShowUps = totalTarget * showUpProb;
  const variance = totalTarget * showUpProb * noShowProbability;
  const stdDev = Math.sqrt(variance);

  let bumpingRisk = 0.05;
  if (stdDev > 0) {
    const z = (safeCapacity + 0.5 - meanShowUps) / stdDev;
    bumpingRisk = Math.max(0.001, (1.0 - normalCdf(z)) * 100);
  }

  let riskTier = 'Low Risk';
  if (bumpingRisk > 10) {
    riskTier = 'High Risk';
  } else if (bumpingRisk > 5) {
    riskTier = 'Moderate Risk';
  } else {
    riskTier = 'Safe (Recommended)';
  }

  return {
    aircraftCapacity: safeCapacity,
    confirmedBookings,
    noShowProbability,
    expectedNoShows: Number(expectedNoShows.toFixed(1)),
    recommendedAdditionalBookings: recommendedAdditional,
    maxSafeBookings,
    bumpingRiskPercentage: Number(bumpingRisk.toFixed(1)),
    riskTier,
    safetyFactor,
  };
}
