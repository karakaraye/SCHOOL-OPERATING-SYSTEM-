import type {
  School,
  AcademicSession,
  Term,
  ClassLevel,
  ClassSection,
  Subject,
  TeacherAssignment,
  User,
  Teacher,
  Parent,
  Student,
  AttendanceRecord,
  AssessmentWeightConfig,
  ResultSubmission,
  ScoreItem,
  Announcement,
  AuditLog,
  GradingScaleTier,
  TimetableSlot,
  StudentBehaviorNote,
  PeriodDefinition,
} from '../types/index.ts';

export const INITIAL_SCHOOL: School = {
  id: 'sch_01',
  name: 'Nameless School',
  code: 'NLS-001',
  motto: 'Excellence in Knowledge & Character',
  address: '100 Academy Boulevard, Education District',
  email: 'contact@namelessschool.edu',
  phone: '0800 000 0000, 0700 000 0000',
  currentSessionId: 'sess_2025_2026',
  currentTermId: 'term_1',
};

export const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: 'sess_2025_2026',
    schoolId: 'sch_01',
    name: '2025/2026 Academic Session',
    startDate: '2025-09-08',
    endDate: '2026-07-20',
    isCurrent: true,
  },
  {
    id: 'sess_2024_2025',
    schoolId: 'sch_01',
    name: '2024/2025 Academic Session',
    startDate: '2024-09-10',
    endDate: '2025-07-18',
    isCurrent: false,
  },
];

export const INITIAL_TERMS: Term[] = [
  {
    id: 'term_1',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    name: 'First Term',
    startDate: '2025-09-08',
    endDate: '2025-12-15',
    isCurrent: true,
  },
  {
    id: 'term_2',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    name: 'Second Term',
    startDate: '2026-01-12',
    endDate: '2026-04-03',
    isCurrent: false,
  },
  {
    id: 'term_3',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    name: 'Third Term',
    startDate: '2026-04-27',
    endDate: '2026-07-20',
    isCurrent: false,
  },
];

// Classes: JS 1 to JSS 3 and SS 1 to SS 3
export const INITIAL_CLASS_LEVELS: ClassLevel[] = [
  { id: 'lvl_jss1', schoolId: 'sch_01', name: 'Junior Secondary 1 (JS 1 / JSS 1)', order: 1 },
  { id: 'lvl_jss2', schoolId: 'sch_01', name: 'Junior Secondary 2 (JS 2 / JSS 2)', order: 2 },
  { id: 'lvl_jss3', schoolId: 'sch_01', name: 'Junior Secondary 3 (JS 3 / JSS 3)', order: 3 },
  { id: 'lvl_ss1', schoolId: 'sch_01', name: 'Senior Secondary 1 (SS 1)', order: 4 },
  { id: 'lvl_ss2', schoolId: 'sch_01', name: 'Senior Secondary 2 (SS 2)', order: 5 },
  { id: 'lvl_ss3', schoolId: 'sch_01', name: 'Senior Secondary 3 (SS 3)', order: 6 },
];

