import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  X,
  LogOut,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  navSections: NavSection[];
}

export const MobileNavSheet: React.FC<MobileNavSheetProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  navSections,
}) => {
  const { currentUser, school, currentSession, currentTerm, logout } = useSchool();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in safe-area-bottom">
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Sheet Container */}
      <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden animate-slide-up">
        {/* Grab Handle */}
        <div className="w-full flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-slate-900 truncate font-heading">
                {school.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {currentSession.name} • {currentTerm.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Active User Profile Pill */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                name={currentUser.name}
                avatar={currentUser.avatar}
                size="md"
              />
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-4 pt-1">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider block">
                  {section.title}
                </span>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onTabChange(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            size={17}
                            className={isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400'}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.badgeColor === 'badge-danger'
                                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight size={14} className="text-slate-300" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out to Login Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
