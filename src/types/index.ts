// SchoolOS — Core Domain Types and RBAC Models

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  motto: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
  currentSessionId: string;
  currentTermId: string;
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  name: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Term {
  id: string;
  schoolId: string;
  sessionId: string;
  name: string; // e.g. "First Term", "Second Term", "Third Term"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassLevel {
  id: string;
  schoolId: string;
  name: string; // e.g. "Grade 7", "Junior Secondary 1", "Senior Secondary 2"
  order: number;
}

export interface ClassSection {
  id: string;
  schoolId: string;
  classLevelId: string;
  name: string; // e.g. "A", "B", "Gold", "Diamond"
  room?: string;
  capacity?: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string; // e.g. "Mathematics", "English Language", "Physics"
  code: string; // e.g. "MTH101"
  category: 'CORE' | 'ELECTIVE' | 'VOCATIONAL';
}

export interface TeacherAssignment {
  id: string;
  schoolId: string;
  teacherId: string;
  classSectionId: string;
  subjectId: string;
}

export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  staffId: string;
  qualification: string;
  specialization: string;
  joinedDate: string;
}

export interface Parent {
  id: string;
  userId: string;
  schoolId: string;
  occupation: string;
  address: string;
  alternatePhone?: string;
  childrenStudentIds: string[];
}

export interface Student {
  id: string;
  userId: string;
  schoolId: string;
  admissionNumber: string;
  classSectionId: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  bloodGroup?: string;
  parentIds: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  admissionDate: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classSectionId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedByTeacherId: string;
  submittedAt: string;
}

export interface AssessmentWeightConfig {
  id: string;
  schoolId: string;
  name: string; // e.g. "CA 1", "CA 2", "Exam"
  maxScore: number;
  weightPercent: number;
}

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED' | 'PUBLISHED';

export interface ResultSubmission {
  id: string;
  schoolId: string;
  sessionId: string;
  termId: string;
  classSectionId: string;
  subjectId: string;
  teacherId: string;
  status: SubmissionStatus;
  submittedAt?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  correctionFeedback?: string;
  publishedAt?: string;
}

export interface ScoreItem {
  id: string;
  submissionId: string;
  studentId: string;
  scores: Record<string, number>; // { [assessmentWeightId]: score }
  totalScore: number; // calculated sum or weighted sum
  grade: string; // A, B, C, D, F
  remark: string; // Excellent, Very Good, Credit, Pass, Fail
  teacherRemark?: string;
}

export type AnnouncementTarget = 'ALL' | 'TEACHERS' | 'PARENTS' | 'CLASS_SECTION';

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'URGENT';
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  targetAudience: AnnouncementTarget;
  targetClassSectionId?: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface AuditLog {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ATTENDANCE' | 'SCORE_SUBMISSION' | 'ACADEMIC_SETUP' | 'ANNOUNCEMENT' | 'SECURITY';
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface GradingScaleTier {
  minScore: number;
  maxScore: number;
  grade: string;
  remark: string;
  colorClass: string;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface PeriodDefinition {
  id: string;
  number: number; // 1, 2, 3, etc. (0 for break)
  label: string; // e.g. "Period 1", "Morning Assembly", "Mid-Morning Break"
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:50"
  isBreak?: boolean;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  teacherId: string;
  classSectionId: string;
  subjectId: string;
  day: DayOfWeek;
  periodNumber: number; // 1 to 10
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:50"
  room?: string;
}

export type BehaviorCategory = 'COMMENDATION' | 'DISCIPLINE' | 'ACADEMIC_EFFORT' | 'GENERAL';

export interface StudentBehaviorNote {
  id: string;
  schoolId: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  category: BehaviorCategory;
  title: string;
  description: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  visibleToParent: boolean;
  createdAt: string;
}

