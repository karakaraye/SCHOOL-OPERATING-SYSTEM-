import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, Server, Globe, Shield } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const LiveDbBadge: React.FC = () => {
  const { isLiveDb, dbStatus, dbInfo, lastSyncTime, refreshFromLiveDb } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromLiveDb();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formattedTime = lastSyncTime
    ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Pending';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border shadow-xs ${
          isLiveDb
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            : dbStatus === 'CONNECTING'
            ? 'bg-amber-50 text-amber-700 border-amber-300'
            : 'bg-slate-100 text-slate-600 border-slate-300'
        }`}
        title="Live Supabase PostgreSQL Database Connection"
      >
        <span className="relative flex h-2 w-2">
          {isLiveDb && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLiveDb ? 'bg-emerald-500' : dbStatus === 'CONNECTING' ? 'bg-amber-500' : 'bg-slate-400'
            }`}
          />
        </span>
        <Database size={13} className={isLiveDb ? 'text-emerald-600' : 'text-slate-500'} />
        <span className="hidden sm:inline font-mono text-[11px]">
          {isLiveDb ? 'Supabase Live' : dbStatus === 'CONNECTING' ? 'Connecting DB...' : 'Local Cache'}
        </span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 z-50 animate-scale-up space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Database size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white font-heading">
                    Supabase PostgreSQL
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>Real-time Connection Active</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 flex items-center gap-1">
                  <Globe size={11} /> Host:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {dbInfo?.host || 'aws-1-eu-west-1.pooler.supabase.com'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 flex items-center gap-1">
                  <Server size={11} /> Port & DB:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  6543 • postgres
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield size={11} /> SSL:
                </span>
                <span className="badge badge-success text-[9px] py-0.5">
                  TLS / Encrypted
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>Last live sync:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">All data synced live</span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-secondary btn-sm !py-1 !px-2.5 !text-xs flex items-center gap-1 font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
              >
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
