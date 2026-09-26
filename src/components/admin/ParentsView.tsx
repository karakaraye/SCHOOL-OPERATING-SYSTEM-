import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  X,
  Sparkles,
  Upload,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  GraduationCap,
  UserPlus,
  Check,
} from 'lucide-react';
import type { Parent } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import { rankStudentsForParent } from '../../utils/studentParentMatcher';

export const ParentsView: React.FC = () => {
  const {
    parents,
    allUsers,
    students,
    studentProfiles,
    classSections,
    createParent,
    updateParentAvatar,
    removeParentAvatar,
    updateParentCredentials,
    linkStudentToParent,
    linkMultipleStudentsToParent,
    switchUser,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'CREDENTIALS'>('DIRECTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [linkStudentModalParent, setLinkStudentModalParent] = useState<Parent | null>(null);

  // Multi-student selection for Link modal
  const [selectedStudentIdsToLink, setSelectedStudentIdsToLink] = useState<string[]>([]);
  const [linkModalSearchInput, setLinkModalSearchInput] = useState('');
  const [linkModalSearchQuery, setLinkModalSearchQuery] = useState('');

  // Search state for Onboard Guardian modal
  const [createModalSearchInput, setCreateModalSearchInput] = useState('');
  const [createModalSearchQuery, setCreateModalSearchQuery] = useState('');

  // Password reset modal state
  const [resetParent, setResetParent] = useState<Parent | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    address: '',
    linkStudentIds: [] as string[],
    avatar: '',
    password: 'parent123',
  });

  const createFileInputRef = useRef<HTMLInputElement>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'Parent#';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const filteredParents = parents.filter(parent => {
    const user = allUsers.find(u => u.id === parent.userId);
    const name = user?.name || '';
    const email = user?.email || '';
    const phone = user?.phone || '';
    const occ = parent.occupation || '';

    // Also check if matches any child name
    const childrenNames = parent.childrenStudentIds
      .map(id => {
        const s = students.find(st => st.id === id);
        return s ? studentProfiles[s.userId]?.name || '' : '';
      })
      .join(' ')
      .toLowerCase();

    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      occ.toLowerCase().includes(q) ||
      childrenNames.includes(q)
    );
  });

  // Computed ranked student list for Onboarding modal (auto-scans as parent name is typed)
  const createRankedStudents = useMemo(() => {
    return rankStudentsForParent({
      parentName: formData.name,
      students,
      studentProfiles,
      classSections,
      searchQuery: createModalSearchQuery || createModalSearchInput,
    });
  }, [formData.name, students, studentProfiles, classSections, createModalSearchQuery, createModalSearchInput]);

  // Suggested matches for Onboarding modal
  const createSuggestedMatches = useMemo(() => {
    return createRankedStudents.filter(s => s.isMatched);
  }, [createRankedStudents]);

  // Computed ranked student list for Link Modal (based on selected parent's name)
  const linkRankedStudents = useMemo(() => {
    if (!linkStudentModalParent) return [];
    const parentUser = allUsers.find(u => u.id === linkStudentModalParent.userId);
    return rankStudentsForParent({
      parentName: parentUser?.name || '',
      students,
      studentProfiles,
      classSections,
      searchQuery: linkModalSearchQuery || linkModalSearchInput,
    });
  }, [linkStudentModalParent, allUsers, students, studentProfiles, classSections, linkModalSearchQuery, linkModalSearchInput]);

  // Suggested matches for Link Modal (excluding students already linked)
  const linkSuggestedMatches = useMemo(() => {
    if (!linkStudentModalParent) return [];
    return linkRankedStudents.filter(
      s => s.isMatched && !linkStudentModalParent.childrenStudentIds.includes(s.student.id)
    );
  }, [linkRankedStudents, linkStudentModalParent]);

  const toggleStudentForCreate = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      linkStudentIds: prev.linkStudentIds.includes(studentId)
        ? prev.linkStudentIds.filter(id => id !== studentId)
        : [...prev.linkStudentIds, studentId],
    }));
  };

  const selectAllSuggestedForCreate = () => {
    const ids = createSuggestedMatches.map(s => s.student.id);
    setFormData(prev => ({
      ...prev,
      linkStudentIds: Array.from(new Set([...prev.linkStudentIds, ...ids])),
    }));
  };

  const clearCreateSelectedStudents = () => {
    setFormData(prev => ({ ...prev, linkStudentIds: [] }));
  };

  const toggleStudentForLink = (studentId: string) => {
    setSelectedStudentIdsToLink(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllSuggestedForLink = () => {
    const ids = linkSuggestedMatches.map(s => s.student.id);
    setSelectedStudentIdsToLink(prev => Array.from(new Set([...prev, ...ids])));
  };

  const clearLinkSelectedStudents = () => {
    setSelectedStudentIdsToLink([]);
  };

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    createParent({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      occupation: formData.occupation.trim(),
      address: formData.address.trim(),
      linkStudentIds: formData.linkStudentIds,
      avatar: formData.avatar || undefined,
      password: formData.password.trim() || 'parent123',
    });

    const count = formData.linkStudentIds.length;
    setShowCreateModal(false);
    setSuccessNotice(
      `Guardian ${formData.name} onboarded successfully${
        count > 0 ? ` with ${count} student ward${count > 1 ? 's' : ''} linked` : ''
      }. Initial password set to "${formData.password}".`
    );
    setTimeout(() => setSuccessNotice(null), 4000);

    setFormData({
      name: '',
      email: '',
      phone: '',
      occupation: '',
      address: '',
      linkStudentIds: [],
      avatar: '',
      password: 'parent123',
    });
    setCreateModalSearchInput('');
    setCreateModalSearchQuery('');
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkStudentModalParent && selectedStudentIdsToLink.length > 0) {
      if (linkMultipleStudentsToParent) {
        linkMultipleStudentsToParent(selectedStudentIdsToLink, linkStudentModalParent.id);
      } else {
        selectedStudentIdsToLink.forEach(id => linkStudentToParent(id, linkStudentModalParent.id));
      }
      const parentUser = allUsers.find(u => u.id === linkStudentModalParent.userId);
      const count = selectedStudentIdsToLink.length;
      setLinkStudentModalParent(null);
      setSelectedStudentIdsToLink([]);
      setLinkModalSearchInput('');
      setLinkModalSearchQuery('');
      setSuccessNotice(`Successfully linked ${count} student ward${count > 1 ? 's' : ''} to ${parentUser?.name || 'guardian'}.`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleCopyCredentials = (parent: Parent) => {
    const user = allUsers.find(u => u.id === parent.userId);
    if (!user) return;
    const text = `SchoolOS Guardian Portal Login Credentials:\nName: ${user.name}\nEmail: ${user.email}\nInitial Password: ${user.password || 'parent123'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(parent.id);
    setTimeout(() => setCopiedId(null), 2500);
    setSuccessNotice(`Guardian credentials copied for ${user.name}`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetParent || !newResetPassword.trim()) return;

    updateParentCredentials(resetParent.id, {
      password: newResetPassword.trim(),
    });

    const user = allUsers.find(u => u.id === resetParent.userId);
    setResetParent(null);
    setNewResetPassword('');
    setSuccessNotice(`Password updated successfully for guardian ${user?.name}.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const toggleReveal = (parentId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-warning text-[10px]">Guardian Network</span>
            <span className="text-xs text-[var(--text-secondary)]">Parent-School Portal & Access</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Parents & Guardians Directory
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage guardian contact credentials, initial login passwords, linked student wards across JS 1–SS 3, and communications.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'DIRECTORY'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('CREDENTIALS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'CREDENTIALS'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} />
              <span>Credentials & Access</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-md shadow-md shadow-indigo-600/30"
          >
            <Plus size={16} />
            <span>Onboard Guardian</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium animate-fade-in shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Tab 1: Directory Cards */}
      {activeTab === 'DIRECTORY' && (
        <>
          {/* Top Quick Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Registered Guardians
              </span>
              <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
                {parents.length}
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold">100% Verified Profiles</span>
            </div>

            <div className="glass-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Total Linked Wards
              </span>
              <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
                {parents.reduce((acc, p) => acc + p.childrenStudentIds.length, 0)}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Across JS 1–JSS 3 & SS 1–SS 3</span>
            </div>

            <div className="glass-card p-4 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Portal Access
              </span>
              <div className="text-2xl font-extrabold font-heading text-[var(--text-primary)] mt-1">
                Active
              </div>
              <span className="text-[11px] text-cyan-400 font-semibold">Real-time Report Access</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="glass-card p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search guardian by name, email, phone, occupation, or child ward..."
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
          </div>

          {/* Parents Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredParents.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 space-y-2 glass-card">
                <Sparkles size={28} className="mx-auto text-indigo-400/40" />
                <p className="text-sm font-medium">No parent profiles match your search query.</p>
              </div>
            ) : (
              filteredParents.map(parent => {
                const user = allUsers.find(u => u.id === parent.userId);
                const linkedWards = students.filter(s => parent.childrenStudentIds.includes(s.id));

                return (
                  <div
                    key={parent.id}
                    className="glass-card glass-card-hover p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={user?.name || 'Guardian'}
                            avatar={user?.avatar}
                            size="lg"
                            shape="rounded"
                            editable={true}
                            onUpload={(url) => updateParentAvatar(parent.id, url)}
                            onRemove={() => removeParentAvatar(parent.id)}
                          />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading truncate">
                              {user?.name}
                            </h3>
                            <span className="text-[11px] text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                              <Briefcase size={12} className="flex-shrink-0" />
                              {parent.occupation}
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-warning text-[9px] flex-shrink-0">Guardian</span>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 flex-shrink-0" />
                          <span>{user?.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{parent.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Linked Wards Section */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Linked Wards ({linkedWards.length})
                        </span>
                        <button
                          onClick={() => {
                            setLinkStudentModalParent(parent);
                            setSelectedStudentIdsToLink([]);
                            setLinkModalSearchInput('');
                            setLinkModalSearchQuery('');
                          }}
                          className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Plus size={12} /> Link Child
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {linkedWards.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No student ward linked yet.</p>
                        ) : (
                          linkedWards.map(ward => {
                            const wardProfile = studentProfiles[ward.userId];
                            const classSec = classSections.find(c => c.id === ward.classSectionId);
                            return (
                              <div
                                key={ward.id}
                                className="p-2 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <UserAvatar
                                    name={wardProfile?.name || 'Student'}
                                    avatar={wardProfile?.avatar}
                                    size="xs"
                                  />
                                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                                    {wardProfile?.name}
                                  </span>
                                </div>
                                <span className="badge badge-primary text-[9px] py-0.5">
                                  {classSec?.name || 'Class'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Bottom Quick Action for Password */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(parent)}
                          className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <Copy size={12} />
                          <span>{copiedId === parent.id ? 'Copied!' : 'Copy Slip'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetParent(parent);
                            setNewResetPassword(generateRandomPassword());
                          }}
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <KeyRound size={12} />
                          <span>Set Password</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Tab 2: Guardian Credentials & Access Table */}
      {activeTab === 'CREDENTIALS' && (
        <div className="space-y-4">
          <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Super Admin Guardian Credential Management
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Configure initial login passwords for guardians, generate secure tokens, or copy credential slips.
                </p>
              </div>
            </div>
            <div className="relative min-w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter credentials..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-control !pl-8 !py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guardian Profile</th>
                  <th>Login Email</th>
                  <th>Contact Phone</th>
                  <th>Current Password</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map(parent => {
                  const user = allUsers.find(u => u.id === parent.userId);
                  const isRevealed = revealedPasswords[parent.id];
                  const currentPassword = user?.password || 'parent123';

                  return (
                    <tr key={parent.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={user?.name || 'Guardian'}
                            avatar={user?.avatar}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block font-heading">
                              {user?.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {parent.occupation}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-medium">
                          {user?.email}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {user?.phone || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {isRevealed ? currentPassword : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(parent.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
                            onClick={() => handleCopyCredentials(parent)}
                            className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 text-slate-700 dark:text-slate-200"
                            title="Copy Login Credentials"
                          >
                            <Copy size={12} />
                            <span>{copiedId === parent.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetParent(parent);
                              setNewResetPassword(generateRandomPassword());
                            }}
                            className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 text-amber-600 hover:text-amber-800 dark:text-amber-400"
                            title="Set Password"
                          >
                            <KeyRound size={12} />
                            <span>Set Pass</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (user) {
                                switchUser(user.id);
                              }
                            }}
                            className="btn btn-primary btn-sm !py-1 !px-2 text-xs flex items-center gap-1 bg-amber-600 text-white font-bold"
                            title="Sign in directly as this guardian"
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

      {/* Onboard Parent Modal */}
      <ModalPortal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div
          className="modal-content p-5 sm:p-6 space-y-3.5 max-w-xl w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-scale-up my-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
                  Onboard Guardian
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Create parent credentials & link student ward
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

            {/* Row 1: Photo & Main Info */}
            <div className="flex items-start gap-3.5">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <UserAvatar
                  name={formData.name || 'Guardian'}
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

              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Babatunde Adeleke"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone & Occupation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+234 803 000 0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Petroleum Engineer"
                  value={formData.occupation}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                />
              </div>
            </div>

            {/* Row 3: Initial Password & Home Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Initial Password
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="input-control !w-full !py-1.5 !px-2.5 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, password: generateRandomPassword() }))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 flex-shrink-0"
                    title="Generate Strong Password"
                  >
                    <Sparkles size={13} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Home Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Admiralty Way, Lekki"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="input-control !w-full !py-1.5 !px-3 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                />
              </div>
            </div>

            {/* Row 4: Link Student Wards (Multi-Select & Surname/First Name Scanner) */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-indigo-500" />
                  <span>Link Student Ward(s) (Multi-Select)</span>
                </label>
                {formData.linkStudentIds.length > 0 && (
                  <span className="badge badge-primary text-[10px] font-bold">
                    {formData.linkStudentIds.length} Selected
                  </span>
                )}
              </div>

              {/* Real-time Name Scanning Indicator */}
              {formData.name.trim() && (
                <div className="p-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 min-w-0">
                    <Sparkles size={12} className="text-amber-500 flex-shrink-0 animate-pulse" />
                    <span className="truncate">
                      Scanning students for surname / first name matching: <strong>{formData.name}</strong>
                    </span>
                    <span className="font-extrabold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                      ({createSuggestedMatches.length} match{createSuggestedMatches.length === 1 ? '' : 'es'} at top)
                    </span>
                  </div>
                  {createSuggestedMatches.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllSuggestedForCreate}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                    >
                      Select All Matches
                    </button>
                  )}
                </div>
              )}

              {/* Student Search Bar with Search Input & Explicit Search Button */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student name, admission no, class arm..."
                    value={createModalSearchInput}
                    onChange={e => setCreateModalSearchInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setCreateModalSearchQuery(createModalSearchInput.trim());
                      }
                    }}
                    className="input-control !w-full !pl-8 !pr-7 !py-1.5 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                  />
                  {createModalSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModalSearchInput('');
                        setCreateModalSearchQuery('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalSearchQuery(createModalSearchInput.trim())}
                  className="btn btn-secondary btn-sm !py-1.5 !px-3 !text-xs flex items-center gap-1 font-semibold flex-shrink-0 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
                >
                  <Search size={12} />
                  <span>Search</span>
                </button>
              </div>

              {/* Selected Students Pills Tray */}
              {formData.linkStudentIds.length > 0 && (
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Selected:</span>
                  {formData.linkStudentIds.map(id => {
                    const st = students.find(s => s.id === id);
                    const name = st ? studentProfiles[st.userId]?.name : 'Student';
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => toggleStudentForCreate(id)}
                          className="text-indigo-500 hover:text-rose-500 rounded-full"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={clearCreateSelectedStudents}
                    className="text-[10px] text-slate-400 hover:text-rose-500 ml-auto font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Ranked Student List Container */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                {createRankedStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No students found matching search.
                  </div>
                ) : (
                  createRankedStudents.map(item => {
                    const isSelected = formData.linkStudentIds.includes(item.student.id);
                    return (
                      <div
                        key={item.student.id}
                        onClick={() => toggleStudentForCreate(item.student.id)}
                        className={`p-2 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/50'
                            : item.isMatched
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <UserAvatar name={item.name} avatar={item.avatar} size="xs" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              {item.isMatched && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-0.5">
                                  <Sparkles size={9} />
                                  <span>{item.matchReason}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span>{item.admissionNumber}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{item.className}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all flex-shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-sm !py-1.5 !px-3 !text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm !py-1.5 !px-4 !text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Create Guardian Profile
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Password Reset Modal for Guardian */}
      <ModalPortal isOpen={Boolean(resetParent)} onClose={() => setResetParent(null)}>
        {resetParent && (
          <div
            className="modal-content max-w-sm w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-600 font-extrabold font-heading text-base">
                <KeyRound size={18} />
                <span>Set Guardian Password</span>
              </div>
              <button
                onClick={() => setResetParent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Guardian Account:</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {allUsers.find(u => u.id === resetParent.userId)?.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {allUsers.find(u => u.id === resetParent.userId)?.email}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  New Initial Password
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
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800"
                    title="Generate Random Password"
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetParent(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>

      {/* Link Student Modal */}
      <ModalPortal isOpen={Boolean(linkStudentModalParent)} onClose={() => setLinkStudentModalParent(null)}>
        {linkStudentModalParent && (() => {
          const parentUser = allUsers.find(u => u.id === linkStudentModalParent.userId);
          const parentName = parentUser?.name || 'Guardian';

          return (
            <div
              className="modal-content p-5 space-y-4 max-w-xl w-full !bg-white dark:!bg-slate-900 !opacity-100 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                      Link Student Wards to Guardian
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Linking wards to <strong>{parentName}</strong> ({parentUser?.phone || 'No phone'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLinkStudentModalParent(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLinkSubmit} className="space-y-3.5">
                {/* Auto-matching scan badge */}
                <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200 min-w-0">
                    <Sparkles size={13} className="text-amber-500 flex-shrink-0 animate-pulse" />
                    <span className="truncate">
                      Scanning for students with surname or first name matching <strong>{parentName}</strong>:
                    </span>
                    <span className="badge badge-warning text-[10px] font-bold flex-shrink-0">
                      {linkSuggestedMatches.length} suggested match{linkSuggestedMatches.length === 1 ? '' : 'es'} at top
                    </span>
                  </div>
                  {linkSuggestedMatches.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllSuggestedForLink}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                    >
                      Select All Matches
                    </button>
                  )}
                </div>

                {/* Search Bar with Input & Explicit Search Button */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student by name, admission no, class arm..."
                      value={linkModalSearchInput}
                      onChange={e => setLinkModalSearchInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setLinkModalSearchQuery(linkModalSearchInput.trim());
                        }
                      }}
                      className="input-control !w-full !pl-9 !pr-8 !py-2 !text-xs !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border-slate-300 dark:!border-slate-700"
                    />
                    {linkModalSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLinkModalSearchInput('');
                          setLinkModalSearchQuery('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkModalSearchQuery(linkModalSearchInput.trim())}
                    className="btn btn-secondary btn-sm !py-2 !px-3.5 !text-xs flex items-center gap-1.5 font-bold flex-shrink-0 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs"
                  >
                    <Search size={13} />
                    <span>Search</span>
                  </button>
                </div>

                {/* Selected Wards Display */}
                {selectedStudentIdsToLink.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
                    <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
                      Ready to Link ({selectedStudentIdsToLink.length}):
                    </span>
                    {selectedStudentIdsToLink.map(id => {
                      const st = students.find(s => s.id === id);
                      const name = st ? studentProfiles[st.userId]?.name : 'Student';
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700"
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => toggleStudentForLink(id)}
                            className="text-indigo-500 hover:text-rose-500 rounded-full"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      onClick={clearLinkSelectedStudents}
                      className="text-[11px] text-slate-400 hover:text-rose-500 ml-auto font-medium"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                {/* Students Ranked List */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto bg-slate-50/40 dark:bg-slate-900/40">
                  {linkRankedStudents.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No students found matching search.
                    </div>
                  ) : (
                    linkRankedStudents.map(item => {
                      const isAlreadyLinked = linkStudentModalParent.childrenStudentIds.includes(item.student.id);
                      const isSelected = selectedStudentIdsToLink.includes(item.student.id);

                      return (
                        <div
                          key={item.student.id}
                          onClick={() => {
                            if (!isAlreadyLinked) {
                              toggleStudentForLink(item.student.id);
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
                              type="checkbox"
                              disabled={isAlreadyLinked}
                              checked={isAlreadyLinked || isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <UserAvatar name={item.name} avatar={item.avatar} size="sm" />
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
                                <span>{item.admissionNumber}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-600 dark:text-slate-300">{item.className}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {isAlreadyLinked ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                                Current Ward
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

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudentIdsToLink.length} student ward{selectedStudentIdsToLink.length === 1 ? '' : 's'} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLinkStudentModalParent(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={selectedStudentIdsToLink.length === 0}
                      className="btn btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      <span>
                        {selectedStudentIdsToLink.length > 0
                          ? `Link ${selectedStudentIdsToLink.length} Ward${selectedStudentIdsToLink.length > 1 ? 's' : ''}`
                          : 'Select Wards to Link'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          );
        })()}
      </ModalPortal>
    </div>
  );
};
