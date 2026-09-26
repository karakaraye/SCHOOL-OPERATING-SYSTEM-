import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
} from 'lucide-react';

export const ParentAttendanceView: React.FC = () => {
  const {
    currentUser,
    parents,
    students,
    studentProfiles,
    classSections,
    attendance,
  } = useSchool();

  const currentParent = parents.find(p => p.userId === currentUser.id) || parents[0];
  const linkedStudentIds = currentParent?.childrenStudentIds || [];
  const linkedStudents = students.filter(s => linkedStudentIds.includes(s.id));

  const [selectedChildId, setSelectedChildId] = useState<string>(
    linkedStudentIds[0] || ''
  );

  const activeChild = students.find(s => s.id === selectedChildId) || linkedStudents[0];
  const activeProfile = activeChild ? studentProfiles[activeChild.userId] : null;
  const activeClass = classSections.find(c => c.id === activeChild?.classSectionId);

  // Student specific attendance records
  const childAttendance = attendance.filter(a => a.studentId === activeChild?.id);
  const totalLogs = childAttendance.length;
  const presentCount = childAttendance.filter(a => a.status === 'PRESENT').length;
  const lateCount = childAttendance.filter(a => a.status === 'LATE').length;
  const absentCount = childAttendance.filter(a => a.status === 'ABSENT').length;

  const punctualityRate = totalLogs > 0 ? Math.round(((presentCount + lateCount) / totalLogs) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Child Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-success text-[10px]">Punctuality Registry</span>
            <span className="text-xs text-[var(--text-secondary)]">Daily Roll Call History</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Ward Attendance Calendar
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Complete attendance timeline and punctuality compliance audit.
          </p>
        </div>

        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-secondary)] font-bold">Child Ward:</span>
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-bold"
            >
              {linkedStudents.map(st => (
                <option key={st.id} value={st.id}>
                  {studentProfiles[st.userId]?.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Present On Time
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-heading text-emerald-400 mt-1">
            {presentCount} Days
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Full Attendance</span>
        </div>

        <div className="glass-card p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Late Arrivals
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black font-heading text-amber-400 mt-1">
            {lateCount} Days
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Recorded Delays</span>
        </div>

        <div className="glass-card p-4 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Unexcused Absent
            </span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black font-heading text-rose-400 mt-1">
            {absentCount} Days
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Requires Letter</span>
        </div>

        <div className="glass-card p-4 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Compliance Rate
            </span>
            <Sparkles size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-heading text-cyan-400 mt-1">
            {punctualityRate}%
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">Exemplary Standing</span>
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
            Attendance Log Entries for {activeProfile?.name} ({activeClass?.name})
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Total Recorded Days: <strong>{totalLogs}</strong>
          </span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Teacher Note / Reason</th>
                <th>Class Section</th>
              </tr>
            </thead>
            <tbody>
              {childAttendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-xs text-slate-400">
                    No attendance records logged for this student yet.
                  </td>
                </tr>
              ) : (
                childAttendance.map(rec => {
                  const getStatusBadge = () => {
                    switch (rec.status) {
                      case 'PRESENT':
                        return <span className="badge badge-success">Present</span>;
                      case 'LATE':
                        return <span className="badge badge-warning">Late</span>;
                      case 'ABSENT':
                        return <span className="badge badge-danger">Absent</span>;
                      case 'EXCUSED':
                        return <span className="badge badge-cyan">Excused</span>;
                    }
                  };

                  return (
                    <tr key={rec.id}>
                      <td>
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                          {rec.date}
                        </span>
                      </td>
                      <td>{getStatusBadge()}</td>
                      <td>
                        <span className="text-xs text-[var(--text-secondary)] italic">
                          {rec.remarks || 'No notes entered'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {activeClass?.name}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
