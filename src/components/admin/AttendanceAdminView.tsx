import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const AttendanceAdminView: React.FC = () => {
  const {
    attendance,
    classSections,
    students,
    studentProfiles,
    teachers,
    allUsers,
  } = useSchool();

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Filter attendance records
  const filteredRecords = attendance.filter(rec => {
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesClass = selectedClassId === 'ALL' || rec.classSectionId === selectedClassId;
    return matchesDate && matchesClass;
  });

  // Calculate statistics for the filtered view
  const totalMarked = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length;
  const lateCount = filteredRecords.filter(r => r.status === 'LATE').length;
  const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;
  const excusedCount = filteredRecords.filter(r => r.status === 'EXCUSED').length;

  const presentRate = totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-success text-[10px]">Attendance Compliance</span>
            <span className="text-xs text-[var(--text-secondary)]">Live Roll Call Audit</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            School-Wide Attendance Central
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Audit daily teacher attendance submissions, view student punctuality rates, and inspect absence documentation.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <Calendar size={15} className="text-indigo-400" />
            <span className="text-xs text-[var(--text-secondary)]">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-semibold cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <Filter size={15} className="text-slate-400" />
            <span className="text-xs text-[var(--text-secondary)]">Class Arm:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Class Arms</option>
              {classSections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDate('2026-09-08');
              setSelectedClassId('ALL');
            }}
            className="btn btn-secondary btn-sm text-xs"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Present */}
        <div className="glass-card p-4 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Present
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-heading text-emerald-400 mt-1">
            {presentCount}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">
            {totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0}% On Time
          </span>
        </div>

        {/* Late */}
        <div className="glass-card p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Late Arrivals
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black font-heading text-amber-400 mt-1">
            {lateCount}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Punctuality Alert</span>
        </div>

        {/* Absent */}
        <div className="glass-card p-4 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Unexcused Absent
            </span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black font-heading text-rose-400 mt-1">
            {absentCount}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Guardian Alert Flag</span>
        </div>

        {/* Excused */}
        <div className="glass-card p-4 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Excused / Medical
            </span>
            <AlertCircle size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-heading text-cyan-400 mt-1">
            {excusedCount}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Documented</span>
        </div>
      </div>

      {/* Class by Class Attendance Progress Grid */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 font-heading">
          Class Section Compliance Breakdown ({selectedDate})
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Roll call progress across each class arm for the selected date.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classSections.map(arm => {
            const armRecords = attendance.filter(
              r => r.classSectionId === arm.id && r.date === selectedDate
            );
            const armPresent = armRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
            const armPct = armRecords.length > 0 ? Math.round((armPresent / armRecords.length) * 100) : 0;
            const isRecorded = armRecords.length > 0;

            return (
              <div
                key={arm.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRecorded
                    ? 'bg-[var(--bg-surface-soft)] border-[var(--border-subtle)]'
                    : 'bg-amber-500/5 border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-[var(--text-primary)]">{arm.name}</span>
                  {isRecorded ? (
                    <span className="badge badge-success text-[9px] py-0.5">{armPct}% Present</span>
                  ) : (
                    <span className="badge badge-warning text-[9px] py-0.5">Pending</span>
                  )}
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      armPct >= 90 ? 'bg-emerald-500' : armPct >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${armPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] block mt-1.5">
                  {isRecorded ? `${armPresent} of ${armRecords.length} present` : 'Roll call unrecorded'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Records Audit Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
            Daily Log Entries ({filteredRecords.length})
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Overall Compliance: <strong className="text-emerald-400 font-bold">{presentRate}%</strong>
          </span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class Section</th>
                <th>Date</th>
                <th>Status</th>
                <th>Teacher Remark / Note</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-[var(--text-muted)] space-y-2">
                    <Sparkles size={24} className="mx-auto text-indigo-400/40" />
                    <p>No attendance records logged for this filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => {
                  const student = students.find(s => s.id === rec.studentId);
                  const profile = student ? studentProfiles[student.userId] : null;
                  const classSec = classSections.find(c => c.id === rec.classSectionId);
                  const teacher = teachers.find(t => t.id === rec.markedByTeacherId);
                  const teacherUser = allUsers.find(u => u.id === teacher?.userId);

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
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={profile?.name || 'Student'}
                            avatar={profile?.avatar}
                            size="xs"
                          />
                          <div>
                            <span className="font-bold text-xs text-[var(--text-primary)] block">
                              {profile?.name || 'Student'}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-mono">
                              {student?.admissionNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-[var(--text-primary)] font-semibold">
                          {classSec?.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          {rec.date}
                        </span>
                      </td>
                      <td>{getStatusBadge()}</td>
                      <td>
                        <span className="text-xs text-[var(--text-secondary)] italic">
                          {rec.remarks || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-[var(--text-secondary)] font-medium">
                          {teacherUser?.name || 'Faculty Member'}
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
