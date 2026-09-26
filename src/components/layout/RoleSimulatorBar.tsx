import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useDevice } from '../../context/DeviceContext';
import { 
  Search, 
  Bell,
  LayoutGrid,
  Shield,
  Menu,
  LogOut,
} from 'lucide-react';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import { NotificationsDrawer } from '../common/NotificationsDrawer';
import { UserAvatar } from '../common/UserAvatar';
import { LiveDbBadge } from '../common/LiveDbBadge';

interface RoleSimulatorBarProps {
  onNavigate?: (tab: string) => void;
  onOpenMobileMenu?: () => void;
}

export const RoleSimulatorBar: React.FC<RoleSimulatorBarProps> = ({ 
  onNavigate = () => {},
  onOpenMobileMenu,
}) => {
  const { 
    currentUser, 
    school, 
    currentSession, 
    currentTerm,
    submissions,
    logout,
  } = useSchool();
  const { isPhone } = useDevice();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Unread notifications count
  const pendingSubmissions = submissions.filter(s => s.status === 'SUBMITTED').length;
  const totalNotifications = pendingSubmissions > 0 ? 3 : 3;

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 flex-shrink-0">
        {/* Left: Mobile Menu Button (Phone only) + School Crest & Details */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f172a] border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-sm flex-shrink-0">
            <Shield size={isPhone ? 18 : 22} className="fill-[#1e293b] stroke-amber-400 stroke-2" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-xs sm:text-[13px] text-slate-900 truncate font-heading tracking-tight">
                {school.name}
              </h2>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 font-mono hidden xs:inline">• {school.code}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              {currentSession.name} • {currentTerm.name}
            </p>
          </div>
        </div>

        {/* Center: Search Bar with ⌘K (Hidden on small mobile) */}
        <div className="flex-1 max-w-sm mx-2 sm:mx-4 hidden md:block">
          <div
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer transition-all shadow-none group"
          >
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600">
              <Search size={14} />
              <span className="text-xs text-slate-400">Search commands, students...</span>
            </div>
            <kbd className="text-[10px] font-semibold bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Mobile Search Icon + Device Indicator + Notifications + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Mobile Search Button (Phone only) */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* Live Supabase PostgreSQL Status */}
          <LiveDbBadge />

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* App Grid Icon (Desktop) */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:block"
            title="Apps & Modules"
          >
            <LayoutGrid size={18} />
          </button>

          {/* User Profile Pill & Role Switcher Dropdown */}
          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-1.5 sm:pr-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
            >
              <UserAvatar
                name={currentUser.name}
                avatar={currentUser.avatar}
                size="sm"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* User Profile Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-fade-in"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <UserAvatar
                    name={currentUser.name}
                    avatar={currentUser.avatar}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="py-2.5 px-1 space-y-1.5 text-xs text-slate-600 border-b border-slate-100">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Institution:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[130px]">{school.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Current Session:</span>
                    <span className="font-semibold text-slate-700">{currentSession.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Active Term:</span>
                    <span className="font-semibold text-slate-700">{currentTerm.name}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all text-left"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette & Notifications Drawer */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
