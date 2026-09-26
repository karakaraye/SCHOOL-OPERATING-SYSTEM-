import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useDevice } from '../../context/DeviceContext';
import { RoleSimulatorBar } from './RoleSimulatorBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileNavSheet } from './MobileNavSheet';
import { UserAvatar } from '../common/UserAvatar';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  Settings,
  CalendarCheck2,
  FileCheck2,
  Megaphone,
  ClipboardList,
  BookOpen,
  PenLine,
  FileText,
  Bell,
  Calendar,
  LogOut,
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

interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const { currentUser, submissions, students, classSections, logout } = useSchool();
  const { isPhone } = useDevice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count pending submissions for admin badge
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'SUBMITTED').length;

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser.role === 'TEACHER';
  const isParent = currentUser.role === 'PARENT';

  const getNavSections = (): NavSection[] => {
    if (isAdmin) {
      return [
        {
          title: 'Operations & Management',
          items: [
            { id: 'admin_dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
            { id: 'admin_students', label: 'Students Directory', icon: GraduationCap, badge: `${students.length}` },
            { id: 'admin_parents', label: 'Parents Directory', icon: Users },
            { id: 'admin_teachers', label: 'Teachers & Allocations', icon: UserCheck },
            { id: 'admin_academic', label: 'Classes', icon: BookOpen, badge: `${classSections.length}` },
          ],
        },
        {
          title: 'Academics & Compliance',
          items: [
            { id: 'admin_timetable', label: 'Master Timetable & Allocations', icon: Calendar },
            { id: 'admin_academic_setup', label: 'Academic Setup & Terms', icon: Settings },
            { id: 'admin_attendance', label: 'Attendance Central', icon: CalendarCheck2 },
            {
              id: 'admin_results',
              label: 'Results & Approvals',
              icon: FileCheck2,
              badge: pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount} Pending` : undefined,
              badgeColor: 'badge-danger',
            },
          ],
        },
        {
          title: 'Communication & Audit',
          items: [
            { id: 'admin_announcements', label: 'Broadcasts & Notices', icon: Megaphone },
            { id: 'admin_reports_audit', label: 'Reports & Audit Trail', icon: ClipboardList },
          ],
        },
      ];
    }

    if (isTeacher) {
      return [
        {
          title: 'Teacher Workspace',
          items: [
            { id: 'teacher_dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
            { id: 'teacher_classes', label: 'My Classes & Students', icon: BookOpen },
            { id: 'teacher_timetable', label: 'Weekly Timetable', icon: Calendar },
            { id: 'teacher_attendance', label: 'Mark Attendance', icon: CalendarCheck2 },
            { id: 'teacher_scores', label: 'Score Entry & Grading', icon: PenLine },
            { id: 'teacher_announcements', label: 'Class Announcements', icon: Megaphone },
          ],
        },
      ];
    }

    if (isParent) {
      return [
        {
          title: 'Guardian Portal',
          items: [
            { id: 'parent_dashboard', label: 'Child Overview', icon: LayoutDashboard },
            { id: 'parent_attendance', label: 'Attendance Calendar', icon: CalendarCheck2 },
            { id: 'parent_reports', label: 'Official Report Cards', icon: FileText },
            { id: 'parent_notices', label: 'School & Class Notices', icon: Bell },
          ],
        },
      ];
    }

    return [];
  };

  const navSections = getNavSections();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f0f4f9] text-slate-900 font-sans">
      {/* Sidebar Navigation - Full Height Left Column (Hidden on Phone) */}
      {!isPhone && (
        <aside
          className="app-sidebar w-[264px] bg-white border-r border-slate-200 flex-shrink-0 flex-col justify-between p-4 h-screen sticky top-0 z-30 hidden lg:flex"
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo Header */}
            <div className="flex items-center gap-3 px-1 py-1 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
                <BookOpen size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="font-extrabold text-[15px] text-slate-900 font-heading leading-tight flex items-center gap-1.5">
                  <span>SchoolOS</span>
                  <span className="text-xs font-black text-blue-600">SaaS v1.0</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Academics & Central</p>
              </div>
            </div>

            {/* Section Header */}
            <div className="px-1 pt-1 pb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {currentUser.role.replace('_', ' ')} PORTAL
              </span>
            </div>

            {/* User Profile Card in Sidebar */}
            <div className="p-2.5 mb-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-2.5">
              <UserAvatar
                name={currentUser.name}
                avatar={currentUser.avatar}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 truncate font-heading leading-tight">
                  {currentUser.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentUser.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-600 border border-rose-200">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Navigation Sections */}
            <nav className="space-y-4 flex-1 overflow-y-auto pr-1">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 mb-1 uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            size={16}
                            className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ml-1.5 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor === 'badge-danger'
                                ? 'bg-rose-100 text-rose-600 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Sign Out Button & Node Status */}
          <div className="mt-4 pt-3 border-t border-slate-200 px-1 space-y-2">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out / Switch Portal</span>
            </button>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-slate-700">Multi-Tenant Node</span>
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                ONLINE
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* Main Container: Top Bar + Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isPhone ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
        {/* Unified Top Header Bar */}
        <RoleSimulatorBar
          onNavigate={onTabChange}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto bg-[#f0f4f9] ${
            isPhone ? 'pb-28' : 'pb-6'
          }`}
        >
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Phone Bottom Navigation Bar */}
        {isPhone && (
          <MobileBottomNav
            currentTab={currentTab}
            onTabChange={onTabChange}
            onOpenMenu={() => setMobileMenuOpen(true)}
          />
        )}

        {/* Phone Slide-Up Navigation Sheet */}
        <MobileNavSheet
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentTab={currentTab}
          onTabChange={onTabChange}
          navSections={navSections}
        />
      </div>
    </div>
  );
};
