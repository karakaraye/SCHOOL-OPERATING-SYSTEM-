import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../common/Toast';
import {
  Calendar,
  Layers,
  BookOpen,
  Sliders,
  School as SchoolIcon,
  Plus,
  CheckCircle2,
  Save,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Search,
  Building2,
} from 'lucide-react';
import type { AssessmentWeightConfig, ClassLevel, ClassSection, Subject } from '../../types';
import { ModalPortal } from '../common/ModalPortal';

interface AcademicSetupViewProps {
  initialTab?: 'sessions' | 'classes' | 'subjects' | 'assessment' | 'branding';
}

export const AcademicSetupView: React.FC<AcademicSetupViewProps> = ({ initialTab = 'sessions' }) => {
  const {
    school,
    updateSchoolProfile,
    sessions,
    terms,
    currentSession,
    setCurrentSession,
    setCurrentTerm,
    createSession,
    createTerm,
    classLevels,
    classSections,
    subjects,
    createClassLevel,
    updateClassLevel,
    deleteClassLevel,
    createClassSection,
    updateClassSection,
    deleteClassSection,
    createSubject,
    updateSubject,
    deleteSubject,
    assessmentConfigs,
    updateAssessmentConfig,
    gradingScale,
    students,
    teacherAssignments,
  } = useSchool();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'sessions' | 'classes' | 'subjects' | 'assessment' | 'branding'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search / filter within classes tab
  const [classSearch, setClassSearch] = useState('');

  // Editing Class Level Tier state & modals
  const [editingLevel, setEditingLevel] = useState<ClassLevel | null>(null);
  const [editLevelName, setEditLevelName] = useState('');
  const [deletingLevel, setDeletingLevel] = useState<ClassLevel | null>(null);

  // Editing Class Section Arm state & modals
  const [editingArm, setEditingArm] = useState<ClassSection | null>(null);
  const [editArmName, setEditArmName] = useState('');
  const [editArmLevelId, setEditArmLevelId] = useState('');
  const [editArmRoom, setEditArmRoom] = useState('');
  const [editArmCapacity, setEditArmCapacity] = useState(35);
  const [deletingArm, setDeletingArm] = useState<ClassSection | null>(null);

  // Editing Subject state & modals
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectCategory, setEditSubjectCategory] = useState<'CORE' | 'ELECTIVE' | 'VOCATIONAL'>('CORE');
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Search & filter within subjects tab
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'ALL' | 'CORE' | 'ELECTIVE' | 'VOCATIONAL'>('ALL');

  // New Session / Term forms
  const [newSessionName, setNewSessionName] = useState('2026/2027');
  const [newSessionStart, setNewSessionStart] = useState('2026-09-01');
  const [newSessionEnd, setNewSessionEnd] = useState('2027-07-20');

  const [newTermName, setNewTermName] = useState('Second Term');
  const [newTermStart, setNewTermStart] = useState('2026-01-10');
  const [newTermEnd, setNewTermEnd] = useState('2026-04-15');

  // New Class Level / Arm forms
  const [newLevelName, setNewLevelName] = useState('');
  const [newArmName, setNewArmName] = useState('');
  const [newArmLevelId, setNewArmLevelId] = useState(classLevels[0]?.id || '');
  const [newArmRoom, setNewArmRoom] = useState('');

  // New Subject form
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<'CORE' | 'ELECTIVE' | 'VOCATIONAL'>('CORE');

  // Assessment weights state
  const [localWeights, setLocalWeights] = useState<AssessmentWeightConfig[]>(assessmentConfigs);
  const [weightSaveNotice, setWeightSaveNotice] = useState(false);

  // School profile form
  const [profileForm, setProfileForm] = useState({
    name: school.name,
    motto: school.motto,
    code: school.code,
    address: school.address,
    email: school.email,
    phone: school.phone,
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    createSession(newSessionName.trim(), newSessionStart, newSessionEnd);
    showToast('Academic Session Created', `Session ${newSessionName.trim()} created successfully`);
    setNewSessionName('');
  };

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName.trim()) return;
    createTerm(currentSession.id, newTermName.trim(), newTermStart, newTermEnd);
    showToast('Academic Term Added', `Term ${newTermName.trim()} added to current session`);
    setNewTermName('');
  };

  // Class Level handlers
  const handleCreateLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName.trim()) return;
    createClassLevel(newLevelName.trim());
    showToast('Class Tier Created', `Tier "${newLevelName.trim()}" created successfully`);
    setNewLevelName('');
  };

  const handleOpenEditLevel = (lvl: ClassLevel) => {
    setEditingLevel(lvl);
    setEditLevelName(lvl.name);
  };

  const handleSaveLevelEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel || !editLevelName.trim()) return;
    const oldName = editingLevel.name;
    updateClassLevel(editingLevel.id, editLevelName.trim());
    showToast('Class Tier Renamed', `Renamed "${oldName}" to "${editLevelName.trim()}"`);
    setEditingLevel(null);
  };

  const handleConfirmDeleteLevel = () => {
    if (!deletingLevel) return;
    const name = deletingLevel.name;
    deleteClassLevel(deletingLevel.id);
    showToast('Class Tier Deleted', `Tier "${name}" and associated arms deleted`, 'warning');
    setDeletingLevel(null);
  };

  // Class Arm handlers
  const handleCreateArm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArmName.trim() || !newArmLevelId) return;
    createClassSection(newArmLevelId, newArmName.trim(), newArmRoom.trim() || undefined);
    showToast('Class Arm Created', `Section arm "${newArmName.trim()}" created`);
    setNewArmName('');
    setNewArmRoom('');
  };

  const handleOpenEditArm = (arm: ClassSection) => {
    setEditingArm(arm);
    setEditArmName(arm.name);
    setEditArmLevelId(arm.classLevelId);
    setEditArmRoom(arm.room || '');
    setEditArmCapacity(arm.capacity || 35);
  };

  const handleSaveArmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArm || !editArmName.trim() || !editArmLevelId) return;
    const oldName = editingArm.name;
    updateClassSection(editingArm.id, {
      name: editArmName.trim(),
      classLevelId: editArmLevelId,
      room: editArmRoom.trim() || undefined,
      capacity: editArmCapacity,
    });
    showToast('Class Arm Updated', `Updated "${oldName}" details`);
    setEditingArm(null);
  };

  const handleConfirmDeleteArm = () => {
    if (!deletingArm) return;
    const name = deletingArm.name;
    deleteClassSection(deletingArm.id);
    showToast('Class Arm Deleted', `Section arm "${name}" deleted`, 'warning');
    setDeletingArm(null);
  };

  // Subject handlers
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCode.trim()) return;
    createSubject(newSubjectName.trim(), newSubjectCode.trim().toUpperCase(), newSubjectCategory);
    showToast('Subject Added', `${newSubjectName.trim()} (${newSubjectCode.trim().toUpperCase()}) added to catalog`);
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  const handleOpenEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setEditSubjectName(subj.name);
    setEditSubjectCode(subj.code);
    setEditSubjectCategory(subj.category);
  };

  const handleSaveSubjectEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectName.trim() || !editSubjectCode.trim()) return;
    const oldName = editingSubject.name;
    updateSubject(editingSubject.id, {
      name: editSubjectName.trim(),
      code: editSubjectCode.trim().toUpperCase(),
      category: editSubjectCategory,
    });
    showToast('Subject Updated', `Updated "${oldName}" (${editSubjectCode.trim().toUpperCase()})`);
    setEditingSubject(null);
  };

  const handleConfirmDeleteSubject = () => {
    if (!deletingSubject) return;
    const name = deletingSubject.name;
    deleteSubject(deletingSubject.id);
    showToast('Subject Deleted', `Subject "${name}" deleted from curriculum`, 'warning');
    setDeletingSubject(null);
  };

  const handleWeightChange = (id: string, maxScore: number) => {
    setLocalWeights(prev =>
      prev.map(item => (item.id === id ? { ...item, maxScore, weightPercent: maxScore } : item))
    );
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssessmentConfig(localWeights);
    setWeightSaveNotice(true);
    showToast('Weights Saved', 'Assessment continuous & exam weighting updated');
    setTimeout(() => setWeightSaveNotice(false), 3000);
  };

  const totalAssessmentScore = localWeights.reduce((acc, curr) => acc + curr.maxScore, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    showToast('Profile Saved', 'Institutional information updated');
  };

  // Filter class levels & sections
  const filteredLevels = classLevels.filter(lvl => {
    if (!classSearch.trim()) return true;
    const q = classSearch.toLowerCase();
    const matchesLevel = lvl.name.toLowerCase().includes(q);
    const childArms = classSections.filter(c => c.classLevelId === lvl.id);
    const matchesArm = childArms.some(arm => arm.name.toLowerCase().includes(q) || (arm.room && arm.room.toLowerCase().includes(q)));
    return matchesLevel || matchesArm;
  });

  // Filter subjects
  const filteredSubjects = subjects.filter(s => {
    const matchesSearch =
      !subjectSearch.trim() ||
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase());
    const matchesCategory = subjectCategoryFilter === 'ALL' || s.category === subjectCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-primary text-[10px]">System Architecture</span>
          <span className="text-xs text-[var(--text-secondary)]">Academic Rules Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
          Academic Setup & Institutional Configuration
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Manage academic sessions, terms, class arm topologies, curriculum subjects, assessment weight structures, and institutional profiles.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1.5 flex items-center gap-1.5 flex-wrap">
        {[
          { id: 'classes', label: 'Class Tiers & Arms', icon: Layers, count: classSections.length },
          { id: 'subjects', label: 'Curriculum Catalog', icon: BookOpen, count: subjects.length },
          { id: 'sessions', label: 'Sessions & Terms', icon: Calendar, count: sessions.length },
          { id: 'assessment', label: 'Assessment & Grading', icon: Sliders },
          { id: 'branding', label: 'Institutional Profile', icon: SchoolIcon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Class Tiers & Section Arms */}
      {activeTab === 'classes' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Class Tiers (Levels)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)] font-heading">
                  {classLevels.length}
                </span>
                <span className="text-xs text-blue-600 font-semibold">Tiers Active</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Section Arms
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)] font-heading">
                  {classSections.length}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">Classrooms</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Enrolled Students
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)] font-heading">
                  {students.length}
                </span>
                <span className="text-xs text-indigo-600 font-semibold">Students</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Avg. Class Size
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)] font-heading">
                  {classSections.length > 0 ? Math.round(students.length / classSections.length) : 0}
                </span>
                <span className="text-xs text-slate-400 font-semibold">per arm</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Class Hierarchy List */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                      Class Level Tiers & Section Arms
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Click the edit icon on any tier or arm to rename it, change location, or adjust capacity.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search class or tier..."
                      value={classSearch}
                      onChange={e => setClassSearch(e.target.value)}
                      className="input-control !pl-8 !py-1.5 !text-xs w-full"
                    />
                    {classSearch && (
                      <button
                        onClick={() => setClassSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredLevels.length === 0 ? (
                  <div className="p-8 text-center bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-subtle)] text-slate-400">
                    <p className="text-xs">No class tiers matching "{classSearch}"</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredLevels.map((lvl, index) => {
                      const arms = classSections.filter(c => c.classLevelId === lvl.id);
                      const filteredArms = classSearch.trim()
                        ? arms.filter(a => a.name.toLowerCase().includes(classSearch.toLowerCase()) || (a.room && a.room.toLowerCase().includes(classSearch.toLowerCase())))
                        : arms;
                      const levelStudentsCount = students.filter(s => arms.some(a => a.id === s.classSectionId)).length;

                      return (
                        <div
                          key={lvl.id}
                          className="p-5 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] space-y-4 shadow-sm hover:border-slate-300 transition-all"
                        >
                          {/* Tier Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                                T{index + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-base text-[var(--text-primary)] font-heading">
                                    {lvl.name} Tier
                                  </h4>
                                  <span className="badge badge-primary text-[10px]">
                                    {arms.length} {arms.length === 1 ? 'Arm' : 'Arms'}
                                  </span>
                                  <span className="badge text-[10px] bg-slate-100 text-slate-600">
                                    {levelStudentsCount} Students
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons on Tier */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditLevel(lvl)}
                                className="btn btn-secondary !py-1.5 !px-2.5 !text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Rename Class Tier"
                              >
                                <Pencil size={13} />
                                <span>Rename Tier</span>
                              </button>
                              <button
                                onClick={() => {
                                  setNewArmLevelId(lvl.id);
                                  const armInput = document.getElementById('new-arm-name-input');
                                  if (armInput) armInput.focus();
                                }}
                                className="btn btn-secondary !py-1.5 !px-2.5 !text-xs text-slate-600 hover:text-slate-900"
                                title="Add Arm to this Tier"
                              >
                                <Plus size={13} />
                                <span>Add Arm</span>
                              </button>
                              <button
                                onClick={() => setDeletingLevel(lvl)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Tier"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Section Arms Grid */}
                          {arms.length === 0 ? (
                            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] text-center text-xs text-slate-400">
                              No section arms in this tier yet. Click "Add Arm" above to create one.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {(filteredArms.length > 0 ? filteredArms : arms).map(arm => {
                                const enrolledCount = students.filter(s => s.classSectionId === arm.id).length;
                                const capacity = arm.capacity || 35;
                                const capacityPercent = Math.min(100, Math.round((enrolledCount / capacity) * 100));

                                return (
                                  <div
                                    key={arm.id}
                                    className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <h5 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                                          {arm.name}
                                        </h5>
                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => handleOpenEditArm(arm)}
                                            className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="Edit Class Name & Room"
                                          >
                                            <Pencil size={12} />
                                          </button>
                                          <button
                                            onClick={() => setDeletingArm(arm)}
                                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            title="Delete Section Arm"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mt-1">
                                        <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                                        <span className="truncate">{arm.room || 'Main Academic Block'}</span>
                                      </div>
                                    </div>

                                    {/* Capacity Progress Bar */}
                                    <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-slate-500 font-medium">Enrolled</span>
                                        <span className="font-bold text-[var(--text-primary)] font-mono">
                                          {enrolledCount} / {capacity}
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            capacityPercent >= 90
                                              ? 'bg-rose-500'
                                              : capacityPercent >= 75
                                              ? 'bg-amber-500'
                                              : 'bg-blue-500'
                                          }`}
                                          style={{ width: `${capacityPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Forms: Add Class Tier & Add Class Arm */}
            <div className="space-y-6">
              {/* Add Class Tier Form */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Create Class Level Tier
                    </h4>
                    <p className="text-[11px] text-slate-400">e.g. JS 1, JSS 2, SS 3, Year 7</p>
                  </div>
                </div>

                <form onSubmit={handleCreateLevel} className="space-y-3">
                  <div>
                    <label className="input-label">Tier Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JS 1 or SS 1"
                      value={newLevelName}
                      onChange={e => setNewLevelName(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-full">
                    <Plus size={14} />
                    <span>Create Level Tier</span>
                  </button>
                </form>
              </div>

              {/* Add Class Arm Form */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BookOpen size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Create Section Arm
                    </h4>
                    <p className="text-[11px] text-slate-400">e.g. JS 1 Alpha, SS 2 Commercial</p>
                  </div>
                </div>

                <form onSubmit={handleCreateArm} className="space-y-3">
                  <div>
                    <label className="input-label">Target Class Level Tier</label>
                    <select
                      value={newArmLevelId}
                      onChange={e => setNewArmLevelId(e.target.value)}
                      className="select-control font-semibold"
                    >
                      {classLevels.map(lvl => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.name} Tier
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Class Section Arm Name</label>
                    <input
                      id="new-arm-name-input"
                      type="text"
                      required
                      placeholder="e.g. JS 1 Alpha"
                      value={newArmName}
                      onChange={e => setNewArmName(e.target.value)}
                      className="input-control"
                    />
                  </div>

                  <div>
                    <label className="input-label">Room / Building Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 104, Block B"
                      value={newArmRoom}
                      onChange={e => setNewArmRoom(e.target.value)}
                      className="input-control"
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary btn-sm w-full text-emerald-700 hover:bg-emerald-50">
                    <Plus size={14} />
                    <span>Create Section Arm</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Catalog (SUBJECTS TAB WITH FULL EDIT / DELETE) */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Curriculum Offerings
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)] font-heading">
                  {subjects.length}
                </span>
                <span className="text-xs text-blue-600 font-semibold">Subjects</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Core (Compulsory)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600 font-heading">
                  {subjects.filter(s => s.category === 'CORE').length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Core Courses</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Elective Subjects
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-600 font-heading">
                  {subjects.filter(s => s.category === 'ELECTIVE').length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Electives</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Vocational / Trade
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 font-heading">
                  {subjects.filter(s => s.category === 'VOCATIONAL').length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Trades</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subjects Table & Search */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                      Curriculum Subjects Catalog
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Edit subject names, codes, and category classifications across all grades.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search subject or code..."
                      value={subjectSearch}
                      onChange={e => setSubjectSearch(e.target.value)}
                      className="input-control !pl-8 !py-1.5 !text-xs w-full"
                    />
                    {subjectSearch && (
                      <button
                        onClick={() => setSubjectSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4 pb-3 border-b border-[var(--border-subtle)]">
                  {(['ALL', 'CORE', 'ELECTIVE', 'VOCATIONAL'] as const).map(cat => {
                    const count = cat === 'ALL' ? subjects.length : subjects.filter(s => s.category === cat).length;
                    const isSelected = subjectCategoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSubjectCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{cat === 'ALL' ? 'All Subjects' : cat}</span>
                        <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Table */}
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>Subject Code</th>
                        <th>Category</th>
                        <th>Teachers Assigned</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                            No subjects matching current search filter.
                          </td>
                        </tr>
                      ) : (
                        filteredSubjects.map(s => {
                          const assignedTeachersCount = teacherAssignments.filter(a => a.subjectId === s.id).length;

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                              <td>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                                    <BookOpen size={14} />
                                  </div>
                                  <span className="font-bold text-xs text-[var(--text-primary)]">
                                    {s.name}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                                  {s.code}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge text-[10px] font-bold ${
                                    s.category === 'CORE'
                                      ? 'badge-primary'
                                      : s.category === 'ELECTIVE'
                                      ? 'badge-cyan'
                                      : 'badge-warning'
                                  }`}
                                >
                                  {s.category}
                                </span>
                              </td>
                              <td>
                                <span className="text-xs text-slate-500 font-medium">
                                  {assignedTeachersCount} {assignedTeachersCount === 1 ? 'Teacher' : 'Teachers'}
                                </span>
                              </td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditSubject(s)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Edit Subject Name & Code"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => setDeletingSubject(s)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Subject"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
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

            {/* Sidebar Form: Add Subject */}
            <div>
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Add Curriculum Subject
                    </h4>
                    <p className="text-[11px] text-slate-400">Create new subject offering</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSubject} className="space-y-3">
                  <div>
                    <label className="input-label">Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Further Mathematics"
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                      className="input-control"
                    />
                  </div>

                  <div>
                    <label className="input-label">Subject Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FMA201"
                      value={newSubjectCode}
                      onChange={e => setNewSubjectCode(e.target.value)}
                      className="input-control font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="input-label">Subject Category</label>
                    <select
                      value={newSubjectCategory}
                      onChange={e => setNewSubjectCategory(e.target.value as any)}
                      className="select-control font-medium"
                    >
                      <option value="CORE">CORE (Compulsory)</option>
                      <option value="ELECTIVE">ELECTIVE</option>
                      <option value="VOCATIONAL">VOCATIONAL</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm w-full">
                    <Plus size={14} />
                    <span>Add Subject</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sessions & Terms */}
      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                Active Academic Session & Terms
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Configure calendar dates and toggle the active term for score submissions and report cards.
              </p>

              <div className="space-y-4">
                {sessions.map(sess => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[var(--text-primary)] font-heading">
                          Academic Year: {sess.name}
                        </span>
                        {sess.id === school.currentSessionId ? (
                          <span className="badge badge-success text-[9px]">Active Session</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSession(sess.id);
                              showToast('Active Session Updated', `Switched active session to ${sess.name}`);
                            }}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] font-mono">
                        {sess.startDate} ➔ {sess.endDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      {terms
                        .filter(t => t.sessionId === sess.id)
                        .map(term => {
                          const isCurrent = term.id === school.currentTermId;
                          return (
                            <div
                              key={term.id}
                              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                isCurrent
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 font-bold'
                                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs">{term.name}</span>
                                {isCurrent ? (
                                  <CheckCircle2 size={14} className="text-emerald-600" />
                                ) : (
                                  <button
                                    onClick={() => {
                                      setCurrentTerm(term.id);
                                      showToast('Active Term Updated', `Switched active term to ${term.name}`);
                                    }}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">
                                {term.startDate} to {term.endDate}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Create New Session Form */}
            <div className="glass-card p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Create Academic Session
              </h4>
              <form onSubmit={handleCreateSession} className="space-y-3">
                <div>
                  <label className="input-label">Session Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026/2027"
                    value={newSessionName}
                    onChange={e => setNewSessionName(e.target.value)}
                    className="input-control font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="input-label">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newSessionStart}
                      onChange={e => setNewSessionStart(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label className="input-label">End Date</label>
                    <input
                      type="date"
                      required
                      value={newSessionEnd}
                      onChange={e => setNewSessionEnd(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-full">
                  <Plus size={14} />
                  <span>Add Session</span>
                </button>
              </form>
            </div>

            {/* Create Term Form */}
            <div className="glass-card p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Add Term to Active Session
              </h4>
              <form onSubmit={handleCreateTerm} className="space-y-3">
                <div>
                  <label className="input-label">Term Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Second Term"
                    value={newTermName}
                    onChange={e => setNewTermName(e.target.value)}
                    className="input-control"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="input-label">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newTermStart}
                      onChange={e => setNewTermStart(e.target.value)}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label className="input-label">End Date</label>
                    <input
                      type="date"
                      required
                      value={newTermEnd}
                      onChange={e => setNewTermEnd(e.target.value)}
                      className="input-control"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary btn-sm w-full">
                  <Plus size={14} />
                  <span>Add Term</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Assessment Weights & Grading Scale */}
      {activeTab === 'assessment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Assessment Weight Configuration */}
          <div className="glass-card p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Assessment Weight Configuration
                </h3>
                <span
                  className={`badge ${
                    totalAssessmentScore === 100 ? 'badge-success' : 'badge-danger'
                  }`}
                >
                  Total: {totalAssessmentScore}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Configure continuous assessment (CA) and terminal exam weights totaling 100%.
              </p>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4">
              <div className="space-y-3">
                {localWeights.map(cfg => (
                  <div
                    key={cfg.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        {cfg.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {cfg.name.toLowerCase().includes('exam') ? 'Final Terminal Examination' : 'Continuous Assessment Test'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.maxScore}
                        onChange={e => handleWeightChange(cfg.id, Number(e.target.value) || 0)}
                        className="input-control !w-20 !py-1 !px-2 font-mono font-bold text-center"
                      />
                      <span className="text-xs font-bold text-slate-400">marks</span>
                    </div>
                  </div>
                ))}
              </div>

              {totalAssessmentScore !== 100 && (
                <p className="text-xs text-rose-600 font-semibold">
                  ⚠️ The sum of weights must equal 100% (currently {totalAssessmentScore}%).
                </p>
              )}

              {weightSaveNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>Assessment weights updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={totalAssessmentScore !== 100}
                className="btn btn-primary btn-md w-full"
              >
                <Save size={15} />
                <span>Save Assessment Weights</span>
              </button>
            </form>
          </div>

          {/* Standard Grading Curve Scale */}
          <div className="glass-card p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Standard Grading Curve Scale
                </h3>
                <span className="badge badge-primary text-[10px]">WAEC Standard</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Threshold boundaries and classification remarks automatically assigned on report cards.
              </p>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Score Range</th>
                    <th>Grade</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingScale.map(tier => (
                    <tr key={tier.grade}>
                      <td>
                        <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                          {tier.minScore}% — {tier.maxScore}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${tier.colorClass} text-xs font-bold`}>
                          {tier.grade}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {tier.remark}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Institutional Branding Profile */}
      {activeTab === 'branding' && (
        <div className="glass-card p-6 max-w-2xl space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
              Institution Details & Report Card Header
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Branding metadata printed on official terminal transcripts and student report sheets.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="input-label">Institution Official Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-control font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">School Code</label>
                <input
                  type="text"
                  required
                  value={profileForm.code}
                  onChange={e => setProfileForm({ ...profileForm, code: e.target.value })}
                  className="input-control font-mono"
                />
              </div>
              <div>
                <label className="input-label">Institutional Motto</label>
                <input
                  type="text"
                  required
                  value={profileForm.motto}
                  onChange={e => setProfileForm({ ...profileForm, motto: e.target.value })}
                  className="input-control"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Campus Physical Address</label>
              <input
                type="text"
                required
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                className="input-control"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Contact Email</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="input-control"
                />
              </div>
              <div>
                <label className="input-label">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="input-control"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
              <button type="submit" className="btn btn-primary btn-md">
                <Save size={15} />
                <span>Save School Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Edit Class Level Tier Modal */}
      <ModalPortal isOpen={Boolean(editingLevel)} onClose={() => setEditingLevel(null)}>
        {editingLevel && (
          <div className="modal-container max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Pencil size={15} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                    Rename Class Level Tier
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Updating tier affects child arms & student hierarchy.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLevel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLevelEdit} className="space-y-4 p-5">
              <div>
                <label className="input-label">Class Level Tier Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. JS 1, JSS 2, Grade 7, SS 3"
                  value={editLevelName}
                  onChange={e => setEditLevelName(e.target.value)}
                  className="input-control font-bold text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Currently holds {classSections.filter(c => c.classLevelId === editingLevel.id).length} section arms.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <span>All associated section arms and enrolled students will automatically retain this new tier designation.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingLevel(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editLevelName.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>

      {/* 2. Edit Class Section Arm Modal */}
      <ModalPortal isOpen={Boolean(editingArm)} onClose={() => setEditingArm(null)}>
        {editingArm && (
          <div className="modal-container max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Pencil size={15} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                    Edit Class Section Arm
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Modify class arm name, parent tier, room, and capacity.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingArm(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveArmEdit} className="space-y-4 p-5">
              <div>
                <label className="input-label">Class Section Arm Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. JS 1 Alpha, SS 2 Commercial"
                  value={editArmName}
                  onChange={e => setEditArmName(e.target.value)}
                  className="input-control font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Parent Class Level Tier</label>
                  <select
                    value={editArmLevelId}
                    onChange={e => setEditArmLevelId(e.target.value)}
                    className="select-control font-semibold"
                  >
                    {classLevels.map(lvl => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} Tier
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Room / Building Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 201, Block A"
                    value={editArmRoom}
                    onChange={e => setEditArmRoom(e.target.value)}
                    className="input-control"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Student Capacity Limit</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={editArmCapacity}
                  onChange={e => setEditArmCapacity(Number(e.target.value) || 35)}
                  className="input-control font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Currently {students.filter(s => s.classSectionId === editingArm.id).length} active students enrolled.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingArm(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editArmName.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>

      {/* 3. Edit Subject Modal */}
      <ModalPortal isOpen={Boolean(editingSubject)} onClose={() => setEditingSubject(null)}>
        {editingSubject && (
          <div className="modal-container max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Pencil size={15} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                    Edit Curriculum Subject
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Rename subject, adjust code, or change category track.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubjectEdit} className="space-y-4 p-5">
              <div>
                <label className="input-label">Subject Official Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Further Mathematics"
                  value={editSubjectName}
                  onChange={e => setEditSubjectName(e.target.value)}
                  className="input-control font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MTH101"
                    value={editSubjectCode}
                    onChange={e => setEditSubjectCode(e.target.value.toUpperCase())}
                    className="input-control font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={editSubjectCategory}
                    onChange={e => setEditSubjectCategory(e.target.value as any)}
                    className="select-control font-medium"
                  >
                    <option value="CORE">CORE (Compulsory)</option>
                    <option value="ELECTIVE">ELECTIVE</option>
                    <option value="VOCATIONAL">VOCATIONAL</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Updates immediately reflect on Teacher Assignment sheets, Score Entry workbooks, and Official Transcripts.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editSubjectName.trim() || !editSubjectCode.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Save size={14} />
                  <span>Save Subject</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>

      {/* 4. Delete Subject Confirmation Modal */}
      <ModalPortal isOpen={Boolean(deletingSubject)} onClose={() => setDeletingSubject(null)}>
        {deletingSubject && (
          <div className="modal-container max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold font-heading">
                  Delete Curriculum Subject?
                </h3>
              </div>
              <button
                onClick={() => setDeletingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deletingSubject.name} ({deletingSubject.code})</strong> from the curriculum?
              </p>

              {teacherAssignments.filter(a => a.subjectId === deletingSubject.id).length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  ⚠️ Note: {teacherAssignments.filter(a => a.subjectId === deletingSubject.id).length} teacher allocation(s) are currently attached to this subject.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setDeletingSubject(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSubject}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Delete Subject</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>

      {/* 5. Delete Class Level Confirmation Modal */}
      <ModalPortal isOpen={Boolean(deletingLevel)} onClose={() => setDeletingLevel(null)}>
        {deletingLevel && (
          <div className="modal-container max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold font-heading">
                  Delete Class Tier?
                </h3>
              </div>
              <button
                onClick={() => setDeletingLevel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deletingLevel.name} Tier</strong>?
              </p>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
                <p className="font-bold">⚠️ Warning:</p>
                <p>
                  Deleting this tier will also remove all {classSections.filter(c => c.classLevelId === deletingLevel.id).length} associated section arms.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setDeletingLevel(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteLevel}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Delete Tier</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>

      {/* 6. Delete Class Arm Confirmation Modal */}
      <ModalPortal isOpen={Boolean(deletingArm)} onClose={() => setDeletingArm(null)}>
        {deletingArm && (
          <div className="modal-container max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold font-heading">
                  Delete Class Section Arm?
                </h3>
              </div>
              <button
                onClick={() => setDeletingArm(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to delete class arm <strong className="text-[var(--text-primary)]">{deletingArm.name}</strong>?
              </p>

              {students.filter(s => s.classSectionId === deletingArm.id).length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  ⚠️ Note: {students.filter(s => s.classSectionId === deletingArm.id).length} student(s) currently belong to this arm.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setDeletingArm(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteArm}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Delete Arm</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
