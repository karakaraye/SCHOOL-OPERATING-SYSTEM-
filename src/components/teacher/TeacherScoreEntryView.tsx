import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Save,
  Send,
  CheckCircle2,
  Lock,
  RotateCcw,
  Globe,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Download,
  Printer,
  Wand2,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import type { ResultSubmission } from '../../types';

// Smart remark suggestions library based on score band
const SMART_REMARKS: Record<'A' | 'B' | 'C' | 'D' | 'F', string[]> = {
  A: [
    'Outstanding conceptual mastery and stellar performance throughout the term.',
    'Exceptional analytical skills and commendable engagement in class discussions.',
    'Top-tier academic excellence. Consistently delivers brilliant work.',
    'Exemplary problem-solving capability; a role model to peers.',
  ],
  B: [
    'Very strong understanding of key syllabus topics with high consistency.',
    'Commendable academic effort; shows great diligence and enthusiasm.',
    'Demonstrates clear subject aptitude and active participation in class exercises.',
    'Good grasp of theoretical concepts. Has potential for grade A with minor polish.',
  ],
  C: [
    'Good credit achievement with steady class participation and attention.',
    'Solid foundation demonstrated; encourage more problem-solving practice at home.',
    'Satisfactory comprehension of syllabus, capable of higher attainment with revision.',
    'Consistent effort shown throughout the term. Keep working hard.',
  ],
  D: [
    'Fair attempt; needs to strengthen foundational concepts through revision.',
    'Average pass; recommend structured daily study schedule and homework review.',
    'Shows basic understanding but requires closer focus during practical sessions.',
    'Capable of much better results with improved concentration.',
  ],
  F: [
    'Needs urgent academic intervention and focused remedial guidance.',
    'Low score recorded; recommend parent-teacher conference for personalized study plan.',
    'Struggling with core syllabus topics; mandatory revision and tutorials advised.',
    'Requires immediate assistance with homework and lesson review.',
  ],
};

const getRandomSmartRemark = (grade: string): string => {
  const band = (['A', 'B', 'C', 'D', 'F'].includes(grade) ? grade : 'C') as 'A' | 'B' | 'C' | 'D' | 'F';
  const list = SMART_REMARKS[band] || SMART_REMARKS.C;
  return list[Math.floor(Math.random() * list.length)];
};

