import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Eye,
  Search,
  CheckCircle2,
  FileCheck2,
  BookOpen,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    school,
    students,
    teachers,
    classSections,
    submissions,
    allUsers,
    subjects,
    currentSession,
    currentTerm,
  } = useSchool();

  const totalStudents = students.filter(s => s.status === 'ACTIVE').length;
  const totalTeachers = teachers.length;
  const totalClasses = classSections.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'SUBMITTED');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-100/90 via-indigo-50/80 to-blue-50/90 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-4 sm:p-6 md:p-7 border border-blue-200/70 dark:border-indigo-900/40 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Text & Mission Pills */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-400 block">
              EXECUTIVE OPERATIONS
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
              Administrative Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Live multi-tier institutional governance: student lifecycle, faculty workload distribution, terminal score review queues, and parent communications.
            </p>

            {/* 3 Core Values Pills */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-300/40">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">!</span>
                <span>Excellence in Character</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-300/40">
                <Users size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Leadership</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-300/40">
                <BookOpen size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Knowledge</span>
              </span>
            </div>
          </div>

          {/* Right Date & Academic Session Info Widget */}
          <div className="flex flex-col items-stretch sm:items-end gap-2.5 flex-shrink-0 w-full lg:w-auto">
            <div className="p-4 rounded-2xl bg-[#1e3a8a] text-white shadow-sm border border-blue-900/60 min-w-[240px] space-y-2">
              <div className="flex items-center justify-between gap-3 border-b border-blue-800/60 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Calendar size={13} className="text-blue-200" />
                  <span>Mon, Nov 16, 2025</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
              <div className="space-y-0.5 text-left sm:text-right">
                <div className="text-xs font-extrabold text-white">
                  {currentSession.name}
                </div>
                <div className="text-[11px] text-blue-200 font-medium">
                  {currentTerm.name}
                </div>
              </div>
              <div className="pt-1.5 flex items-center justify-between text-[11px] text-blue-200/90 font-semibold border-t border-blue-800/40">
                <span>Code: <span className="text-white font-mono">{school.code}</span></span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-700/60 text-blue-100 font-bold">In Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Amber Alert Banner */}
      <div className="p-4 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-black text-base shadow-sm">
            !
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900">
                {pendingSubmissions.length} Teacher Score Sheet{pendingSubmissions.length === 1 ? '' : 's'} Awaiting Administrative Review
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Faculty have submitted final terminal scores for {currentTerm.name}. Inspect scores, approve & lock, or return for corrections.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('admin_results')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm self-end sm:self-auto flex items-center gap-1.5"
        >
          <span>Review Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 3. 5-Column Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Enrolled Students */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Enrolled Students
              </span>
              <span className="text-2xl font-black font-heading text-slate-900">
                {totalStudents}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-600 font-bold">100% Active</span>
            <button onClick={() => onNavigate('admin_students')} className="text-blue-600 font-bold hover:underline">
              Manage Directory →
            </button>
          </div>
        </div>

        {/* Class Sections */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Class Sections
              </span>
              <span className="text-2xl font-black font-heading text-slate-900">
                {totalClasses}
              </span>
            </div>
          </div>
          <div className="text-xs pt-1">
            <span className="text-emerald-600 font-bold">100% Active</span>
          </div>
        </div>

        {/* Academic Faculty */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Academic Faculty
              </span>
              <span className="text-2xl font-black font-heading text-slate-900">
                {totalTeachers}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-600 font-bold">100% Assigned</span>
            <button onClick={() => onNavigate('admin_teachers')} className="text-blue-600 font-bold hover:underline">
              Allocations →
            </button>
          </div>
        </div>

        {/* Term Attendance Rate */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Term Attendance Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-heading text-slate-900">
                  88%
                </span>
                <span className="text-xs text-slate-400">7/8 logs</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp size={12} /> High Compliance
            </span>
            <button onClick={() => onNavigate('admin_attendance')} className="text-blue-600 font-bold hover:underline">
              View Matrix →
            </button>
          </div>
        </div>

        {/* Results Pipeline */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Results Pipeline
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black font-heading text-slate-900">
                  1
                </span>
                <span className="text-xs font-bold text-slate-600">Published</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                  (1 Pending)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 text-xs">4 Total Sheets</span>
            <button onClick={() => onNavigate('admin_results')} className="text-blue-600 font-bold hover:underline">
              Approvals →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Middle Section (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Col 1: 7-Day Attendance Rate Compliance (5 Cols) */}
        <div className="lg:col-span-5 min-w-0 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  7-Day Attendance Rate Compliance
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Metric
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Aggregated daily presence rate across all JSS & SS class arms
            </p>

            <div className="flex items-center gap-4">
              {/* SVG Area Chart */}
              <div className="flex-1 h-36 min-w-0">
                <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="attBlueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="30" y1="20" x2="310" y2="20" stroke="#f1f5f9" strokeDasharray="2 2" />
                  <line x1="30" y1="50" x2="310" y2="50" stroke="#f1f5f9" strokeDasharray="2 2" />
                  <line x1="30" y1="80" x2="310" y2="80" stroke="#f1f5f9" strokeDasharray="2 2" />
                  <line x1="30" y1="105" x2="310" y2="105" stroke="#e2e8f0" />

                  {/* Y-axis labels */}
                  <text x="0" y="23" fontSize="8" fill="#94a3b8">100%</text>
                  <text x="5" y="53" fontSize="8" fill="#94a3b8">90%</text>
                  <text x="5" y="83" fontSize="8" fill="#94a3b8">80%</text>
                  <text x="5" y="108" fontSize="8" fill="#94a3b8">60%</text>

                  {/* Area fill */}
                  <path
                    d="M 45 45 C 65 30 75 25 90 25 C 105 25 120 38 135 38 C 150 38 165 22 180 22 C 195 22 210 30 225 30 C 240 30 255 35 270 35 C 285 35 295 20 305 15 L 305 105 L 45 105 Z"
                    fill="url(#attBlueGrad)"
                  />
                  {/* Line stroke */}
                  <path
                    d="M 45 45 C 65 30 75 25 90 25 C 105 25 120 38 135 38 C 150 38 165 22 180 22 C 195 22 210 30 225 30 C 240 30 255 35 270 35 C 285 35 295 20 305 15"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Data points */}
                  {[
                    { cx: 45, cy: 45, day: 'Mon', val: '94%' },
                    { cx: 90, cy: 25, day: 'Tue', val: '97%' },
                    { cx: 135, cy: 38, day: 'Wed', val: '95%' },
                    { cx: 180, cy: 22, day: 'Thu', val: '98%' },
                    { cx: 225, cy: 30, day: 'Fri', val: '96%' },
                    { cx: 270, cy: 35, day: 'Mon', val: '95%' },
                    { cx: 305, cy: 15, day: 'Tue', val: '99%' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.cx} cy={pt.cy} r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={pt.cx} y={pt.cy - 7} textAnchor="middle" fill="#2563eb" fontSize="8" fontWeight="bold">
                        {pt.val}
                      </text>
                      <text x={pt.cx} y="116" textAnchor="middle" fill="#64748b" fontSize="8">
                        {pt.day}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Circular Weekly Average Meter & Stacked Subtext */}
              <div className="w-28 text-center flex flex-col items-center justify-center flex-shrink-0 space-y-1.5">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-emerald-200 flex flex-col items-center justify-center">
                  <span className="text-xs font-black font-heading text-slate-900 leading-tight">
                    96.4%
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">Weekly Avg</span>
                </div>
                <div className="text-[11px] text-slate-500 text-center leading-snug pt-1">
                  <span className="text-emerald-600 font-bold flex items-center justify-center gap-0.5">
                    <TrendingUp size={12} /> High Compliance
                  </span>
                  <span className="block text-[10px] text-slate-400">across all arms</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Target: &gt; 90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Score Distribution (3 Cols = 25%) */}
        <div className="lg:col-span-3 min-w-0 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1 gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                Score Distribution
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0 whitespace-nowrap">
                WAEC Curve
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 truncate">
              Grade frequency for {currentTerm.name}
            </p>

            {/* Vertical Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-28 pt-4 px-1">
              {[
                { grade: 'A', height: 'h-14', color: 'bg-emerald-500', num: '15', pct: '(56%)' },
                { grade: 'B', height: 'h-10', color: 'bg-blue-500', num: '22', pct: '(22%)' },
                { grade: 'C', height: 'h-16', color: 'bg-amber-400', num: '42', pct: '(22%)' },
                { grade: 'D', height: 'h-4', color: 'bg-orange-500', num: '70', pct: '(0%)' },
                { grade: 'F', height: 'h-20', color: 'bg-rose-500', num: '92', pct: '(22%)' },
              ].map(item => (
                <div key={item.grade} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <span className="text-[9px] font-black text-slate-700 mb-0.5">{item.num}</span>
                  <span className="text-[8px] text-slate-400 mb-1 truncate">{item.pct}</span>
                  <div className={`w-full max-w-[28px] ${item.height} ${item.color} rounded-t-md`} />
                  <span className="text-[10px] font-bold text-slate-600 mt-1.5">{item.grade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 text-center">
            <Award size={15} className="flex-shrink-0" />
            <span className="truncate">Overall Class Pass Rate: <strong className="font-black">100% Passing</strong></span>
          </div>
        </div>

        {/* Col 3: Live Operations Stream (4 Cols = 33.3%) */}
        <div className="lg:col-span-4 min-w-0 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                Live Operations Stream
              </h3>
              <button onClick={() => onNavigate('admin_reports_audit')} className="text-xs text-blue-600 font-bold hover:underline flex-shrink-0 whitespace-nowrap">
                All Logs →
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Item 1: Publish Results */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <FileCheck2 size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[11px] text-emerald-600 uppercase tracking-wide truncate">
                      PUBLISH RESULTS
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">10:00 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Published First Term results for JSS 1 Alpha Mathematics (Teacher: Mr. David Adeleke). Visible to parents.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Actor: <strong className="text-slate-700">Pastor Samuel Adeleke</strong> (SCHOOL_ADMIN)
                  </span>
                </div>
              </div>

              {/* Item 2: Return Submission */}
              <div className="flex items-start gap-2.5 text-xs pt-1.5 border-t border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <AlertTriangle size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[11px] text-rose-600 uppercase tracking-wide truncate">
                      RETURN SUBMISSION
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">12:00 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Returned SS 2 Science Chemistry submission to Dr. Adekunle Martins with feedback.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Actor: <strong className="text-slate-700">Pastor Samuel Adeleke</strong> (SCHOOL_ADMIN)
                  </span>
                </div>
              </div>

              {/* Item 3: Submit Scores */}
              <div className="flex items-start gap-2.5 text-xs pt-1.5 border-t border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <FileText size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[11px] text-blue-600 uppercase tracking-wide truncate">
                      SUBMIT SCORES
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">05:00 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Submitted SS 2 Science Physics terminal scores for admin review and lock.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Actor: <strong className="text-slate-700">Mr. David Adeleke</strong> (TEACHER)
                  </span>
                </div>
              </div>

              {/* Item 4: Record Attendance */}
              <div className="flex items-start gap-2.5 text-xs pt-1.5 border-t border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[11px] text-purple-600 uppercase tracking-wide truncate">
                      RECORD ATTENDANCE
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">09:15 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Marked daily attendance for JSS 1 Alpha (3 students present, 1 late).
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Actor: <strong className="text-slate-700">Mr. David Adeleke</strong> (TEACHER)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Active Score Submissions Overview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Score Submissions Overview
            </h3>
            <p className="text-xs text-slate-400">
              Live workflow pipeline of teacher terminal assessments for {currentTerm.name}
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin_results')}
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-bold">Class Arm</th>
                <th className="py-2.5 px-3 font-bold">Subject</th>
                <th className="py-2.5 px-3 font-bold">Teacher</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map(sub => {
                const sec = classSections.find(c => c.id === sub.classSectionId);
                const teacher = teachers.find(t => t.id === sub.teacherId);
                const teacherUser = allUsers.find(u => u.id === teacher?.userId);
                const subject = subjects.find(s => s.id === sub.subjectId);

                const getStatusPill = () => {
                  switch (sub.status) {
                    case 'PUBLISHED':
                      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Published</span>;
                    case 'SUBMITTED':
                      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Awaiting Review</span>;
                    case 'DRAFT':
                      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>;
                    case 'RETURNED':
                      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Returned</span>;
                    default:
                      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Approved</span>;
                  }
                };

                const isAwaitingReview = sub.status === 'SUBMITTED';

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {sec?.name}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {subject?.name}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={teacherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={teacherUser?.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-medium text-slate-800">
                          {teacherUser?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">{getStatusPill()}</td>
                    <td className="py-3 px-3 text-right">
                      {isAwaitingReview ? (
                        <button
                          onClick={() => onNavigate('admin_results')}
                          className="btn bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold !py-1 !px-3 rounded-lg shadow-sm inline-flex items-center gap-1"
                        >
                          <Search size={12} />
                          <span>Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('admin_results')}
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold !py-1 !px-3 rounded-lg inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
