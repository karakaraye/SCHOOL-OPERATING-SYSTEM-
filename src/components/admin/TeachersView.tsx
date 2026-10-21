import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  UserCheck,
  Plus,
  Search,
  Award,
  Phone,
  Mail,
  Trash2,
  X,
  Layers,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import type { Teacher } from '../../types';

export const TeachersView: React.FC = () => {
  const {
    teachers,
    allUsers,
    teacherAssignments,
    classSections,
    subjects,
    createTeacher,
    updateTeacherCredentials,
    assignTeacher,
    removeTeacherAssignment,
    switchUser,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'CREDENTIALS'>('DIRECTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<Teacher | null>(null);

  // Password reset modal state
  const [resetTeacher, setResetTeacher] = useState<Teacher | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form states
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    email: '',
    phone: '',
    staffId: `STAFF/2026/${Math.floor(100 + Math.random() * 900)}`,
    qualification: 'B.Sc (Ed), M.Sc',
    specialization: 'Mathematics & Computing',
    password: 'teacher123',
  });

  const [assignFormData, setAssignFormData] = useState({
    classSectionId: classSections[0]?.id || '',
    subjectId: subjects[0]?.id || '',
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'Teach#';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const filteredTeachers = teachers.filter(teacher => {
    const user = allUsers.find(u => u.id === teacher.userId);
    const name = user?.name || '';
    const email = user?.email || '';
    const staffId = teacher.staffId || '';
    const spec = teacher.specialization || '';

    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      staffId.toLowerCase().includes(q) ||
      spec.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFormData.name.trim() || !teacherFormData.email.trim()) return;

    createTeacher({
      name: teacherFormData.name.trim(),
      email: teacherFormData.email.trim(),
      phone: teacherFormData.phone.trim(),
      staffId: teacherFormData.staffId.trim(),
      qualification: teacherFormData.qualification.trim(),
      specialization: teacherFormData.specialization.trim(),
      password: teacherFormData.password.trim() || 'teacher123',
    });

    setShowCreateModal(false);
    setSuccessNotice(`Teacher login created for ${teacherFormData.name} (Email: ${teacherFormData.email}, Password: ${teacherFormData.password}).`);
    setTimeout(() => setSuccessNotice(null), 4000);

    setTeacherFormData({
      name: '',
      email: '',
      phone: '',
      staffId: `STAFF/2026/${Math.floor(100 + Math.random() * 900)}`,
      qualification: 'B.Sc (Ed), M.Sc',
      specialization: 'General Sciences',
      password: 'teacher123',
    });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacherForAssign && assignFormData.classSectionId && assignFormData.subjectId) {
      assignTeacher(
        selectedTeacherForAssign.id,
        assignFormData.classSectionId,
        assignFormData.subjectId
      );
      setShowAssignModal(false);
      setSuccessNotice('Class teaching allocation confirmed.');
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  const handleCopyCredentials = (teacher: Teacher) => {
    const user = allUsers.find(u => u.id === teacher.userId);
    if (!user) return;
    const text = `SchoolOS Teacher Portal Login Credentials:\nStaff ID: ${teacher.staffId}\nEmail: ${user.email}\nDefault Password: ${user.password || 'teacher123'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(teacher.id);
    setTimeout(() => setCopiedId(null), 2500);
    setSuccessNotice(`Login credentials copied for ${user.name}`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTeacher || !newResetPassword.trim()) return;

    updateTeacherCredentials(resetTeacher.id, {
      password: newResetPassword.trim(),
    });

    const user = allUsers.find(u => u.id === resetTeacher.userId);
    setResetTeacher(null);
    setNewResetPassword('');
    setSuccessNotice(`Password updated successfully for ${user?.name}.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const toggleReveal = (teacherId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan text-[10px]">Faculty Administration</span>
            <span className="text-xs text-[var(--text-secondary)]">Staff Directory & Credentials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Faculty Directory & Teacher Login Accounts
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Create teacher login accounts, manage default passwords, copy login credentials, and allocate teaching assignments.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-md shadow-md shadow-indigo-600/30 flex items-center gap-1.5 bg-indigo-600 text-white font-bold"
          >
            <Plus size={16} />
            <span>Create Teacher Login</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DIRECTORY'
              ? 'border-indigo-600 text-indigo-600 font-heading'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck size={16} />
          <span>Faculty Directory & Allocations ({teachers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CREDENTIALS')}
          className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'CREDENTIALS'
              ? 'border-indigo-600 text-indigo-600 font-heading'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <KeyRound size={16} />
          <span>Faculty Login Credentials & Access Control</span>
        </button>
      </div>

      {/* Success Notice Banner */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Faculty
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {teachers.length}
          </div>
          <span className="text-[11px] text-cyan-600 font-semibold">100% Active Logins</span>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Assignments
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {teacherAssignments.length}
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold">Class/Subject Pairs</span>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Curriculum Subjects
          </span>
          <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
            {subjects.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Fully Staffed</span>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Default Password
          </span>
          <div className="text-xl font-mono font-extrabold text-[var(--text-primary)] mt-1">
            teacher123
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">Customizable per staff</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, staff ID, login email, or subject specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control !pl-10 !bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Faculty Directory Grid */}
      {activeTab === 'DIRECTORY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeachers.map(teacher => {
            const user = allUsers.find(u => u.id === teacher.userId);
            const assignments = teacherAssignments.filter(a => a.teacherId === teacher.id);

            return (
              <div
                key={teacher.id}
                className="glass-card glass-card-hover p-6 flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <UserAvatar
                        name={user?.name || 'Faculty'}
                        avatar={user?.avatar}
                        size="lg"
                        shape="rounded"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
                          {user?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                            {teacher.staffId}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {teacher.qualification}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-cyan text-[10px] font-bold">Academic Staff</span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 flex-shrink-0" />
                      <span>{user?.phone}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Award size={13} className="text-indigo-600 flex-shrink-0" />
                    <span>Specialization: <strong className="text-[var(--text-primary)]">{teacher.specialization}</strong></span>
                  </div>
                </div>

                {/* Teaching Assignments */}
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <Layers size={12} className="text-indigo-600" />
                      <span>Assigned Loads ({assignments.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTeacherForAssign(teacher);
                        setShowAssignModal(true);
                      }}
                      className="btn btn-secondary btn-sm !py-1 !px-2 text-xs text-indigo-600"
                    >
                      <Plus size={12} />
                      <span>Allocate Load</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {assignments.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No class assigned yet.</span>
                    ) : (
                      assignments.map(asgn => {
                        const classSec = classSections.find(c => c.id === asgn.classSectionId);
                        const subj = subjects.find(s => s.id === asgn.subjectId);

                        return (
                          <div
                            key={asgn.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                          >
                            <span className="font-bold text-indigo-600">{classSec?.name}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-[var(--text-secondary)]">{subj?.name}</span>
                            <button
                              onClick={() => removeTeacherAssignment(asgn.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 ml-1"
                              title="Remove assignment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Faculty Login Credentials & Access Control Table */}
      {activeTab === 'CREDENTIALS' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                Teacher Login Credentials Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Staff can log in with their email address or Staff ID alongside their assigned password.
              </p>
            </div>
            <span className="badge badge-primary text-xs font-bold">
              {teachers.length} Active Credentials
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher / Staff Member</th>
                  <th>Staff ID</th>
                  <th>Login Email</th>
                  <th>Password</th>
                  <th>Account Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => {
                  const user = allUsers.find(u => u.id === teacher.userId);
                  const isRevealed = revealedPasswords[teacher.id] || false;
                  const currentPassword = user?.password || 'teacher123';

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={user?.name || 'Faculty'}
                            avatar={user?.avatar}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 block font-heading">
                              {user?.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {teacher.specialization}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {teacher.staffId}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-800 font-medium">
                          {user?.email}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {isRevealed ? currentPassword : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(teacher.id)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title={isRevealed ? 'Hide Password' : 'Show Password'}
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success text-[10px] font-bold">
                          Active Login
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(teacher)}
                            className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 text-slate-700"
                            title="Copy Login Credentials"
                          >
                            <Copy size={12} />
                            <span>{copiedId === teacher.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetTeacher(teacher);
                              setNewResetPassword(generateRandomPassword());
                            }}
                            className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                            title="Reset Password"
                          >
                            <KeyRound size={12} />
                            <span>Reset</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (user) {
                                switchUser(user.id);
                              }
                            }}
                            className="btn btn-primary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 bg-indigo-600 text-white font-bold"
                            title="Sign in directly as this teacher"
                          >
                            <span>Test Login</span>
                            <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboard Teacher & Create Login Modal */}
      <ModalPortal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div
          className="modal-content p-5 sm:p-6 space-y-3.5 max-w-xl w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-scale-up my-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                  Onboard Teacher
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Create faculty account credentials & profile
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
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Full Name & Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jonathan Agbo (Ph.D)"
                  value={teacherFormData.name}
                  onChange={e => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Official Login Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="jonathan.agbo@namelessschool.edu"
                  value={teacherFormData.email}
                  onChange={e => setTeacherFormData({ ...teacherFormData, email: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Row 2: Staff ID & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Staff ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherFormData.staffId}
                  onChange={e => setTeacherFormData({ ...teacherFormData, staffId: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 802 000 0000"
                  value={teacherFormData.phone}
                  onChange={e => setTeacherFormData({ ...teacherFormData, phone: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Row 3: Initial Password & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Initial Password
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    required
                    value={teacherFormData.password}
                    onChange={e => setTeacherFormData({ ...teacherFormData, password: e.target.value })}
                    className="input-control !w-full !py-1.5 !px-2.5 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setTeacherFormData(prev => ({ ...prev, password: generateRandomPassword() }))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 flex-shrink-0"
                    title="Generate Strong Password"
                  >
                    <Sparkles size={13} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Subject Specialization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics & Mathematics"
                  value={teacherFormData.specialization}
                  onChange={e => setTeacherFormData({ ...teacherFormData, specialization: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Row 4: Qualifications */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                Academic Qualifications
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B.Sc (Ed), M.Sc Physics"
                value={teacherFormData.qualification}
                onChange={e => setTeacherFormData({ ...teacherFormData, qualification: e.target.value })}
                className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-sm !py-1.5 !px-3 !text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm !py-1.5 !px-4 !text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Create Teacher Login
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Reset Password Modal */}
      <ModalPortal isOpen={Boolean(resetTeacher)} onClose={() => setResetTeacher(null)}>
        {resetTeacher && (
          <div
            className="modal-content max-w-sm w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold font-heading text-base">
                <KeyRound size={18} />
                <span>Reset Teacher Password</span>
              </div>
              <button
                onClick={() => setResetTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Set a new password for{' '}
                <strong>{allUsers.find(u => u.id === resetTeacher.userId)?.name}</strong>:
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  New Password
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    value={newResetPassword}
                    onChange={e => setNewResetPassword(e.target.value)}
                    className="input-control !w-full !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(generateRandomPassword())}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
                    title="Generate random password"
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetTeacher(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>

      {/* Allocate Class Subject Modal */}
      <ModalPortal isOpen={Boolean(showAssignModal && selectedTeacherForAssign)} onClose={() => setShowAssignModal(false)}>
        {showAssignModal && selectedTeacherForAssign && (
          <div
            className="modal-content max-w-md w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                Allocate Teaching Load
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Assign a class arm and curriculum subject to{' '}
                <strong>{allUsers.find(u => u.id === selectedTeacherForAssign.userId)?.name}</strong>.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Class Section Arm
                </label>
                <select
                  value={assignFormData.classSectionId}
                  onChange={e => setAssignFormData({ ...assignFormData, classSectionId: e.target.value })}
                  className="select-control !w-full !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                >
                  {classSections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Curriculum Subject
                </label>
                <select
                  value={assignFormData.subjectId}
                  onChange={e => setAssignFormData({ ...assignFormData, subjectId: e.target.value })}
                  className="select-control !w-full !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
