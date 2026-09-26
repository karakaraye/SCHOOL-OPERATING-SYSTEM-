import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../common/Toast';
import {
  RotateCcw,
  Eye,
  Lock,
  Globe,
  AlertTriangle,
  X,
  MessageSquare,
  Sparkles,
  Check,
  XCircle,
  Search,
  Send,
  Clock,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import type { ResultSubmission } from '../../types';

const REJECTION_TEMPLATES = [
  'Continuous Assessment (CA) scores exceed the maximum allowable marks.',
  'Terminal Exam scores are missing or inconsistent for one or more students.',
  'Scores require recalculation — totals do not match grading boundaries.',
  'Missing descriptive teacher remarks for failing or borderline students.',
  'Please verify student attendance records against test participation.',
];

export const ResultsAdminView: React.FC = () => {
  const {
    submissions,
    scores,
    classSections,
    subjects,
    teachers,
    allUsers,
    students,
    studentProfiles,
    assessmentConfigs,
    approveSubmission,
    returnSubmission,
    publishSubmission,
  } = useSchool();

  const { showToast } = useToast();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingSubmission, setInspectingSubmission] = useState<ResultSubmission | null>(null);

  // Reject Modal state
  const [rejectModalSubmission, setRejectModalSubmission] = useState<ResultSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = selectedStatusFilter === 'ALL' || sub.status === selectedStatusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const classSec = classSections.find(c => c.id === sub.classSectionId);
    const subj = subjects.find(s => s.id === sub.subjectId);
    const teacher = teachers.find(t => t.id === sub.teacherId);
    const teacherUser = allUsers.find(u => u.id === teacher?.userId);

    return (
      (classSec?.name && classSec.name.toLowerCase().includes(q)) ||
      (subj?.name && subj.name.toLowerCase().includes(q)) ||
      (subj?.code && subj.code.toLowerCase().includes(q)) ||
      (teacherUser?.name && teacherUser.name.toLowerCase().includes(q))
    );
  });

  const handleApprove = (sub: ResultSubmission) => {
    approveSubmission(sub.id);
    const classSec = classSections.find(c => c.id === sub.classSectionId);
    const subj = subjects.find(s => s.id === sub.subjectId);
    showToast(
      'Result Approved & Locked',
      `${classSec?.name || 'Class'} — ${subj?.name || 'Subject'} approved for publishing`
    );
    if (inspectingSubmission?.id === sub.id) {
      setInspectingSubmission({ ...inspectingSubmission, status: 'APPROVED' });
    }
  };

  const handleOpenRejectModal = (sub: ResultSubmission) => {
    setRejectModalSubmission(sub);
    setRejectionReason(sub.correctionFeedback || '');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalSubmission || !rejectionReason.trim()) return;

    returnSubmission(rejectModalSubmission.id, rejectionReason.trim());
    const classSec = classSections.find(c => c.id === rejectModalSubmission.classSectionId);
    const subj = subjects.find(s => s.id === rejectModalSubmission.subjectId);
    const teacher = teachers.find(t => t.id === rejectModalSubmission.teacherId);
    const teacherUser = allUsers.find(u => u.id === teacher?.userId);

    showToast(
      'Result Rejected & Returned',
      `Feedback sent to ${teacherUser?.name || 'teacher'} for ${classSec?.name || 'Class'} ${subj?.name || 'Subject'}`,
      'warning'
    );

    if (inspectingSubmission?.id === rejectModalSubmission.id) {
      setInspectingSubmission({
        ...inspectingSubmission,
        status: 'RETURNED',
        correctionFeedback: rejectionReason.trim(),
      });
    }

    setRejectModalSubmission(null);
    setRejectionReason('');
  };

  const handlePublish = (sub: ResultSubmission) => {
    publishSubmission(sub.id);
    const classSec = classSections.find(c => c.id === sub.classSectionId);
    const subj = subjects.find(s => s.id === sub.subjectId);
    showToast(
      'Results Published to Parents',
      `Official grades for ${classSec?.name || 'Class'} ${subj?.name || 'Subject'} are now visible to parents`
    );
    if (inspectingSubmission?.id === sub.id) {
      setInspectingSubmission({ ...inspectingSubmission, status: 'PUBLISHED' });
    }
  };

  const getStatusBadge = (status: ResultSubmission['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge badge-success flex items-center gap-1"><Globe size={11} /> Published to Parents</span>;
      case 'APPROVED':
        return <span className="badge badge-primary flex items-center gap-1"><Lock size={11} /> Approved & Locked</span>;
      case 'SUBMITTED':
        return <span className="badge badge-warning flex items-center gap-1"><Clock size={11} /> Awaiting Review</span>;
      case 'RETURNED':
        return <span className="badge badge-danger flex items-center gap-1"><XCircle size={11} /> Rejected / Returned</span>;
      case 'DRAFT':
        return <span className="badge badge-muted">Draft</span>;
    }
  };

  // Pipeline counts
  const pendingCount = submissions.filter(s => s.status === 'SUBMITTED').length;
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const publishedCount = submissions.filter(s => s.status === 'PUBLISHED').length;
  const returnedCount = submissions.filter(s => s.status === 'RETURNED').length;

  // Inspecting submission metrics
  const inspectionScores = inspectingSubmission
    ? scores.filter(sc => sc.submissionId === inspectingSubmission.id)
    : [];

  const totalStudentsGraded = inspectionScores.length;
  const avgScore = totalStudentsGraded > 0
    ? Math.round(inspectionScores.reduce((acc, c) => acc + c.totalScore, 0) / totalStudentsGraded)
    : 0;
  const highestScore = totalStudentsGraded > 0
    ? Math.max(...inspectionScores.map(s => s.totalScore))
    : 0;
  const lowestScore = totalStudentsGraded > 0
    ? Math.min(...inspectionScores.map(s => s.totalScore))
    : 0;
  const passCount = inspectionScores.filter(s => s.totalScore >= 50).length;
  const passRate = totalStudentsGraded > 0 ? Math.round((passCount / totalStudentsGraded) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-warning text-[10px]">Academic Approvals Pipeline</span>
          <span className="text-xs text-[var(--text-secondary)]">Terminal Examination Governance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
          Results Approvals & Score Sheet Governance
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Inspect submitted teacher score sheets, approve valid sheets, reject with specific correction notes, and publish official grades to parents.
        </p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Awaiting Review
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-heading">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Need Action</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Approved & Locked
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 font-heading">
              {approvedCount}
            </span>
            <span className="text-xs text-blue-700 font-semibold">Ready to Publish</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Published to Parents
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-heading">
              {publishedCount}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Live on Portal</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Rejected / Returned
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-heading">
              {returnedCount}
            </span>
            <span className="text-xs text-rose-700 font-semibold">With Feedback</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon & Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Sheets', count: submissions.length },
            { id: 'SUBMITTED', label: 'Awaiting Review', count: pendingCount },
            { id: 'APPROVED', label: 'Approved & Locked', count: approvedCount },
            { id: 'PUBLISHED', label: 'Published', count: publishedCount },
            { id: 'RETURNED', label: 'Rejected / Returned', count: returnedCount },
            { id: 'DRAFT', label: 'Teacher Drafts', count: submissions.filter(s => s.status === 'DRAFT').length },
          ].map(st => {
            const isSelected = selectedStatusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{st.label}</span>
                {st.count > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {st.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search class, subject, teacher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-control !pl-8 !py-1.5 !text-xs w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Submissions Grid Table */}
      <div className="glass-card overflow-hidden">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class Arm</th>
                <th>Curriculum Subject</th>
                <th>Subject Teacher</th>
                <th>Submission Status</th>
                <th>Date Submitted</th>
                <th className="text-right">Decision & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-[var(--text-muted)] space-y-2">
                    <Sparkles size={24} className="mx-auto text-blue-400/40" />
                    <p>No score sheets found in this status pipeline stage.</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => {
                  const classSec = classSections.find(c => c.id === sub.classSectionId);
                  const subj = subjects.find(s => s.id === sub.subjectId);
                  const teacher = teachers.find(t => t.id === sub.teacherId);
                  const teacherUser = allUsers.find(u => u.id === teacher?.userId);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td>
                        <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                          {classSec?.name || 'Class Arm'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-cyan text-[10px] font-bold">
                          {subj?.name} ({subj?.code})
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={teacherUser?.name || 'Teacher'}
                            avatar={teacherUser?.avatar}
                            size="sm"
                          />
                          <div>
                            <span className="text-xs font-bold text-[var(--text-primary)] block">
                              {teacherUser?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {teacher?.staffId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {getStatusBadge(sub.status)}
                          {sub.status === 'RETURNED' && sub.correctionFeedback && (
                            <p className="text-[11px] text-rose-600 line-clamp-1 max-w-xs italic">
                              "{sub.correctionFeedback}"
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Sheet */}
                          <button
                            onClick={() => setInspectingSubmission(sub)}
                            className="btn btn-secondary !py-1 !px-2.5 !text-xs text-slate-600 hover:text-slate-900"
                            title="Inspect Score Breakdown"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>

                          {/* Action Buttons for SUBMITTED */}
                          {sub.status === 'SUBMITTED' && (
                            <>
                              <button
                                onClick={() => handleApprove(sub)}
                                className="btn btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-1 !px-2.5 !text-xs text-white shadow-sm"
                                title="Approve and Lock Result"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(sub)}
                                className="btn btn-danger !py-1 !px-2.5 !text-xs shadow-sm"
                                title="Reject and Send Correction Note"
                              >
                                <XCircle size={13} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Action Buttons for RETURNED (Can Re-Approve or Edit Note) */}
                          {sub.status === 'RETURNED' && (
                            <>
                              <button
                                onClick={() => handleApprove(sub)}
                                className="btn btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-1 !px-2.5 !text-xs text-white"
                                title="Approve Result"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(sub)}
                                className="btn btn-secondary !py-1 !px-2.5 !text-xs text-rose-600 hover:bg-rose-50"
                                title="Edit Rejection Reason"
                              >
                                <MessageSquare size={13} />
                                <span>Reason</span>
                              </button>
                            </>
                          )}

                          {/* Action Buttons for APPROVED */}
                          {sub.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => handlePublish(sub)}
                                className="btn btn-primary !py-1 !px-2.5 !text-xs text-white shadow-sm"
                                title="Publish Official Transcript to Parents"
                              >
                                <Globe size={13} />
                                <span>Publish</span>
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(sub)}
                                className="btn btn-secondary !py-1 !px-2.5 !text-xs text-rose-600 hover:bg-rose-50"
                                title="Reject / Re-open Sheet"
                              >
                                <RotateCcw size={13} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
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

      {/* Inspecting Score Sheet Modal */}
      <ModalPortal isOpen={Boolean(inspectingSubmission)} onClose={() => setInspectingSubmission(null)}>
        {inspectingSubmission && (
          <div
            className="modal-container !max-w-4xl !bg-white dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Title & Action Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] font-heading">
                    {classSections.find(c => c.id === inspectingSubmission.classSectionId)?.name} —{' '}
                    {subjects.find(s => s.id === inspectingSubmission.subjectId)?.name}
                  </h3>
                  {getStatusBadge(inspectingSubmission.status)}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Subject Teacher:{' '}
                  <strong className="text-[var(--text-primary)]">
                    {allUsers.find(u => u.id === teachers.find(t => t.id === inspectingSubmission.teacherId)?.userId)?.name}
                  </strong>
                </p>
              </div>

              {/* Action Buttons in Modal Header */}
              <div className="flex items-center gap-2 flex-wrap">
                {(inspectingSubmission.status === 'SUBMITTED' || inspectingSubmission.status === 'RETURNED') && (
                  <>
                    <button
                      onClick={() => handleApprove(inspectingSubmission)}
                      className="btn btn-primary !bg-emerald-600 hover:!bg-emerald-700 btn-sm shadow-md"
                    >
                      <Check size={14} />
                      <span>Approve & Lock</span>
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(inspectingSubmission)}
                      className="btn btn-danger btn-sm shadow-md"
                    >
                      <XCircle size={14} />
                      <span>Reject with Reason</span>
                    </button>
                  </>
                )}

                {inspectingSubmission.status === 'APPROVED' && (
                  <>
                    <button
                      onClick={() => handlePublish(inspectingSubmission)}
                      className="btn btn-primary btn-sm shadow-md"
                    >
                      <Globe size={14} />
                      <span>Publish to Parents</span>
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(inspectingSubmission)}
                      className="btn btn-secondary btn-sm text-rose-600 hover:bg-rose-50"
                    >
                      <RotateCcw size={14} />
                      <span>Reject & Re-open</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setInspectingSubmission(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Class Average</span>
                <span className="text-xl font-black text-blue-600 font-heading">{avgScore}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Highest Score</span>
                <span className="text-xl font-black text-emerald-600 font-heading">{highestScore}/100</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Lowest Score</span>
                <span className="text-xl font-black text-amber-600 font-heading">{lowestScore}/100</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Pass Rate</span>
                <span className="text-xl font-black text-cyan-600 font-heading">{passRate}%</span>
              </div>
            </div>

            {/* Rejection Feedback Note Banner if returned */}
            {inspectingSubmission.correctionFeedback && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
                  <span>Rejection Reason Sent to Teacher:</span>
                </div>
                <p className="mt-1 pl-6 text-rose-900 font-medium">
                  "{inspectingSubmission.correctionFeedback}"
                </p>
              </div>
            )}

            {/* Student Score Sheet Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Enrolled Student Score Ledger ({inspectionScores.length} records)
              </h4>
              <div className="data-table-container max-h-80 overflow-y-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      {assessmentConfigs.map(c => (
                        <th key={c.id}>{c.name} ({c.maxScore})</th>
                      ))}
                      <th>Total Score (100)</th>
                      <th>Grade</th>
                      <th>Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionScores.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-xs text-slate-400">
                          No scores recorded for this submission yet.
                        </td>
                      </tr>
                    ) : (
                      inspectionScores.map(sc => {
                        const student = students.find(s => s.id === sc.studentId);
                        const profile = student ? studentProfiles[student.userId] : null;

                        return (
                          <tr key={sc.id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  name={profile?.name || 'Student'}
                                  avatar={profile?.avatar}
                                  size="xs"
                                />
                                <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                                  {profile?.name || 'Student'}
                                </span>
                              </div>
                            </td>
                            {assessmentConfigs.map(c => (
                              <td key={c.id} className="font-mono text-xs font-semibold">
                                {sc.scores[c.id] !== undefined ? sc.scores[c.id] : '—'}
                              </td>
                            ))}
                            <td>
                              <span className="font-bold font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {sc.totalScore}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-primary text-xs font-bold">
                                {sc.grade}
                              </span>
                            </td>
                            <td>
                              <span className="text-xs text-[var(--text-secondary)] italic">
                                {sc.teacherRemark || sc.remark}
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
        )}
      </ModalPortal>

      {/* ================= REJECT RESULT SUBMISSION MODAL ================= */}
      <ModalPortal isOpen={Boolean(rejectModalSubmission)} onClose={() => setRejectModalSubmission(null)}>
        {rejectModalSubmission && (
          <div
            className="modal-container max-w-lg !bg-white dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                    Reject Result Submission
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Specify the reason for rejection to guide teacher corrections.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Submission Target Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Class & Subject:</span>
                <span className="font-bold text-slate-800">
                  {classSections.find(c => c.id === rejectModalSubmission.classSectionId)?.name} —{' '}
                  {subjects.find(s => s.id === rejectModalSubmission.subjectId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject Teacher:</span>
                <span className="font-semibold text-slate-700">
                  {allUsers.find(u => u.id === teachers.find(t => t.id === rejectModalSubmission.teacherId)?.userId)?.name}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="input-label !mb-0">
                    Reason for Rejection / Teacher Feedback Note *
                  </label>
                  <span className="text-[11px] text-slate-400">Required</span>
                </div>
                <textarea
                  rows={4}
                  required
                  autoFocus
                  placeholder="e.g. Please re-check CA2 marks for students #3 and #8. Exam score totals exceed maximum test boundary of 60 marks."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="textarea-control font-medium text-xs leading-relaxed"
                />
              </div>

              {/* Quick Template Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Quick Reason Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRejectionReason(tpl)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-colors text-left"
                    >
                      + {tpl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Rejecting this result will unlock the score sheet for the teacher to edit, displaying your feedback note prominently on their dashboard.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setRejectModalSubmission(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="btn btn-danger btn-sm shadow-md"
                >
                  <Send size={14} />
                  <span>Reject & Send Reason</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