export const TeacherScoreEntryView: React.FC = () => {
  const {
    currentTerm,
    currentUser,
    teachers,
    teacherAssignments,
    classSections,
    subjects,
    students,
    studentProfiles,
    assessmentConfigs,
    scores,
    getOrCreateSubmission,
    saveScoreDraft,
    submitScoresForApproval,
    calculateGrade,
  } = useSchool();

  const currentTeacher = teachers.find(t => t.userId === currentUser.id) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    myAssignments[0]?.id || ''
  );
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Batch Tool Modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchConfigId, setBatchConfigId] = useState<string>('');
  const [batchScoreValue, setBatchScoreValue] = useState<number>(15);
  const [batchTarget, setBatchTarget] = useState<'ALL' | 'BLANK_ONLY'>('BLANK_ONLY');

  const activeAssignment = myAssignments.find(a => a.id === selectedAssignmentId) || myAssignments[0];
  const activeClass = classSections.find(c => c.id === activeAssignment?.classSectionId);
  const activeSubject = subjects.find(s => s.id === activeAssignment?.subjectId);

  // Set default batch config when configs load
  useEffect(() => {
    if (assessmentConfigs.length > 0 && !batchConfigId) {
      setBatchConfigId(assessmentConfigs[0].id);
    }
  }, [assessmentConfigs, batchConfigId]);

  // Active submission entity
  const currentSubmission: ResultSubmission | undefined = activeAssignment
    ? getOrCreateSubmission(activeAssignment.classSectionId, activeAssignment.subjectId, currentTeacher.id)
    : undefined;

  const enrolledStudents = students.filter(
    s => s.classSectionId === activeAssignment?.classSectionId && s.status === 'ACTIVE'
  );

  // Local scores state
  const [scoreRows, setScoreRows] = useState<
    Record<string, { scores: Record<string, number>; teacherRemark: string }>
  >({});

  // Sync score rows whenever active assignment changes
  useEffect(() => {
    if (!currentSubmission) return;

    const existingScores = scores.filter(sc => sc.submissionId === currentSubmission.id);
    const initialMap: Record<string, { scores: Record<string, number>; teacherRemark: string }> = {};

    enrolledStudents.forEach(st => {
      const found = existingScores.find(sc => sc.studentId === st.id);
      if (found) {
        initialMap[st.id] = {
          scores: { ...found.scores },
          teacherRemark: found.teacherRemark || '',
        };
      } else {
        const emptyScores: Record<string, number> = {};
        assessmentConfigs.forEach(cfg => {
          emptyScores[cfg.id] = 0;
        });
        initialMap[st.id] = {
          scores: emptyScores,
          teacherRemark: '',
        };
      }
    });

    setScoreRows(initialMap);
  }, [selectedAssignmentId, currentSubmission?.id, enrolledStudents.length]);

  const handleScoreChange = (studentId: string, configId: string, val: number, maxScore: number) => {
    const clamped = Math.max(0, Math.min(val, maxScore));
    setScoreRows(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        scores: {
          ...prev[studentId]?.scores,
          [configId]: clamped,
        },
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setScoreRows(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        teacherRemark: remark,
      },
    }));
  };

  const isLocked =
    currentSubmission?.status === 'SUBMITTED' ||
    currentSubmission?.status === 'APPROVED' ||
    currentSubmission?.status === 'PUBLISHED';

  const prepareRowsForContext = () => {
    return Object.entries(scoreRows).map(([studentId, data]) => ({
      studentId,
      scores: data.scores,
      teacherRemark: data.teacherRemark.trim() || undefined,
    }));
  };

  const handleSaveDraft = () => {
    if (!currentSubmission) return;
    saveScoreDraft(currentSubmission.id, prepareRowsForContext());
    setSuccessNotice('Score sheet draft saved successfully.');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleSubmitForReview = () => {
    if (!currentSubmission) return;
    submitScoresForApproval(currentSubmission.id, prepareRowsForContext());
    setSuccessNotice('Scores submitted to the Principal for verification & locking!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Smart Remarks Generator: Single Student
  const handleAutoSuggestSingleRemark = (studentId: string) => {
    if (isLocked) return;
    const row = scoreRows[studentId];
    let total = 0;
    Object.values(row?.scores || {}).forEach(v => {
      total += Number(v) || 0;
    });
    const gradeInfo = calculateGrade(total);
    const suggestion = getRandomSmartRemark(gradeInfo.grade);
    handleRemarkChange(studentId, suggestion);
  };

  // Smart Remarks Generator: All Students
  const handleAutoSuggestAllRemarks = () => {
    if (isLocked) return;
    setScoreRows(prev => {
      const next = { ...prev };
      enrolledStudents.forEach(st => {
        const studentRow = next[st.id] || { scores: {}, teacherRemark: '' };
        let total = 0;
        Object.values(studentRow.scores || {}).forEach(v => {
          total += Number(v) || 0;
        });
        const gradeInfo = calculateGrade(total);
        const remark = getRandomSmartRemark(gradeInfo.grade);
        next[st.id] = {
          ...studentRow,
          teacherRemark: remark,
        };
      });
      return next;
    });
    setSuccessNotice('Generated intelligent behavioral & academic remarks for all enrolled students.');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Batch Fill Score Handler
  const handleApplyBatchScore = () => {
    if (isLocked || !batchConfigId) return;
    const targetCfg = assessmentConfigs.find(c => c.id === batchConfigId);
    if (!targetCfg) return;

    const clampedVal = Math.max(0, Math.min(batchScoreValue, targetCfg.maxScore));

    setScoreRows(prev => {
      const next = { ...prev };
      enrolledStudents.forEach(st => {
        const studentRow = next[st.id] || { scores: {}, teacherRemark: '' };
        const currentVal = studentRow.scores?.[batchConfigId] ?? 0;

        if (batchTarget === 'ALL' || (batchTarget === 'BLANK_ONLY' && currentVal === 0)) {
          next[st.id] = {
            ...studentRow,
            scores: {
              ...studentRow.scores,
              [batchConfigId]: clampedVal,
            },
          };
        }
      });
      return next;
    });

    setShowBatchModal(false);
    setSuccessNotice(`Batch filled ${targetCfg.name} with score ${clampedVal} for ${batchTarget === 'ALL' ? 'all' : 'zero-score'} students.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Admission Number',
      ...assessmentConfigs.map(c => `${c.name} (${c.maxScore})`),
      'Total (100)',
      'Grade',
      'Teacher Remark',
    ];

    const rows = enrolledStudents.map(st => {
      const profile = studentProfiles[st.userId];
      const studentRow = scoreRows[st.id] || { scores: {}, teacherRemark: '' };
      let total = 0;
      Object.values(studentRow.scores || {}).forEach(v => {
        total += Number(v) || 0;
      });
      const gradeInfo = calculateGrade(total);

      return [
        `"${profile?.name || 'Student'}"`,
        `"${st.admissionNumber}"`,
        ...assessmentConfigs.map(c => studentRow.scores?.[c.id] ?? 0),
        total,
        `"${gradeInfo.grade}"`,
        `"${(studentRow.teacherRemark || gradeInfo.remark).replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeClass?.name || 'Class'}_${activeSubject?.code || 'Subject'}_Scores.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate live statistics and Grade Distribution
  const totalScoresList = Object.values(scoreRows).map(row => {
    return Object.values(row.scores || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  });
  const classAvg = totalScoresList.length > 0
    ? Math.round(totalScoresList.reduce((a, b) => a + b, 0) / totalScoresList.length)
    : 0;
  const highest = totalScoresList.length > 0 ? Math.max(...totalScoresList) : 0;
  const lowest = totalScoresList.length > 0 ? Math.min(...totalScoresList) : 0;
  const passCount = totalScoresList.filter(s => s >= 50).length;
  const passPct = totalScoresList.length > 0 ? Math.round((passCount / totalScoresList.length) * 100) : 100;

  // Grade Counts for Histogram Breakdown
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  totalScoresList.forEach(tot => {
    const g = calculateGrade(tot).grade;
    if (gradeCounts[g] !== undefined) {
      gradeCounts[g]++;
    } else {
      gradeCounts[g] = 1;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan text-[10px]">Academic Assessment</span>
            <span className="text-xs text-[var(--text-secondary)]">Gradebook & Results Pipeline</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Score Entry & Terminal Submission
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Record continuous assessments (CA 1 & 2) and terminal exam scores with automatic grade calculations and smart auto-remarks.
          </p>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            title="Export class score ledger as CSV spreadsheet"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            title="Print score ledger"
          >
            <Printer size={14} />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Class Section & Subject Selector */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[var(--bg-surface-soft)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Teaching Load:</span>
          <select
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}
            className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-bold cursor-pointer"
          >
            {myAssignments.map(asgn => {
              const c = classSections.find(x => x.id === asgn.classSectionId);
              const s = subjects.find(x => x.id === asgn.subjectId);
              return (
                <option key={asgn.id} value={asgn.id}>
                  {c?.name} — {s?.name} ({s?.code})
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Pill in Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[var(--text-secondary)] font-semibold">Workflow Status:</span>
          {currentSubmission?.status === 'PUBLISHED' && (
            <span className="badge badge-success flex items-center gap-1"><Globe size={11} /> Published to Parents</span>
          )}
          {currentSubmission?.status === 'APPROVED' && (
            <span className="badge badge-primary flex items-center gap-1"><Lock size={11} /> Approved & Locked</span>
          )}
          {currentSubmission?.status === 'SUBMITTED' && (
            <span className="badge badge-warning flex items-center gap-1"><AlertTriangle size={11} /> Awaiting Admin Approval</span>
          )}
          {currentSubmission?.status === 'RETURNED' && (
            <span className="badge badge-danger flex items-center gap-1 font-bold animate-pulse"><RotateCcw size={11} /> Returned for Correction</span>
          )}
          {(!currentSubmission || currentSubmission.status === 'DRAFT') && (
            <span className="badge badge-muted">Draft (Editable)</span>
          )}
        </div>
      </div>

      {/* Returned Note Banner if status is RETURNED */}
      {currentSubmission?.status === 'RETURNED' && currentSubmission.correctionFeedback && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-900 text-xs space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm font-heading">
              <MessageSquare size={18} className="text-rose-600" />
              <span>Correction Required by Principal</span>
            </div>
            <span className="badge badge-danger text-[10px]">Action Required</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed font-semibold pl-6 bg-white/60 p-2.5 rounded-lg border border-rose-200">
            "{currentSubmission.correctionFeedback}"
          </p>
          <p className="text-[11px] text-rose-600 pl-6 font-medium">
            Please make the required adjustments to the scores or teacher remarks below and click <strong>"Submit to Principal for Review"</strong>.
          </p>
        </div>
      )}

      {/* Live Class Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Class Average</span>
          <span className="text-xl font-black text-indigo-600 font-heading">{classAvg}%</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Highest Score</span>
          <span className="text-xl font-black text-emerald-600 font-heading">{highest}/100</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Lowest Score</span>
          <span className="text-xl font-black text-amber-600 font-heading">{lowest}/100</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Pass Rate</span>
          <span className="text-xl font-black text-cyan-600 font-heading">{passPct}%</span>
        </div>
      </div>

      {/* Grade Distribution Breakdown Bar */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Grade Distribution Breakdown ({enrolledStudents.length} Students)
          </span>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> A: {gradeCounts.A}
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> B: {gradeCounts.B}
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> C: {gradeCounts.C}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> D: {gradeCounts.D}
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> F: {gradeCounts.F}
            </span>
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          {enrolledStudents.length > 0 && (
            <>
              <div style={{ width: `${(gradeCounts.A / enrolledStudents.length) * 100}%` }} className="bg-emerald-500 h-full transition-all" title={`Grade A: ${gradeCounts.A}`} />
              <div style={{ width: `${(gradeCounts.B / enrolledStudents.length) * 100}%` }} className="bg-blue-500 h-full transition-all" title={`Grade B: ${gradeCounts.B}`} />
              <div style={{ width: `${(gradeCounts.C / enrolledStudents.length) * 100}%` }} className="bg-indigo-500 h-full transition-all" title={`Grade C: ${gradeCounts.C}`} />
              <div style={{ width: `${(gradeCounts.D / enrolledStudents.length) * 100}%` }} className="bg-amber-500 h-full transition-all" title={`Grade D: ${gradeCounts.D}`} />
              <div style={{ width: `${(gradeCounts.F / enrolledStudents.length) * 100}%` }} className="bg-rose-500 h-full transition-all" title={`Grade F: ${gradeCounts.F}`} />
            </>
          )}
        </div>
      </div>

      {/* Notice Message */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Score Grid Table & Quick Tools Bar */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-soft)]">
          <div>
            <span className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider block">
              {activeClass?.name} • {activeSubject?.name} Score Ledger
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {enrolledStudents.length} Active Students Enrolled • Term: {currentTerm.name}
            </span>
          </div>

          {!isLocked && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowBatchModal(true)}
                className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs flex items-center gap-1.5"
                title="Batch fill assessment scores for students"
              >
                <Sliders size={13} />
                <span>Batch Score Tool</span>
              </button>
              <button
                type="button"
                onClick={handleAutoSuggestAllRemarks}
                className="btn btn-primary btn-sm !py-1 !px-2.5 text-xs flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm"
                title="Generate smart academic remarks for all students automatically"
              >
                <Sparkles size={13} />
                <span>Auto-Generate All Remarks</span>
              </button>
            </div>
          )}

          {isLocked && (
            <span className="text-xs text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Lock size={12} /> Inputs locked pending administrative review
            </span>
          )}
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                {assessmentConfigs.map(c => (
                  <th key={c.id} className="text-center">
                    {c.name} (Max {c.maxScore})
                  </th>
                ))}
                <th className="text-center">Total (100)</th>
                <th className="text-center">Grade</th>
                <th>Teacher Remark & Auto-Suggestions</th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    No active students enrolled in this section.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map(st => {
                  const profile = studentProfiles[st.userId];
                  const studentRow = scoreRows[st.id] || { scores: {}, teacherRemark: '' };

                  let rowTotal = 0;
                  Object.values(studentRow.scores || {}).forEach(v => {
                    rowTotal += Number(v) || 0;
                  });
                  const gradeInfo = calculateGrade(rowTotal);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
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
                        <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {st.admissionNumber}
                        </span>
                      </td>
                      {assessmentConfigs.map(cfg => {
                        const currentVal = studentRow.scores?.[cfg.id] ?? 0;
                        return (
                          <td key={cfg.id} className="text-center">
                            <input
                              type="number"
                              min="0"
                              max={cfg.maxScore}
                              disabled={isLocked}
                              value={currentVal}
                              onChange={e =>
                                handleScoreChange(
                                  st.id,
                                  cfg.id,
                                  Number(e.target.value) || 0,
                                  cfg.maxScore
                                )
                              }
                              className={`input-control !w-20 !py-1 !px-2 font-mono font-bold text-center inline-block ${
                                isLocked ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'bg-white'
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="text-center">
                        <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200 inline-block">
                          {rowTotal}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${gradeInfo.colorClass} text-xs font-black`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder={gradeInfo.remark}
                            value={studentRow.teacherRemark}
                            onChange={e => handleRemarkChange(st.id, e.target.value)}
                            className={`input-control !py-1 !px-2.5 !text-xs flex-1 ${
                              isLocked ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'bg-white'
                            }`}
                          />
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => handleAutoSuggestSingleRemark(st.id)}
                              className="btn btn-secondary btn-sm !py-1 !px-2 text-xs flex-shrink-0 text-indigo-600 hover:text-indigo-800"
                              title="Generate AI remark for this student"
                            >
                              <Wand2 size={13} />
                              <span className="hidden lg:inline text-[11px]">Suggest</span>
                            </button>
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

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 glass-card">
        <span className="text-xs text-[var(--text-secondary)] font-medium">
          {isLocked
            ? 'Score sheet is currently locked in review queue.'
            : 'Unsaved modifications will be stored as draft until final submission.'}
        </span>

        {!isLocked && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary btn-md"
            >
              <Save size={15} />
              <span>Save Progress Draft</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitForReview}
              className="btn btn-primary btn-md shadow-lg shadow-indigo-600/30"
            >
              <Send size={15} />
              <span>Submit to Principal for Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Batch Fill Score Modal */}
      <ModalPortal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)}>
        {showBatchModal && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-md w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold font-heading text-base">
                <Sliders size={18} />
                <span>Batch Fill Assessment Scores</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Quickly apply a standard score to students for continuous assessment or class exercises.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Assessment Component
                </label>
                <select
                  value={batchConfigId}
                  onChange={e => setBatchConfigId(e.target.value)}
                  className="select-control !w-full !bg-white !text-slate-900 !border-slate-300"
                >
                  {assessmentConfigs.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Max Score: {c.maxScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Score to Apply
                </label>
                <input
                  type="number"
                  min="0"
                  max={assessmentConfigs.find(c => c.id === batchConfigId)?.maxScore || 100}
                  value={batchScoreValue}
                  onChange={e => setBatchScoreValue(Number(e.target.value) || 0)}
                  className="input-control !w-full !bg-white !text-slate-900 !border-slate-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Application Target
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchTarget('BLANK_ONLY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      batchTarget === 'BLANK_ONLY'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Zero / Blank Scores Only
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                      Preserves existing entered marks
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchTarget('ALL')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      batchTarget === 'ALL'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Enrolled Students
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                      Overwrites existing marks
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBatchScore}
                className="btn btn-primary btn-sm bg-indigo-600 text-white font-bold"
              >
                <Check size={14} />
                <span>Apply Batch Scores</span>
              </button>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
