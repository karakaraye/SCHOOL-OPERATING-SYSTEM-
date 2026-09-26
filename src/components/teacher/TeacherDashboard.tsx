import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BookOpen,
  CalendarCheck2,
  PenLine,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
  Megaphone,
  Calendar,
  MapPin,
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';
import type { DayOfWeek } from '../../types';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    teachers,
    teacherAssignments,
    classSections,
    subjects,
    students,
    attendance,
    submissions,
    announcements,
    timetableSlots,
    currentTerm,
    currentSession,
    changeTeacherPassword,
  } = useSchool();

  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayOfWeek>('MONDAY');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentTeacher = teachers.find(t => t.userId === currentUser.id) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPassword.trim()) {
      setErrorMsg('Please enter your current (old) password.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }
    if (oldPassword.trim() === newPassword.trim()) {
      setErrorMsg('New password cannot be identical to your old password.');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      const result = changeTeacherPassword(currentUser.email, oldPassword, newPassword);
      setIsUpdating(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to update password.');
      } else {
        setSuccessMsg('Your password has been changed successfully.');
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccessMsg(null);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 2500);
      }
    }, 300);
  };

  // Today's attendance status check
  const today = '2026-09-08';
  const unrecordedClasses = myAssignments.filter(asgn => {
    const hasRecord = attendance.some(
      r => r.classSectionId === asgn.classSectionId && r.date === today
    );
    return !hasRecord;
  });

  // Check submissions that are returned
  const returnedSubmissions = submissions.filter(
    s => s.teacherId === currentTeacher?.id && s.status === 'RETURNED'
  );

  // Schedule timetable periods for selected day (e.g. MONDAY, TUESDAY...)
  const activeDaySlots = timetableSlots
    .filter(s => s.teacherId === currentTeacher?.id && s.day === selectedScheduleDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Teacher Hero Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-slate-950 border-indigo-500/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="badge badge-cyan text-[10px] py-1 px-2.5 flex items-center gap-1.5">
                <Sparkles size={11} /> Faculty Workspace
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Staff ID: {currentTeacher?.staffId}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">{currentTeacher?.qualification}</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight font-heading">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Assigned Specialization: <strong className="text-white">{currentTeacher?.specialization}</strong>. Manage your class cohorts, take roll call, review timetable schedules, and enter terminal scores.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('teacher_attendance')}
              className="btn btn-primary btn-md shadow-lg shadow-indigo-600/30"
            >
              <CalendarCheck2 size={16} />
              <span>Mark Today's Attendance</span>
            </button>
            <button
              onClick={() => onNavigate('teacher_scores')}
              className="btn btn-secondary btn-md"
            >
              <PenLine size={16} />
              <span>Score Entry & Grading</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="btn btn-secondary btn-md !bg-white/10 hover:!bg-white/20 !text-white !border-white/20 text-xs font-bold"
              title="Change your account password"
            >
              <KeyRound size={15} />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Returned Submissions Urgent Alert Banner (if any) */}
      {returnedSubmissions.length > 0 && (
        <div className="p-4 md:p-5 border-2 border-rose-400 bg-rose-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md text-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-900 font-heading">
                Score Sheet Returned for Correction
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                The Principal has returned your score sheet with review feedback. Click below to adjust scores and re-submit.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('teacher_scores')}
            className="btn btn-danger btn-sm self-end sm:self-auto shadow-md"
          >
            <span>Review & Correct Scores</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Assigned Teaching Loads
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="text-3xl font-black font-heading text-[var(--text-primary)] mt-2">
            {myAssignments.length}
          </div>
          <span className="text-xs text-indigo-600 font-semibold">Active Classes & Subjects</span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Today's Roll Call Status
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <CalendarCheck2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-black font-heading text-[var(--text-primary)] mt-2">
            {unrecordedClasses.length === 0 ? 'Completed' : `${unrecordedClasses.length} Pending`}
          </div>
          <span className={`text-xs font-semibold ${unrecordedClasses.length === 0 ? 'text-emerald-600' : 'text-amber-600 font-bold'}`}>
            {unrecordedClasses.length === 0 ? 'All roll calls recorded' : 'Action needed for today'}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Active Term Context
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center border border-cyan-500/20">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-xl font-black font-heading text-[var(--text-primary)] mt-2">
            {currentTerm.name}
          </div>
          <span className="text-xs text-cyan-600 font-semibold">{currentSession.name} Session</span>
        </div>
      </div>

      {/* Teaching Schedule & Period Timeline Widget */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading flex items-center gap-2">
                <span>Teaching Schedule</span>
                <span className="badge badge-cyan text-[10px] font-bold">
                  {selectedScheduleDay}
                </span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Synced from Admin Master Timetable • {activeDaySlots.length} periods scheduled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {DAYS.map(d => {
                const count = timetableSlots.filter(
                  s => s.teacherId === currentTeacher?.id && s.day === d
                ).length;
                const isSelected = selectedScheduleDay === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedScheduleDay(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{d.slice(0, 3)}</span>
                    {count > 0 && (
                      <span className={`ml-1 text-[10px] font-black ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onNavigate('teacher_timetable')}
              className="btn btn-secondary btn-xs text-indigo-600 hover:bg-indigo-50 font-bold flex items-center gap-1"
            >
              <span>Full Matrix</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {activeDaySlots.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">No teaching periods scheduled for {selectedScheduleDay}.</p>
            <p className="text-[11px] text-slate-400">
              When the School Administrator schedules a lesson period for your assigned classes, it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeDaySlots.map(slot => {
              const cls = classSections.find(c => c.id === slot.classSectionId);
              const subj = subjects.find(s => s.id === slot.subjectId);

              return (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border border-indigo-200 space-y-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100 px-2 py-0.5 rounded">
                      Period {slot.periodNumber} • {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="badge badge-cyan text-[9px] font-bold">
                      {subj?.code}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                      {subj?.name}
                    </h4>
                    <span className="text-xs font-bold text-slate-700 block mt-0.5">
                      {cls?.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-indigo-100">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-indigo-600" />
                      <span>{slot.room || cls?.room || 'Main Block'}</span>
                    </span>
                    <button
                      onClick={() => onNavigate('teacher_attendance')}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                    >
                      Roll Call →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teaching Load Cards Deck */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
              My Teaching Loads & Class Allocations
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Quick access to mark attendance and grade students for your assigned classes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('teacher_classes')}
            className="btn btn-secondary btn-sm text-xs"
          >
            <span>View All Students</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myAssignments.map(asgn => {
            const classSec = classSections.find(c => c.id === asgn.classSectionId);
            const subj = subjects.find(s => s.id === asgn.subjectId);
            const enrolled = students.filter(
              s => s.classSectionId === asgn.classSectionId && s.status === 'ACTIVE'
            );
            const sub = submissions.find(
              s => s.classSectionId === asgn.classSectionId && s.subjectId === asgn.subjectId
            );

            return (
              <div
                key={asgn.id}
                className="p-5 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] space-y-4 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
                      {classSec?.name}
                    </h4>
                    <span className="badge badge-cyan text-[10px] mt-1 font-bold">
                      {subj?.name} ({subj?.code})
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                    {enrolled.length} Enrolled
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
                  <span>
                    Grading Status:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {sub ? sub.status : 'DRAFT'}
                    </strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('teacher_attendance')}
                      className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs"
                    >
                      Roll Call
                    </button>
                    <button
                      onClick={() => onNavigate('teacher_scores')}
                      className="btn btn-primary btn-sm !py-1 !px-2.5 text-xs"
                    >
                      Enter Scores
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-indigo-600" />
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
              Faculty Noticeboard & Circulars
            </h3>
          </div>
          <button
            onClick={() => onNavigate('teacher_announcements')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
          >
            All Notices →
          </button>
        </div>

        <div className="space-y-3">
          {announcements.slice(0, 3).map(ann => (
            <div
              key={ann.id}
              className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                  {ann.title}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Modal for Teacher */}
      <ModalPortal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        {showPasswordModal && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-md w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2.5 text-indigo-600 font-extrabold font-heading text-lg">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <KeyRound size={20} />
                </div>
                <div>
                  <span className="block leading-tight">Change Faculty Password</span>
                  <span className="text-[11px] font-medium text-slate-500">Self-Service Account Security</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3">
                <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <strong className="font-extrabold text-sm block mb-0.5">Password Updated!</strong>
                  <p className="text-emerald-700">{successMsg}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are required to enter your <strong className="text-slate-900">current (old) password</strong> first before setting your new password.
                </p>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2 font-medium">
                    <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Old Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current (Old) Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input
                      type={showOld ? 'text' : 'password'}
                      required
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="input-control !w-full !pl-10 !pr-10 !bg-white !text-slate-900 !border-slate-300 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                      Passwords do not match.
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30"
                  >
                    {isUpdating ? 'Updating...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
