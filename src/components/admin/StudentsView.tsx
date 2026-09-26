import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  X,
  Eye,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Upload,
  Trash2,
  Image as ImageIcon,
  Check,
  UserCheck,
} from 'lucide-react';
import type { Student } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import { rankParentsForStudent } from '../../utils/studentParentMatcher';

export const StudentsView: React.FC = () => {
  const {
    students,
    classSections,
    parents,
    allUsers,
    studentProfiles,
    createStudent,
    updateStudentStatus,
    updateStudentAvatar,
    removeStudentAvatar,
    linkStudentToParent,
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [linkParentModalStudent, setLinkParentModalStudent] = useState<Student | null>(null);
  const [parentToLinkId, setParentToLinkId] = useState<string>('');
  const [linkParentSearchInput, setLinkParentSearchInput] = useState('');
  const [linkParentSearchQuery, setLinkParentSearchQuery] = useState('');

  // Form states for new student
  const [formData, setFormData] = useState({
    name: '',
    admissionNumber: `TCS/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    classSectionId: classSections[0]?.id || '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dob: '2013-05-15',
    parentId: '',
    avatar: '',
  });

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);

  // Calculate top statistics
  const totalEnrolled = students.length;
  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const maleCount = students.filter(s => s.gender === 'MALE').length;
  const femaleCount = students.filter(s => s.gender === 'FEMALE').length;
  const unlinkedCount = students.filter(s => s.parentIds.length === 0).length;

  // Filter students
  const filteredStudents = students.filter(student => {
    const name = studentProfiles[student.userId]?.name || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClassFilter === 'ALL' || student.classSectionId === selectedClassFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' || student.status === selectedStatusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleCreatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, avatar: result }));
      }
    };
    reader.readAsDataURL(file);
    if (createFileInputRef.current) createFileInputRef.current.value = '';
  };

  const handleDetailPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudentForDetail) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateStudentAvatar(selectedStudentForDetail.id, result);
      }
    };
    reader.readAsDataURL(file);
    if (detailFileInputRef.current) detailFileInputRef.current.value = '';
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classSectionId) return;

    createStudent({
      name: formData.name.trim(),
      admissionNumber: formData.admissionNumber.trim(),
      classSectionId: formData.classSectionId,
      gender: formData.gender,
      dob: formData.dob,
      parentId: formData.parentId ? formData.parentId : undefined,
      avatar: formData.avatar || undefined,
    });

    setShowCreateModal(false);
    setFormData({
      name: '',
      admissionNumber: `TCS/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      classSectionId: classSections[0]?.id || '',
      gender: 'MALE',
      dob: '2013-05-15',
      parentId: '',
      avatar: '',
    });
  };

  const rankedParentsForLink = useMemo(() => {
    if (!linkParentModalStudent) return [];
    const studentName = studentProfiles[linkParentModalStudent.userId]?.name || '';
    return rankParentsForStudent({
      studentName,
      parents,
      allUsers,
      searchQuery: linkParentSearchQuery || linkParentSearchInput,
    });
  }, [linkParentModalStudent, studentProfiles, parents, allUsers, linkParentSearchQuery, linkParentSearchInput]);

  const handleLinkParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkParentModalStudent && parentToLinkId) {
      linkStudentToParent(linkParentModalStudent.id, parentToLinkId);
      setLinkParentModalStudent(null);
      setParentToLinkId('');
      setLinkParentSearchInput('');
      setLinkParentSearchQuery('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[10px]">Academic Directory</span>
            <span className="text-xs text-[var(--text-secondary)]">Institutional Cohort</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Student Management & Enrollment
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage student profiles, JS 1–JSS 3 & SS 1–SS 3 class allocations, laptop photo uploads, and parent linkages.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md self-start sm:self-auto shadow-md shadow-indigo-600/30"
        >
          <Plus size={16} />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Top Quick Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Students
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {totalEnrolled}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">{activeCount} Active</span>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Gender Balance
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {maleCount}M / {femaleCount}F
          </div>
          <span className="text-[11px] text-indigo-400 font-semibold">Equal Distribution</span>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Class Sections
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {classSections.length}
          </div>
          <span className="text-[11px] text-cyan-400 font-semibold">JS 1–JSS 3 & SS 1–SS 3</span>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Guardian Linkage
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {totalEnrolled - unlinkedCount}/{totalEnrolled}
          </div>
          <span className="text-[11px] text-amber-400 font-semibold">
            {unlinkedCount > 0 ? `${unlinkedCount} Unlinked` : '100% Linked'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by full name or admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control !pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs text-[var(--text-secondary)]">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Classes (JS 1–SS 3)</option>
              {classSections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-secondary)]">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-card overflow-hidden">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Profile</th>
                <th>Admission No</th>
                <th>Class Section</th>
                <th>Gender / DOB</th>
                <th>Linked Guardian</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-[var(--text-muted)] space-y-2">
                    <Sparkles size={24} className="mx-auto text-indigo-400/40" />
                    <p>No students match your search filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const profile = studentProfiles[student.userId] || {
                    name: 'Student Name',
                    avatar: '',
                  };
                  const classSec = classSections.find(c => c.id === student.classSectionId);
                  const linkedParents = parents.filter(p => student.parentIds.includes(p.id));

                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={profile.name}
                            avatar={profile.avatar}
                            size="md"
                          />
                          <div>
                            <span className="font-bold text-xs text-[var(--text-primary)] block font-heading">
                              {profile.name}
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)]">
                              Enrolled: {student.admissionDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {student.admissionNumber}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {classSec?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs">
                          <span className="font-semibold text-[var(--text-primary)]">{student.gender}</span>
                          <span className="text-[var(--text-muted)] block text-[11px]">DOB: {student.dob}</span>
                        </div>
                      </td>
                      <td>
                        {linkedParents.length > 0 ? (
                          <div className="space-y-1">
                            {linkedParents.map(p => {
                              const parentUser = allUsers.find(u => u.id === p.userId);
                              return (
                                <div key={p.id} className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                                  <Users size={12} />
                                  <span>{parentUser?.name || 'Parent'}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setLinkParentModalStudent(student);
                              setParentToLinkId(parents[0]?.id || '');
                            }}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
                          >
                            <Plus size={11} />
                            <span>Link Guardian</span>
                          </button>
                        )}
                      </td>
                      <td>
                        <select
                          value={student.status}
                          onChange={(e) => updateStudentStatus(student.id, e.target.value as Student['status'])}
                          className={`select-control !w-auto !py-1 !px-2 !text-[11px] font-bold rounded-lg cursor-pointer ${
                            student.status === 'ACTIVE'
                              ? '!bg-emerald-500/15 !text-emerald-300 !border-emerald-500/30'
                              : student.status === 'INACTIVE'
                              ? '!bg-slate-500/15 !text-slate-400 !border-slate-500/30'
                              : '!bg-amber-500/15 !text-amber-300 !border-amber-500/30'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="TRANSFERRED">TRANSFERRED</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs"
                          title="View Complete Student Profile & Manage Photo"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Inspection Modal / Drawer */}
      <ModalPortal isOpen={Boolean(selectedStudentForDetail)} onClose={() => setSelectedStudentForDetail(null)}>
        {selectedStudentForDetail && (
          <div
            className="modal-content p-6 space-y-6 max-w-lg w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={detailFileInputRef}
                  onChange={handleDetailPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <UserAvatar
                  name={studentProfiles[selectedStudentForDetail.userId]?.name}
                  avatar={studentProfiles[selectedStudentForDetail.userId]?.avatar}
                  size="xl"
                  shape="rounded"
                  editable={true}
                  onUpload={(url) => updateStudentAvatar(selectedStudentForDetail.id, url)}
                  onRemove={() => removeStudentAvatar(selectedStudentForDetail.id)}
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                    {studentProfiles[selectedStudentForDetail.userId]?.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {selectedStudentForDetail.admissionNumber}
                    </span>
                    <span className="badge badge-success text-[10px]">
                      {selectedStudentForDetail.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Action Row */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <ImageIcon size={16} className="text-blue-500" />
                <span>
                  {studentProfiles[selectedStudentForDetail.userId]?.avatar
                    ? 'Photo attached from laptop'
                    : 'No photo attached (using initials)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => detailFileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm !text-xs !py-1 !px-2.5 flex items-center gap-1.5"
                >
                  <Upload size={12} />
                  <span>{studentProfiles[selectedStudentForDetail.userId]?.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
                {studentProfiles[selectedStudentForDetail.userId]?.avatar && (
                  <button
                    type="button"
                    onClick={() => removeStudentAvatar(selectedStudentForDetail.id)}
                    className="btn btn-secondary btn-sm !text-xs !py-1 !px-2 text-rose-500 hover:text-rose-600"
                    title="Remove Photo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Class Arm</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {classSections.find(c => c.id === selectedStudentForDetail.classSectionId)?.name || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Gender</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedStudentForDetail.gender}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Date of Birth</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedStudentForDetail.dob}
                </span>
              </div>
            </div>

            {/* Linked Guardians */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Users size={14} className="text-amber-500" />
                <span>Linked Guardians & Emergency Contacts</span>
              </h4>
              {parents.filter(p => selectedStudentForDetail.parentIds.includes(p.id)).length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  No guardian linked to this student profile yet.
                </div>
              ) : (
                parents
                  .filter(p => selectedStudentForDetail.parentIds.includes(p.id))
                  .map(p => {
                    const parentUser = allUsers.find(u => u.id === p.userId);
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {parentUser?.name} ({p.occupation})
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Phone size={11} /> {parentUser?.phone}</span>
                            <span className="flex items-center gap-1"><Mail size={11} /> {parentUser?.email}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin size={11} /> {p.address}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="btn btn-secondary btn-md"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </ModalPortal>

      {/* Enroll Student Modal */}
      <ModalPortal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div
          className="modal-content p-5 sm:p-6 space-y-3.5 max-w-xl w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-scale-up my-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                  Enroll New Student
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Register student admission & link guardian
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <input
              type="file"
              ref={createFileInputRef}
              onChange={handleCreatePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Row 1: Photo & Full Name */}
            <div className="flex items-start gap-3.5">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <UserAvatar
                  name={formData.name || 'New Student'}
                  avatar={formData.avatar}
                  size="lg"
                  shape="rounded"
                />
                <button
                  type="button"
                  onClick={() => createFileInputRef.current?.click()}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={10} />
                  <span>{formData.avatar ? 'Change' : 'Photo'}</span>
                </button>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                    className="text-[10px] text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Full Name of Student <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chukwudi Adeleke"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  First Name, Middle Name & Surname
                </p>
              </div>
            </div>

            {/* Row 2: Admission Number & Class Arm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Admission Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.admissionNumber}
                  onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Class Section Arm
                </label>
                <select
                  value={formData.classSectionId}
                  onChange={e => setFormData({ ...formData, classSectionId: e.target.value })}
                  className="select-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                >
                  {classSections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Gender & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="select-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Row 4: Link Guardian */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                Link Guardian (Optional)
              </label>
              <select
                value={formData.parentId}
                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                className="select-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
              >
                <option value="">— Select Registered Guardian (Optional) —</option>
                {parents.map(p => {
                  const u = allUsers.find(x => x.id === p.userId);
                  return (
                    <option key={p.id} value={p.id}>
                      {u?.name} ({p.occupation})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-sm !py-1.5 !px-3 !text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm !py-1.5 !px-4 !text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Complete Enrollment
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Link Parent Modal */}
      <ModalPortal isOpen={Boolean(linkParentModalStudent)} onClose={() => setLinkParentModalStudent(null)}>
        {linkParentModalStudent && (() => {
          const studentName = studentProfiles[linkParentModalStudent.userId]?.name || 'Student';
          const suggestedMatches = rankedParentsForLink.filter(p => p.isMatched);

          return (
            <div
              className="modal-content p-5 space-y-4 max-w-lg w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                      Link Guardian to Student
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Linking parent profile for <strong>{studentName}</strong> ({linkParentModalStudent.admissionNumber})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLinkParentModalStudent(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLinkParentSubmit} className="space-y-3.5">
                {/* Auto-matching scan banner */}
                <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200 min-w-0">
                    <Sparkles size={13} className="text-amber-500 flex-shrink-0 animate-pulse" />
                    <span className="truncate">
                      Scanning parents matching surname or first name of <strong>{studentName}</strong>:
                    </span>
                    <span className="badge badge-warning text-[10px] font-bold flex-shrink-0">
                      {suggestedMatches.length} suggested match{suggestedMatches.length === 1 ? '' : 'es'} at top
                    </span>
                  </div>
                </div>

                {/* Search Bar with Input & Explicit Search Button */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search guardian name, occupation, phone..."
                      value={linkParentSearchInput}
                      onChange={e => setLinkParentSearchInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setLinkParentSearchQuery(linkParentSearchInput.trim());
                        }
                      }}
                      className="input-control !w-full !pl-9 !pr-8 !py-2 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                    />
                    {linkParentSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLinkParentSearchInput('');
                          setLinkParentSearchQuery('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkParentSearchQuery(linkParentSearchInput.trim())}
                    className="btn btn-secondary btn-sm !py-2 !px-3.5 !text-xs flex items-center gap-1.5 font-bold flex-shrink-0 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs"
                  >
                    <Search size={13} />
                    <span>Search</span>
                  </button>
                </div>

                {/* Ranked Parent Selection List */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto bg-slate-50/40 dark:bg-slate-900/40">
                  {rankedParentsForLink.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No guardians found matching your search.
                    </div>
                  ) : (
                    rankedParentsForLink.map(item => {
                      const isAlreadyLinked = linkParentModalStudent.parentIds.includes(item.parent.id);
                      const isSelected = parentToLinkId === item.parent.id;

                      return (
                        <div
                          key={item.parent.id}
                          onClick={() => {
                            if (!isAlreadyLinked) {
                              setParentToLinkId(item.parent.id);
                            }
                          }}
                          className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                            isAlreadyLinked
                              ? 'bg-slate-100/70 dark:bg-slate-800/40 opacity-70 cursor-not-allowed'
                              : isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 cursor-pointer'
                              : item.isMatched
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="radio"
                              name="selectedParent"
                              disabled={isAlreadyLinked}
                              checked={isAlreadyLinked || isSelected}
                              onChange={() => {}}
                              className="text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </span>
                                {item.isMatched && !isAlreadyLinked && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                                    <Sparkles size={10} />
                                    <span>{item.matchReason}</span>
                                  </span>
                                )}
                                {isAlreadyLinked && (
                                  <span className="badge badge-success text-[9px] py-0.5 flex items-center gap-1">
                                    <Check size={10} />
                                    <span>Already Linked</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span>{item.occupation || 'Guardian'}</span>
                                {item.phone && (
                                  <>
                                    <span>•</span>
                                    <span>{item.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isAlreadyLinked ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                                Current Guardian
                              </span>
                            ) : (
                              <button
                                type="button"
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLinkParentModalStudent(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!parentToLinkId}
                    className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold"
                  >
                    Confirm Linkage
                  </button>
                </div>
              </form>
            </div>
          );
        })()}
      </ModalPortal>
    </div>
  );
};
