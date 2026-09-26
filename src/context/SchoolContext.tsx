import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type {
  User,
  School,
  AcademicSession,
  Term,
  ClassLevel,
  ClassSection,
  Subject,
  Teacher,
  Parent,
  Student,
  TeacherAssignment,
  AttendanceRecord,
  AttendanceStatus,
  AssessmentWeightConfig,
  GradingScaleTier,
  ResultSubmission,
  ScoreItem,
  AuditLog,
  TimetableSlot,
  DayOfWeek,
  StudentBehaviorNote,
  Announcement,
  PeriodDefinition,
} from '../types';
import {
  INITIAL_SCHOOL,
  INITIAL_SESSIONS,
  INITIAL_TERMS,
  INITIAL_CLASS_LEVELS,
  INITIAL_CLASS_SECTIONS,
  INITIAL_SUBJECTS,
  INITIAL_ASSESSMENT_CONFIG,
  INITIAL_GRADING_SCALE,
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_PARENTS,
  INITIAL_STUDENTS,
  INITIAL_STUDENT_USERS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_SUBMISSIONS,
  INITIAL_SCORES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TIMETABLE,
  INITIAL_BEHAVIOR_NOTES,
  INITIAL_PERIOD_DEFINITIONS,
} from '../data/seedData';

interface SchoolContextType {
  // Current session & theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentUser: User;
  switchUser: (userId: string) => void;
  allUsers: User[];
  
  // Auth & Session
  isAuthenticated: boolean;
  login: (credential: string, password?: string) => { success: boolean; error?: string };
  loginAsUser: (userId: string) => void;
  logout: () => void;

  // School & Academic Setup
  school: School;
  updateSchoolProfile: (updates: Partial<School>) => void;
  sessions: AcademicSession[];
  terms: Term[];
  currentSession: AcademicSession;
  currentTerm: Term;
  setCurrentSession: (sessionId: string) => void;
  setCurrentTerm: (termId: string) => void;
  createSession: (name: string, startDate: string, endDate: string) => void;
  createTerm: (sessionId: string, name: string, startDate: string, endDate: string) => void;
  
  // Classes & Subjects
  classLevels: ClassLevel[];
  classSections: ClassSection[];
  subjects: Subject[];
  createClassLevel: (name: string) => void;
  updateClassLevel: (id: string, name: string) => void;
  deleteClassLevel: (id: string) => void;
  createClassSection: (classLevelId: string, name: string, room?: string) => void;
  updateClassSection: (id: string, updates: { name?: string; room?: string; capacity?: number; classLevelId?: string }) => void;
  deleteClassSection: (id: string) => void;
  createSubject: (name: string, code: string, category: 'CORE' | 'ELECTIVE' | 'VOCATIONAL') => void;
  updateSubject: (id: string, updates: { name?: string; code?: string; category?: 'CORE' | 'ELECTIVE' | 'VOCATIONAL' }) => void;
  deleteSubject: (id: string) => void;

  // Assessments & Grading
  assessmentConfigs: AssessmentWeightConfig[];
  updateAssessmentConfig: (configs: AssessmentWeightConfig[]) => void;
  gradingScale: GradingScaleTier[];

  // People & Directory
  teachers: Teacher[];
  parents: Parent[];
  students: Student[];
  studentProfiles: Record<string, { name: string; avatar: string }>;
  teacherAssignments: TeacherAssignment[];
  
  createStudent: (data: { name: string; admissionNumber: string; classSectionId: string; gender: 'MALE' | 'FEMALE'; dob: string; parentId?: string; avatar?: string }) => void;
  updateStudentStatus: (studentId: string, status: Student['status']) => void;
  updateStudentAvatar: (studentId: string, avatarDataUrl: string) => void;
  removeStudentAvatar: (studentId: string) => void;

  createParent: (data: { name: string; email: string; phone: string; occupation: string; address: string; linkStudentId?: string; linkStudentIds?: string[]; avatar?: string; password?: string }) => void;
  updateParentAvatar: (parentId: string, avatarDataUrl: string) => void;
  removeParentAvatar: (parentId: string) => void;
  updateParentCredentials: (parentId: string, updates: { email?: string; password?: string; phone?: string; isActive?: boolean }) => void;
  linkStudentToParent: (studentId: string, parentId: string) => void;
  linkMultipleStudentsToParent: (studentIds: string[], parentId: string) => void;

  createTeacher: (data: { name: string; email: string; phone: string; staffId: string; qualification: string; specialization: string; password?: string; avatar?: string }) => void;
  updateTeacherCredentials: (teacherId: string, updates: { email?: string; password?: string; staffId?: string; isActive?: boolean }) => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
  changeTeacherPassword: (identifier: string, oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  updateUserAvatar: (userId: string, avatarDataUrl: string) => void;
  removeUserAvatar: (userId: string) => void;
  assignTeacher: (teacherId: string, classSectionId: string, subjectId: string) => void;
  removeTeacherAssignment: (assignmentId: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (classSectionId: string, date: string, records: { studentId: string; status: AttendanceStatus; remarks?: string }[]) => void;
  
  // Results & Scoring Workflow
  submissions: ResultSubmission[];
  scores: ScoreItem[];
  getOrCreateSubmission: (classSectionId: string, subjectId: string, teacherId: string) => ResultSubmission;
  saveScoreDraft: (submissionId: string, scoreRows: { studentId: string; scores: Record<string, number>; teacherRemark?: string }[]) => void;
  submitScoresForApproval: (submissionId: string, scoreRows: { studentId: string; scores: Record<string, number>; teacherRemark?: string }[]) => void;
  approveSubmission: (submissionId: string) => void;
  returnSubmission: (submissionId: string, feedback: string) => void;
  publishSubmission: (submissionId: string) => void;

  // Communication & Announcements
  announcements: Announcement[];
  createAnnouncement: (title: string, content: string, category: Announcement['category'], targetAudience: Announcement['targetAudience'], targetClassSectionId?: string, isPinned?: boolean) => void;
  
  // Timetable & Schedule
  periodDefinitions: PeriodDefinition[];
  updatePeriodDefinition: (id: string, updates: Partial<PeriodDefinition>) => void;
  createPeriodDefinition: (data: Omit<PeriodDefinition, 'id'>) => void;
  deletePeriodDefinition: (id: string) => void;
  resetPeriodDefinitions: () => void;
  timetableSlots: TimetableSlot[];
  createTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'schoolId'>) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  getTeacherForClassSubject: (classSectionId: string, subjectId: string) => Teacher | undefined;
  checkTimetableConflict: (
    teacherId: string,
    day: DayOfWeek,
    periodNumber: number,
    excludeSlotId?: string
  ) => {
    hasConflict: boolean;
    conflictingSlot?: TimetableSlot;
    conflictingClass?: string;
    conflictingSubject?: string;
  };
  bulkAssignTeachers: (assignments: Array<{ teacherId: string; classSectionId: string; subjectId: string }>) => void;

  // Student Behavioral Notes & Commendations
  studentBehaviorNotes: StudentBehaviorNote[];
  addBehaviorNote: (data: Omit<StudentBehaviorNote, 'id' | 'schoolId' | 'createdAt'>) => void;
  deleteBehaviorNote: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entityType: AuditLog['entityType'], details: string, entityId?: string) => void;

