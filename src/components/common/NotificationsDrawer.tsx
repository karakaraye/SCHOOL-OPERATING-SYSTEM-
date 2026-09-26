import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import {
  Bell,
  X,
  AlertTriangle,
  Megaphone,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { submissions, announcements, auditLogs, currentUser } = useSchool();
  const [filter, setFilter] = useState<'ALL' | 'ALERTS' | 'ANNOUNCEMENTS'>('ALL');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser.role === 'TEACHER';

  // Submissions that need attention
  const pendingAdminSubmissions = submissions.filter(s => s.status === 'SUBMITTED');
  const returnedTeacherSubmissions = submissions.filter(s => s.status === 'RETURNED');

  // Build unified notification stream
  const notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'ALERT' | 'ANNOUNCEMENT' | 'AUDIT';
    icon: React.ElementType;
    iconColor: string;
    actionTab?: string;
  }> = [];

  // Add alerts based on role
  if (isAdmin) {
    pendingAdminSubmissions.forEach(sub => {
      notifications.push({
        id: `alert-${sub.id}`,
        title: 'Score Sheet Awaiting Admin Approval',
        message: `Teacher submitted terminal grades for review & publishing.`,
        time: 'Pending Review',
        type: 'ALERT',
        icon: AlertTriangle,
        iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        actionTab: 'admin_results',
      });
    });
  }

  if (isTeacher) {
    returnedTeacherSubmissions.forEach(sub => {
      notifications.push({
        id: `alert-ret-${sub.id}`,
        title: 'Score Sheet Returned for Correction',
        message: sub.correctionFeedback || 'Please review and correct scores.',
        time: 'Action Required',
        type: 'ALERT',
        icon: AlertTriangle,
        iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        actionTab: 'teacher_scores',
      });
    });
  }

  // Add Announcements
  announcements.forEach(ann => {
    notifications.push({
      id: `ann-${ann.id}`,
      title: ann.title,
      message: ann.content.length > 90 ? `${ann.content.substring(0, 90)}...` : ann.content,
      time: new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      type: 'ANNOUNCEMENT',
      icon: Megaphone,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      actionTab: isAdmin ? 'admin_announcements' : isTeacher ? 'teacher_announcements' : 'parent_notices',
    });
  });

  // Add Recent Audit logs
  auditLogs.slice(0, 4).forEach(log => {
    notifications.push({
      id: `audit-${log.id}`,
      title: log.action.replace(/_/g, ' '),
      message: `${log.userName} (${log.userRole}): ${log.details}`,
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'AUDIT',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      actionTab: isAdmin ? 'admin_reports_audit' : undefined,
    });
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALERTS') return n.type === 'ALERT';
    if (filter === 'ANNOUNCEMENTS') return n.type === 'ANNOUNCEMENT';
    return true;
  });

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--bg-card-solid)] border-l border-[var(--border-subtle)] h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications & Activity</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Live operational alerts & announcements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--bg-surface-soft)]">
          {(['ALL', 'ALERTS', 'ANNOUNCEMENTS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Sparkles size={28} className="mx-auto text-indigo-400/40" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-slate-500">No unread notifications matching this filter</p>
            </div>
          ) : (
            filteredNotifications.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.actionTab) {
                      onNavigate(item.actionTab);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all ${
                    item.actionTab ? 'cursor-pointer hover:border-indigo-500/40 hover:bg-[var(--bg-card-hover)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${item.iconColor}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.actionTab && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
                          <span>View Details</span>
                          <ArrowUpRight size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
          <span className="text-[11px] text-[var(--text-muted)]">
            SchoolOS Real-Time Event Dispatcher
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
