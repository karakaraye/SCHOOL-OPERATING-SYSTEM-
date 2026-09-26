import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileCheck2,
  CalendarCheck2,
  PenLine,
  FileText,
  Bell,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenMenu,
}) => {
  const { currentUser, submissions, students } = useSchool();

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser.role === 'TEACHER';
  const isParent = currentUser.role === 'PARENT';

  const pendingSubmissionsCount = submissions.filter(s => s.status === 'SUBMITTED').length;

  interface NavButton {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }

  const getPrimaryTabs = (): NavButton[] => {
    if (isAdmin) {
      return [
        { id: 'admin_dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'admin_students', label: 'Students', icon: GraduationCap, badge: students.length },
        { id: 'admin_academic', label: 'Classes', icon: BookOpen },
        {
          id: 'admin_results',
          label: 'Approvals',
          icon: FileCheck2,
          badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
      ];
    }

    if (isTeacher) {
      return [
        { id: 'teacher_dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'teacher_classes', label: 'Classes', icon: BookOpen },
        { id: 'teacher_attendance', label: 'Attend', icon: CalendarCheck2 },
        { id: 'teacher_scores', label: 'Grades', icon: PenLine },
      ];
    }

    if (isParent) {
      return [
        { id: 'parent_dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'parent_attendance', label: 'Attend', icon: CalendarCheck2 },
        { id: 'parent_reports', label: 'Reports', icon: FileText },
        { id: 'parent_notices', label: 'Notices', icon: Bell, badge: 2 },
      ];
    }

    return [];
  };

  const primaryTabs = getPrimaryTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active Indicator Pip */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-blue-600" />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 py-0.2 min-w-[15px] h-[15px] rounded-full text-[9px] font-black flex items-center justify-center shadow-xs ${
                      tab.badgeColor || 'bg-blue-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th Button: Open Full Menu Sheet */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
        >
          <Menu size={20} className="stroke-[1.8]" />
          <span className="text-[10px] mt-1 leading-tight tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