  // Query / Calculation Helpers
  calculateGrade: (totalScore: number) => { grade: string; remark: string; colorClass: string };
  getTeacherProfile: (userId: string) => Teacher | undefined;
  getParentProfile: (userId: string) => Parent | undefined;
  getStudentName: (studentId: string) => string;
  getStudentAvatar: (studentId: string) => string;

  // Live PostgreSQL Database
  isLiveDb: boolean;
  dbStatus: 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'OFFLINE';
  dbInfo: { provider: string; host: string; database: string } | null;
  lastSyncTime: Date | null;
  refreshFromLiveDb: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state (Enforce light mode to match reference UI)
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('schoolos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State initialization with localStorage persistence
  const [school, setSchool] = useState<School>(() => {
    const saved = localStorage.getItem('schoolos_school');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_SCHOOL;
  });

  const [sessions, setSessions] = useState<AcademicSession[]>(() => {
    const saved = localStorage.getItem('schoolos_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_SESSIONS;
  });

  const [terms, setTerms] = useState<Term[]>(() => {
    const saved = localStorage.getItem('schoolos_terms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always sanitize any seasonal suffixes like (Autumn), (Spring), (Summer)
          return parsed.map((t: Term) => ({
            ...t,
            name: t.name.replace(/\s*\(Autumn\)|\s*\(Spring\)|\s*\(Summer\)/gi, '').trim(),
          }));
        }
      } catch (e) {}
    }
    return INITIAL_TERMS;
  });
  const [classLevels, setClassLevels] = useState<ClassLevel[]>(INITIAL_CLASS_LEVELS);
  const [classSections, setClassSections] = useState<ClassSection[]>(INITIAL_CLASS_SECTIONS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [assessmentConfigs, setAssessmentConfigs] = useState<AssessmentWeightConfig[]>(INITIAL_ASSESSMENT_CONFIG);
  const [gradingScale] = useState<GradingScaleTier[]>(INITIAL_GRADING_SCALE);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [parents, setParents] = useState<Parent[]>(INITIAL_PARENTS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [studentProfiles, setStudentProfiles] = useState<Record<string, { name: string; avatar: string }>>(INITIAL_STUDENT_USERS);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(INITIAL_TEACHER_ASSIGNMENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [submissions, setSubmissions] = useState<ResultSubmission[]>(INITIAL_SUBMISSIONS);
  const [scores, setScores] = useState<ScoreItem[]>(INITIAL_SCORES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [periodDefinitions, setPeriodDefinitions] = useState<PeriodDefinition[]>(() => {
    const saved = localStorage.getItem('schoolos_period_definitions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_PERIOD_DEFINITIONS;
  });

  useEffect(() => {
    localStorage.setItem('schoolos_period_definitions', JSON.stringify(periodDefinitions));
  }, [periodDefinitions]);

  useEffect(() => {
    localStorage.setItem('schoolos_school', JSON.stringify(school));
  }, [school]);

  useEffect(() => {
    localStorage.setItem('schoolos_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('schoolos_terms', JSON.stringify(terms));
  }, [terms]);

  const [studentBehaviorNotes, setStudentBehaviorNotes] = useState<StudentBehaviorNote[]>(INITIAL_BEHAVIOR_NOTES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Live Database State
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR' | 'OFFLINE'>('CONNECTING');
  const [dbInfo, setDbInfo] = useState<{ provider: string; host: string; database: string } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const isInitialLoadDone = useRef(false);

  const refreshFromLiveDb = useCallback(async () => {
    try {
      const healthRes = await fetch('/api/db/health');
      if (!healthRes.ok) throw new Error('Health check failed');
      const healthData = await healthRes.json();

      if (healthData.ok) {
        setIsLiveDb(true);
        setDbStatus('CONNECTED');
        setDbInfo({
          provider: healthData.provider,
          host: healthData.host,
          database: healthData.database,
        });

        const stateRes = await fetch('/api/db/state');
        if (stateRes.ok) {
          const statePayload = await stateRes.json();
          if (statePayload.ok && statePayload.data) {
            const d = statePayload.data;
            if (d.school) setSchool(d.school);
            if (Array.isArray(d.sessions) && d.sessions.length) setSessions(d.sessions);
            if (Array.isArray(d.terms) && d.terms.length) setTerms(d.terms);
            if (Array.isArray(d.classLevels) && d.classLevels.length) setClassLevels(d.classLevels);
            if (Array.isArray(d.classSections) && d.classSections.length) setClassSections(d.classSections);
            if (Array.isArray(d.subjects) && d.subjects.length) setSubjects(d.subjects);
            if (Array.isArray(d.users) && d.users.length) setUsers(d.users);
            if (Array.isArray(d.teachers) && d.teachers.length) setTeachers(d.teachers);
            if (Array.isArray(d.parents) && d.parents.length) setParents(d.parents);
            if (Array.isArray(d.students) && d.students.length) setStudents(d.students);
            if (d.studentProfiles) setStudentProfiles(d.studentProfiles);
            if (Array.isArray(d.teacherAssignments)) setTeacherAssignments(d.teacherAssignments);
            if (Array.isArray(d.attendance)) setAttendance(d.attendance);
            if (Array.isArray(d.assessmentConfigs)) setAssessmentConfigs(d.assessmentConfigs);
            if (Array.isArray(d.submissions)) setSubmissions(d.submissions);
            if (Array.isArray(d.scores)) setScores(d.scores);
            if (Array.isArray(d.announcements)) setAnnouncements(d.announcements);
            if (Array.isArray(d.timetableSlots)) setTimetableSlots(d.timetableSlots);
            if (Array.isArray(d.periodDefinitions)) setPeriodDefinitions(d.periodDefinitions);
            if (Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
            setLastSyncTime(new Date());
          }
        }
      }
    } catch (err) {
      console.warn('[SchoolOS] Live DB connection not available:', err);
      setIsLiveDb(false);
      setDbStatus('OFFLINE');
    }
  }, []);

  // On mount: fetch live database
  useEffect(() => {
    refreshFromLiveDb().finally(() => {
      isInitialLoadDone.current = true;
    });
  }, [refreshFromLiveDb]);

  // Debounced auto-sync to PostgreSQL when state updates
  useEffect(() => {
    if (!isInitialLoadDone.current || !isLiveDb) return;

    const timer = setTimeout(() => {
      fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school,
          sessions,
          terms,
          users,
          parents,
          students,
          studentProfiles,
          attendance,
          submissions,
          scores,
          auditLogs,
        }),
      })
        .then(() => setLastSyncTime(new Date()))
        .catch(err => console.error('[Live DB Sync Error]:', err));
    }, 800);

    return () => clearTimeout(timer);
  }, [
    isLiveDb,
    school,
    sessions,
    terms,
    users,
    parents,
    students,
    studentProfiles,
    attendance,
    submissions,
    scores,
    auditLogs,
  ]);

  // Active simulated user & Auth state
  const [currentUserId, setCurrentUserId] = useState<string>('usr_admin');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const stored = localStorage.getItem('schoolos_auth');
    return stored !== null ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('schoolos_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const u = users.find(x => x.id === userId);
    if (u) {
      addAuditLog('SWITCH_USER_SESSION', 'SECURITY', `User switched simulation context to ${u.name} (${u.role})`);
    }
  };

  const login = (credential: string, password?: string): { success: boolean; error?: string } => {
    const trimmed = credential.trim().toLowerCase();
    const pwd = password?.trim() || '';

    // General Admin quick matching:
    // Matches by email or username 'admin'
    let foundUser = users.find(
      u => u.email.toLowerCase() === trimmed || (trimmed === 'admin' && (u.role === 'SCHOOL_ADMIN' || u.role === 'SUPER_ADMIN'))
    );

    // If not found by email, check if credential matches a teacher's staff ID (e.g. 'STAFF/2024/001' or '001')
    if (!foundUser) {
      const matchTeacher = teachers.find(
        t => t.staffId.toLowerCase() === trimmed || t.staffId.toLowerCase().endsWith(trimmed)
      );
      if (matchTeacher) {
        foundUser = users.find(u => u.id === matchTeacher.userId);
      }
    }

    if (!foundUser) {
      return { success: false, error: 'No active user account found with this email, staff ID, or username.' };
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'This account has been deactivated by the School Administrator.' };
    }

    // Password validation (default: 'admin' for admin, 'teacher123' for teachers, 'parent123' for parents, or custom set)
    if (pwd) {
      const validPwd = foundUser.password || (foundUser.role.includes('ADMIN') ? 'admin' : 'teacher123');
      const isGeneralAdminPass = foundUser.role.includes('ADMIN') && (pwd === 'admin' || pwd === 'admin123');
      if (pwd !== validPwd && !isGeneralAdminPass) {
        return { success: false, error: 'Invalid password. Please check your credentials and try again.' };
      }
    }

    setCurrentUserId(foundUser.id);
    setIsAuthenticated(true);
    addAuditLog('USER_LOGIN', 'SECURITY', `${foundUser.name} logged in successfully as ${foundUser.role}`);
    return { success: true };
  };

  const loginAsUser = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (u) {
      setCurrentUserId(u.id);
      setIsAuthenticated(true);
      addAuditLog('DEMO_PERSONA_LOGIN', 'SECURITY', `Authenticated session for ${u.name} (${u.role})`);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('USER_LOGOUT', 'SECURITY', `User logged out of session`);
  };

  const currentSession = sessions.find(s => s.id === school.currentSessionId) || sessions.find(s => s.isCurrent) || sessions[0];
  const currentTerm = terms.find(t => t.id === school.currentTermId) || terms.find(t => t.isCurrent) || terms[0];

  const updateSchoolProfile = (updates: Partial<School>) => {
    setSchool(prev => ({ ...prev, ...updates }));
    addAuditLog('UPDATE_SCHOOL_PROFILE', 'ACADEMIC_SETUP', `Updated school details`);
  };

  const setCurrentSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    setSessions(prev => prev.map(s => ({ ...s, isCurrent: s.id === sessionId })));

    // Find the active term for this session, or the first term in this session
    const sessionTerms = terms.filter(t => t.sessionId === sessionId);
    const activeTerm = sessionTerms.find(t => t.isCurrent) || sessionTerms[0];

    setSchool(prev => ({
      ...prev,
      currentSessionId: sessionId,
      currentTermId: activeTerm ? activeTerm.id : prev.currentTermId,
    }));

    if (activeTerm) {
      setTerms(prev => prev.map(t => ({ ...t, isCurrent: t.id === activeTerm.id })));
    }

    addAuditLog('SET_CURRENT_SESSION', 'ACADEMIC_SETUP', `Active session set to ${session?.name || sessionId}`);
  };

  const setCurrentTerm = (termId: string) => {
    const term = terms.find(t => t.id === termId);
    setTerms(prev => prev.map(t => ({ ...t, isCurrent: t.id === termId })));

    setSchool(prev => ({
      ...prev,
      currentTermId: termId,
      currentSessionId: term?.sessionId ? term.sessionId : prev.currentSessionId,
    }));

    if (term?.sessionId) {
      setSessions(prev => prev.map(s => ({ ...s, isCurrent: s.id === term.sessionId })));
    }

    addAuditLog('SET_CURRENT_TERM', 'ACADEMIC_SETUP', `Active term set to ${term?.name || termId}`);
  };

  const createSession = (name: string, startDate: string, endDate: string) => {
    const newSession: AcademicSession = {
      id: `sess_${Date.now()}`,
      schoolId: school.id,
      name,
      startDate,
      endDate,
      isCurrent: false,
    };
    setSessions(prev => [newSession, ...prev]);
    addAuditLog('CREATE_SESSION', 'ACADEMIC_SETUP', `Created academic session ${name}`);
  };

  const createTerm = (sessionId: string, name: string, startDate: string, endDate: string) => {
    const newTerm: Term = {
      id: `term_${Date.now()}`,
      schoolId: school.id,
      sessionId,
      name,
      startDate,
      endDate,
      isCurrent: false,
    };
    setTerms(prev => [...prev, newTerm]);
    addAuditLog('CREATE_TERM', 'ACADEMIC_SETUP', `Added term ${name} to session`);
  };

  const createClassLevel = (name: string) => {
    const newLevel: ClassLevel = {
      id: `lvl_${Date.now()}`,
      schoolId: school.id,
      name,
      order: classLevels.length + 1,
    };
    setClassLevels(prev => [...prev, newLevel]);
    addAuditLog('CREATE_CLASS_LEVEL', 'ACADEMIC_SETUP', `Created class tier ${name}`);
  };

  const updateClassLevel = (id: string, name: string) => {
    setClassLevels(prev => prev.map(lvl => (lvl.id === id ? { ...lvl, name } : lvl)));
    addAuditLog('UPDATE_CLASS_LEVEL', 'ACADEMIC_SETUP', `Renamed class tier to "${name}"`, id);
  };

  const deleteClassLevel = (id: string) => {
    const lvl = classLevels.find(l => l.id === id);
    setClassLevels(prev => prev.filter(l => l.id !== id));
    setClassSections(prev => prev.filter(s => s.classLevelId !== id));
    addAuditLog('DELETE_CLASS_LEVEL', 'ACADEMIC_SETUP', `Deleted class tier ${lvl?.name || id}`, id);
  };

  const createClassSection = (classLevelId: string, name: string, room?: string) => {
    const newSec: ClassSection = {
      id: `sec_${Date.now()}`,
      schoolId: school.id,
      classLevelId,
      name,
      room,
      capacity: 35,
    };
    setClassSections(prev => [...prev, newSec]);
    addAuditLog('CREATE_CLASS_SECTION', 'ACADEMIC_SETUP', `Created class arm ${name}`);
  };

  const updateClassSection = (
    id: string,
    updates: { name?: string; room?: string; capacity?: number; classLevelId?: string }
  ) => {
    setClassSections(prev =>
      prev.map(sec => (sec.id === id ? { ...sec, ...updates } : sec))
    );
    addAuditLog('UPDATE_CLASS_SECTION', 'ACADEMIC_SETUP', `Updated class arm details for ${updates.name || id}`, id);
  };

  const deleteClassSection = (id: string) => {
    const sec = classSections.find(s => s.id === id);
    setClassSections(prev => prev.filter(s => s.id !== id));
    addAuditLog('DELETE_CLASS_SECTION', 'ACADEMIC_SETUP', `Deleted class arm ${sec?.name || id}`, id);
  };

  const createSubject = (name: string, code: string, category: 'CORE' | 'ELECTIVE' | 'VOCATIONAL') => {
    const newSub: Subject = {
      id: `subj_${Date.now()}`,
      schoolId: school.id,
      name,
      code,
      category,
    };
    setSubjects(prev => [...prev, newSub]);
    addAuditLog('CREATE_SUBJECT', 'ACADEMIC_SETUP', `Added curriculum subject ${name} (${code})`);
  };

  const updateSubject = (
    id: string,
    updates: { name?: string; code?: string; category?: 'CORE' | 'ELECTIVE' | 'VOCATIONAL' }
  ) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, ...updates } : sub))
    );
    addAuditLog('UPDATE_SUBJECT', 'ACADEMIC_SETUP', `Updated subject ${updates.name || id}`, id);
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find(s => s.id === id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    addAuditLog('DELETE_SUBJECT', 'ACADEMIC_SETUP', `Deleted subject ${sub?.name || id}`, id);
  };

  const updateAssessmentConfig = (configs: AssessmentWeightConfig[]) => {
    setAssessmentConfigs(configs);
    addAuditLog('UPDATE_ASSESSMENT_CONFIG', 'ACADEMIC_SETUP', `Updated assessment weighting structure`);
  };

  // Grade calculator based on grading scale
  const calculateGrade = (totalScore: number) => {
    for (const tier of gradingScale) {
      if (totalScore >= tier.minScore && totalScore <= tier.maxScore) {
        return tier;
      }
    }
    return gradingScale[gradingScale.length - 1];
  };

  // Helper selectors
  const getTeacherProfile = (userId: string) => teachers.find(t => t.userId === userId);
  const getParentProfile = (userId: string) => parents.find(p => p.userId === userId);
  
  const getStudentName = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    if (!s) return 'Unknown Student';
    return studentProfiles[s.userId]?.name || 'Student';
  };

  const getStudentAvatar = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    if (!s) return '';
    return studentProfiles[s.userId]?.avatar || '';
  };

  // Student creation & management
  const createStudent = (data: {
    name: string;
    admissionNumber: string;
    classSectionId: string;
    gender: 'MALE' | 'FEMALE';
    dob: string;
    parentId?: string;
    avatar?: string;
  }) => {
    const newUserId = `usr_stu_${Date.now()}`;
    const newStudentId = `stu_${Date.now()}`;

    const newStudent: Student = {
      id: newStudentId,
      userId: newUserId,
      schoolId: school.id,
      admissionNumber: data.admissionNumber,
      classSectionId: data.classSectionId,
      gender: data.gender,
      dob: data.dob,
      parentIds: data.parentId ? [data.parentId] : [],
      status: 'ACTIVE',
      admissionDate: new Date().toISOString().split('T')[0],
    };

    setStudents(prev => [newStudent, ...prev]);
    setStudentProfiles(prev => ({
      ...prev,
      [newUserId]: {
        name: data.name,
        avatar: data.avatar || '',
      },
    }));

    if (data.parentId) {
      setParents(prev =>
        prev.map(p =>
          p.id === data.parentId
            ? { ...p, childrenStudentIds: [...p.childrenStudentIds, newStudentId] }
            : p
        )
      );
    }

    addAuditLog('CREATE_STUDENT', 'STUDENT', `Enrolled new student ${data.name} (${data.admissionNumber})`, newStudentId);
  };

  const updateStudentAvatar = (studentId: string, avatarDataUrl: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setStudentProfiles(prev => ({
      ...prev,
      [student.userId]: {
        ...prev[student.userId],
        avatar: avatarDataUrl,
      },
    }));

    addAuditLog('UPDATE_STUDENT_AVATAR', 'STUDENT', `Updated photo for student ${getStudentName(studentId)}`, studentId);
  };

  const removeStudentAvatar = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setStudentProfiles(prev => ({
      ...prev,
      [student.userId]: {
        ...prev[student.userId],
        avatar: '',
      },
    }));

    addAuditLog('REMOVE_STUDENT_AVATAR', 'STUDENT', `Removed photo for student ${getStudentName(studentId)}`, studentId);
  };

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, status } : s)));
    addAuditLog('UPDATE_STUDENT_STATUS', 'STUDENT', `Updated student status to ${status}`, studentId);
  };

  // Parent creation & management
  const createParent = (data: {
    name: string;
    email: string;
    phone: string;
    occupation: string;
    address: string;
    linkStudentId?: string;
    linkStudentIds?: string[];
    avatar?: string;
    password?: string;
  }) => {
    const newUserId = `usr_prt_${Date.now()}`;
    const newParentId = `prt_${Date.now()}`;

    // Combine single linkStudentId and multi linkStudentIds
    const rawIds = [
      ...(data.linkStudentIds || []),
      ...(data.linkStudentId ? [data.linkStudentId] : []),
    ];
    const studentIdsToLink = Array.from(new Set(rawIds)).filter(Boolean);

    const newUser: User = {
      id: newUserId,
      schoolId: school.id,
      name: data.name,
      email: data.email,
      role: 'PARENT',
      phone: data.phone,
      password: data.password || 'parent123',
      avatar: data.avatar || '',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newParent: Parent = {
      id: newParentId,
      userId: newUserId,
      schoolId: school.id,
      occupation: data.occupation,
      address: data.address,
      childrenStudentIds: studentIdsToLink,
    };

    setUsers(prev => [...prev, newUser]);
    setParents(prev => [...prev, newParent]);

    if (studentIdsToLink.length > 0) {
      setStudents(prev =>
        prev.map(s =>
          studentIdsToLink.includes(s.id)
            ? { ...s, parentIds: Array.from(new Set([...s.parentIds, newParentId])) }
            : s
        )
      );
    }

    if (isLiveDb) {
      fetch('/api/db/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUser,
          newParent,
          linkedStudentIds: studentIdsToLink,
        }),
      })
        .then(() => setLastSyncTime(new Date()))
        .catch(err => console.error('[PostgreSQL createParent Error]:', err));
    }

    addAuditLog('CREATE_PARENT', 'PARENT', `Onboarded parent ${data.name} with portal credentials (${studentIdsToLink.length} ward(s) linked)`, newParentId);
  };

  const updateParentCredentials = (
    parentId: string,
    updates: { email?: string; password?: string; phone?: string; isActive?: boolean }
  ) => {
    const parent = parents.find(p => p.id === parentId);
    if (!parent) return;

    setUsers(prev =>
      prev.map(u => {
        if (u.id === parent.userId) {
          return {
            ...u,
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.password ? { password: updates.password } : {}),
            ...(updates.phone ? { phone: updates.phone } : {}),
            ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
          };
        }
        return u;
      })
    );

    addAuditLog('UPDATE_PARENT_CREDENTIALS', 'SECURITY', `Updated login credentials for guardian ID ${parentId}`, parentId);
  };

  const updateParentAvatar = (parentId: string, avatarDataUrl: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (!parent) return;

    setUsers(prev =>
      prev.map(u => (u.id === parent.userId ? { ...u, avatar: avatarDataUrl } : u))
    );

    addAuditLog('UPDATE_PARENT_AVATAR', 'PARENT', `Updated photo for parent`, parentId);
  };

  const removeParentAvatar = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (!parent) return;

    setUsers(prev =>
      prev.map(u => (u.id === parent.userId ? { ...u, avatar: '' } : u))
    );

    addAuditLog('REMOVE_PARENT_AVATAR', 'PARENT', `Removed photo for parent`, parentId);
  };

  const updateUserAvatar = (userId: string, avatarDataUrl: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, avatar: avatarDataUrl } : u))
    );
    addAuditLog('UPDATE_USER_AVATAR', 'SECURITY', `Updated avatar for user ${userId}`);
  };

  const removeUserAvatar = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, avatar: '' } : u))
    );
    addAuditLog('REMOVE_USER_AVATAR', 'SECURITY', `Removed avatar for user ${userId}`);
  };

  const linkStudentToParent = (studentId: string, parentId: string) => {
    setParents(prev =>
      prev.map(p =>
        p.id === parentId && !p.childrenStudentIds.includes(studentId)
          ? { ...p, childrenStudentIds: [...p.childrenStudentIds, studentId] }
          : p
      )
    );
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId && !s.parentIds.includes(parentId)
          ? { ...s, parentIds: [...s.parentIds, parentId] }
          : s
      )
    );
    addAuditLog('LINK_PARENT_CHILD', 'PARENT', `Linked student ID ${studentId} to parent ID ${parentId}`);
  };

  const linkMultipleStudentsToParent = (studentIds: string[], parentId: string) => {
    if (!studentIds || studentIds.length === 0) return;
    setParents(prev =>
      prev.map(p =>
        p.id === parentId
          ? { ...p, childrenStudentIds: Array.from(new Set([...p.childrenStudentIds, ...studentIds])) }
          : p
      )
    );
    setStudents(prev =>
      prev.map(s =>
        studentIds.includes(s.id) && !s.parentIds.includes(parentId)
          ? { ...s, parentIds: [...s.parentIds, parentId] }
          : s
      )
    );
    addAuditLog('LINK_PARENT_CHILD', 'PARENT', `Linked ${studentIds.length} student(s) to parent ID ${parentId}`);
  };

  // Global Super Admin password setter for anyone
  const updateUserPassword = (userId: string, newPassword: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: newPassword } : u))
    );
    const targetUser = users.find(u => u.id === userId);
    addAuditLog(
      'ADMIN_SET_USER_PASSWORD',
      'SECURITY',
      `Super Admin set password for ${targetUser?.name || userId} (${targetUser?.role || 'USER'})`,
      userId
    );
  };

  // Teacher onboarding & credentials management
  const createTeacher = (data: {
    name: string;
    email: string;
    phone: string;
    staffId: string;
    qualification: string;
    specialization: string;
    password?: string;
    avatar?: string;
  }) => {
    const newUserId = `usr_tch_${Date.now()}`;
    const newTeacherId = `tch_${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      schoolId: school.id,
      name: data.name,
      email: data.email,
      role: 'TEACHER',
      phone: data.phone,
      password: data.password || 'teacher123',
      avatar: data.avatar || '',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newTeacher: Teacher = {
      id: newTeacherId,
      userId: newUserId,
      schoolId: school.id,
      staffId: data.staffId,
      qualification: data.qualification,
      specialization: data.specialization,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, newUser]);
    setTeachers(prev => [...prev, newTeacher]);
    addAuditLog('CREATE_TEACHER', 'TEACHER', `Added academic faculty member ${data.name} (${data.staffId}) with login credentials`, newTeacherId);
  };

  const updateTeacherCredentials = (
    teacherId: string,
    updates: { email?: string; password?: string; staffId?: string; isActive?: boolean }
  ) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    if (updates.staffId) {
      setTeachers(prev =>
        prev.map(t => (t.id === teacherId ? { ...t, staffId: updates.staffId! } : t))
      );
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.id === teacher.userId) {
          return {
            ...u,
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.password ? { password: updates.password } : {}),
            ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
          };
        }
        return u;
      })
    );

    addAuditLog('UPDATE_TEACHER_CREDENTIALS', 'SECURITY', `Updated login credentials for teacher ID ${teacher.staffId}`, teacherId);
  };

  // Teacher self-service password change from Login Page requiring old password
  const changeTeacherPassword = (
    identifier: string,
    oldPassword: string,
    newPassword: string
  ): { success: boolean; error?: string } => {
    const trimmed = identifier.trim().toLowerCase();
    const oldPwd = oldPassword.trim();
    const newPwd = newPassword.trim();

    if (!trimmed) {
      return { success: false, error: 'Please enter your Teacher Email or Staff ID.' };
    }
    if (!oldPwd) {
      return { success: false, error: 'Please enter your current (old) password.' };
    }
    if (!newPwd) {
      return { success: false, error: 'Please enter a new password.' };
    }
    if (newPwd.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters in length.' };
    }
    if (oldPwd === newPwd) {
      return { success: false, error: 'New password cannot be identical to your current password.' };
    }

    // Match teacher by email or staffId
    let foundUser = users.find(
      u => u.role === 'TEACHER' && u.email.toLowerCase() === trimmed
    );

    let foundTeacher = teachers.find(t => t.userId === foundUser?.id);

    if (!foundUser) {
      const matchTeacher = teachers.find(
        t => t.staffId.toLowerCase() === trimmed || t.staffId.toLowerCase().endsWith(trimmed)
      );
      if (matchTeacher) {
        foundTeacher = matchTeacher;
        foundUser = users.find(u => u.id === matchTeacher.userId);
      }
    }

    if (!foundUser || !foundTeacher) {
      return { success: false, error: 'No active Teacher account found with this email or Staff ID.' };
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'This Teacher account has been deactivated by the School Administrator.' };
    }

    // Verify old password
    const currentValidPwd = foundUser.password || 'teacher123';
    if (oldPwd !== currentValidPwd) {
      return { success: false, error: 'The current (old) password you entered is incorrect. Please check and try again.' };
    }

    // Update password
    setUsers(prev =>
      prev.map(u => (u.id === foundUser!.id ? { ...u, password: newPwd } : u))
    );

    addAuditLog(
      'TEACHER_PASSWORD_CHANGE_SELF',
      'SECURITY',
      `Teacher ${foundUser.name} (${foundTeacher.staffId}) updated their portal password from login portal`,
      foundTeacher.id
    );

    return { success: true };
  };

  const assignTeacher = (teacherId: string, classSectionId: string, subjectId: string) => {
    setTeacherAssignments(prev => {
      // Remove any existing assignment for this exact classSection + subject
      const filtered = prev.filter(
        a => !(a.classSectionId === classSectionId && a.subjectId === subjectId)
      );
      const newAsgn: TeacherAssignment = {
        id: `asgn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        schoolId: school.id,
        teacherId,
        classSectionId,
        subjectId,
      };
      return [...filtered, newAsgn];
    });

    const teacher = teachers.find(t => t.id === teacherId);
    const user = teacher ? users.find(u => u.id === teacher.userId) : null;
    const cls = classSections.find(c => c.id === classSectionId);
    const subj = subjects.find(s => s.id === subjectId);
    addAuditLog(
      'ASSIGN_TEACHER',
      'TEACHER',
      `Assigned ${user?.name || 'Faculty'} to teach ${subj?.name || 'subject'} in ${cls?.name || 'class'}`,
      teacherId
    );
  };

  const bulkAssignTeachers = (
    assignments: Array<{ teacherId: string; classSectionId: string; subjectId: string }>
  ) => {
    setTeacherAssignments(prev => {
      let updated = [...prev];
      assignments.forEach(asgn => {
        updated = updated.filter(
          a => !(a.classSectionId === asgn.classSectionId && a.subjectId === asgn.subjectId)
        );
        updated.push({
          id: `asgn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          schoolId: school.id,
          teacherId: asgn.teacherId,
          classSectionId: asgn.classSectionId,
          subjectId: asgn.subjectId,
        });
      });
      return updated;
    });
    addAuditLog('BULK_ASSIGN_TEACHERS', 'TEACHER', `Updated batch subject-teacher allocations across grade levels`);
  };

  const removeTeacherAssignment = (assignmentId: string) => {
    setTeacherAssignments(prev => prev.filter(a => a.id !== assignmentId));
    addAuditLog('REMOVE_TEACHER_ASSIGNMENT', 'TEACHER', `Removed faculty subject allocation`, assignmentId);
  };

  // Attendance recording
  const markAttendance = (
    classSectionId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
  ) => {
    // Filter out previous attendance for this class and date
    const remaining = attendance.filter(
      a => !(a.classSectionId === classSectionId && a.date === date)
    );

    const newRecords: AttendanceRecord[] = records.map(r => ({
      id: `att_${Date.now()}_${r.studentId}`,
      schoolId: school.id,
      classSectionId,
      studentId: r.studentId,
      date,
      status: r.status,
      remarks: r.remarks,
      markedByTeacherId: currentUser.id,
      submittedAt: new Date().toISOString(),
    }));

    setAttendance([...remaining, ...newRecords]);
    addAuditLog('MARK_ATTENDANCE', 'ATTENDANCE', `Recorded attendance for ${records.length} students on ${date}`, classSectionId);
  };

  // Results & Scoring Workflow
  const getOrCreateSubmission = (
    classSectionId: string,
    subjectId: string,
    teacherId: string
  ): ResultSubmission => {
    const existing = submissions.find(
      s =>
        s.sessionId === currentSession.id &&
        s.termId === currentTerm.id &&
        s.classSectionId === classSectionId &&
        s.subjectId === subjectId
    );

    if (existing) return existing;

    // Create new DRAFT submission
    const newSub: ResultSubmission = {
      id: `sub_${Date.now()}`,
      schoolId: school.id,
      sessionId: currentSession.id,
      termId: currentTerm.id,
      classSectionId,
      subjectId,
      teacherId,
      status: 'DRAFT',
    };

    setSubmissions(prev => [...prev, newSub]);
    return newSub;
  };

  const saveScoreDraft = (
    submissionId: string,
    scoreRows: { studentId: string; scores: Record<string, number>; teacherRemark?: string }[]
  ) => {
    // Upsert scores
    setScores(prev => {
      const filtered = prev.filter(s => s.submissionId !== submissionId);
      const newScores: ScoreItem[] = scoreRows.map(row => {
        const total = Object.values(row.scores).reduce((sum, val) => sum + (Number(val) || 0), 0);
        const gradeInfo = calculateGrade(total);
        return {
          id: `scr_${Date.now()}_${row.studentId}`,
          submissionId,
          studentId: row.studentId,
          scores: row.scores,
          totalScore: total,
          grade: gradeInfo.grade,
          remark: gradeInfo.remark,
          teacherRemark: row.teacherRemark,
        };
      });
      return [...filtered, ...newScores];
    });

    setSubmissions(prev =>
      prev.map(s => (s.id === submissionId ? { ...s, status: 'DRAFT' } : s))
    );

    addAuditLog('SAVE_SCORE_DRAFT', 'SCORE_SUBMISSION', `Saved score draft for submission ID ${submissionId}`, submissionId);
  };

  const submitScoresForApproval = (
    submissionId: string,
    scoreRows: { studentId: string; scores: Record<string, number>; teacherRemark?: string }[]
  ) => {
    saveScoreDraft(submissionId, scoreRows);

    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? {
              ...s,
              status: 'SUBMITTED',
              submittedAt: new Date().toISOString(),
              correctionFeedback: undefined,
            }
          : s
      )
    );

    addAuditLog('SUBMIT_SCORES_FOR_APPROVAL', 'SCORE_SUBMISSION', `Submitted terminal scores for admin review`, submissionId);
  };

  const approveSubmission = (submissionId: string) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? {
              ...s,
              status: 'APPROVED',
              reviewedByUserId: currentUser.id,
              reviewedAt: new Date().toISOString(),
              correctionFeedback: undefined,
            }
          : s
      )
    );
    addAuditLog('APPROVE_SUBMISSION', 'SCORE_SUBMISSION', `Approved and locked score submission`, submissionId);
  };

  const returnSubmission = (submissionId: string, feedback: string) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? {
              ...s,
              status: 'RETURNED',
              reviewedByUserId: currentUser.id,
              reviewedAt: new Date().toISOString(),
              correctionFeedback: feedback,
            }
          : s
      )
    );
    addAuditLog('RETURN_SUBMISSION', 'SCORE_SUBMISSION', `Returned submission for corrections: "${feedback}"`, submissionId);
  };

  const publishSubmission = (submissionId: string) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? {
              ...s,
              status: 'PUBLISHED',
              publishedAt: new Date().toISOString(),
            }
          : s
      )
    );
    addAuditLog('PUBLISH_SUBMISSION', 'SCORE_SUBMISSION', `Published terminal scores to parents and students`, submissionId);
  };

  // Communication & Announcements
  const createAnnouncement = (
    title: string,
    content: string,
    category: Announcement['category'],
    targetAudience: Announcement['targetAudience'],
    targetClassSectionId?: string,
    isPinned: boolean = false
  ) => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      schoolId: school.id,
      title,
      content,
      category,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      targetAudience,
      targetClassSectionId,
      createdAt: new Date().toISOString(),
      isPinned,
    };

    setAnnouncements(prev => [newAnn, ...prev]);
    addAuditLog('CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', `Created school broadcast "${title}"`, newAnn.id);
  };

  // Period Timings Operations
  const updatePeriodDefinition = (id: string, updates: Partial<PeriodDefinition>) => {
    setPeriodDefinitions(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog('UPDATE_PERIOD_TIMING', 'ACADEMIC_SETUP', `Updated timing for timetable period`);
  };

  const createPeriodDefinition = (data: Omit<PeriodDefinition, 'id'>) => {
    const newId = `prd_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newPeriod: PeriodDefinition = {
      ...data,
      id: newId,
    };
    setPeriodDefinitions(prev => [...prev, newPeriod]);
    addAuditLog('CREATE_PERIOD_TIMING', 'ACADEMIC_SETUP', `Created timetable period ${data.label} (${data.startTime} - ${data.endTime})`, newId);
  };

  const deletePeriodDefinition = (id: string) => {
    setPeriodDefinitions(prev => prev.filter(p => p.id !== id));
    addAuditLog('DELETE_PERIOD_TIMING', 'ACADEMIC_SETUP', `Deleted timetable period slot`, id);
  };

  const resetPeriodDefinitions = () => {
    setPeriodDefinitions(INITIAL_PERIOD_DEFINITIONS);
    addAuditLog('RESET_PERIOD_TIMINGS', 'ACADEMIC_SETUP', 'Reset timetable periods to standard defaults');
  };

  // Timetable Operations
  const createTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'schoolId'>) => {
    const newSlot: TimetableSlot = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      schoolId: school.id,
      ...slot,
    };
    setTimetableSlots(prev => [...prev, newSlot]);
    const cls = classSections.find(c => c.id === slot.classSectionId);
    const subj = subjects.find(s => s.id === slot.subjectId);
    addAuditLog(
      'CREATE_TIMETABLE_SLOT',
      'ACADEMIC_SETUP',
      `Scheduled ${subj?.name || 'Subject'} in ${cls?.name || 'Class'} on ${newSlot.day} (Period ${newSlot.periodNumber})`,
      newSlot.id
    );
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetableSlots(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    addAuditLog('UPDATE_TIMETABLE_SLOT', 'ACADEMIC_SETUP', `Updated timetable period details`, id);
  };

  const deleteTimetableSlot = (id: string) => {
    const existing = timetableSlots.find(s => s.id === id);
    setTimetableSlots(prev => prev.filter(s => s.id !== id));
    addAuditLog(
      'DELETE_TIMETABLE_SLOT',
      'ACADEMIC_SETUP',
      `Removed timetable period on ${existing?.day || 'day'} (Period ${existing?.periodNumber || ''})`,
      id
    );
  };

  const getTeacherForClassSubject = (classSectionId: string, subjectId: string): Teacher | undefined => {
    const asgn = teacherAssignments.find(
      a => a.classSectionId === classSectionId && a.subjectId === subjectId
    );
    if (!asgn) return undefined;
    return teachers.find(t => t.id === asgn.teacherId);
  };

  const checkTimetableConflict = (
    teacherId: string,
    day: DayOfWeek,
    periodNumber: number,
    excludeSlotId?: string
  ) => {
    const conflictingSlot = timetableSlots.find(
      s =>
        s.teacherId === teacherId &&
        s.day === day &&
        s.periodNumber === periodNumber &&
        s.id !== excludeSlotId
    );

    if (!conflictingSlot) {
      return { hasConflict: false };
    }

    const cls = classSections.find(c => c.id === conflictingSlot.classSectionId);
    const subj = subjects.find(s => s.id === conflictingSlot.subjectId);

    return {
      hasConflict: true,
      conflictingSlot,
      conflictingClass: cls?.name || 'Another Class',
      conflictingSubject: subj?.name || 'Subject',
    };
  };

  // Behavioral Notes Operations
  const addBehaviorNote = (data: Omit<StudentBehaviorNote, 'id' | 'schoolId' | 'createdAt'>) => {
    const newNote: StudentBehaviorNote = {
      id: `bn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      schoolId: school.id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setStudentBehaviorNotes(prev => [newNote, ...prev]);
    const student = students.find(s => s.id === data.studentId);
    const stuName = student ? getStudentName(student.id) : 'Student';
    addAuditLog('LOG_BEHAVIOR_NOTE', 'STUDENT', `Logged ${data.category} note for ${stuName}: "${data.title}"`, newNote.id);
  };

  const deleteBehaviorNote = (id: string) => {
    setStudentBehaviorNotes(prev => prev.filter(n => n.id !== id));
    addAuditLog('DELETE_BEHAVIOR_NOTE', 'STUDENT', `Deleted behavior note`, id);
  };

  // Audit Logger
  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    details: string,
    entityId?: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      schoolId: school.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const value: SchoolContextType = {
    theme,
    toggleTheme,
    currentUser,
    switchUser,
    allUsers: users,
    isAuthenticated,
    login,
    loginAsUser,
    logout,
    school,
    updateSchoolProfile,
    sessions,
    terms,
    currentSession,
    currentTerm,
    setCurrentSession,
    setCurrentTerm,
    createSession,
    createTerm,
    classLevels,
    classSections,
    subjects,
    createClassLevel,
    updateClassLevel,
    deleteClassLevel,
    createClassSection,
    updateClassSection,
    deleteClassSection,
    createSubject,
    updateSubject,
    deleteSubject,
    assessmentConfigs,
    updateAssessmentConfig,
    gradingScale,
    teachers,
    parents,
    students,
    studentProfiles,
    teacherAssignments,
    createStudent,
    updateStudentStatus,
    updateStudentAvatar,
    removeStudentAvatar,
    createParent,
    updateParentAvatar,
    removeParentAvatar,
    updateParentCredentials,
    updateUserAvatar,
    removeUserAvatar,
    linkStudentToParent,
    linkMultipleStudentsToParent,
    createTeacher,
    updateTeacherCredentials,
    updateUserPassword,
    changeTeacherPassword,
    assignTeacher,
    bulkAssignTeachers,
    removeTeacherAssignment,
    attendance,
    markAttendance,
    submissions,
    scores,
    getOrCreateSubmission,
    saveScoreDraft,
    submitScoresForApproval,
    approveSubmission,
    returnSubmission,
    publishSubmission,
    announcements,
    createAnnouncement,
    periodDefinitions,
    updatePeriodDefinition,
    createPeriodDefinition,
    deletePeriodDefinition,
    resetPeriodDefinitions,
    timetableSlots,
    createTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    getTeacherForClassSubject,
    checkTimetableConflict,
    studentBehaviorNotes,
    addBehaviorNote,
    deleteBehaviorNote,
    auditLogs,
    addAuditLog,
    calculateGrade,
    getTeacherProfile,
    getParentProfile,
    getStudentName,
    getStudentAvatar,
    isLiveDb,
    dbStatus,
    dbInfo,
    lastSyncTime,
    refreshFromLiveDb,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
