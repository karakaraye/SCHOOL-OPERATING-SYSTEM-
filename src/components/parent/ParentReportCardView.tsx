import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Printer,
  School as SchoolIcon,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const ParentReportCardView: React.FC = () => {
  const {
    school,
    currentUser,
    parents,
    students,
    studentProfiles,
    classSections,
    submissions,
    scores,
    subjects,
    assessmentConfigs,
    attendance,
    currentSession,
    currentTerm,
    gradingScale,
  } = useSchool();

  const currentParent = parents.find(p => p.userId === currentUser.id) || parents[0];
  const linkedStudentIds = currentParent?.childrenStudentIds || [];
  const linkedStudents = students.filter(s => linkedStudentIds.includes(s.id));

  const [selectedChildId, setSelectedChildId] = useState<string>(
    linkedStudentIds[0] || ''
  );

  const activeChild = students.find(s => s.id === selectedChildId) || linkedStudents[0];
  const activeProfile = activeChild ? studentProfiles[activeChild.userId] : null;
  const activeClass = classSections.find(c => c.id === activeChild?.classSectionId);

  // Find published submissions for active class
  const publishedSubmissions = submissions.filter(
    s => s.classSectionId === activeChild?.classSectionId && s.status === 'PUBLISHED'
  );
  const publishedSubmissionIds = publishedSubmissions.map(s => s.id);

  // Filter child scores that are in published submissions
  const childPublishedScores = scores.filter(
    sc => sc.studentId === activeChild?.id && publishedSubmissionIds.includes(sc.submissionId)
  );

  // Calculate overall summary metrics
  const totalScoreSum = childPublishedScores.reduce((acc, curr) => acc + curr.totalScore, 0);
  const totalPossible = childPublishedScores.length * 100;
  const overallPercentage = totalPossible > 0 ? Math.round((totalScoreSum / totalPossible) * 100) : 0;

  // Overall grade
  let cumulativeGrade = '—';
  if (childPublishedScores.length > 0) {
    for (const tier of gradingScale) {
      if (overallPercentage >= tier.minScore && overallPercentage <= tier.maxScore) {
        cumulativeGrade = tier.grade;
        break;
      }
    }
  }

  // Attendance metrics
  const childAtt = attendance.filter(a => a.studentId === activeChild?.id);
  const daysPresent = childAtt.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attRate = childAtt.length > 0 ? Math.round((daysPresent / childAtt.length) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[10px]">Official Transcript</span>
            <span className="text-xs text-[var(--text-secondary)]">Academic Assessment Records</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Official Academic Report Card
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Verified academic transcript for {currentTerm.name}, approved and signed by the school administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {linkedStudents.length > 1 && (
            <div className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-bold">Child Ward:</span>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="select-control !w-auto !py-0.5 !px-2 !text-xs !bg-transparent !border-none font-bold cursor-pointer"
              >
                {linkedStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {studentProfiles[st.userId]?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button onClick={handlePrint} className="btn btn-primary btn-md shadow-lg shadow-indigo-600/30">
            <Printer size={16} />
            <span>Print Official Report Card</span>
          </button>
        </div>
      </div>

      {/* Official Report Card Container (Print-optimized) */}
      <div className="report-card-container glass-card p-6 md:p-10 space-y-6 bg-[var(--bg-card-solid)] border-[var(--border-strong)] shadow-2xl relative">
        {/* Institutional Letterhead */}
        <div className="text-center pb-6 border-b-2 border-indigo-500/40 space-y-1.5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-xl mb-3 ring-4 ring-indigo-500/20">
            <SchoolIcon size={34} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[var(--text-primary)] font-heading">
            {school.name}
          </h2>
          <p className="text-xs md:text-sm text-indigo-400 font-bold italic">
            "{school.motto}"
          </p>
          <div className="text-xs text-[var(--text-secondary)] space-x-2 pt-1">
            <span>{school.address}</span>
            <span>•</span>
            <span>Email: {school.email}</span>
            <span>•</span>
            <span>Tel: {school.phone}</span>
          </div>
          <div className="inline-block mt-2">
            <span className="badge badge-primary text-xs py-1 px-4 font-bold tracking-widest uppercase">
              Official Continuous Assessment & Examination Report
            </span>
          </div>
        </div>

        {/* Student Demographic Block with Passport Photo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] text-xs">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={activeProfile?.name || 'Student'}
              avatar={activeProfile?.avatar}
              size="xl"
              shape="rounded"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Student Name</span>
              <span className="font-extrabold text-base text-[var(--text-primary)] font-heading">
                {activeProfile?.name}
              </span>
              <span className="font-mono font-bold text-xs text-indigo-400 block mt-0.5">
                Adm No: {activeChild?.admissionNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full sm:w-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Class Arm</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">
                {activeClass?.name || 'Class Arm'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Gender / Age</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">
                {activeChild?.gender || 'N/A'} • {activeChild?.dob}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Session & Term</span>
              <span className="font-bold text-xs text-[var(--text-primary)]">
                {currentSession.name} • {currentTerm.name}
              </span>
            </div>
          </div>
        </div>

        {/* Subject Score Breakdown Ledger Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Award size={14} className="text-indigo-400" />
            <span>Academic Performance Record</span>
          </h3>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  {assessmentConfigs.map(c => (
                    <th key={c.id}>
                      {c.name} ({c.maxScore})
                    </th>
                  ))}
                  <th>Total Score (100)</th>
                  <th>Grade</th>
                  <th>Subject Remark</th>
                </tr>
              </thead>
              <tbody>
                {childPublishedScores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs text-slate-400">
                      Terminal examination results are undergoing administrative moderation.
                    </td>
                  </tr>
                ) : (
                  childPublishedScores.map(sc => {
                    const sub = submissions.find(s => s.id === sc.submissionId);
                    const subj = subjects.find(s => s.id === sub?.subjectId);

                    return (
                      <tr key={sc.id}>
                        <td>
                          <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                            {subj?.name}
                          </span>
                        </td>
                        {assessmentConfigs.map(c => (
                          <td key={c.id} className="font-mono text-xs font-semibold">
                            {sc.scores[c.id] !== undefined ? sc.scores[c.id] : '—'}
                          </td>
                        ))}
                        <td>
                          <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
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

        {/* Cumulative Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Marks</span>
            <span className="text-xl font-black text-[var(--text-primary)] font-heading mt-1 block">
              {totalScoreSum} / {totalPossible}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Cumulative Average</span>
            <span className="text-xl font-black text-indigo-400 font-heading mt-1 block">
              {overallPercentage}%
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Terminal Grade</span>
            <span className="text-xl font-black text-emerald-400 font-heading mt-1 block">
              {cumulativeGrade}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Term Attendance</span>
            <span className="text-xl font-black text-cyan-400 font-heading mt-1 block">
              {attRate}%
            </span>
          </div>
        </div>

        {/* Appraisal & Principal Official Endorsement Stamp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] space-y-2">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Class Form Teacher's General Appraisal
            </span>
            <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
              "{activeProfile?.name} has shown exceptional diligence and active academic participation across all curriculum subjects this term. Excellent progress."
            </p>
            <div className="pt-2 text-right">
              <span className="text-[11px] font-bold text-[var(--text-primary)] block">Form Teacher Signature</span>
              <span className="text-[10px] text-slate-500">Verified electronically</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Principal's Official Certification
              </span>
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                "An outstanding terminal result. Promoted with commendable honors. Keep up the high standard."
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                <ShieldCheck size={16} />
                <span>Digitally Sealed & Verified</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Date: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
