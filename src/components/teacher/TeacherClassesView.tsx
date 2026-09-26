import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Search,
  Phone,
  Mail,
  Upload,
  Trash2,
  Plus,
  Printer,
  Download,
  Eye,
  X,
  ShieldAlert,
  Award,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ModalPortal } from '../common/ModalPortal';
import type { Student, BehaviorCategory } from '../../types';

export const TeacherClassesView: React.FC = () => {
  const {
    currentUser,
    teachers,
    teacherAssignments,
    classSections,
    subjects,
    students,
    studentProfiles,
    parents,
    allUsers,
    attendance,
    scores,
    submissions,
    calculateGrade,
    updateStudentAvatar,
    removeStudentAvatar,
    studentBehaviorNotes,
    addBehaviorNote,
    deleteBehaviorNote,
  } = useSchool();

  const currentTeacher = teachers.find(t => t.userId === currentUser.id) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    myAssignments[0]?.classSectionId || classSections[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingStudent, setInspectingStudent] = useState<Student | null>(null);

  // New Behavioral Note Form state
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [noteCategory, setNoteCategory] = useState<BehaviorCategory>('COMMENDATION');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteSeverity, setNoteSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [noteVisibleToParent, setNoteVisibleToParent] = useState(true);
  const [noteNotice, setNoteNotice] = useState<string | null>(null);

  const selectedClass = classSections.find(c => c.id === selectedClassId) || classSections[0];
  const activeAssignment = myAssignments.find(a => a.classSectionId === selectedClassId) || myAssignments[0];
  const activeSubject = subjects.find(s => s.id === activeAssignment?.subjectId);

  const enrolledStudents = students.filter(
    s => s.classSectionId === selectedClassId && s.status === 'ACTIVE'
  );

  const filteredStudents = enrolledStudents.filter(st => {
    const profile = studentProfiles[st.userId];
    const name = profile?.name || '';
    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      st.admissionNumber.toLowerCase().includes(q)
    );
  });

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, studentId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateStudentAvatar(studentId, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Behavioral Note Handler
  const handleSaveBehaviorNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingStudent || !noteTitle.trim() || !noteDescription.trim()) return;

    addBehaviorNote({
      studentId: inspectingStudent.id,
      teacherId: currentTeacher?.id || 'tch_01',
      teacherName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      category: noteCategory,
      title: noteTitle.trim(),
      description: noteDescription.trim(),
      severity: noteSeverity,
      visibleToParent: noteVisibleToParent,
    });

    setNoteTitle('');
    setNoteDescription('');
    setShowAddNoteForm(false);
    setNoteNotice('Behavioral observation recorded in student history.');
    setTimeout(() => setNoteNotice(null), 3500);
  };

  // Export Roster CSV
  const handleExportRosterCSV = () => {
    const headers = [
      'Student Name',
      'Admission Number',
      'Class Section',
      'Gender',
      'Date of Birth',
      'Blood Group',
      'Guardian Name',
      'Guardian Phone',
      'Guardian Email',
      'Attendance Rate (%)',
    ];

    const rows = enrolledStudents.map(st => {
      const profile = studentProfiles[st.userId];
      const parent = parents.find(p => st.parentIds.includes(p.id));
      const parentUser = parent ? allUsers.find(u => u.id === parent.userId) : null;

      const stuAtt = attendance.filter(a => a.studentId === st.id);
      const presentCount = stuAtt.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attRate = stuAtt.length > 0 ? Math.round((presentCount / stuAtt.length) * 100) : 100;

      return [
        `"${profile?.name || 'Student'}"`,
        `"${st.admissionNumber}"`,
        `"${selectedClass?.name || ''}"`,
        `"${st.gender}"`,
        `"${st.dob}"`,
        `"${st.bloodGroup || '—'}"`,
        `"${parentUser?.name || 'Unlinked'}"`,
        `"${parentUser?.phone || '—'}"`,
        `"${parentUser?.email || '—'}"`,
        `${attRate}%`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedClass?.name || 'Class'}_Student_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan text-[10px]">Academic Class Rosters</span>
            <span className="text-xs text-[var(--text-secondary)]">Class & Student Cohorts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            My Classes & Student Cohorts
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Explore enrolled students in your assigned classes, inspect guardian emergency contacts, record commendations, and log behavioral observations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportRosterCSV}
            className="btn btn-secondary btn-sm"
            title="Download CSV roster of students"
          >
            <Download size={14} />
            <span>Export Roster CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            title="Print printable student roster"
          >
            <Printer size={14} />
            <span>Print Roster</span>
          </button>
        </div>
      </div>

      {/* Class Section Picker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {myAssignments.map(asgn => {
          const classSec = classSections.find(c => c.id === asgn.classSectionId);
          const subj = subjects.find(s => s.id === asgn.subjectId);
          const count = students.filter(
            s => s.classSectionId === asgn.classSectionId && s.status === 'ACTIVE'
          ).length;
          const isSelected = selectedClassId === asgn.classSectionId;

          return (
            <div
              key={asgn.id}
              onClick={() => setSelectedClassId(asgn.classSectionId)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    {classSec?.name}
                  </h3>
                  <span className="badge badge-cyan text-[10px] mt-1 font-bold">
                    {subj?.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200">
                  {count} Students
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-3 font-medium">
                Room: {classSec?.room || 'Main Block'} • Capacity: {classSec?.capacity}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected Class Student Roster */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
              Enrolled Students in {selectedClass?.name} ({filteredStudents.length})
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Click any student row or the inspect button to open their comprehensive behavioral log, guardian emergency contact, and subject score summary.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or admission ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-control !pl-9 !py-1.5 !text-xs !bg-white"
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Gender / DOB</th>
                <th>Linked Guardian</th>
                <th>Emergency Contact</th>
                <th>Attendance Compliance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    No students match your search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => {
                  const profile = studentProfiles[st.userId];
                  const firstParent = parents.find(p => st.parentIds.includes(p.id));
                  const parentUser = firstParent ? allUsers.find(u => u.id === firstParent.userId) : null;

                  // Student attendance
                  const stuAtt = attendance.filter(a => a.studentId === st.id);
                  const presentCount = stuAtt.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
                  const attRate = stuAtt.length > 0 ? Math.round((presentCount / stuAtt.length) * 100) : 100;

                  // Student behavior count
                  const notes = studentBehaviorNotes.filter(n => n.studentId === st.id);

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setInspectingStudent(st)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={profile?.name || 'Student'}
                            avatar={profile?.avatar}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-xs text-[var(--text-primary)] font-heading block">
                              {profile?.name}
                            </span>
                            {notes.length > 0 && (
                              <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                                <Award size={10} /> {notes.length} behavioral note{notes.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {st.admissionNumber}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800">{st.gender}</span>
                          <span className="text-[10px] text-slate-500 block">DOB: {st.dob}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-700 font-medium">
                          {parentUser?.name || 'Unlinked'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                          <Phone size={12} className="text-slate-400" />
                          <span>{parentUser?.phone || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all ${
                                attRate >= 85
                                  ? 'bg-emerald-500'
                                  : attRate >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${attRate}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold font-mono ${
                              attRate >= 85
                                ? 'text-emerald-700'
                                : attRate >= 70
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {attRate}%
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setInspectingStudent(st);
                          }}
                          className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
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
      <ModalPortal
        isOpen={Boolean(inspectingStudent)}
        onClose={() => {
          setInspectingStudent(null);
          setShowAddNoteForm(false);
        }}
      >
        {inspectingStudent && (
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content max-w-2xl w-full !bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-scale-up"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="relative group">
                  <UserAvatar
                    name={studentProfiles[inspectingStudent.userId]?.name || 'Student'}
                    avatar={studentProfiles[inspectingStudent.userId]?.avatar}
                    size="lg"
                  />
                  <label className="absolute bottom-0 right-0 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-md transition-all">
                    <Upload size={12} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handlePhotoUpload(e, inspectingStudent.id)}
                    />
                  </label>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                      {studentProfiles[inspectingStudent.userId]?.name}
                    </h2>
                    <span className="badge badge-cyan text-[10px] font-bold">
                      {inspectingStudent.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span>Admission ID: {inspectingStudent.admissionNumber}</span>
                    <span>•</span>
                    <span>Class: {selectedClass?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {studentProfiles[inspectingStudent.userId]?.avatar && (
                  <button
                    type="button"
                    onClick={() => removeStudentAvatar(inspectingStudent.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    title="Remove custom photo"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setInspectingStudent(null);
                    setShowAddNoteForm(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notice Message if any */}
            {noteNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{noteNotice}</span>
              </div>
            )}

            {/* Quick Metrics & Bio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Gender</span>
                <span className="text-sm font-bold text-slate-900">{inspectingStudent.gender}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Date of Birth</span>
                <span className="text-sm font-bold text-slate-900">{inspectingStudent.dob}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Blood Group</span>
                <span className="text-sm font-bold text-slate-900">{inspectingStudent.bloodGroup || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Admission Date</span>
                <span className="text-sm font-bold text-slate-900">{inspectingStudent.admissionDate}</span>
              </div>
            </div>

            {/* Linked Parent Information Card */}
            {(() => {
              const firstParent = parents.find(p => inspectingStudent.parentIds.includes(p.id));
              const parentUser = firstParent ? allUsers.find(u => u.id === firstParent.userId) : null;

              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartHandshake size={14} className="text-indigo-600" />
                      Guardian & Emergency Contact
                    </span>
                    {parentUser && (
                      <span className="badge badge-primary text-[10px]">Verified Parent</span>
                    )}
                  </div>

                  {parentUser ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Parent / Guardian Name:</span>
                        <strong className="text-slate-900 text-sm">{parentUser.name}</strong>
                        <span className="text-[11px] text-slate-500 block">{firstParent?.occupation}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-slate-900">
                          <Phone size={13} className="text-indigo-600" />
                          <span>{parentUser.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={13} className="text-indigo-600" />
                          <span>{parentUser.email}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-1">
                      No linked guardian registered yet. Admin can attach parent from the Parents Directory.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Subject Academic Performance in This Teacher's Subject */}
            {(() => {
              // Find score in active submission
              const sub = submissions.find(
                s => s.classSectionId === inspectingStudent.classSectionId && s.subjectId === activeSubject?.id
              );
              const scoreRec = sub ? scores.find(sc => sc.submissionId === sub.id && sc.studentId === inspectingStudent.id) : null;
              const stuTotal = scoreRec?.totalScore ?? 0;
              const gradeInfo = calculateGrade(stuTotal);

              return (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-indigo-600" />
                      Academic Standing: {activeSubject?.name}
                    </span>
                    <span className={`badge ${gradeInfo.colorClass} text-xs font-black`}>
                      Grade: {gradeInfo.grade} ({stuTotal}/100)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                    <span>
                      Remark: <strong className="text-indigo-950 font-semibold">{scoreRec?.teacherRemark || gradeInfo.remark}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Status: {sub?.status || 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Behavioral Log & Commendations Section */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-1.5">
                    <Award size={16} className="text-amber-500" />
                    Student Behavioral Log & Commendations
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Record positive milestones, disciplinary notes, or academic effort observations.
                  </p>
                </div>

                {!showAddNoteForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddNoteForm(true)}
                    className="btn btn-primary btn-sm !py-1 !px-2.5 text-xs flex items-center gap-1 bg-indigo-600 text-white font-bold shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Add Note</span>
                  </button>
                )}
              </div>

              {/* Add Note Form */}
              {showAddNoteForm && (
                <form
                  onSubmit={handleSaveBehaviorNote}
                  className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">New Behavioral Entry</span>
                    <button
                      type="button"
                      onClick={() => setShowAddNoteForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Category
                      </label>
                      <select
                        value={noteCategory}
                        onChange={e => setNoteCategory(e.target.value as BehaviorCategory)}
                        className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                      >
                        <option value="COMMENDATION">🌟 Commendation / Star Award</option>
                        <option value="ACADEMIC_EFFORT">📚 Academic Effort & Progress</option>
                        <option value="DISCIPLINE">⚠️ Disciplinary / Conduct Note</option>
                        <option value="GENERAL">📝 General Observation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Severity / Impact
                      </label>
                      <select
                        value={noteSeverity}
                        onChange={e => setNoteSeverity(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                        className="select-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                      >
                        <option value="LOW">Low / Routine Note</option>
                        <option value="MEDIUM">Medium / Notable</option>
                        <option value="HIGH">High / Urgent Priority</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Note Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Great Mathematics Olympiad participation"
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Detailed Observation / Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe the student's behavior or achievement..."
                      value={noteDescription}
                      onChange={e => setNoteDescription(e.target.value)}
                      className="input-control !w-full !bg-white !text-slate-900 !text-xs !border-slate-300"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noteVisibleToParent}
                        onChange={e => setNoteVisibleToParent(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Visible to linked guardian in Guardian Portal</span>
                    </label>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm bg-indigo-600 text-white font-bold"
                    >
                      Save Observation
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Notes Feed */}
              {(() => {
                const notes = studentBehaviorNotes.filter(n => n.studentId === inspectingStudent.id);

                if (notes.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No behavioral observations recorded for this student yet.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {notes.map(note => {
                      const isCommendation = note.category === 'COMMENDATION';
                      const isDiscipline = note.category === 'DISCIPLINE';

                      return (
                        <div
                          key={note.id}
                          className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                            isCommendation
                              ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                              : isDiscipline
                              ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {isCommendation && <Award size={14} className="text-amber-600" />}
                              {isDiscipline && <ShieldAlert size={14} className="text-rose-600" />}
                              <span className="font-extrabold text-xs font-heading">
                                {note.title}
                              </span>
                              <span
                                className={`badge text-[9px] ${
                                  isCommendation
                                    ? 'badge-warning'
                                    : isDiscipline
                                    ? 'badge-danger'
                                    : 'badge-cyan'
                                }`}
                              >
                                {note.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {note.date}
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteBehaviorNote(note.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Delete note"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {note.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>Logged by {note.teacherName}</span>
                            <span>{note.visibleToParent ? '👁️ Shared with Parent' : '🔒 Faculty internal'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setInspectingStudent(null);
                  setShowAddNoteForm(false);
                }}
                className="btn btn-secondary btn-sm"
              >
                Close Inspection
              </button>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};