export const INITIAL_CLASS_SECTIONS: ClassSection[] = [
  // JSS 1
  { id: 'sec_jss1_a', schoolId: 'sch_01', classLevelId: 'lvl_jss1', name: 'JSS 1 Alpha', room: 'Block A - Room 101', capacity: 35 },
  { id: 'sec_jss1_b', schoolId: 'sch_01', classLevelId: 'lvl_jss1', name: 'JSS 1 Beta', room: 'Block A - Room 102', capacity: 35 },
  
  // JSS 2
  { id: 'sec_jss2_a', schoolId: 'sch_01', classLevelId: 'lvl_jss2', name: 'JSS 2 Gold', room: 'Block A - Room 201', capacity: 30 },
  { id: 'sec_jss2_b', schoolId: 'sch_01', classLevelId: 'lvl_jss2', name: 'JSS 2 Silver', room: 'Block A - Room 202', capacity: 30 },
  
  // JSS 3
  { id: 'sec_jss3_a', schoolId: 'sch_01', classLevelId: 'lvl_jss3', name: 'JSS 3 Diamond', room: 'Block B - Room 101', capacity: 30 },
  { id: 'sec_jss3_b', schoolId: 'sch_01', classLevelId: 'lvl_jss3', name: 'JSS 3 Emerald', room: 'Block B - Room 102', capacity: 30 },

  // SS 1
  { id: 'sec_ss1_sci', schoolId: 'sch_01', classLevelId: 'lvl_ss1', name: 'SS 1 Science', room: 'Science Wing - Lab 1', capacity: 30 },
  { id: 'sec_ss1_art', schoolId: 'sch_01', classLevelId: 'lvl_ss1', name: 'SS 1 Arts & Comm', room: 'Humanities Wing 201', capacity: 30 },

  // SS 2
  { id: 'sec_ss2_sci', schoolId: 'sch_01', classLevelId: 'lvl_ss2', name: 'SS 2 Science', room: 'Science Lab Annex B', capacity: 30 },
  { id: 'sec_ss2_art', schoolId: 'sch_01', classLevelId: 'lvl_ss2', name: 'SS 2 Arts & Comm', room: 'Humanities Wing 304', capacity: 30 },

  // SS 3
  { id: 'sec_ss3_sci', schoolId: 'sch_01', classLevelId: 'lvl_ss3', name: 'SS 3 Science', room: 'Science Wing - Senior Lab', capacity: 30 },
  { id: 'sec_ss3_art', schoolId: 'sch_01', classLevelId: 'lvl_ss3', name: 'SS 3 Arts & Comm', room: 'Humanities Wing 401', capacity: 30 },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'subj_math', schoolId: 'sch_01', name: 'Mathematics', code: 'MTH-101', category: 'CORE' },
  { id: 'subj_eng', schoolId: 'sch_01', name: 'English Language', code: 'ENG-101', category: 'CORE' },
  { id: 'subj_phy', schoolId: 'sch_01', name: 'Physics', code: 'PHY-201', category: 'CORE' },
  { id: 'subj_chm', schoolId: 'sch_01', name: 'Chemistry', code: 'CHM-201', category: 'CORE' },
  { id: 'subj_bio', schoolId: 'sch_01', name: 'Biology', code: 'BIO-101', category: 'CORE' },
  { id: 'subj_econ', schoolId: 'sch_01', name: 'Economics', code: 'ECO-201', category: 'ELECTIVE' },
  { id: 'subj_civic', schoolId: 'sch_01', name: 'Civic Education', code: 'CIV-101', category: 'CORE' },
  { id: 'subj_fmath', schoolId: 'sch_01', name: 'Further Mathematics', code: 'FMT-301', category: 'ELECTIVE' },
  { id: 'subj_govt', schoolId: 'sch_01', name: 'Government', code: 'GOV-201', category: 'CORE' },
];

export const INITIAL_ASSESSMENT_CONFIG: AssessmentWeightConfig[] = [
  { id: 'ass_ca1', schoolId: 'sch_01', name: 'Continuous Assessment 1', maxScore: 20, weightPercent: 20 },
  { id: 'ass_ca2', schoolId: 'sch_01', name: 'Continuous Assessment 2 (Mid-Term)', maxScore: 20, weightPercent: 20 },
  { id: 'ass_exam', schoolId: 'sch_01', name: 'Terminal Examination', maxScore: 60, weightPercent: 60 },
];

