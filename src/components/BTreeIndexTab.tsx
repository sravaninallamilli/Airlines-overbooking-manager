import React, { useState } from 'react';
import {
  GitFork,
  Search,
  CheckCircle2,
  CornerDownRight,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Booking, BTreeNodeUI, SearchStep } from '../types';
import { BTreeIndex } from '../lib/btree';

interface BTreeIndexTabProps {
  bTree: BTreeIndex;
  bookings: Booking[];
  onSearchTrace: (key: string) => { booking: Booking | null; steps: SearchStep[] };
  defaultSearchKey?: string;
}

export const BTreeIndexTab: React.FC<BTreeIndexTabProps> = ({
  bTree,
  bookings,
  onSearchTrace,
  defaultSearchKey = '',
}) => {
  const [searchKey, setSearchKey] = useState(defaultSearchKey || 'BKG-015');
  const [searchResult, setSearchResult] = useState<{
    booking: Booking | null;
    steps: SearchStep[];
  } | null>(null);
  const [activeHighlightNode, setActiveHighlightNode] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;
    const res = onSearchTrace(searchKey.trim());
    setSearchResult(res);
    if (res.steps.length > 0) {
      setActiveHighlightNode(res.steps[res.steps.length - 1].nodeId);
    }
  };

  const treeUI = bTree.getTreeUI();
  const sortedBookings = bTree.getAllBookings();

  // Recursive renderer for B-tree nodes with colorful styling
  const renderBTreeNode = (node: BTreeNodeUI, isRoot: boolean = false) => {
    const isStepTarget = searchResult?.steps.some(s => s.nodeId === node.id);
    const isTerminalTarget = activeHighlightNode === node.id;

    const borderColor = isTerminalTarget
      ? 'border-amber-500 ring-4 ring-amber-300/60 bg-amber-50/90 shadow-md'
      : isStepTarget
      ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/80 shadow-xs'
      : isRoot
      ? 'border-indigo-400 bg-linear-to-b from-indigo-50/40 to-white shadow-xs'
      : node.isLeaf
      ? 'border-teal-300 bg-linear-to-b from-teal-50/30 to-white shadow-xs'
      : 'border-blue-300 bg-white shadow-xs';

    const headerTagBg = isTerminalTarget
      ? 'bg-amber-200 text-amber-900 font-bold'
      : isStepTarget
      ? 'bg-blue-200 text-blue-900 font-bold'
      : isRoot
      ? 'bg-indigo-100 text-indigo-800'
      : node.isLeaf
      ? 'bg-teal-100 text-teal-800'
      : 'bg-blue-100 text-blue-800';

    return (
      <div key={node.id} className="flex flex-col items-center my-3">
        {/* Node Card */}
        <div className={`px-4 py-3 rounded-2xl border-2 transition-all min-w-[170px] ${borderColor}`}>
          <div className="flex items-center justify-between space-x-2 mb-2 pb-1 border-b border-neutral-100 text-[10px]">
            <span className={`px-2 py-0.5 rounded-full font-mono ${headerTagBg}`}>
              {isRoot ? 'Root Node' : node.isLeaf ? 'Leaf Node' : 'Internal Node'}
            </span>
            <span className="text-neutral-500 font-mono">Keys: {node.keys.length}/5</span>
          </div>

          {/* Keys inside Node */}
          <div className="flex items-center space-x-1.5 justify-center">
            {node.keys.map(k => {
              const isMatchedKey = searchResult?.booking?.bookingId === k.key;
              const isBiz = k.booking.passenger.fareClass === 'BUSINESS';
              const isPrem = k.booking.passenger.fareClass === 'PREMIUM';

              const keyBadgeColor = isMatchedKey
                ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md ring-2 ring-emerald-300 scale-105'
                : isBiz
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : isPrem
                ? 'bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100'
                : 'bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100';

              return (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => {
                    setSearchKey(k.key);
                    const res = onSearchTrace(k.key);
                    setSearchResult(res);
                    setActiveHighlightNode(node.id);
                  }}
                  className={`px-2 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${keyBadgeColor}`}
                  title={`${k.key}: ${k.booking.passenger.fullName} (${k.booking.passenger.fareClass})`}
                >
                  {k.key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Child branches */}
        {node.children && node.children.length > 0 && (
          <div className="w-full mt-3 pt-3 border-t-2 border-dashed border-indigo-200 flex justify-center space-x-4 sm:space-x-6 overflow-x-auto">
            {node.children.map(child => renderBTreeNode(child, false))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-indigo-950 via-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md text-amber-300 rounded-xl border border-white/15">
              <GitFork className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                ADSA (Unit 1 - Advanced Data Structures)
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                B-Tree Booking Index (Degree t = 3)
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-xs backdrop-blur-md">
            <Database className="h-4 w-4 text-blue-300" />
            <span className="font-mono text-neutral-200">
              Total Keys: <strong className="text-white">{bookings.length}</strong> • Depth: O(log_t N)
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed bg-white/10 p-3.5 rounded-xl border border-white/15">
          The booking engine indexes confirmed and waitlisted reservations using a balanced{' '}
          <strong>B-Tree of minimum degree t = 3</strong>. Every internal node maintains 2 to 5 keys,
          and all leaves sit at the identical depth, guaranteeing external-memory search and retrieval in{' '}
          <code className="text-amber-300 font-mono font-bold">O(t · log_t N)</code> operations.
        </p>
      </div>

      {/* Interactive Search Console */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span>Interactive B-Tree Search Console</span>
          </h2>
          <span className="text-xs text-neutral-500">
            Try searching: <button onClick={() => setSearchKey('BKG-012')} className="text-blue-600 underline font-mono cursor-pointer">BKG-012</button>, <button onClick={() => setSearchKey('BKG-045')} className="text-blue-600 underline font-mono cursor-pointer">BKG-045</button>, or <button onClick={() => setSearchKey('BKG-088')} className="text-blue-600 underline font-mono cursor-pointer">BKG-088</button>
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value.toUpperCase())}
              placeholder="Enter Booking ID (e.g. BKG-015)..."
              className="w-full px-4 py-2.5 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>Trace B-Tree Index</span>
          </button>
        </form>

        {/* Search Result Steps Output */}
        {searchResult && (
          <div className="mt-4 p-5 rounded-2xl bg-linear-to-br from-neutral-50 to-blue-50/30 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
              <span className="text-xs font-bold text-neutral-900 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Traversal Path ({searchResult.steps.length} Node Inspections):</span>
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold ${
                  searchResult.booking
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {searchResult.booking ? 'KEY FOUND IN B-TREE' : 'KEY NOT FOUND'}
              </span>
            </div>

            <div className="space-y-2">
              {searchResult.steps.map((st, idx) => (
                <div key={idx} className="text-xs font-mono bg-white p-3 rounded-xl border border-blue-100 space-y-1 shadow-2xs">
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold">
                    <CornerDownRight className="h-3.5 w-3.5 text-blue-500" />
                    <span>Step {idx + 1}: Inspect Node [{st.keysInNode.join(', ')}]</span>
                  </div>
                  <div className="text-neutral-600 pl-5 text-[11px]">{st.comparison}</div>
                  <div className="text-blue-700 font-semibold pl-5 text-[11px]">{st.action}</div>
                </div>
              ))}
            </div>

            {searchResult.booking && (
              <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between shadow-2xs">
                <div>
                  <strong>Resolved Record:</strong> {searchResult.booking.passenger.fullName} (
                  {searchResult.booking.passenger.passengerId}) • Fare Class:{' '}
                  <span className="font-bold">{searchResult.booking.passenger.fareClass}</span> • Status:{' '}
                  <span className="font-bold">{searchResult.booking.status}</span>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual B-Tree Rendering */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <GitFork className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Visual B-Tree Node Hierarchy (Order t = 3)
            </h2>
          </div>
          <span className="text-xs text-neutral-500">
            Click any key pill to initiate search traversal
          </span>
        </div>

        <div className="overflow-x-auto p-6 bg-linear-to-b from-neutral-50/60 to-blue-50/20 rounded-2xl border border-neutral-200 min-h-[260px] flex justify-center">
          {treeUI ? renderBTreeNode(treeUI, true) : <p className="text-neutral-400 text-xs">Tree is empty.</p>}
        </div>
      </div>

      {/* In-Order Traversal List */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-bold text-neutral-900">
            In-Order Traversal of Indexed Bookings (Sorted Keys)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            Total Indexed: {sortedBookings.length}
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">B-Tree Key</th>
                <th className="py-2.5 px-3">Passenger</th>
                <th className="py-2.5 px-3">Fare Class</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortedBookings.slice(0, 20).map(b => (
                <tr key={b.bookingId} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-neutral-900">
                    {b.bookingId}
                  </td>
                  <td className="py-2 px-3 font-semibold text-neutral-900">
                    {b.passenger.fullName} <span className="text-neutral-400 text-[11px]">({b.passenger.passengerId})</span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        b.passenger.fareClass === 'BUSINESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.passenger.fareClass === 'PREMIUM'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {b.passenger.fareClass}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-neutral-800">{b.status}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => {
                        setSearchKey(b.bookingId);
                        const res = onSearchTrace(b.bookingId);
                        setSearchResult(res);
                        if (res.steps.length > 0) {
                          setActiveHighlightNode(res.steps[res.steps.length - 1].nodeId);
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Trace Key →
                    </button>
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
