import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ModalPortal } from '../common/ModalPortal';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Users,
  BookOpen,
  Printer,
  Layers,
  ShieldCheck,
  Search,
  X,
  RotateCcw,
  Save,
} from 'lucide-react';
import type { DayOfWeek, TimetableSlot, Subject, PeriodDefinition } from '../../types';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export const AdminTimetableView: React.FC = () => {
  const {
    classLevels,
    classSections,
    subjects,
    teachers,
    allUsers,
    teacherAssignments,
    timetableSlots,
    periodDefinitions,
    updatePeriodDefinition,
    createPeriodDefinition,
    deletePeriodDefinition,
    resetPeriodDefinitions,
    createTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    assignTeacher,
    getTeacherForClassSubject,
    checkTimetableConflict,
    currentSession,
    currentTerm,
  } = useSchool();

  // Navigation tabs within Admin Timetable
  const [activeTab, setActiveTab] = useState<'CLASS_GRID' | 'ALLOCATION_MATRIX' | 'TEACHER_GRID' | 'HEALTH_AUDIT'>('CLASS_GRID');

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classSections[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [allocationLevelFilter, setAllocationLevelFilter] = useState<string>('ALL');
  const [allocationSearchTerm, setAllocationSearchTerm] = useState<string>('');

  // Modals
  const [showSlotModal, setShowSlotModal] = useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [showPeriodConfigModal, setShowPeriodConfigModal] = useState<boolean>(false);

  // Slot Form State
  const [slotDay, setSlotDay] = useState<DayOfWeek>('MONDAY');
  const [slotPeriod, setSlotPeriod] = useState<number>(1);
  const [slotStartTime, setSlotStartTime] = useState<string>('08:00');
  const [slotEndTime, setSlotEndTime] = useState<string>('08:50');
  const [slotClassId, setSlotClassId] = useState<string>(classSections[0]?.id || '');
  const [slotSubjectId, setSlotSubjectId] = useState<string>(subjects[0]?.id || '');
  const [slotTeacherId, setSlotTeacherId] = useState<string>('');
  const [slotRoom, setSlotRoom] = useState<string>('');
  const [overrideAutoTeacher, setOverrideAutoTeacher] = useState<boolean>(false);

  // Period Configuration Form State
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [editPeriodLabel, setEditPeriodLabel] = useState<string>('');
  const [editPeriodStartTime, setEditPeriodStartTime] = useState<string>('08:00');
  const [editPeriodEndTime, setEditPeriodEndTime] = useState<string>('08:50');
  const [editPeriodIsBreak, setEditPeriodIsBreak] = useState<boolean>(false);
  const [editPeriodNumber, setEditPeriodNumber] = useState<number>(1);

  // New Period Form
  const [showAddPeriodForm, setShowAddPeriodForm] = useState<boolean>(false);
  const [newPeriodNumber, setNewPeriodNumber] = useState<number>(8);
  const [newPeriodLabel, setNewPeriodLabel] = useState<string>('Period 8');
  const [newPeriodStartTime, setNewPeriodStartTime] = useState<string>('14:30');
  const [newPeriodEndTime, setNewPeriodEndTime] = useState<string>('15:15');
  const [newPeriodIsBreak, setNewPeriodIsBreak] = useState<boolean>(false);

  // Quick Allocation Modal State
  const [allocatingClassSectionId, setAllocatingClassSectionId] = useState<string | null>(null);
  const [allocatingSubjectId, setAllocatingSubjectId] = useState<string | null>(null);
  const [selectedAllocTeacherId, setSelectedAllocTeacherId] = useState<string>('');

  // Toast / Feedback
  const [notice, setNotice] = useState<{ type: 'SUCCESS' | 'INFO'; message: string } | null>(null);

  const showNotification = (message: string, type: 'SUCCESS' | 'INFO' = 'SUCCESS') => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const selectedClass = classSections.find(c => c.id === selectedClassId) || classSections[0];

  // Auto-fill teacher when subject or class changes in slot form
  const autoAssignedTeacher = useMemo(() => {
    if (!slotClassId || !slotSubjectId) return undefined;
    return getTeacherForClassSubject(slotClassId, slotSubjectId);
  }, [slotClassId, slotSubjectId, teacherAssignments, getTeacherForClassSubject]);

  // Handle subject change in slot modal
  const handleSubjectChangeInModal = (newSubjId: string) => {
    setSlotSubjectId(newSubjId);
    if (!overrideAutoTeacher) {
      const teacher = getTeacherForClassSubject(slotClassId, newSubjId);
      if (teacher) {
        setSlotTeacherId(teacher.id);
      } else if (teachers.length > 0) {
        setSlotTeacherId(teachers[0].id);
      }
    }
  };

  // When period number changes in slot modal, auto-update timing defaults
  const handleSlotPeriodSelect = (periodNum: number) => {
    setSlotPeriod(periodNum);
    const pDef = periodDefinitions.find(p => p.number === periodNum);
    if (pDef) {
      setSlotStartTime(pDef.startTime);
      setSlotEndTime(pDef.endTime);
    }
  };

  // Open modal to schedule slot
  const handleOpenNewSlot = (day: DayOfWeek, periodNum: number, prefilledClassId?: string) => {
    setEditingSlotId(null);
    setSlotDay(day);
    setSlotPeriod(periodNum);
    const pDef = periodDefinitions.find(p => p.number === periodNum) || periodDefinitions[0];
    setSlotStartTime(pDef?.startTime || '08:00');
    setSlotEndTime(pDef?.endTime || '08:50');

    const targetClassId = prefilledClassId || selectedClassId || classSections[0]?.id || '';
    setSlotClassId(targetClassId);
    const targetSubjId = subjects[0]?.id || '';
    setSlotSubjectId(targetSubjId);
    
    // Auto-resolve assigned teacher
    const teacher = getTeacherForClassSubject(targetClassId, targetSubjId);
    setSlotTeacherId(teacher?.id || teachers[0]?.id || '');
    setOverrideAutoTeacher(false);

    const cls = classSections.find(c => c.id === targetClassId);
    setSlotRoom(cls?.room || '');
    setShowSlotModal(true);
  };

  // Open modal to edit existing slot
  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setSlotDay(slot.day);
    setSlotPeriod(slot.periodNumber);
    setSlotStartTime(slot.startTime || '08:00');
    setSlotEndTime(slot.endTime || '08:50');
    setSlotClassId(slot.classSectionId);
    setSlotSubjectId(slot.subjectId);
    setSlotTeacherId(slot.teacherId);
    setSlotRoom(slot.room || '');
    setOverrideAutoTeacher(true);
    setShowSlotModal(true);
  };

  // Check live conflict for the current slot form state
  const liveConflict = useMemo(() => {
    if (!slotTeacherId || !slotDay || !slotPeriod) return { hasConflict: false };
    return checkTimetableConflict(slotTeacherId, slotDay, slotPeriod, editingSlotId || undefined);
  }, [slotTeacherId, slotDay, slotPeriod, editingSlotId, timetableSlots, checkTimetableConflict]);

  // Submit Slot (Create or Edit)
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotClassId || !slotSubjectId || !slotTeacherId) return;

    if (editingSlotId) {
      updateTimetableSlot(editingSlotId, {
        classSectionId: slotClassId,
        subjectId: slotSubjectId,
        teacherId: slotTeacherId,
        day: slotDay,
        periodNumber: slotPeriod,
        startTime: slotStartTime.trim() || '08:00',
        endTime: slotEndTime.trim() || '08:50',
        room: slotRoom.trim() || undefined,
      });
      showNotification(`Updated timetable period for ${slotDay} (Period ${slotPeriod}).`);
    } else {
      createTimetableSlot({
        classSectionId: slotClassId,
        subjectId: slotSubjectId,
        teacherId: slotTeacherId,
        day: slotDay,
        periodNumber: slotPeriod,
        startTime: slotStartTime.trim() || '08:00',
        endTime: slotEndTime.trim() || '08:50',
        room: slotRoom.trim() || undefined,
      });
      showNotification(`Scheduled lesson for ${slotDay} (Period ${slotPeriod}). Teacher dashboard updated automatically!`);
    }

    // If teacher was not previously assigned to this class+subject, auto-link assignment for future convenience
    const existingAsgn = teacherAssignments.find(
      a => a.classSectionId === slotClassId && a.subjectId === slotSubjectId
    );
    if (!existingAsgn || existingAsgn.teacherId !== slotTeacherId) {
      assignTeacher(slotTeacherId, slotClassId, slotSubjectId);
    }

    setShowSlotModal(false);
  };

  // Delete Slot
  const handleDeleteSlot = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to remove this timetable slot?')) {
      deleteTimetableSlot(id);
      showNotification('Timetable slot removed successfully.', 'INFO');
    }
  };

  // Quick Allocation Submit
  const handleSaveQuickAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingClassSectionId || !allocatingSubjectId || !selectedAllocTeacherId) return;

    assignTeacher(selectedAllocTeacherId, allocatingClassSectionId, allocatingSubjectId);
    const cls = classSections.find(c => c.id === allocatingClassSectionId);
    const subj = subjects.find(s => s.id === allocatingSubjectId);
    const teacher = teachers.find(t => t.id === selectedAllocTeacherId);
    const u = teacher ? allUsers.find(x => x.id === teacher.userId) : null;

    showNotification(`Assigned ${u?.name || 'teacher'} to teach ${subj?.name} in ${cls?.name}.`);
    setAllocatingClassSectionId(null);
    setAllocatingSubjectId(null);
  };

  // Handle Editing Period Definition
  const handleStartEditPeriodDef = (p: PeriodDefinition) => {
    setEditingPeriodId(p.id);
    setEditPeriodLabel(p.label);
    setEditPeriodStartTime(p.startTime);
    setEditPeriodEndTime(p.endTime);
    setEditPeriodIsBreak(Boolean(p.isBreak));
    setEditPeriodNumber(p.number);
  };

  const handleSaveEditPeriodDef = (id: string) => {
    if (!editPeriodLabel.trim()) return;
    updatePeriodDefinition(id, {
      label: editPeriodLabel.trim(),
      startTime: editPeriodStartTime.trim(),
      endTime: editPeriodEndTime.trim(),
      isBreak: editPeriodIsBreak,
      number: editPeriodNumber,
    });
    setEditingPeriodId(null);
    showNotification(`Period "${editPeriodLabel}" timings updated (${editPeriodStartTime} - ${editPeriodEndTime}).`);
  };

  const handleCreateNewPeriodDef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodLabel.trim()) return;
    createPeriodDefinition({
      number: Number(newPeriodNumber),
      label: newPeriodLabel.trim(),
      startTime: newPeriodStartTime.trim(),
      endTime: newPeriodEndTime.trim(),
      isBreak: newPeriodIsBreak,
    });
    setShowAddPeriodForm(false);
    setNewPeriodLabel(`Period ${Number(newPeriodNumber) + 1}`);
    setNewPeriodNumber(Number(newPeriodNumber) + 1);
    showNotification('New period slot added to master schedule.');
  };

  // Health Audit Calculations
  const auditDiagnostics = useMemo(() => {
    const conflicts: Array<{ teacherName: string; day: DayOfWeek; period: number; slots: TimetableSlot[] }> = [];
    const unallocatedSlots: TimetableSlot[] = [];

    const activePeriodNumbers = periodDefinitions.filter(p => !p.isBreak).map(p => p.number);

    // 1. Check double bookings
    DAYS.forEach(day => {
      activePeriodNumbers.forEach(period => {
        teachers.forEach(teacher => {
          const slots = timetableSlots.filter(
            s => s.teacherId === teacher.id && s.day === day && s.periodNumber === period
          );
          if (slots.length > 1) {
            const u = allUsers.find(x => x.id === teacher.userId);
            conflicts.push({
              teacherName: u?.name || 'Faculty',
              day,
              period,
              slots,
            });
          }
        });
      });
    });

    // 2. Check unassigned curriculum subjects in classes
    const missingAllocations: Array<{ classSection: (typeof classSections)[0]; subject: Subject }> = [];
    classSections.forEach(cls => {
      subjects.forEach(subj => {
        const asgn = teacherAssignments.find(
          a => a.classSectionId === cls.id && a.subjectId === subj.id
        );
        if (!asgn) {
          missingAllocations.push({ classSection: cls, subject: subj });
        }
      });
    });

    return {
      conflicts,
      unallocatedSlots,
      missingAllocations,
      isHealthy: conflicts.length === 0,
    };
  }, [timetableSlots, teacherAssignments, classSections, subjects, teachers, allUsers, periodDefinitions]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center gap-3 text-xs">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{notice.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[10px] font-bold">Academic Operations</span>
            <span className="text-xs text-slate-500 font-medium">
              {currentSession.name} • {currentTerm.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Master Timetable & Subject Allocations
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed">
            Centralized scheduler for all secondary classes (JS 1 → SS 3). Configure distinct subject teachers across grade levels, customize period start and end timings, avoid scheduling clashes, and automatically sync teaching periods to faculty dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPeriodConfigModal(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-bold"
            title="Edit Bell Schedule & Period Times"
          >
            <Clock size={15} className="text-indigo-600" />
            <span>Edit Period Times</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNewSlot('MONDAY', 1)}
            className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Schedule Period</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-slate-700 hover:bg-slate-100"
            title="Print current timetable"
          >
            <Printer size={15} />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('CLASS_GRID')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'CLASS_GRID'
              ? 'bg-white text-indigo-600 shadow-md shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar size={15} />
          <span>Class Timetable Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALLOCATION_MATRIX')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'ALLOCATION_MATRIX'
              ? 'bg-white text-indigo-600 shadow-md shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={15} />
          <span>JS 1 → SS 3 Subject Allocations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEACHER_GRID')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'TEACHER_GRID'
              ? 'bg-white text-indigo-600 shadow-md shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Faculty Schedule Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HEALTH_AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'HEALTH_AUDIT'
              ? 'bg-white text-indigo-600 shadow-md shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Clash Diagnostics</span>
          {auditDiagnostics.conflicts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CLASS-BY-CLASS MASTER WEEKLY GRID                 */}
      {/* ========================================================= */}
      {activeTab === 'CLASS_GRID' && (
        <div className="space-y-5">
          {/* Class Selector Bar */}
          <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Active Classroom View
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="select-control !text-sm font-extrabold !bg-white !text-slate-900 !border-slate-300 !py-1 !pl-3 !pr-8"
                  >
                    {classLevels.map(lvl => {
                      const arms = classSections.filter(c => c.classLevelId === lvl.id);
                      if (arms.length === 0) return null;
                      return (
                        <optgroup key={lvl.id} label={lvl.name}>
                          {arms.map(arm => (
                            <option key={arm.id} value={arm.id}>
                              {arm.name} ({arm.room || 'General Hall'})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Class Stats & Period Times Shortcut */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[10px]">Assigned Room:</span>
                <strong className="text-slate-900">{selectedClass?.room || 'Main Block'}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs">
                <span className="text-indigo-600 block text-[10px]">Weekly Periods:</span>
                <strong className="text-indigo-900 font-black">
                  {timetableSlots.filter(s => s.classSectionId === selectedClassId).length} scheduled
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setShowPeriodConfigModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 border border-slate-300 transition-colors"
                title="Configure daily period slots & timing"
              >
                <Clock size={13} className="text-indigo-600" />
                <span>{periodDefinitions.length} Daily Periods</span>
              </button>
            </div>
          </div>

          {/* Interactive 5-Day Weekly Grid */}
          <div className="glass-card overflow-x-auto shadow-sm border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="p-3 w-32 border-r border-slate-200 text-center">Day / Period</th>
                  {periodDefinitions.map(p => (
                    <th
                      key={p.id}
                      className={`p-3 text-center border-r border-slate-200 ${
                        p.isBreak ? 'bg-amber-50/60 text-amber-800 w-28' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="block text-slate-900 font-extrabold">{p.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleStartEditPeriodDef(p);
                            setShowPeriodConfigModal(true);
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-0.5"
                          title="Edit timing for this period"
                        >
                          <Edit2 size={10} />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-medium block mt-0.5">
                        {p.startTime} - {p.endTime}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {DAYS.map(day => (
                  <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    {/* Day Column */}
                    <td className="p-3.5 border-r border-slate-200 font-extrabold text-slate-900 bg-slate-50/40 text-center font-heading">
                      <span className="block text-sm">{day}</span>
                    </td>

                    {/* Period Cells */}
                    {periodDefinitions.map(period => {
                      if (period.isBreak) {
                        return (
                          <td
                            key={`${day}-break-${period.id}`}
                            className="p-2 border-r border-slate-200 bg-amber-50/30 text-center text-amber-700 font-medium text-[11px] select-none"
                          >
                            ☕ {period.label}
                          </td>
                        );
                      }

                      const slot = timetableSlots.find(
                        s =>
                          s.classSectionId === selectedClassId &&
                          s.day === day &&
                          s.periodNumber === period.number
                      );

                      if (slot) {
                        const subj = subjects.find(s => s.id === slot.subjectId);
                        const teacher = teachers.find(t => t.id === slot.teacherId);
                        const user = teacher ? allUsers.find(u => u.id === teacher.userId) : null;

                        return (
                          <td
                            key={`${day}-${period.number}-${period.id}`}
                            onClick={() => handleOpenEditSlot(slot)}
                            className="p-2.5 border-r border-slate-200 align-top cursor-pointer group hover:bg-indigo-50/40 transition-all"
                          >
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs group-hover:border-indigo-400 transition-all space-y-1.5 relative">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[9px] font-extrabold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                  {subj?.code || 'SUBJ'}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleOpenEditSlot(slot);
                                    }}
                                    className="p-1 rounded bg-white text-slate-500 hover:text-indigo-600 shadow-2xs"
                                    title="Edit Period"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => handleDeleteSlot(slot.id, e)}
                                    className="p-1 rounded bg-white text-slate-500 hover:text-rose-600 shadow-2xs"
                                    title="Delete Period"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-extrabold text-slate-900 text-xs font-heading truncate">
                                  {subj?.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                                  <span className="truncate font-semibold">{user?.name || 'Assigned Faculty'}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-indigo-100 font-mono">
                                <span className="flex items-center gap-1">
                                  <MapPin size={10} className="text-indigo-600" />
                                  <span>{slot.room || selectedClass?.room || 'Main Block'}</span>
                                </span>
                                <span>{slot.startTime || period.startTime}</span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // Empty Slot (Click to add)
                      return (
                        <td
                          key={`${day}-${period.number}-${period.id}`}
                          onClick={() => handleOpenNewSlot(day, period.number)}
                          className="p-2 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-100/70 transition-colors group"
                        >
                          <div className="py-4 rounded-xl border border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-white flex flex-col items-center justify-center gap-1 text-slate-400 group-hover:text-indigo-600 transition-all">
                            <Plus size={14} className="opacity-40 group-hover:opacity-100" />
                            <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100">
                              Schedule
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: JS 1 -> SS 3 SUBJECT-TEACHER ALLOCATION MATRIX     */}
      {/* ========================================================= */}
      {activeTab === 'ALLOCATION_MATRIX' && (
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Layers size={18} className="text-indigo-600" />
                  <span>Curriculum Subject Teacher Allocation Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign different specialized teachers for the same subject across grade levels (e.g. JS 1 vs JS 2 vs SS 3 Mathematics).
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search subject..."
                    value={allocationSearchTerm}
                    onChange={e => setAllocationSearchTerm(e.target.value)}
                    className="input-control !text-xs !pl-8 !py-1.5 !w-48 !bg-white !text-slate-900 !border-slate-300"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {['ALL', 'JUNIOR', 'SENIOR'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAllocationLevelFilter(lvl)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        allocationLevelFilter === lvl
                          ? 'bg-white text-indigo-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl === 'ALL' ? 'All Classes' : lvl === 'JUNIOR' ? 'Junior (JS 1-3)' : 'Senior (SS 1-3)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600">
                    <th className="p-3 w-48 border-r border-slate-200">Subject</th>
                    {classSections
                      .filter(cls => {
                        if (allocationLevelFilter === 'JUNIOR') return cls.name.includes('JS');
                        if (allocationLevelFilter === 'SENIOR') return cls.name.includes('SS');
                        return true;
                      })
                      .map(cls => (
                        <th key={cls.id} className="p-3 text-center border-r border-slate-200">
                          <span className="block text-slate-900 font-extrabold">{cls.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{cls.room || 'Main Hall'}</span>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {subjects
                    .filter(s =>
                      s.name.toLowerCase().includes(allocationSearchTerm.toLowerCase()) ||
                      s.code.toLowerCase().includes(allocationSearchTerm.toLowerCase())
                    )
                    .map(subj => {
                      const relevantClasses = classSections.filter(cls => {
                        if (allocationLevelFilter === 'JUNIOR') return cls.name.includes('JS');
                        if (allocationLevelFilter === 'SENIOR') return cls.name.includes('SS');
                        return true;
                      });

                      return (
                        <tr key={subj.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 border-r border-slate-200 bg-slate-50/40">
                            <div className="font-extrabold text-slate-900 font-heading">{subj.name}</div>
                            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                              {subj.code}
                            </span>
                          </td>

                          {relevantClasses.map(cls => {
                            const assignedTeacher = getTeacherForClassSubject(cls.id, subj.id);
                            const user = assignedTeacher ? allUsers.find(u => u.id === assignedTeacher.userId) : null;

                            return (
                              <td
                                key={`${subj.id}-${cls.id}`}
                                className="p-2 border-r border-slate-200 text-center align-middle"
                              >
                                {assignedTeacher ? (
                                  <div
                                    onClick={() => {
                                      setAllocatingClassSectionId(cls.id);
                                      setAllocatingSubjectId(subj.id);
                                      setSelectedAllocTeacherId(assignedTeacher.id);
                                    }}
                                    className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 cursor-pointer group transition-all text-left shadow-2xs"
                                    title="Click to reassign teacher"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-emerald-950 text-[11px] truncate block">
                                        {user?.name || 'Teacher'}
                                      </span>
                                      <Edit2 size={10} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[9px] text-emerald-700 font-mono block">
                                      {assignedTeacher.staffId}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAllocatingClassSectionId(cls.id);
                                      setAllocatingSubjectId(subj.id);
                                      setSelectedAllocTeacherId(teachers[0]?.id || '');
                                    }}
                                    className="w-full py-2 px-1 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-white text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                                  >
                                    <Plus size={11} />
                                    <span>Assign</span>
                                  </button>
                                )}
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FACULTY SCHEDULE MATRIX & WORKLOAD                 */}
      {/* ========================================================= */}
      {activeTab === 'TEACHER_GRID' && (
        <div className="space-y-5">
          {/* Teacher Selector Bar */}
          <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Select Faculty Member
                </span>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="select-control !text-sm font-extrabold !bg-white !text-slate-900 !border-slate-300 !py-1 !pl-3 !pr-8"
                >
                  {teachers.map(t => {
                    const u = allUsers.find(x => x.id === t.userId);
                    return (
                      <option key={t.id} value={t.id}>
                        {u?.name || 'Faculty'} ({t.staffId} • {t.specialization})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Workload Stats */}
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Assigned Load:</span>
                <strong className="text-slate-900">
                  {teacherAssignments.filter(a => a.teacherId === selectedTeacherId).length} classes
                </strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block text-[10px]">Weekly Lessons:</span>
                <strong className="text-emerald-950 font-black">
                  {timetableSlots.filter(s => s.teacherId === selectedTeacherId).length} periods / week
                </strong>
              </div>
            </div>
          </div>

          {/* Weekly Timetable for Selected Teacher */}
          <div className="glass-card overflow-x-auto shadow-sm border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="p-3 w-32 border-r border-slate-200 text-center">Day / Period</th>
                  {periodDefinitions.map(p => (
                    <th
                      key={p.id}
                      className={`p-3 text-center border-r border-slate-200 ${
                        p.isBreak ? 'bg-amber-50/60 text-amber-800 w-28' : ''
                      }`}
                    >
                      <span className="block text-slate-900 font-extrabold">{p.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium block mt-0.5">
                        {p.startTime} - {p.endTime}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {DAYS.map(day => (
                  <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 border-r border-slate-200 font-extrabold text-slate-900 bg-slate-50/40 text-center font-heading">
                      <span className="block text-sm">{day}</span>
                    </td>

                    {periodDefinitions.map(period => {
                      if (period.isBreak) {
                        return (
                          <td
                            key={`${day}-break-tch-${period.id}`}
                            className="p-2 border-r border-slate-200 bg-amber-50/30 text-center text-amber-700 font-medium text-[11px]"
                          >
                            Recess
                          </td>
                        );
                      }

                      const slot = timetableSlots.find(
                        s =>
                          s.teacherId === selectedTeacherId &&
                          s.day === day &&
                          s.periodNumber === period.number
                      );

                      if (slot) {
                        const cls = classSections.find(c => c.id === slot.classSectionId);
                        const subj = subjects.find(s => s.id === slot.subjectId);

                        return (
                          <td
                            key={`${day}-${period.number}-tch-${period.id}`}
                            onClick={() => handleOpenEditSlot(slot)}
                            className="p-2.5 border-r border-slate-200 align-top cursor-pointer group hover:bg-emerald-50/40 transition-all"
                          >
                            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-2xs space-y-1 relative">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  {cls?.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {slot.startTime || period.startTime}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-slate-900 text-xs font-heading truncate">
                                {subj?.name}
                              </h4>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <MapPin size={10} className="text-emerald-600" />
                                <span>{slot.room || cls?.room || 'Main Block'}</span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={`${day}-${period.number}-empty-tch-${period.id}`}
                          className="p-2 border-r border-slate-200 text-center text-slate-300 text-[10px] italic"
                        >
                          Free Period
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CLASH DIAGNOSTICS & TIMETABLE HEALTH               */}
      {/* ========================================================= */}
      {activeTab === 'HEALTH_AUDIT' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Double-Booking Clash Card */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    auditDiagnostics.conflicts.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                      Faculty Double-Booking Clashes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Teachers scheduled in multiple classrooms at the identical period
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  auditDiagnostics.conflicts.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {auditDiagnostics.conflicts.length === 0 ? '0 Clashes (Healthy)' : `${auditDiagnostics.conflicts.length} Clashes Found`}
                </span>
              </div>

              {auditDiagnostics.conflicts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-800">Master Schedule is Clash-Free!</p>
                  <p className="text-[11px] text-slate-400">
                    No teacher has overlapping period assignments across any classrooms.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditDiagnostics.conflicts.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5 text-xs text-rose-900">
                      <div className="flex items-center justify-between font-extrabold">
                        <span>{c.teacherName}</span>
                        <span className="badge badge-danger text-[10px]">{c.day} • Period {c.period}</span>
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Assigned to {c.slots.length} rooms simultaneously:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {c.slots.map(s => {
                          const cls = classSections.find(x => x.id === s.classSectionId);
                          const subj = subjects.find(x => x.id === s.subjectId);
                          return (
                            <span key={s.id} className="bg-white px-2 py-1 rounded border border-rose-200 text-[10px] font-bold">
                              {cls?.name} ({subj?.name})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Curriculum Coverage Diagnostic Card */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                      Curriculum Subject Allocation Status
                    </h3>
                    <p className="text-xs text-slate-500">
                      Classrooms with unassigned primary subject teachers
                    </p>
                  </div>
                </div>
                <span className="badge badge-primary text-xs font-bold">
                  {subjects.length} Subjects Defined
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {classSections.map(cls => {
                  const assignedCount = teacherAssignments.filter(a => a.classSectionId === cls.id).length;
                  const percent = Math.round((assignedCount / subjects.length) * 100);

                  return (
                    <div key={cls.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block font-heading">{cls.name}</strong>
                        <span className="text-[10px] text-slate-500">
                          {assignedCount} of {subjects.length} subjects allocated
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-indigo-700 font-mono">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SCHEDULE / EDIT PERIOD MODAL                    */}
      {/* ========================================================= */}
      <ModalPortal isOpen={showSlotModal} onClose={() => setShowSlotModal(false)}>
        {showSlotModal && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-lg w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold font-heading text-lg">
                <Calendar size={20} />
                <span>{editingSlotId ? 'Edit Timetable Period' : 'Schedule New Lesson Period'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSlotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              {/* Day & Period Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Day of Week <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={slotDay}
                    onChange={e => setSlotDay(e.target.value as DayOfWeek)}
                    className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-medium"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Period Slot <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={slotPeriod}
                    onChange={e => handleSlotPeriodSelect(Number(e.target.value))}
                    className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-medium"
                  >
                    {periodDefinitions.filter(p => !p.isBreak).map(p => (
                      <option key={p.id} value={p.number}>
                        {p.label} ({p.startTime} - {p.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start & End Times (Customizable for this period) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={e => setSlotStartTime(e.target.value)}
                    className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={slotEndTime}
                    onChange={e => setSlotEndTime(e.target.value)}
                    className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Class Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={slotClassId}
                    onChange={e => {
                      const newClsId = e.target.value;
                      setSlotClassId(newClsId);
                      const t = getTeacherForClassSubject(newClsId, slotSubjectId);
                      if (t && !overrideAutoTeacher) setSlotTeacherId(t.id);
                    }}
                    className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-medium"
                    required
                  >
                    {classSections.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={slotSubjectId}
                    onChange={e => handleSubjectChangeInModal(e.target.value)}
                    className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-medium"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assigned Teacher (Auto-Resolved with manual override option) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Assigned Teacher <span className="text-rose-500">*</span>
                  </label>
                  {autoAssignedTeacher && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      ✨ Auto-resolved from Class Matrix
                    </span>
                  )}
                </div>
                <select
                  value={slotTeacherId}
                  onChange={e => {
                    setSlotTeacherId(e.target.value);
                    setOverrideAutoTeacher(true);
                  }}
                  className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-medium"
                  required
                >
                  {teachers.map(t => {
                    const u = allUsers.find(x => x.id === t.userId);
                    return (
                      <option key={t.id} value={t.id}>
                        {u?.name || 'Faculty'} ({t.staffId})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Real-time Clash / Conflict Warning Alert */}
              {liveConflict.hasConflict && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    <AlertTriangle size={15} className="text-rose-600 flex-shrink-0" />
                    <span>⚠️ Double-Booking Clash Warning!</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    This teacher is already scheduled to teach <strong>{liveConflict.conflictingSubject}</strong> in <strong>{liveConflict.conflictingClass}</strong> on {slotDay} during Period {slotPeriod}. Scheduling this will create a clash!
                  </p>
                </div>
              )}

              {/* Room Location */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Room / Laboratory (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab 1, Room 102"
                  value={slotRoom}
                  onChange={e => setSlotRoom(e.target.value)}
                  className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {editingSlotId ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteTimetableSlot(editingSlotId);
                      setShowSlotModal(false);
                      showNotification('Period removed from timetable.', 'INFO');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>Delete Slot</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSlotModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    {editingSlotId ? 'Save Changes' : 'Confirm & Sync to Teacher'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>

      {/* ========================================================= */}
      {/* MODAL 2: QUICK SUBJECT-TEACHER ALLOCATION MODAL          */}
      {/* ========================================================= */}
      <ModalPortal
        isOpen={Boolean(allocatingClassSectionId && allocatingSubjectId)}
        onClose={() => {
          setAllocatingClassSectionId(null);
          setAllocatingSubjectId(null);
        }}
      >
        {allocatingClassSectionId && allocatingSubjectId && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-md w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold font-heading text-base">
                <Layers size={18} />
                <span>Allocate Subject Teacher</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAllocatingClassSectionId(null);
                  setAllocatingSubjectId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const cls = classSections.find(c => c.id === allocatingClassSectionId);
              const subj = subjects.find(s => s.id === allocatingSubjectId);
              return (
                <form onSubmit={handleSaveQuickAllocation} className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-500">Class Arm: </span>
                      <strong className="text-indigo-900 font-extrabold">{cls?.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Subject: </span>
                      <strong className="text-indigo-900 font-extrabold">{subj?.name} ({subj?.code})</strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Designate Primary Subject Teacher
                    </label>
                    <select
                      value={selectedAllocTeacherId}
                      onChange={e => setSelectedAllocTeacherId(e.target.value)}
                      className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-semibold"
                      required
                    >
                      {teachers.map(t => {
                        const u = allUsers.find(x => x.id === t.userId);
                        return (
                          <option key={t.id} value={t.id}>
                            {u?.name || 'Faculty'} ({t.staffId} • {t.specialization})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This teacher will be the primary instructor for {subj?.name} in {cls?.name}, receiving automatic grading access, score sheet generation, and timetable period scheduling.
                  </p>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAllocatingClassSectionId(null);
                        setAllocatingSubjectId(null);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      Save Allocation
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        )}
      </ModalPortal>

      {/* ========================================================= */}
      {/* MODAL 3: CONFIGURE BELL SCHEDULE & PERIOD TIMINGS        */}
      {/* ========================================================= */}
      <ModalPortal isOpen={showPeriodConfigModal} onClose={() => setShowPeriodConfigModal(false)}>
        {showPeriodConfigModal && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-2xl w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold font-heading text-lg">
                <Clock size={20} />
                <span>Configure Bell Schedule & Period Timings</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPeriodConfigModal(false);
                  setEditingPeriodId(null);
                  setShowAddPeriodForm(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Define the official institutional daily timetable periods, break intervals, start times, and end times. Adjustments automatically update all class grids, teacher portals, and printable timetables.
            </p>

            {/* List of Period Definitions */}
            <div className="space-y-2.5">
              {periodDefinitions.map((p) => {
                const isEditing = editingPeriodId === p.id;

                if (isEditing) {
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-indigo-50/80 border-2 border-indigo-400 space-y-3 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-950 font-heading">
                          Editing: {p.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingPeriodId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Period Label
                          </label>
                          <input
                            type="text"
                            value={editPeriodLabel}
                            onChange={e => setEditPeriodLabel(e.target.value)}
                            placeholder="e.g. Period 1 or Assembly"
                            className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={editPeriodStartTime}
                            onChange={e => setEditPeriodStartTime(e.target.value)}
                            className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={editPeriodEndTime}
                            onChange={e => setEditPeriodEndTime(e.target.value)}
                            className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={editPeriodIsBreak}
                            onChange={e => setEditPeriodIsBreak(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          <span>Mark as Break / Recess Interval (No lessons scheduled)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPeriodId(null)}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditPeriodDef(p.id)}
                            className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1"
                          >
                            <Save size={13} />
                            <span>Save Period</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      p.isBreak
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        p.isBreak ? 'bg-amber-200 text-amber-900' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {p.isBreak ? '☕' : p.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold font-heading text-slate-900">
                            {p.label}
                          </h4>
                          {p.isBreak && (
                            <span className="badge badge-warning text-[9px]">Recess Interval</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {p.startTime} - {p.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStartEditPeriodDef(p)}
                        className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs flex items-center gap-1"
                        title="Edit period timings"
                      >
                        <Edit2 size={12} />
                        <span>Edit Timing</span>
                      </button>

                      {periodDefinitions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${p.label}?`)) {
                              deletePeriodDefinition(p.id);
                              showNotification(`Removed ${p.label} from timetable.`);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Period Slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Period Form */}
            {showAddPeriodForm ? (
              <form
                onSubmit={handleCreateNewPeriodDef}
                className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900">Add New Period to Timetable</span>
                  <button
                    type="button"
                    onClick={() => setShowAddPeriodForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Period Number
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={newPeriodNumber}
                      onChange={e => setNewPeriodNumber(Number(e.target.value))}
                      className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Period 8 or Prep"
                      value={newPeriodLabel}
                      onChange={e => setNewPeriodLabel(e.target.value)}
                      className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newPeriodStartTime}
                      onChange={e => setNewPeriodStartTime(e.target.value)}
                      className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newPeriodEndTime}
                      onChange={e => setNewPeriodEndTime(e.target.value)}
                      className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={newPeriodIsBreak}
                      onChange={e => setNewPeriodIsBreak(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Is Break Interval</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPeriodForm(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      Add Period Slot
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPeriodForm(true)}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 text-indigo-600 font-bold"
                >
                  <Plus size={14} />
                  <span>Add New Period Slot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset period definitions to standard 7-period defaults?')) {
                      resetPeriodDefinitions();
                      showNotification('Period timings reset to default schedule.', 'INFO');
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset to Standard Defaults</span>
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPeriodConfigModal(false)}
                className="btn btn-primary btn-sm bg-indigo-600 text-white font-bold"
              >
                Done Configuring
              </button>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
