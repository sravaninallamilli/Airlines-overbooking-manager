import React, { useState } from 'react';
import { Code2, FileText, Check, Copy, Sparkles } from 'lucide-react';

export const CodeDocsTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('BTree.java');
  const [copied, setCopied] = useState(false);

  const filesMap: Record<string, { language: string; path: string; subject: string; color: string; content: string }> = {
    'BTree.java': {
      language: 'java',
      path: 'backend/java/btree/BTree.java',
      subject: 'ADSA (Unit 1: B-Tree Index)',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      content: `package com.airline.overbooking.btree;

import com.airline.overbooking.model.Booking;
import java.util.ArrayList;
import java.util.List;

/**
 * ADSA Concept: B-Tree Index for airline bookings.
 * Minimum degree t = 3. Search & Insertion: O(log_t N)
 */
public class BTree {
    private BTreeNode root;
    private final int t; // Minimum degree
    private int size;

    public BTree(int t) {
        if (t < 2) throw new IllegalArgumentException("Degree t must be >= 2");
        this.t = t;
        this.root = null;
        this.size = 0;
    }

    public Booking search(String key) {
        if (root == null || key == null) return null;
        return root.search(key);
    }

    public void insert(String key, Booking booking) {
        if (root == null) {
            root = new BTreeNode(t, true);
            root.getKeys().add(key);
            root.getValues().add(booking);
            size++;
            return;
        }

        if (root.getKeys().size() == 2 * t - 1) {
            BTreeNode s = new BTreeNode(t, false);
            s.getChildren().add(root);
            s.splitChild(0, root);
            int i = (s.getKeys().get(0).compareTo(key) < 0) ? 1 : 0;
            s.getChildren().get(i).insertNonFull(key, booking);
            root = s;
        } else {
            root.insertNonFull(key, booking);
        }
        size++;
    }

    public List<Booking> getAllBookings() {
        List<Booking> list = new ArrayList<>();
        if (root != null) root.inOrderTraversal(list);
        return list;
    }
}`,
    },
    'FareClassPartition.java': {
      language: 'java',
      path: 'backend/java/dmgt/FareClassPartition.java',
      subject: 'DMGT (Unit 2: Set Partitioning & Equivalence Relation)',
      color: 'bg-purple-100 text-purple-900 border-purple-300',
      content: `package com.airline.overbooking.dmgt;

import com.airline.overbooking.model.FareClass;
import com.airline.overbooking.model.Passenger;
import java.util.*;

/**
 * DMGT Concept: Disjoint set partitioning: S = E U P U B.
 * Equivalence Relation: x ~ y <=> fareClass(x) == fareClass(y)
 * Invariants: E ∩ P = ∅, E ∩ B = ∅, P ∩ B = ∅
 */
public class FareClassPartition {
    private final Set<Passenger> economySet = new LinkedHashSet<>();
    private final Set<Passenger> premiumSet = new LinkedHashSet<>();
    private final Set<Passenger> businessSet = new LinkedHashSet<>();

    public synchronized boolean addPassenger(Passenger p) {
        if (p == null) return false;
        economySet.remove(p);
        premiumSet.remove(p);
        businessSet.remove(p);

        switch (p.getFareClass()) {
            case ECONOMY:  return economySet.add(p);
            case PREMIUM:  return premiumSet.add(p);
            case BUSINESS: return businessSet.add(p);
            default: throw new IllegalStateException("Unknown class: " + p.getFareClass());
        }
    }

    public boolean verifyDisjoint() {
        return Collections.disjoint(economySet, premiumSet) &&
               Collections.disjoint(economySet, businessSet) &&
               Collections.disjoint(premiumSet, businessSet);
    }

    public int getEconomyCount() { return economySet.size(); }
    public int getPremiumCount() { return premiumSet.size(); }
    public int getBusinessCount() { return businessSet.size(); }
    public int getTotalPartitionedCount() {
        return economySet.size() + premiumSet.size() + businessSet.size();
    }
}`,
    },
    'ReservationSystem.java': {
      language: 'java',
      path: 'backend/java/reservation/ReservationSystem.java',
      subject: 'OOPJ (Reservation System Central Manager)',
      color: 'bg-sky-100 text-sky-900 border-sky-300',
      content: `package com.airline.overbooking.reservation;

import com.airline.overbooking.btree.BTree;
import com.airline.overbooking.dmgt.FareClassPartition;
import com.airline.overbooking.model.*;
import com.airline.overbooking.service.OverbookingCalculator;
import java.util.*;

public class ReservationSystem {
    private Flight currentFlight;
    private final Map<String, Passenger> passengerDirectory = new LinkedHashMap<>();
    private final BTree bookingIndex = new BTree(3);
    private final FareClassPartition fareClassPartition = new FareClassPartition();

    public ReservationSystem(Flight flight) {
        this.currentFlight = flight;
    }

    public synchronized Booking createBooking(String bookingId, String passengerId, Booking.Status initialStatus) {
        Passenger passenger = passengerDirectory.get(passengerId);
        if (passenger == null) throw new NoSuchElementException("Passenger not found");

        Booking booking = new Booking(bookingId, currentFlight.getFlightNumber(), passenger, initialStatus);
        bookingIndex.insert(bookingId, booking);

        if (initialStatus == Booking.Status.CONFIRMED) {
            fareClassPartition.addPassenger(passenger);
        }
        return booking;
    }

    public Booking searchBooking(String bookingId) {
        return bookingIndex.search(bookingId);
    }

    public OverbookingCalculator.OverbookingResult evaluateOverbookingLimit(double pythonNoShowProb) {
        return OverbookingCalculator.calculate(
            currentFlight.getAircraftCapacity(),
            fareClassPartition.getTotalPartitionedCount(),
            currentFlight.getMaxAllowedOverbooking(),
            pythonNoShowProb,
            0.65
        );
    }
}`,
    },
    'OverbookingCalculator.java': {
      language: 'java',
      path: 'backend/java/service/OverbookingCalculator.java',
      subject: 'Java Service (Binomial Safe Overbooking Engine)',
      color: 'bg-teal-100 text-teal-900 border-teal-300',
      content: `package com.airline.overbooking.service;

/**
 * Service to compute safe overbooking limits based on Python no-show estimates.
 * Safe Overbooking = Capacity + floor(Expected No-Shows * SafetyFactor)
 */
public class OverbookingCalculator {
    public static class OverbookingResult {
        private final int aircraftCapacity;
        private final int confirmedBookings;
        private final double noShowProbability;
        private final double expectedNoShows;
        private final int recommendedAdditionalBookings;
        private final int maxSafeBookings;
        private final double bumpingRiskPercentage;
        private final String riskTier;

        // Constructor & Getters...
    }

    public static OverbookingResult calculate(int capacity, int confirmedBookings, int maxAllowedOverbooking,
                                              double noShowProbability, double safetyFactor) {
        double expectedNoShows = confirmedBookings * noShowProbability;
        int rawBuffer = (int) Math.floor(expectedNoShows * safetyFactor);
        int recommendedAdditional = Math.min(rawBuffer, maxAllowedOverbooking);
        int maxSafeBookings = capacity + Math.max(0, recommendedAdditional);

        String riskTier = (noShowProbability < 0.08) ? "Low probability" :
                          (noShowProbability <= 0.16) ? "Medium probability" : "High probability";

        return new OverbookingResult(
            capacity, confirmedBookings, noShowProbability,
            expectedNoShows, recommendedAdditional, maxSafeBookings, 0.042, riskTier
        );
    }
}`,
    },
    'no_show_predictor.py': {
      language: 'python',
      path: 'backend/python/no_show_predictor.py',
      subject: 'Python (Statistical No-Show Estimator)',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      content: `#!/usr/bin/env python3
import csv
import json
import os

def calculate_no_show_statistics(csv_filepath):
    total_records = 0
    total_no_shows = 0
    fare_class_stats = {
        "ECONOMY": {"total": 0, "no_shows": 0},
        "PREMIUM": {"total": 0, "no_shows": 0},
        "BUSINESS": {"total": 0, "no_shows": 0}
    }

    with open(csv_filepath, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fc = row.get("fare_class", "ECONOMY").strip().upper()
            outcome = int(row.get("no_show_outcome", 0))
            fare_class_stats[fc]["total"] += 1
            fare_class_stats[fc]["no_shows"] += outcome
            total_records += 1
            total_no_shows += outcome

    # Empirical Bayes with prior mean = 0.10, weight = 10
    prior_weight = 10
    prior_mean = 0.10
    overall_prob = (total_no_shows + prior_weight * prior_mean) / (total_records + prior_weight)

    risk_tier = "Low probability" if overall_prob < 0.08 else \\
                "Medium probability" if overall_prob <= 0.16 else "High probability"

    return {
        "overall_probability": round(overall_prob, 4),
        "percentage_string": f"{round(overall_prob * 100, 1)}%",
        "risk_tier": risk_tier,
        "sample_size": total_records
    }
`,
    },
    'README.md': {
      language: 'markdown',
      path: 'README.md',
      subject: 'Complete Academic Viva & Documentation Guide',
      color: 'bg-blue-100 text-blue-900 border-blue-300',
      content: `# AIRLINE OVERBOOKING MANAGER - ACADEMIC PROJECT GUIDE

## Subjects Covered:
1. DMGT: Set Theory (Partitioning by fare class E, P, B with disjoint invariant)
2. ADSA: B-Tree Index (Order t=3, O(log N) retrieval)
3. OOPJ: Object-Oriented Reservation System (Passenger, Flight, Booking, ReservationSystem)
4. Python: Historical Data Processing & Bayesian No-Show Estimation
5. Java Service: Safe Overbooking Limit calculation avoiding excessive bumping

## Complete Workflow Pipeline:
Passenger Booking -> Fare Class Partitioning -> B-tree Booking Index ->
Historical Data Export -> Python No-show Prediction -> Java Safe Overbooking Calculation -> Dashboard`,
    },
  };

  const current = filesMap[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-950 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/10 backdrop-blur-md text-amber-300 rounded-xl border border-white/15">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Interactive Academic Code Hub
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Project Architecture & Source Code Explorer
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/10 rounded-xl border border-white/15 backdrop-blur-md">
            <span className="font-bold text-purple-300 block">DMGT (Set Theory):</span>
            <span className="text-neutral-200">FareClassPartition.java</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/15 backdrop-blur-md">
            <span className="font-bold text-amber-300 block">ADSA (B-Tree):</span>
            <span className="text-neutral-200">BTree.java & Node</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/15 backdrop-blur-md">
            <span className="font-bold text-sky-300 block">OOPJ (Reservations):</span>
            <span className="text-neutral-200">ReservationSystem.java</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/15 backdrop-blur-md">
            <span className="font-bold text-emerald-300 block">Python (Prediction):</span>
            <span className="text-neutral-200">no_show_predictor.py</span>
          </div>
        </div>
      </div>

      {/* Code Viewer Layout */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
        {/* File Tabs */}
        <div className="border-b border-neutral-200 bg-neutral-50/80 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(filesMap).map(fName => (
              <button
                key={fName}
                onClick={() => setSelectedFile(fName)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedFile === fName
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{fName}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${current.color}`}>
              {current.subject}
            </span>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="p-5 bg-neutral-950 overflow-x-auto max-h-[520px]">
          <pre className="font-mono text-xs text-neutral-200 leading-relaxed">
            <code>{current.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
