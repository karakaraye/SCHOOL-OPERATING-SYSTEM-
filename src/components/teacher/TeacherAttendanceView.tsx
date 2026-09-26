import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Save,
  Check,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import type { AttendanceStatus } from '../../types';

export const TeacherAttendanceView: React.FC = () => {
  const {
    currentUser,
    teachers,
    teacherAssignments,
    classSections,
    students,
    studentProfiles,
    attendance,
    markAttendance,
  } = useSchool();

  const currentTeacher = teachers.find(t => t.userId === currentUser.id) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    myAssignments[0]?.classSectionId || classSections[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Local attendance state for current sheet
  const [recordsMap, setRecordsMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});

  const enrolledStudents = students.filter(
    s => s.classSectionId === selectedClassId && s.status === 'ACTIVE'
  );

  // Sync state whenever class or date changes
  useEffect(() => {
    const existing = attendance.filter(
      r => r.classSectionId === selectedClassId && r.date === selectedDate
    );

    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    enrolledStudents.forEach(st => {
      const found = existing.find(r => r.studentId === st.id);
      if (found) {
        initialMap[st.id] = {
          status: found.status,
          remarks: found.remarks || '',
        };
      } else {
        initialMap[st.id] = {
          status: 'PRESENT',
          remarks: '',
        };
      }
    });

    setRecordsMap(initialMap);
  }, [selectedClassId, selectedDate, enrolledStudents.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    enrolledStudents.forEach(st => {
      updated[st.id] = {
        status,
        remarks: recordsMap[st.id]?.remarks || '',
      };
    });
    setRecordsMap(updated);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.entries(recordsMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks.trim() || undefined,
    }));

    markAttendance(selectedClassId, selectedDate, payload);
    setSuccessMessage(`Attendance saved successfully for ${enrolledStudents.length} students!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Metrics for current sheet
  const total = enrolledStudents.length;
  const presentCount = Object.values(recordsMap).filter(r => r.status === 'PRESENT').length;
  const lateCount = Object.values(recordsMap).filter(r => r.status === 'LATE').length;
  const absentCount = Object.values(recordsMap).filter(r => r.status === 'ABSENT').length;
  const excusedCount = Object.values(recordsMap).filter(r => r.status === 'EXCUSED').length;
  const punctualityRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-cyan text-[10px]">Daily Roll Call</span>
          <span className="text-xs text-[var(--text-secondary)]">Class Attendance Register</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
          Daily Attendance Register
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Record student presence, punctuality, and absence excuses for your assigned class section arms.
        </p>
      </div>

      {/* Class & Date Selector Ribbon */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Class Arm:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-bold cursor-pointer"
            >
              {myAssignments.map(asgn => {
                const c = classSections.find(x => x.id === asgn.classSectionId);
                return (
                  <option key={asgn.id} value={asgn.classSectionId}>
                    {c?.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <Calendar size={14} className="text-indigo-400" />
            <span className="text-xs font-bold text-[var(--text-secondary)]">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-semibold cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleMarkAll('PRESENT')}
            className="btn btn-secondary btn-sm text-xs text-emerald-400"
          >
            <Check size={14} />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('ABSENT')}
            className="btn btn-secondary btn-sm text-xs text-rose-400"
          >
            <XCircle size={14} />
            <span>Mark All Absent</span>
          </button>
        </div>
      </div>

      {/* Attendance Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Present</span>
            <span className="text-xl font-black text-emerald-300 font-heading">{presentCount}</span>
          </div>
          <CheckCircle2 size={20} className="text-emerald-400 opacity-70" />
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Late</span>
            <span className="text-xl font-black text-amber-300 font-heading">{lateCount}</span>
          </div>
          <Clock size={20} className="text-amber-400 opacity-70" />
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Absent</span>
            <span className="text-xl font-black text-rose-300 font-heading">{absentCount}</span>
          </div>
          <XCircle size={20} className="text-rose-400 opacity-70" />
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Excused</span>
            <span className="text-xl font-black text-cyan-300 font-heading">{excusedCount}</span>
          </div>
          <AlertCircle size={20} className="text-cyan-400 opacity-70" />
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Attendance Register Form Sheet */}
      <form onSubmit={handleSaveSubmit} className="space-y-4">
        <div className="glass-card overflow-hidden">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Profile</th>
                  <th>Admission No</th>
                  <th>Attendance Status</th>
                  <th>Remarks / Delay Reason</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-xs text-slate-400">
                      No active students enrolled in this section.
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map(st => {
                    const profile = studentProfiles[st.userId];
                    const currentStatus = recordsMap[st.id]?.status || 'PRESENT';
                    const currentRemark = recordsMap[st.id]?.remarks || '';

                    return (
                      <tr key={st.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              name={profile?.name || 'Student'}
                              avatar={profile?.avatar}
                              size="sm"
                            />
                            <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                              {profile?.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {st.admissionNumber}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {[
                              { id: 'PRESENT', label: 'Present', color: 'btn-success' },
                              { id: 'LATE', label: 'Late', color: 'btn-warning' },
                              { id: 'ABSENT', label: 'Absent', color: 'btn-danger' },
                              { id: 'EXCUSED', label: 'Excused', color: 'btn-secondary' },
                            ].map(btn => (
                              <button
                                key={btn.id}
                                type="button"
                                onClick={() => handleStatusChange(st.id, btn.id as AttendanceStatus)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === btn.id
                                    ? `${btn.color} shadow-sm`
                                    : 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:text-white'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Optional reason (e.g. Traffic, clinic note)..."
                            value={currentRemark}
                            onChange={e => handleRemarkChange(st.id, e.target.value)}
                            className="input-control !py-1 !px-2.5 !text-xs !bg-transparent"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between p-4 glass-card">
          <span className="text-xs text-[var(--text-secondary)]">
            Class Attendance Compliance Rate:{' '}
            <strong className="text-emerald-400 font-bold">{punctualityRate}%</strong>
          </span>
          <button type="submit" className="btn btn-primary btn-md shadow-lg shadow-indigo-600/30">
            <Save size={16} />
            <span>Save & Record Daily Attendance</span>
          </button>
        </div>
      </form>
    </div>
  );
};