export const INITIAL_GRADING_SCALE: GradingScaleTier[] = [
  { minScore: 75, maxScore: 100, grade: 'A1', remark: 'Distinction', colorClass: 'badge-success' },
  { minScore: 70, maxScore: 74, grade: 'B2', remark: 'Very Good', colorClass: 'badge-primary' },
  { minScore: 65, maxScore: 69, grade: 'B3', remark: 'Good', colorClass: 'badge-cyan' },
  { minScore: 50, maxScore: 64, grade: 'C4', remark: 'Credit', colorClass: 'badge-warning' },
  { minScore: 40, maxScore: 49, grade: 'D7', remark: 'Pass', colorClass: 'badge-warning' },
  { minScore: 0, maxScore: 39, grade: 'F9', remark: 'Fail', colorClass: 'badge-danger' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super',
    schoolId: 'sch_01',
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.vance@namelessschool.edu',
    role: 'SUPER_ADMIN',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+234 801 111 2233',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'usr_admin',
    schoolId: 'sch_01',
    name: 'Pastor Samuel Adeleke',
    email: 'samuel.adeleke@namelessschool.edu',
    role: 'SCHOOL_ADMIN',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phone: '+234 802 222 3344',
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'usr_tch_david',
    schoolId: 'sch_01',
    name: 'Mr. David Adeleke (M.Sc)',
    email: 'david.adeleke@namelessschool.edu',
    role: 'TEACHER',
    password: 'teacher123',
    avatar: '',
    phone: '+234 803 333 4455',
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'usr_tch_sarah',
    schoolId: 'sch_01',
    name: 'Mrs. Sarah Jenkins (B.Ed)',
    email: 'sarah.jenkins@namelessschool.edu',
    role: 'TEACHER',
    password: 'teacher123',
    avatar: '',
    phone: '+234 804 444 5566',
    isActive: true,
    createdAt: '2024-02-10',
  },
  {
    id: 'usr_tch_martins',
    schoolId: 'sch_01',
    name: 'Dr. Adekunle Martins (Ph.D)',
    email: 'adekunle.martins@namelessschool.edu',
    role: 'TEACHER',
    password: 'teacher123',
    avatar: '',
    phone: '+234 805 555 6677',
    isActive: true,
    createdAt: '2024-03-01',
  },
  // Parents have empty avatar strings by default - attachable later or uploaded from laptop
  {
    id: 'usr_prt_michael',
    schoolId: 'sch_01',
    name: 'Dr. Michael Okonkwo',
    email: 'm.okonkwo@medicare.ng',
    role: 'PARENT',
    password: 'parent123',
    avatar: '',
    phone: '+234 806 777 8899',
    isActive: true,
    createdAt: '2024-05-15',
  },
  {
    id: 'usr_prt_aisha',
    schoolId: 'sch_01',
    name: 'Engr. Aisha Bello',
    email: 'aisha.bello@energyconsult.com',
    role: 'PARENT',
    password: 'parent123',
    avatar: '',
    phone: '+234 807 888 9900',
    isActive: true,
    createdAt: '2024-06-20',
  },
  {
    id: 'usr_prt_chidi',
    schoolId: 'sch_01',
    name: 'Barrister Chidi Nnamdi',
    email: 'c.nnamdi@lexchambers.ng',
    role: 'PARENT',
    password: 'parent123',
    avatar: '',
    phone: '+234 808 123 4567',
    isActive: true,
    createdAt: '2024-07-10',
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch_01',
    userId: 'usr_tch_david',
    schoolId: 'sch_01',
    staffId: 'STAFF/2024/001',
    qualification: 'M.Sc Theoretical Physics, B.Sc Mathematics',
    specialization: 'Pure Mathematics & Physics',
    joinedDate: '2024-02-01',
  },
  {
    id: 'tch_02',
    userId: 'usr_tch_sarah',
    schoolId: 'sch_01',
    staffId: 'STAFF/2024/002',
    qualification: 'B.Ed English & Literary Studies',
    specialization: 'English & Literature',
    joinedDate: '2024-02-10',
  },
  {
    id: 'tch_03',
    userId: 'usr_tch_martins',
    schoolId: 'sch_01',
    staffId: 'STAFF/2024/003',
    qualification: 'Ph.D Biochemistry',
    specialization: 'Chemistry & Biology',
    joinedDate: '2024-03-01',
  },
];

