import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ModalPortal } from '../common/ModalPortal';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { DayOfWeek } from '../../types';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export const TeacherTimetableView: React.FC = () => {
  const {
    currentUser,
    teachers,
    classSections,
    subjects,
    timetableSlots,
    periodDefinitions,
    createTimetableSlot,
    deleteTimetableSlot,
  } = useSchool();

  const currentTeacher = teachers.find(t => t.userId === currentUser.id) || teachers[0];
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentTeacher?.id || 'tch_01');
  const [selectedDayTab, setSelectedDayTab] = useState<DayOfWeek>('MONDAY');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add slot modal form fields
  const [newDay, setNewDay] = useState<DayOfWeek>('MONDAY');
  const [newPeriodNum, setNewPeriodNum] = useState<number>(1);
  const [newClassId, setNewClassId] = useState<string>(classSections[0]?.id || '');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newRoom, setNewRoom] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filteredSlots = timetableSlots.filter(s => s.teacherId === selectedTeacherId);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const periodDef = periodDefinitions.find(p => p.number === Number(newPeriodNum));
    const start = periodDef ? periodDef.startTime : '08:00';
    const end = periodDef ? periodDef.endTime : '08:50';

    createTimetableSlot({
      teacherId: selectedTeacherId,
      classSectionId: newClassId,
      subjectId: newSubjectId,
      day: newDay,
      periodNumber: Number(newPeriodNum),
      startTime: start,
      endTime: end,
      room: newRoom.trim() || undefined,
    });

    setShowAddModal(false);
    setNewRoom('');
    setSuccessNotice(`Lesson scheduled for ${newDay} Period ${newPeriodNum}.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan text-[10px]">Academic Schedules</span>
            <span className="text-xs text-[var(--text-secondary)]">Weekly Lesson Periods & Timetable</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Faculty Teaching Timetable
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Weekly periods matrix across Junior (JS 1-3) and Senior (SS 1-3) classrooms with room allocation and instant lesson access.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm bg-indigo-600 text-white font-bold shadow-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Schedule Period</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            title="Print weekly timetable"
          >
            <Printer size={14} />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Faculty Selector & Filters Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Faculty Schedule:</span>
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-bold cursor-pointer"
          >
            {teachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.id === currentTeacher?.id ? `⭐ ${currentUser.name} (My Timetable)` : `Staff ID ${t.staffId} (${t.specialization})`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Clock size={14} className="text-indigo-600" />
          <span>{periodDefinitions.filter(p => !p.isBreak).length} Daily Periods • Institutional Schedule</span>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Desktop Weekly Matrix View */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <div className="data-table-container">
          <table className="data-table !border-collapse">
            <thead>
              <tr>
                <th className="w-36 text-center bg-slate-50">Period / Time</th>
                {DAYS.map(day => (
                  <th key={day} className="text-center font-heading font-extrabold uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periodDefinitions.map(period => {
                if (period.isBreak) {
                  return (
                    <tr key={`break_row_${period.id}`} className="bg-amber-50/60 border-y border-amber-200">
                      <td className="text-center font-bold text-xs text-amber-900 bg-amber-100/50">
                        <div>{period.label}</div>
                        <span className="text-[10px] text-amber-700 font-mono">{period.startTime} - {period.endTime}</span>
                      </td>
                      <td colSpan={5} className="text-center py-2.5 text-xs font-bold text-amber-800 uppercase tracking-widest">
                        ☕ {period.label} ({period.startTime} - {period.endTime})
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`p_${period.number}_${period.id}`}>
                    <td className="text-center bg-slate-50 border-r border-slate-200">
                      <span className="font-extrabold text-xs text-slate-900 block font-heading">
                        {period.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {period.startTime} - {period.endTime}
                      </span>
                    </td>

                    {DAYS.map(day => {
                      const slot = filteredSlots.find(
                        s => s.day === day && s.periodNumber === period.number
                      );

                      if (!slot) {
                        return (
                          <td key={day} className="p-2.5 text-center text-slate-300 hover:bg-slate-50/50 transition-colors">
                            <span className="text-[11px] text-slate-300 font-medium select-none">
                              — Free Period —
                            </span>
                          </td>
                        );
                      }

                      const cls = classSections.find(c => c.id === slot.classSectionId);
                      const subj = subjects.find(s => s.id === slot.subjectId);

                      return (
                        <td key={day} className="p-2">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 text-slate-900 space-y-1.5 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-indigo-900 font-heading">
                                {subj?.name}
                              </span>
                              <span className="badge badge-cyan text-[9px] font-bold">
                                {subj?.code}
                              </span>
                            </div>

                            <div className="text-[11px] font-bold text-slate-800">
                              {cls?.name}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-indigo-100">
                              <span className="flex items-center gap-1">
                                <MapPin size={10} className="text-indigo-600" />
                                <span>{slot.room || cls?.room || 'Main Block'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteTimetableSlot(slot.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-0.5"
                                title="Remove slot"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Day Tabbed View */}
      <div className="block lg:hidden space-y-4">
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDayTab(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDayTab === day
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Day Periods Stack */}
        <div className="space-y-3">
          {periodDefinitions.map(period => {
            if (period.isBreak) {
              return (
                <div key={`m_break_${period.id}`} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs font-bold text-amber-900">
                  ☕ {period.label} ({period.startTime} - {period.endTime})
                </div>
              );
            }

            const slot = filteredSlots.find(
              s => s.day === selectedDayTab && s.periodNumber === period.number
            );

            if (!slot) {
              return (
                <div
                  key={`m_${period.number}_${period.id}`}
                  className="p-3.5 rounded-xl bg-white border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-400"
                >
                  <span className="font-bold">{period.label} ({period.startTime} - {period.endTime})</span>
                  <span>Free Period</span>
                </div>
              );
            }

            const cls = classSections.find(c => c.id === slot.classSectionId);
            const subj = subjects.find(s => s.id === slot.subjectId);

            return (
              <div
                key={`m_${period.number}_${period.id}`}
                className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-700 block">
                      {period.label} • {slot.startTime || period.startTime} - {slot.endTime || period.endTime}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                      {subj?.name} ({subj?.code})
                    </h3>
                  </div>
                  <span className="badge badge-primary text-xs">{cls?.name}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-indigo-100">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-indigo-600" />
                    <span>{slot.room || cls?.room || 'Main Block'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTimetableSlot(slot.id)}
                    className="text-rose-500 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Timetable Period Modal */}
      <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        {showAddModal && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-md w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold font-heading text-base">
                <Calendar size={18} />
                <span>Schedule New Lesson Period</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(e.target.value as DayOfWeek)}
                    className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Period Slot
                  </label>
                  <select
                    value={newPeriodNum}
                    onChange={e => setNewPeriodNum(Number(e.target.value))}
                    className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                  >
                    {periodDefinitions.filter(p => !p.isBreak).map(p => (
                      <option key={p.id} value={p.number}>
                        {p.label} ({p.startTime} - {p.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Class / Arm
                </label>
                <select
                  value={newClassId}
                  onChange={e => setNewClassId(e.target.value)}
                  className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                  required
                >
                  <option value="">Select a class...</option>
                  {classSections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject
                </label>
                <select
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                  required
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Room / Laboratory (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab Annex B, Room 101"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm bg-indigo-600 text-white font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
