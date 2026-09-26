import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  CalendarCheck2,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Upload,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface ParentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    parents,
    students,
    studentProfiles,
    classSections,
    submissions,
    scores,
    subjects,
    teachers,
    teacherAssignments,
    allUsers,
    attendance,
    currentTerm,
    currentSession,
    updateStudentAvatar,
    removeStudentAvatar,
  } = useSchool();

  const currentParent = parents.find(p => p.userId === currentUser.id) || parents[0];
  const linkedStudentIds = currentParent?.childrenStudentIds || [];
  const linkedStudents = students.filter(s => linkedStudentIds.includes(s.id));

  const [selectedChildId, setSelectedChildId] = useState<string>(
    linkedStudentIds[0] || ''
  );

  const childFileInputRef = useRef<HTMLInputElement>(null);

  const activeChild = students.find(s => s.id === selectedChildId) || linkedStudents[0];
  const activeProfile = activeChild ? studentProfiles[activeChild.userId] : null;
  const activeClass = classSections.find(c => c.id === activeChild?.classSectionId);

  // Child attendance metrics
  const childAttendance = attendance.filter(a => a.studentId === activeChild?.id);
  const presentDays = childAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = childAttendance.length > 0
    ? Math.round((presentDays / childAttendance.length) * 100)
    : 100;

  // Check today's attendance
  const today = '2026-09-08';
  const todayAtt = childAttendance.find(a => a.date === today);

  // Published scores for child
  const publishedSubmissions = submissions.filter(
    s => s.classSectionId === activeChild?.classSectionId && s.status === 'PUBLISHED'
  );
  const publishedSubIds = publishedSubmissions.map(s => s.id);
  const childScores = scores.filter(
    sc => sc.studentId === activeChild?.id && publishedSubIds.includes(sc.submissionId)
  );

  // Class teacher info
  const classAssignment = teacherAssignments.find(a => a.classSectionId === activeChild?.classSectionId);
  const classTeacher = teachers.find(t => t.id === classAssignment?.teacherId);
  const classTeacherUser = allUsers.find(u => u.id === classTeacher?.userId);

  const handleChildPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChild) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateStudentAvatar(activeChild.id, result);
      }
    };
    reader.readAsDataURL(file);
    if (childFileInputRef.current) childFileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Parent Welcome Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-slate-950 border-indigo-500/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="badge badge-warning text-[10px] py-1 px-2.5 flex items-center gap-1.5">
                <Sparkles size={11} /> Parent Guardian Portal
              </span>
              <span className="text-xs text-slate-300 font-semibold">{currentTerm.name} ({currentSession.name})</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight font-heading">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Monitoring academic progress, daily attendance registers, and verified report cards for your enrolled children.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('parent_reports')}
              className="btn btn-primary btn-md shadow-lg shadow-indigo-600/30"
            >
              <FileText size={16} />
              <span>View Official Report Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Child Selector Switcher Tabs */}
      {linkedStudents.length > 1 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Select Child Ward:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {linkedStudents.map(child => {
              const profile = studentProfiles[child.userId];
              const sec = classSections.find(c => c.id === child.classSectionId);
              const isSelected = selectedChildId === child.id;

              return (
                <div
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'glass-card glass-card-hover'
                  }`}
                >
                  <UserAvatar
                    name={profile?.name || 'Child'}
                    avatar={profile?.avatar}
                    size="md"
                    shape="rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate font-heading">
                      {profile?.name}
                    </h4>
                    <span className="text-xs text-indigo-400 font-semibold block">
                      {sec?.name} • {child.admissionNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Child Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Child Profile Card */}
        <div className="glass-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <input
              type="file"
              ref={childFileInputRef}
              onChange={handleChildPhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <UserAvatar
              name={activeProfile?.name || 'Student'}
              avatar={activeProfile?.avatar}
              size="xl"
              shape="rounded"
              editable={true}
              onUpload={(url) => activeChild && updateStudentAvatar(activeChild.id, url)}
              onRemove={() => activeChild && removeStudentAvatar(activeChild.id)}
            />
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] truncate font-heading">
                {activeProfile?.name}
              </h3>
              <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 block w-fit mt-1">
                {activeChild?.admissionNumber}
              </span>
              <span className="text-xs text-[var(--text-secondary)] block mt-1">
                Class: <strong>{activeClass?.name}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => childFileInputRef.current?.click()}
            className="btn btn-secondary btn-sm !text-xs !py-1 !px-2 flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
            title="Upload/Change child photo from laptop"
          >
            <Upload size={12} />
            <span className="hidden md:inline">{activeProfile?.avatar ? 'Change' : 'Upload'}</span>
          </button>
        </div>

        {/* Today's Roll Call Badge */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Today's Attendance ({today})
            </span>
            <CalendarCheck2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {todayAtt?.status === 'PRESENT' ? (
              <span className="badge badge-success text-xs font-bold py-1 px-3">
                <CheckCircle2 size={13} /> Present in Class
              </span>
            ) : todayAtt?.status === 'LATE' ? (
              <span className="badge badge-warning text-xs font-bold py-1 px-3">
                <Clock size={13} /> Late Arrival
              </span>
            ) : todayAtt?.status === 'ABSENT' ? (
              <span className="badge badge-danger text-xs font-bold py-1 px-3">
                Absent
              </span>
            ) : (
              <span className="badge badge-success text-xs font-bold py-1 px-3">
                <CheckCircle2 size={13} /> Present & Marked
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Term Compliance: <strong className="text-emerald-400">{attendanceRate}%</strong>
          </span>
        </div>

        {/* Published Grades Count */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Published Results
            </span>
            <FileText size={18} className="text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--text-primary)] font-heading">
            {childScores.length} Subject Transcripts
          </div>
          <span className="text-xs text-indigo-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('parent_reports')}>
            View Verified Report Card →
          </span>
        </div>
      </div>

      {/* Two Column Layout: Published Subject Performance & Class Teacher Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Published Subject Scores */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                Published Academic Scores ({currentTerm.name})
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Verified terminal examination results released by the school administration.
              </p>
            </div>
            <button
              onClick={() => onNavigate('parent_reports')}
              className="btn btn-secondary btn-sm text-xs"
            >
              <span>Full Transcript</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {childScores.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 rounded-xl bg-[var(--bg-surface-soft)] border border-dashed border-[var(--border-medium)]">
                Terminal examination scores for {currentTerm.name} are currently undergoing administrative verification and will appear once published.
              </div>
            ) : (
              childScores.map(sc => {
                const sub = submissions.find(s => s.id === sc.submissionId);
                const subj = subjects.find(s => s.id === sub?.subjectId);
                return (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)] flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="font-bold text-sm text-[var(--text-primary)] block font-heading">
                        {subj?.name} ({subj?.code})
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] italic mt-0.5 block">
                        "{sc.teacherRemark || sc.remark}"
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-black text-base text-[var(--text-primary)]">
                          {sc.totalScore}/100
                        </span>
                        <span className="text-[10px] text-slate-400 block">Total Score</span>
                      </div>
                      <span className="badge badge-primary text-sm font-extrabold py-1 px-3">
                        {sc.grade}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Class Teacher Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-3">
              Assigned Form / Subject Teacher
            </span>
            <div className="flex items-center gap-3.5">
              <UserAvatar
                name={classTeacherUser?.name || 'Class Teacher'}
                avatar={classTeacherUser?.avatar}
                size="lg"
                shape="rounded"
              />
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  {classTeacherUser?.name || 'Class Teacher'}
                </h4>
                <span className="text-xs text-cyan-400 font-semibold block">
                  {classTeacher?.specialization}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400" />
                <span className="truncate">{classTeacherUser?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span>{classTeacherUser?.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('parent_notices')}
            className="btn btn-secondary btn-sm w-full text-xs"
          >
            <span>View School Circulars</span>
          </button>
        </div>
      </div>
    </div>
  );
};