export const INITIAL_PARENTS: Parent[] = [
  {
    id: 'prt_01',
    userId: 'usr_prt_michael',
    schoolId: 'sch_01',
    occupation: 'Chief Consultant Cardiologist',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    alternatePhone: '+234 802 000 1122',
    childrenStudentIds: ['stu_01', 'stu_02', 'stu_06'],
  },
  {
    id: 'prt_02',
    userId: 'usr_prt_aisha',
    schoolId: 'sch_01',
    occupation: 'Senior Petroleum Systems Engineer',
    address: '8 Banana Island Road, Ikoyi, Lagos',
    alternatePhone: '+234 803 000 3344',
    childrenStudentIds: ['stu_03'],
  },
  {
    id: 'prt_03',
    userId: 'usr_prt_chidi',
    schoolId: 'sch_01',
    occupation: 'Principal Partner, Lex Chambers',
    address: '22 Trans-Amadi Industrial Layout, Port Harcourt',
    alternatePhone: '+234 804 000 5566',
    childrenStudentIds: ['stu_07', 'stu_08'],
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // JSS 1 Alpha
  {
    id: 'stu_01',
    userId: 'usr_stu_01',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2025/0101',
    classSectionId: 'sec_jss1_a',
    gender: 'MALE',
    dob: '2013-04-14',
    bloodGroup: 'O+',
    parentIds: ['prt_01'],
    status: 'ACTIVE',
    admissionDate: '2025-09-08',
  },
  {
    id: 'stu_03',
    userId: 'usr_stu_03',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2025/0102',
    classSectionId: 'sec_jss1_a',
    gender: 'MALE',
    dob: '2013-07-03',
    bloodGroup: 'B+',
    parentIds: ['prt_02'],
    status: 'ACTIVE',
    admissionDate: '2025-09-08',
  },
  {
    id: 'stu_04',
    userId: 'usr_stu_04',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2025/0103',
    classSectionId: 'sec_jss1_a',
    gender: 'FEMALE',
    dob: '2013-11-18',
    bloodGroup: 'O+',
    parentIds: [],
    status: 'ACTIVE',
    admissionDate: '2025-09-08',
  },

  // JSS 2 Gold
  {
    id: 'stu_06',
    userId: 'usr_stu_06',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2024/0088',
    classSectionId: 'sec_jss2_a',
    gender: 'MALE',
    dob: '2012-08-10',
    bloodGroup: 'O+',
    parentIds: ['prt_01'],
    status: 'ACTIVE',
    admissionDate: '2024-09-10',
  },

  // JSS 3 Diamond
  {
    id: 'stu_07',
    userId: 'usr_stu_07',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2023/0055',
    classSectionId: 'sec_jss3_a',
    gender: 'FEMALE',
    dob: '2011-05-19',
    bloodGroup: 'A+',
    parentIds: ['prt_03'],
    status: 'ACTIVE',
    admissionDate: '2023-09-11',
  },

  // SS 1 Science
  {
    id: 'stu_08',
    userId: 'usr_stu_08',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2025/0201',
    classSectionId: 'sec_ss1_sci',
    gender: 'MALE',
    dob: '2010-01-25',
    bloodGroup: 'B+',
    parentIds: ['prt_03'],
    status: 'ACTIVE',
    admissionDate: '2025-09-08',
  },

  // SS 2 Science
  {
    id: 'stu_02',
    userId: 'usr_stu_02',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2024/0045',
    classSectionId: 'sec_ss2_sci',
    gender: 'FEMALE',
    dob: '2010-09-22',
    bloodGroup: 'A+',
    parentIds: ['prt_01'],
    status: 'ACTIVE',
    admissionDate: '2024-09-10',
  },
  {
    id: 'stu_05',
    userId: 'usr_stu_05',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2024/0046',
    classSectionId: 'sec_ss2_sci',
    gender: 'MALE',
    dob: '2010-03-12',
    bloodGroup: 'AB+',
    parentIds: [],
    status: 'ACTIVE',
    admissionDate: '2024-09-10',
  },

  // SS 3 Science
  {
    id: 'stu_09',
    userId: 'usr_stu_09',
    schoolId: 'sch_01',
    admissionNumber: 'TCS/2023/0012',
    classSectionId: 'sec_ss3_sci',
    gender: 'FEMALE',
    dob: '2009-06-14',
    bloodGroup: 'O+',
    parentIds: [],
    status: 'ACTIVE',
    admissionDate: '2023-09-11',
  },
];

// Student profiles without pre-assigned stock pictures (avatar: '') - users can attach photos from laptop
export const INITIAL_STUDENT_USERS: Record<string, { name: string; avatar: string }> = {
  usr_stu_01: {
    name: 'Chukwudi Okonkwo',
    avatar: '',
  },
  usr_stu_02: {
    name: 'Chioma Okonkwo',
    avatar: '',
  },
  usr_stu_03: {
    name: 'Farouk Bello',
    avatar: '',
  },
  usr_stu_04: {
    name: 'Amara Johnson',
    avatar: '',
  },
  usr_stu_05: {
    name: 'David Okafor',
    avatar: '',
  },
  usr_stu_06: {
    name: 'Somto Okonkwo',
    avatar: '',
  },
  usr_stu_07: {
    name: 'Kamsi Nnamdi',
    avatar: '',
  },
  usr_stu_08: {
    name: 'Ifeanyi Nnamdi',
    avatar: '',
  },
  usr_stu_09: {
    name: 'Zainab Danjuma',
    avatar: '',
  },
};

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  // Mr. David Adeleke -> JSS 1 Alpha (Math), JSS 2 Gold (Math), SS 2 Science (Physics), SS 3 Science (Physics)
  { id: 'asgn_01', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss1_a', subjectId: 'subj_math' },
  { id: 'asgn_02', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss2_sci', subjectId: 'subj_phy' },
  { id: 'asgn_07', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss2_a', subjectId: 'subj_math' },
  { id: 'asgn_08', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss3_sci', subjectId: 'subj_phy' },
  
  // Mrs. Sarah Jenkins -> JSS 1 Alpha (English), JSS 1 Beta (English), JSS 3 Diamond (English), SS 1 Science (English)
  { id: 'asgn_03', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_jss1_a', subjectId: 'subj_eng' },
  { id: 'asgn_04', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_jss1_b', subjectId: 'subj_eng' },
  { id: 'asgn_09', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_jss3_a', subjectId: 'subj_eng' },
  { id: 'asgn_10', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_ss1_sci', subjectId: 'subj_eng' },

  // Dr. Adekunle Martins -> SS 1 Science (Chemistry), SS 2 Science (Chemistry, Biology), SS 3 Science (Biology)
  { id: 'asgn_05', schoolId: 'sch_01', teacherId: 'tch_03', classSectionId: 'sec_ss2_sci', subjectId: 'subj_chm' },
  { id: 'asgn_06', schoolId: 'sch_01', teacherId: 'tch_03', classSectionId: 'sec_ss2_sci', subjectId: 'subj_bio' },
  { id: 'asgn_11', schoolId: 'sch_01', teacherId: 'tch_03', classSectionId: 'sec_ss1_sci', subjectId: 'subj_chm' },
  { id: 'asgn_12', schoolId: 'sch_01', teacherId: 'tch_03', classSectionId: 'sec_ss3_sci', subjectId: 'subj_bio' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's attendance for JSS 1 Alpha
  { id: 'att_01', schoolId: 'sch_01', classSectionId: 'sec_jss1_a', studentId: 'stu_01', date: '2026-09-08', status: 'PRESENT', markedByTeacherId: 'tch_01', submittedAt: '2026-09-08T08:15:00Z' },
  { id: 'att_02', schoolId: 'sch_01', classSectionId: 'sec_jss1_a', studentId: 'stu_03', date: '2026-09-08', status: 'PRESENT', markedByTeacherId: 'tch_01', submittedAt: '2026-09-08T08:15:00Z' },
  { id: 'att_03', schoolId: 'sch_01', classSectionId: 'sec_jss1_a', studentId: 'stu_04', date: '2026-09-08', status: 'LATE', remarks: 'Traffic delay on Lekki Expressway', markedByTeacherId: 'tch_01', submittedAt: '2026-09-08T08:15:00Z' },
  
  // Yesterday's attendance for JSS 1 Alpha
  { id: 'att_04', schoolId: 'sch_01', classSectionId: 'sec_jss1_a', studentId: 'stu_01', date: '2026-09-07', status: 'PRESENT', markedByTeacherId: 'tch_01', submittedAt: '2026-09-07T08:20:00Z' },
  { id: 'att_05', schoolId: 'sch_01', classSectionId: 'sec_jss1_a', studentId: 'stu_03', date: '2026-09-07', status: 'EXCUSED', remarks: 'Medical appointment', markedByTeacherId: 'tch_01', submittedAt: '2026-09-07T08:20:00Z' },
  { id: 'att_06', schoolId: 'sch_01', classSectionId: 'sec_jss1_a', studentId: 'stu_04', date: '2026-09-07', status: 'PRESENT', markedByTeacherId: 'tch_01', submittedAt: '2026-09-07T08:20:00Z' },

  // SS 2 Science
  { id: 'att_07', schoolId: 'sch_01', classSectionId: 'sec_ss2_sci', studentId: 'stu_02', date: '2026-09-08', status: 'PRESENT', markedByTeacherId: 'tch_01', submittedAt: '2026-09-08T08:30:00Z' },
  { id: 'att_08', schoolId: 'sch_01', classSectionId: 'sec_ss2_sci', studentId: 'stu_05', date: '2026-09-08', status: 'PRESENT', markedByTeacherId: 'tch_01', submittedAt: '2026-09-08T08:30:00Z' },
];

export const INITIAL_SUBMISSIONS: ResultSubmission[] = [
  // 1. Published Result: JSS 1 Alpha Mathematics (Visible to Parent)
  {
    id: 'sub_01',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    termId: 'term_1',
    classSectionId: 'sec_jss1_a',
    subjectId: 'subj_math',
    teacherId: 'tch_01',
    status: 'PUBLISHED',
    submittedAt: '2026-09-02T14:30:00Z',
    reviewedByUserId: 'usr_admin',
    reviewedAt: '2026-09-03T10:00:00Z',
    publishedAt: '2026-09-04T09:00:00Z',
  },
  // 2. Submitted Result (Pending Admin Review): SS 2 Science Physics
  {
    id: 'sub_02',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    termId: 'term_1',
    classSectionId: 'sec_ss2_sci',
    subjectId: 'subj_phy',
    teacherId: 'tch_01',
    status: 'SUBMITTED',
    submittedAt: '2026-09-07T16:00:00Z',
  },
  // 3. Draft Result: JSS 1 Alpha English (Teacher currently editing)
  {
    id: 'sub_03',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    termId: 'term_1',
    classSectionId: 'sec_jss1_a',
    subjectId: 'subj_eng',
    teacherId: 'tch_02',
    status: 'DRAFT',
  },
  // 4. Returned Result: SS 2 Science Chemistry (Returned with note)
  {
    id: 'sub_04',
    schoolId: 'sch_01',
    sessionId: 'sess_2025_2026',
    termId: 'term_1',
    classSectionId: 'sec_ss2_sci',
    subjectId: 'subj_chm',
    teacherId: 'tch_03',
    status: 'RETURNED',
    submittedAt: '2026-09-05T12:00:00Z',
    reviewedByUserId: 'usr_admin',
    reviewedAt: '2026-09-06T11:00:00Z',
    correctionFeedback: 'Please double-check David Okafor\'s CA 2 score; the lab report practical was marked out of 20 instead of 15.',
  },
];

export const INITIAL_SCORES: ScoreItem[] = [
  // Scores for sub_01 (JSS 1 Alpha Math - Published)
  {
    id: 'scr_01',
    submissionId: 'sub_01',
    studentId: 'stu_01', // Chukwudi Okonkwo
    scores: { ass_ca1: 18, ass_ca2: 19, ass_exam: 54 },
    totalScore: 91,
    grade: 'A1',
    remark: 'Distinction',
    teacherRemark: 'Outstanding grasp of algebraic concepts and logical reasoning.',
  },
  {
    id: 'scr_02',
    submissionId: 'sub_01',
    studentId: 'stu_03', // Farouk Bello
    scores: { ass_ca1: 16, ass_ca2: 15, ass_exam: 48 },
    totalScore: 79,
    grade: 'A1',
    remark: 'Distinction',
    teacherRemark: 'Consistently strong performance in class exercises.',
  },
  {
    id: 'scr_03',
    submissionId: 'sub_01',
    studentId: 'stu_04', // Amara Johnson
    scores: { ass_ca1: 14, ass_ca2: 14, ass_exam: 42 },
    totalScore: 70,
    grade: 'B2',
    remark: 'Very Good',
    teacherRemark: 'Shows great potential; encourage more practice on word problems.',
  },

  // Scores for sub_02 (SS 2 Science Physics - Submitted / Pending Review)
  {
    id: 'scr_04',
    submissionId: 'sub_02',
    studentId: 'stu_02', // Chioma Okonkwo
    scores: { ass_ca1: 19, ass_ca2: 20, ass_exam: 56 },
    totalScore: 95,
    grade: 'A1',
    remark: 'Distinction',
    teacherRemark: 'Top of class in quantum & wave mechanics simulations.',
  },
  {
    id: 'scr_05',
    submissionId: 'sub_02',
    studentId: 'stu_05', // David Okafor
    scores: { ass_ca1: 15, ass_ca2: 16, ass_exam: 44 },
    totalScore: 75,
    grade: 'A1',
    remark: 'Distinction',
    teacherRemark: 'Good practical and analytical problem solving.',
  },

  // Scores for sub_03 (JSS 1 Alpha English - Draft)
  {
    id: 'scr_06',
    submissionId: 'sub_03',
    studentId: 'stu_01',
    scores: { ass_ca1: 17, ass_ca2: 18, ass_exam: 0 },
    totalScore: 35,
    grade: 'F9',
    remark: 'Incomplete',
    teacherRemark: 'Awaiting exam script evaluation.',
  },
  {
    id: 'scr_07',
    submissionId: 'sub_03',
    studentId: 'stu_03',
    scores: { ass_ca1: 16, ass_ca2: 17, ass_exam: 0 },
    totalScore: 33,
    grade: 'F9',
    remark: 'Incomplete',
  },

  // Scores for sub_04 (SS 2 Science Chemistry - Returned)
  {
    id: 'scr_08',
    submissionId: 'sub_04',
    studentId: 'stu_02',
    scores: { ass_ca1: 18, ass_ca2: 19, ass_exam: 52 },
    totalScore: 89,
    grade: 'A1',
    remark: 'Distinction',
  },
  {
    id: 'scr_09',
    submissionId: 'sub_04',
    studentId: 'stu_05',
    scores: { ass_ca1: 14, ass_ca2: 20, ass_exam: 40 },
    totalScore: 74,
    grade: 'B2',
    remark: 'Very Good',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_01',
    schoolId: 'sch_01',
    title: 'Mid-Term Assessment Calendar & Parent-Teacher Consultation',
    content: 'Please be informed that the 2025/2026 First Term Mid-Term Assessment will commence on Monday, October 13th. Parent-Teacher Consultation Day is scheduled for Friday, October 24th.',
    category: 'ACADEMIC',
    authorId: 'usr_admin',
    authorName: 'Pastor Samuel Adeleke (Admin)',
    authorRole: 'SCHOOL_ADMIN',
    targetAudience: 'ALL',
    createdAt: '2026-09-05T09:00:00Z',
    isPinned: true,
  },
  {
    id: 'ann_02',
    schoolId: 'sch_01',
    title: 'JSS 1 Mathematics Term Project Submission Reminder',
    content: 'All JSS 1 Alpha students must turn in their Geometric Modeling project binders by Thursday noon. Rubrics have been distributed in class.',
    category: 'ACADEMIC',
    authorId: 'usr_tch_david',
    authorName: 'Mr. David Adeleke',
    authorRole: 'TEACHER',
    targetAudience: 'CLASS_SECTION',
    targetClassSectionId: 'sec_jss1_a',
    createdAt: '2026-09-07T11:30:00Z',
  },
  {
    id: 'ann_03',
    schoolId: 'sch_01',
    title: 'Annual Inter-House Sports & STEM Robotics Exhibition',
    content: 'We are thrilled to announce that the Inter-House Sports Competition and STEM Robotics Tournament will hold on November 20th. Parents are warmly invited.',
    category: 'EVENT',
    authorId: 'usr_super',
    authorName: 'Dr. Evelyn Vance (Super Admin)',
    authorRole: 'SUPER_ADMIN',
    targetAudience: 'ALL',
    createdAt: '2026-09-08T07:45:00Z',
    isPinned: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    schoolId: 'sch_01',
    userId: 'usr_admin',
    userName: 'Pastor Samuel Adeleke',
    userRole: 'SCHOOL_ADMIN',
    action: 'PUBLISH_RESULTS',
    entityType: 'SCORE_SUBMISSION',
    entityId: 'sub_01',
    details: 'Published First Term results for JSS 1 Alpha Mathematics (Teacher: Mr. David Adeleke). Visible to parents.',
    timestamp: '2026-09-04T09:00:00Z',
  },
  {
    id: 'log_02',
    schoolId: 'sch_01',
    userId: 'usr_admin',
    userName: 'Pastor Samuel Adeleke',
    userRole: 'SCHOOL_ADMIN',
    action: 'RETURN_SUBMISSION',
    entityType: 'SCORE_SUBMISSION',
    entityId: 'sub_04',
    details: 'Returned SS 2 Science Chemistry submission to Dr. Adekunle Martins with feedback.',
    timestamp: '2026-09-06T11:00:00Z',
  },
  {
    id: 'log_03',
    schoolId: 'sch_01',
    userId: 'usr_tch_david',
    userName: 'Mr. David Adeleke',
    userRole: 'TEACHER',
    action: 'SUBMIT_SCORES',
    entityType: 'SCORE_SUBMISSION',
    entityId: 'sub_02',
    details: 'Submitted SS 2 Science Physics terminal scores for admin review and lock.',
    timestamp: '2026-09-07T16:00:00Z',
  },
  {
    id: 'log_04',
    schoolId: 'sch_01',
    userId: 'usr_tch_david',
    userName: 'Mr. David Adeleke',
    userRole: 'TEACHER',
    action: 'RECORD_ATTENDANCE',
    entityType: 'ATTENDANCE',
    details: 'Marked daily attendance for JSS 1 Alpha (3 students present, 1 late).',
    timestamp: '2026-09-08T08:15:00Z',
  },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'tt_01', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss1_a', subjectId: 'subj_math', day: 'MONDAY', periodNumber: 1, startTime: '08:00', endTime: '08:50', room: 'Block A - 101' },
  { id: 'tt_02', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss2_sci', subjectId: 'subj_phy', day: 'MONDAY', periodNumber: 2, startTime: '08:50', endTime: '09:40', room: 'Science Lab Annex' },
  { id: 'tt_03', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_jss1_a', subjectId: 'subj_eng', day: 'MONDAY', periodNumber: 3, startTime: '09:40', endTime: '10:30', room: 'Block A - 101' },
  { id: 'tt_04', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss2_a', subjectId: 'subj_math', day: 'MONDAY', periodNumber: 5, startTime: '12:05', endTime: '12:55', room: 'Block A - 201' },
  { id: 'tt_05', schoolId: 'sch_01', teacherId: 'tch_03', classSectionId: 'sec_ss2_sci', subjectId: 'subj_chem', day: 'MONDAY', periodNumber: 6, startTime: '12:55', endTime: '13:45', room: 'Chemistry Lab' },

  // Tuesday
  { id: 'tt_06', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss3_sci', subjectId: 'subj_phy', day: 'TUESDAY', periodNumber: 1, startTime: '08:00', endTime: '08:50', room: 'Senior Lab' },
  { id: 'tt_07', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss1_a', subjectId: 'subj_math', day: 'TUESDAY', periodNumber: 3, startTime: '09:40', endTime: '10:30', room: 'Block A - 101' },
  { id: 'tt_08', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_jss3_a', subjectId: 'subj_eng', day: 'TUESDAY', periodNumber: 4, startTime: '11:15', endTime: '12:05', room: 'Block B - 101' },
  { id: 'tt_09', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss2_sci', subjectId: 'subj_phy', day: 'TUESDAY', periodNumber: 6, startTime: '12:55', endTime: '13:45', room: 'Science Lab Annex' },

  // Wednesday
  { id: 'tt_10', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss2_a', subjectId: 'subj_math', day: 'WEDNESDAY', periodNumber: 2, startTime: '08:50', endTime: '09:40', room: 'Block A - 201' },
  { id: 'tt_11', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss3_sci', subjectId: 'subj_phy', day: 'WEDNESDAY', periodNumber: 4, startTime: '11:15', endTime: '12:05', room: 'Senior Lab' },
  { id: 'tt_12', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_ss1_sci', subjectId: 'subj_eng', day: 'WEDNESDAY', periodNumber: 5, startTime: '12:05', endTime: '12:55', room: 'Science Lab 1' },
  { id: 'tt_13', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss1_a', subjectId: 'subj_math', day: 'WEDNESDAY', periodNumber: 7, startTime: '13:45', endTime: '14:30', room: 'Block A - 101' },

  // Thursday
  { id: 'tt_14', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss1_a', subjectId: 'subj_math', day: 'THURSDAY', periodNumber: 1, startTime: '08:00', endTime: '08:50', room: 'Block A - 101' },
  { id: 'tt_15', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss2_sci', subjectId: 'subj_phy', day: 'THURSDAY', periodNumber: 3, startTime: '09:40', endTime: '10:30', room: 'Science Lab Annex' },
  { id: 'tt_16', schoolId: 'sch_01', teacherId: 'tch_03', classSectionId: 'sec_jss1_a', subjectId: 'subj_sci', day: 'THURSDAY', periodNumber: 4, startTime: '11:15', endTime: '12:05', room: 'Block A - 101' },
  { id: 'tt_17', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss3_sci', subjectId: 'subj_phy', day: 'THURSDAY', periodNumber: 6, startTime: '12:55', endTime: '13:45', room: 'Senior Lab' },

  // Friday
  { id: 'tt_18', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_jss2_a', subjectId: 'subj_math', day: 'FRIDAY', periodNumber: 2, startTime: '08:50', endTime: '09:40', room: 'Block A - 201' },
  { id: 'tt_19', schoolId: 'sch_01', teacherId: 'tch_01', classSectionId: 'sec_ss2_sci', subjectId: 'subj_phy', day: 'FRIDAY', periodNumber: 4, startTime: '11:15', endTime: '12:05', room: 'Physics Lab' },
  { id: 'tt_20', schoolId: 'sch_01', teacherId: 'tch_02', classSectionId: 'sec_jss1_a', subjectId: 'subj_eng', day: 'FRIDAY', periodNumber: 5, startTime: '12:05', endTime: '12:55', room: 'Block A - 101' },
];

export const INITIAL_BEHAVIOR_NOTES: StudentBehaviorNote[] = [
  {
    id: 'bn_01',
    schoolId: 'sch_01',
    studentId: 'stu_01',
    teacherId: 'tch_01',
    teacherName: 'Mr. David Adeleke',
    date: '2026-09-07',
    category: 'COMMENDATION',
    title: 'Outstanding Math Olympiad Problem Solving',
    description: 'Chukwudi solved complex algebraic equations in class with incredible speed and assisted his peers during group work.',
    severity: 'LOW',
    visibleToParent: true,
    createdAt: '2026-09-07T10:15:00Z',
  },
  {
    id: 'bn_02',
    schoolId: 'sch_01',
    studentId: 'stu_04',
    teacherId: 'tch_01',
    teacherName: 'Mr. David Adeleke',
    date: '2026-09-08',
    category: 'ACADEMIC_EFFORT',
    title: 'Great Improvement in Geometry Homework',
    description: 'Amara showed significant improvement in Euclidean geometry proofs after attending Monday tutorial.',
    severity: 'LOW',
    visibleToParent: true,
    createdAt: '2026-09-08T14:30:00Z',
  },
  {
    id: 'bn_03',
    schoolId: 'sch_01',
    studentId: 'stu_05',
    teacherId: 'tch_01',
    teacherName: 'Mr. David Adeleke',
    date: '2026-09-08',
    category: 'DISCIPLINE',
    title: 'Late to Period 1 Morning Session',
    description: 'Arrived 15 minutes after the bell without an admission pass. Reminded of punctuality guidelines.',
    severity: 'LOW',
    visibleToParent: true,
    createdAt: '2026-09-08T08:20:00Z',
  },
];

export const INITIAL_PERIOD_DEFINITIONS: PeriodDefinition[] = [
  { id: 'prd_1', number: 1, label: 'Period 1', startTime: '08:00', endTime: '08:50' },
  { id: 'prd_2', number: 2, label: 'Period 2', startTime: '08:50', endTime: '09:40' },
  { id: 'prd_3', number: 3, label: 'Period 3', startTime: '09:40', endTime: '10:30' },
  { id: 'prd_break', number: 0, label: 'Mid-Morning Break', startTime: '10:30', endTime: '11:15', isBreak: true },
  { id: 'prd_4', number: 4, label: 'Period 4', startTime: '11:15', endTime: '12:05' },
  { id: 'prd_5', number: 5, label: 'Period 5', startTime: '12:05', endTime: '12:55' },
  { id: 'prd_6', number: 6, label: 'Period 6', startTime: '12:55', endTime: '13:45' },
  { id: 'prd_7', number: 7, label: 'Period 7', startTime: '13:45', endTime: '14:30' },
];


