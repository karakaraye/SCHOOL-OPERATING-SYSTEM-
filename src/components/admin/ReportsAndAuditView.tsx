import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  ClipboardList,
  Printer,
  ShieldCheck,
  Search,
  School as SchoolIcon,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import type { UserRole } from '../../types';

export const ReportsAndAuditView: React.FC = () => {
  const {
    auditLogs,
    classSections,
    students,
    studentProfiles,
    parents,
    allUsers,
    teachers,
    school,
    currentSession,
    currentTerm,
    updateUserPassword,
    switchUser,
  } = useSchool();

  const [activeReportTab, setActiveReportTab] = useState<'audit' | 'roster' | 'passwords'>('audit');
  const [selectedClassId, setSelectedClassId] = useState<string>(classSections[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Password Management State
  const [passwordUserModal, setPasswordUserModal] = useState<{ id: string; name: string; email: string; role: UserRole } | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passNotice, setPassNotice] = useState<string | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'School#';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleCopyCredentials = (u: { id: string; name: string; email: string; role: string; password?: string }) => {
    const defaultPass = u.role.includes('ADMIN') ? 'admin' : u.role === 'TEACHER' ? 'teacher123' : 'parent123';
    const text = `SchoolOS Institutional Access Slip:\nName: ${u.name}\nRole: ${u.role}\nEmail: ${u.email}\nPassword: ${u.password || defaultPass}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
    setPassNotice(`Access credentials copied for ${u.name}`);
    setTimeout(() => setPassNotice(null), 3000);
  };

  const handleUpdatePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserModal || !newPasswordVal.trim()) return;

    updateUserPassword(passwordUserModal.id, newPasswordVal.trim());
    setPassNotice(`Password successfully set for ${passwordUserModal.name} (${passwordUserModal.role}).`);
    setTimeout(() => setPassNotice(null), 3500);
    setPasswordUserModal(null);
    setNewPasswordVal('');
  };

  const toggleReveal = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  // Filtered users for password management
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedClass = classSections.find(c => c.id === selectedClassId) || classSections[0];
  const enrolledStudents = students.filter(
    s => s.classSectionId === selectedClassId && s.status === 'ACTIVE'
  );

  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[10px]">Governance & Compliance</span>
            <span className="text-xs text-[var(--text-secondary)]">Immutable Trail & Access Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            System Reports & Access Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Review security audit logs, manage institutional passwords for all roles, and generate official printable Master Class Rosters.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-card)] p-1.5 rounded-xl border border-[var(--border-subtle)] flex-wrap">
          <button
            onClick={() => setActiveReportTab('audit')}
            className={`btn btn-sm ${activeReportTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldCheck size={14} />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => setActiveReportTab('passwords')}
            className={`btn btn-sm ${activeReportTab === 'passwords' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <KeyRound size={14} />
            <span>User Credentials & Passwords</span>
          </button>
          <button
            onClick={() => setActiveReportTab('roster')}
            className={`btn btn-sm ${activeReportTab === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ClipboardList size={14} />
            <span>Master Class Roster</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {passNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium animate-fade-in shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{passNotice}</span>
        </div>
      )}

      {/* Tab 1: Audit Log Trail */}
      {activeReportTab === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Ribbon */}
          <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by actor, action keyword, or details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-control !pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-bold">Category:</span>
              <select
                value={entityFilter}
                onChange={e => setEntityFilter(e.target.value)}
                className="select-control !w-auto !py-1 !px-2.5 !text-xs font-semibold cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="SCORE_SUBMISSION">Score Submissions & Approvals</option>
                <option value="ATTENDANCE">Attendance Recordings</option>
                <option value="STUDENT">Student Enrollment</option>
                <option value="TEACHER">Faculty & Allocations</option>
                <option value="PARENT">Parent Linkage</option>
                <option value="ACADEMIC_SETUP">Academic Setup</option>
                <option value="SECURITY">Security & Sessions</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="glass-card overflow-hidden">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor Profile</th>
                    <th>Event Category</th>
                    <th>Details & Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm text-[var(--text-muted)] space-y-2">
                        <Sparkles size={24} className="mx-auto text-indigo-400/40" />
                        <p>No audit logs matching this search filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id}>
                        <td>
                          <span className="font-mono text-xs text-[var(--text-secondary)]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="font-bold font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="font-bold text-xs text-[var(--text-primary)] block">
                              {log.userName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {log.userRole}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-cyan text-[9px]">
                            {log.entityType}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-[var(--text-secondary)] leading-snug">
                            {log.details}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: All Users Passwords & Credential Management */}
      {activeReportTab === 'passwords' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Ribbon */}
          <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search institutional user accounts by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-control !pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-bold">Role Filter:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="select-control !w-auto !py-1 !px-2.5 !text-xs font-semibold cursor-pointer"
              >
                <option value="ALL">All Roles ({allUsers.length})</option>
                <option value="SUPER_ADMIN">Super Admins</option>
                <option value="SCHOOL_ADMIN">School Admins</option>
                <option value="TEACHER">Faculty (Teachers)</option>
                <option value="PARENT">Guardians (Parents)</option>
              </select>
            </div>
          </div>

          {/* Users & Passwords Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Institutional Role</th>
                  <th>Login Email / Identifier</th>
                  <th>Current Password</th>
                  <th>Account Status</th>
                  <th className="text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-xs text-slate-400">
                      No user accounts found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isRevealed = revealedPasswords[u.id];
                    const defaultPass = u.role.includes('ADMIN') ? 'admin' : u.role === 'TEACHER' ? 'teacher123' : 'parent123';
                    const currentPass = u.password || defaultPass;
                    const teacherProfile = teachers.find(t => t.userId === u.id);

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={u.name} avatar={u.avatar} size="sm" />
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block font-heading">
                                {u.name}
                              </span>
                              {teacherProfile && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Staff ID: {teacherProfile.staffId}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge text-[10px] font-bold ${
                              u.role === 'SUPER_ADMIN'
                                ? 'badge-primary'
                                : u.role === 'SCHOOL_ADMIN'
                                ? 'badge-cyan'
                                : u.role === 'TEACHER'
                                ? 'badge-success'
                                : 'badge-warning'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {u.email}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {isRevealed ? currentPass : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleReveal(u.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              title={isRevealed ? 'Hide Password' : 'Show Password'}
                            >
                              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-success text-[10px]">
                            ● Active
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(u)}
                              className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 text-slate-700 dark:text-slate-200"
                              title="Copy Login Slip"
                            >
                              <Copy size={12} />
                              <span>{copiedId === u.id ? 'Copied!' : 'Slip'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordUserModal(u);
                                setNewPasswordVal(generateRandomPassword());
                              }}
                              className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                              title="Set or Reset Password"
                            >
                              <KeyRound size={12} />
                              <span>Set Password</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => switchUser(u.id)}
                              className="btn btn-primary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 bg-indigo-600 text-white font-bold"
                              title="Test login as this user"
                            >
                              <span>Test</span>
                              <ArrowUpRight size={12} />
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
      )}

      {/* Tab 3: Master Class Roster */}
      {activeReportTab === 'roster' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls */}
          <div className="no-print glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-secondary)]">Select Class Section:</span>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="select-control !w-auto font-bold"
              >
                {classSections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button onClick={handlePrintRoster} className="btn btn-primary btn-md">
              <Printer size={16} />
              <span>Print Official Class Roster</span>
            </button>
          </div>

          {/* Printable Roster Sheet */}
          <div className="glass-card p-6 md:p-8 bg-[var(--bg-card-solid)] border-[var(--border-strong)] space-y-6">
            {/* Header */}
            <div className="text-center pb-4 border-b border-[var(--border-medium)] space-y-1">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md mb-2">
                <SchoolIcon size={24} />
              </div>
              <h2 className="text-xl font-black uppercase text-[var(--text-primary)] font-heading">
                {school.name}
              </h2>
              <p className="text-xs text-indigo-400 font-semibold italic">
                "{school.motto}"
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 text-xs text-[var(--text-secondary)]">
                <span>Academic Session: <strong>{currentSession.name}</strong></span>
                <span>•</span>
                <span>Active Term: <strong>{currentTerm.name}</strong></span>
                <span>•</span>
                <span>Class Arm: <strong className="text-indigo-400">{selectedClass?.name}</strong></span>
              </div>
            </div>

            {/* Roster Table */}
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Student Full Name</th>
                    <th>Admission No</th>
                    <th>Gender</th>
                    <th>Date of Birth</th>
                    <th>Linked Guardian</th>
                    <th>Guardian Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                        No active students enrolled in this section.
                      </td>
                    </tr>
                  ) : (
                    enrolledStudents.map((st, index) => {
                      const profile = studentProfiles[st.userId];
                      const firstParent = parents.find(p => st.parentIds.includes(p.id));
                      const parentUser = firstParent ? allUsers.find(u => u.id === firstParent.userId) : null;

                      return (
                        <tr key={st.id}>
                          <td className="font-bold text-xs">{index + 1}</td>
                          <td>
                            <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                              {profile?.name}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono text-xs text-indigo-400 font-semibold">
                              {st.admissionNumber}
                            </span>
                          </td>
                          <td>{st.gender}</td>
                          <td>{st.dob}</td>
                          <td>{parentUser?.name || '—'}</td>
                          <td>{parentUser?.phone || '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Total Enrolled Students: <strong>{enrolledStudents.length}</strong></span>
              <span>Generated on: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin User Password Modal */}
      <ModalPortal isOpen={Boolean(passwordUserModal)} onClose={() => setPasswordUserModal(null)}>
        {passwordUserModal && (
          <div
            className="modal-container max-w-sm w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold font-heading text-base">
                <KeyRound size={18} />
                <span>Super Admin: Set Password</span>
              </div>
              <button
                onClick={() => setPasswordUserModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Target Account</span>
                <div className="font-bold text-slate-900 text-sm">{passwordUserModal.name}</div>
                <div className="text-xs font-mono text-indigo-600">{passwordUserModal.email}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">Role: {passwordUserModal.role}</div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Password
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    value={newPasswordVal}
                    onChange={e => setNewPasswordVal(e.target.value)}
                    className="input-control !w-full !bg-white !text-slate-900 !border-slate-300 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPasswordVal(generateRandomPassword())}
                    className="p-2 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                    title="Generate Random Password"
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPasswordUserModal(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm bg-indigo-600 text-white font-bold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
