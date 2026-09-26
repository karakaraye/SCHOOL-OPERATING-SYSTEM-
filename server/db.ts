import pg from 'pg';
import dotenv from 'dotenv';
import * as seed from '../src/data/seedData.ts';
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
  TimetableSlot,
  StudentBehaviorNote,
  PeriodDefinition,
} from '../src/types/index.ts';

dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.dzxtrgdtkfszyssjjltx:IWILLCHANGETHEWORLD2004@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Ensures all relational domain tables exist in the PostgreSQL database.
 */
export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Schools
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        motto TEXT,
        address TEXT,
        email TEXT,
        phone TEXT,
        logo TEXT,
        current_session_id TEXT,
        current_term_id TEXT
      );
    `);

    // 2. Academic Sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS academic_sessions (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_current BOOLEAN DEFAULT false
      );
    `);

    // 3. Terms
    await client.query(`
      CREATE TABLE IF NOT EXISTS terms (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_current BOOLEAN DEFAULT false
      );
    `);

    // 4. Class Levels
    await client.query(`
      CREATE TABLE IF NOT EXISTS class_levels (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        "order" INTEGER NOT NULL
      );
    `);

    // 5. Class Sections
    await client.query(`
      CREATE TABLE IF NOT EXISTS class_sections (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        class_level_id TEXT NOT NULL,
        name TEXT NOT NULL,
        room TEXT,
        capacity INTEGER
      );
    `);

    // 6. Subjects
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        category TEXT NOT NULL
      );
    `);

    // 7. Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        avatar TEXT,
        phone TEXT,
        password TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TEXT
      );
    `);

    // 8. Teachers
    await client.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        school_id TEXT NOT NULL,
        staff_id TEXT,
        qualification TEXT,
        specialization TEXT,
        joined_date TEXT
      );
    `);

    // 9. Parents
    await client.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        school_id TEXT NOT NULL,
        occupation TEXT,
        address TEXT,
        alternate_phone TEXT,
        children_student_ids JSONB DEFAULT '[]'::jsonb
      );
    `);

    // 10. Students
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        school_id TEXT NOT NULL,
        admission_number TEXT NOT NULL UNIQUE,
        class_section_id TEXT,
        gender TEXT,
        dob TEXT,
        blood_group TEXT,
        parent_ids JSONB DEFAULT '[]'::jsonb,
        status TEXT DEFAULT 'ACTIVE',
        admission_date TEXT
      );
    `);

    // 11. Student Profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT
      );
    `);

    // 12. Teacher Assignments
    await client.query(`
      CREATE TABLE IF NOT EXISTS teacher_assignments (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        class_section_id TEXT NOT NULL,
        subject_id TEXT NOT NULL
      );
    `);

    // 13. Attendance Records
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        class_section_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        remarks TEXT,
        marked_by_teacher_id TEXT,
        submitted_at TEXT
      );
    `);

    // 14. Assessment Weight Configs
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_configs (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        name TEXT NOT NULL,
        max_score NUMERIC NOT NULL,
        weight_percent NUMERIC NOT NULL
      );
    `);

    // 15. Result Submissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS result_submissions (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        term_id TEXT NOT NULL,
        class_section_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        status TEXT NOT NULL,
        submitted_at TEXT,
        reviewed_by_user_id TEXT,
        reviewed_at TEXT,
        correction_feedback TEXT,
        published_at TEXT
      );
    `);

    // 16. Score Items
    await client.query(`
      CREATE TABLE IF NOT EXISTS score_items (
        id TEXT PRIMARY KEY,
        submission_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        scores JSONB DEFAULT '{}'::jsonb,
        total_score NUMERIC,
        grade TEXT,
        remark TEXT,
        teacher_remark TEXT
      );
    `);

    // 17. Announcements
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT,
        author_role TEXT,
        target_audience TEXT,
        target_class_section_id TEXT,
        created_at TEXT
      );
    `);

    // 18. Timetable Slots
    await client.query(`
      CREATE TABLE IF NOT EXISTS timetable_slots (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        teacher_id TEXT,
        class_section_id TEXT NOT NULL,
        subject_id TEXT,
        day TEXT NOT NULL,
        period_number INTEGER,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        room TEXT
      );
    `);

    // 19. Period Definitions
    await client.query(`
      CREATE TABLE IF NOT EXISTS period_definitions (
        id TEXT PRIMARY KEY,
        number INTEGER,
        label TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_break BOOLEAN DEFAULT false
      );
    `);

    // 20. Behavior Notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS behavior_notes (
        id TEXT PRIMARY KEY,
        school_id TEXT,
        student_id TEXT NOT NULL,
        teacher_id TEXT,
        teacher_name TEXT,
        date TEXT,
        category TEXT,
        title TEXT,
        description TEXT,
        severity TEXT,
        visible_to_parent BOOLEAN DEFAULT true,
        created_at TEXT
      );
    `);

    // 21. Audit Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        user_id TEXT,
        user_name TEXT,
        user_role TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        details TEXT,
        entity_id TEXT
      );
    `);

    await client.query('COMMIT');

    // Check if initial seeding is needed
    const countRes = await client.query('SELECT COUNT(*) as count FROM schools');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] Database is empty. Seeding initial SchoolOS datasets...');
      await seedInitialData(client);
      console.log('[PostgreSQL] Initial dataset seeding completed successfully.');
    } else {
      console.log('[PostgreSQL] Database already initialized with existing records.');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Error initializing database tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Seeds initial demo/production data from seedData.ts into PostgreSQL.
 */
async function seedInitialData(client: pg.PoolClient) {
  await client.query('BEGIN');
  try {
    // 1. School
    const sc = seed.INITIAL_SCHOOL;
    await client.query(
      `INSERT INTO schools (id, name, code, motto, address, email, phone, logo, current_session_id, current_term_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING;`,
      [sc.id, sc.name, sc.code, sc.motto, sc.address, sc.email, sc.phone, sc.logo || null, sc.currentSessionId, sc.currentTermId]
    );

    // 2. Academic Sessions
    for (const s of seed.INITIAL_SESSIONS) {
      await client.query(
        `INSERT INTO academic_sessions (id, school_id, name, start_date, end_date, is_current)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING;`,
        [s.id, s.schoolId, s.name, s.startDate, s.endDate, s.isCurrent]
      );
    }

    // 3. Terms
    for (const t of seed.INITIAL_TERMS) {
      const cleanName = t.name.replace(/\s*\(Autumn\)|\s*\(Spring\)|\s*\(Summer\)/gi, '').trim();
      await client.query(
        `INSERT INTO terms (id, school_id, session_id, name, start_date, end_date, is_current)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING;`,
        [t.id, t.schoolId, t.sessionId, cleanName, t.startDate, t.endDate, t.isCurrent]
      );
    }

    // 4. Class Levels
    for (const cl of seed.INITIAL_CLASS_LEVELS) {
      await client.query(
        `INSERT INTO class_levels (id, school_id, name, "order")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING;`,
        [cl.id, cl.schoolId, cl.name, cl.order]
      );
    }

    // 5. Class Sections
    for (const cs of seed.INITIAL_CLASS_SECTIONS) {
      await client.query(
        `INSERT INTO class_sections (id, school_id, class_level_id, name, room, capacity)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING;`,
        [cs.id, cs.schoolId, cs.classLevelId, cs.name, cs.room || null, cs.capacity || null]
      );
    }

    // 6. Subjects
    for (const sub of seed.INITIAL_SUBJECTS) {
      await client.query(
        `INSERT INTO subjects (id, school_id, name, code, category)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING;`,
        [sub.id, sub.schoolId, sub.name, sub.code, sub.category]
      );
    }

    // 7. Users
    for (const u of seed.INITIAL_USERS) {
      await client.query(
        `INSERT INTO users (id, school_id, name, email, role, avatar, phone, password, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [u.id, u.schoolId, u.name, u.email, u.role, u.avatar || null, u.phone || null, u.password || null, u.isActive, u.createdAt]
      );
    }

    // 8. Teachers
    for (const tch of seed.INITIAL_TEACHERS) {
      await client.query(
        `INSERT INTO teachers (id, user_id, school_id, staff_id, qualification, specialization, joined_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING;`,
        [tch.id, tch.userId, tch.schoolId, tch.staffId, tch.qualification, tch.specialization, tch.joinedDate]
      );
    }

    // 9. Parents
    for (const p of seed.INITIAL_PARENTS) {
      await client.query(
        `INSERT INTO parents (id, user_id, school_id, occupation, address, alternate_phone, children_student_ids)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING;`,
        [p.id, p.userId, p.schoolId, p.occupation, p.address, p.alternatePhone || null, JSON.stringify(p.childrenStudentIds || [])]
      );
    }

    // 10. Students
    for (const st of seed.INITIAL_STUDENTS) {
      await client.query(
        `INSERT INTO students (id, user_id, school_id, admission_number, class_section_id, gender, dob, blood_group, parent_ids, status, admission_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING;`,
        [st.id, st.userId, st.schoolId, st.admissionNumber, st.classSectionId, st.gender, st.dob, st.bloodGroup || null, JSON.stringify(st.parentIds || []), st.status, st.admissionDate]
      );
    }

    // 11. Student Profiles
    for (const [userId, prof] of Object.entries(seed.INITIAL_STUDENT_USERS)) {
      await client.query(
        `INSERT INTO student_profiles (user_id, name, avatar)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar;`,
        [userId, prof.name, prof.avatar || null]
      );
    }

    // 12. Teacher Assignments
    for (const ta of seed.INITIAL_TEACHER_ASSIGNMENTS) {
      await client.query(
        `INSERT INTO teacher_assignments (id, school_id, teacher_id, class_section_id, subject_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING;`,
        [ta.id, ta.schoolId, ta.teacherId, ta.classSectionId, ta.subjectId]
      );
    }

    // 13. Attendance
    for (const att of seed.INITIAL_ATTENDANCE) {
      await client.query(
        `INSERT INTO attendance_records (id, school_id, class_section_id, student_id, date, status, remarks, marked_by_teacher_id, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [att.id, att.schoolId, att.classSectionId, att.studentId, att.date, att.status, att.remarks || null, att.markedByTeacherId, att.submittedAt]
      );
    }

    // 14. Assessment Configs
    for (const ac of seed.INITIAL_ASSESSMENT_CONFIG) {
      await client.query(
        `INSERT INTO assessment_configs (id, school_id, name, max_score, weight_percent)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING;`,
        [ac.id, ac.schoolId, ac.name, ac.maxScore, ac.weightPercent]
      );
    }

    // 15. Result Submissions
    for (const sub of seed.INITIAL_SUBMISSIONS) {
      await client.query(
        `INSERT INTO result_submissions (id, school_id, session_id, term_id, class_section_id, subject_id, teacher_id, status, submitted_at, reviewed_by_user_id, reviewed_at, correction_feedback, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING;`,
        [sub.id, sub.schoolId, sub.sessionId, sub.termId, sub.classSectionId, sub.subjectId, sub.teacherId, sub.status, sub.submittedAt || null, sub.reviewedByUserId || null, sub.reviewedAt || null, sub.correctionFeedback || null, sub.publishedAt || null]
      );
    }

    // 16. Score Items
    for (const sc of seed.INITIAL_SCORES) {
      await client.query(
        `INSERT INTO score_items (id, submission_id, student_id, scores, total_score, grade, remark, teacher_remark)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING;`,
        [sc.id, sc.submissionId, sc.studentId, JSON.stringify(sc.scores || {}), sc.totalScore, sc.grade, sc.remark, sc.teacherRemark || null]
      );
    }

    // 17. Announcements
    for (const ann of seed.INITIAL_ANNOUNCEMENTS) {
      await client.query(
        `INSERT INTO announcements (id, school_id, title, content, category, author_id, author_name, author_role, target_audience, target_class_section_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING;`,
        [ann.id, ann.schoolId, ann.title, ann.content, ann.category, ann.authorId, ann.authorName, ann.authorRole, ann.targetAudience, ann.targetClassSectionId || null, ann.createdAt]
      );
    }

    // 18. Timetable
    for (const tt of seed.INITIAL_TIMETABLE) {
      await client.query(
        `INSERT INTO timetable_slots (id, school_id, teacher_id, class_section_id, subject_id, day, period_number, start_time, end_time, room)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [tt.id, tt.schoolId, tt.teacherId || null, tt.classSectionId, tt.subjectId, tt.day, tt.periodNumber, tt.startTime, tt.endTime, tt.room || null]
      );
    }

    // 19. Period Definitions
    for (const pd of seed.INITIAL_PERIOD_DEFINITIONS) {
      await client.query(
        `INSERT INTO period_definitions (id, number, label, start_time, end_time, is_break)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING;`,
        [pd.id, pd.number, pd.label, pd.startTime, pd.endTime, pd.isBreak || false]
      );
    }

    // 20. Behavior Notes
    for (const bn of seed.INITIAL_BEHAVIOR_NOTES) {
      await client.query(
        `INSERT INTO behavior_notes (id, school_id, student_id, teacher_id, teacher_name, date, category, title, description, severity, visible_to_parent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING;`,
        [bn.id, bn.schoolId, bn.studentId, bn.teacherId, bn.teacherName, bn.date, bn.category, bn.title, bn.description, bn.severity || null, bn.visibleToParent ?? true, bn.createdAt]
      );
    }

    // 21. Audit Logs
    for (const al of seed.INITIAL_AUDIT_LOGS) {
      await client.query(
        `INSERT INTO audit_logs (id, timestamp, user_id, user_name, user_role, action, entity_type, details, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [al.id, al.timestamp, al.userId || null, al.userName || null, al.userRole || null, al.action, al.entityType, al.details, al.entityId || null]
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

/**
 * Loads all state collections directly from PostgreSQL.
 */
export async function getFullDatabaseState() {
  const [
    schoolsRes,
    sessionsRes,
    termsRes,
    levelsRes,
    sectionsRes,
    subjectsRes,
    usersRes,
    teachersRes,
    parentsRes,
    studentsRes,
    profilesRes,
    assignmentsRes,
    attendanceRes,
    configsRes,
    submissionsRes,
    scoresRes,
    announcementsRes,
    timetableRes,
    periodsRes,
    behaviorRes,
    logsRes,
  ] = await Promise.all([
    pool.query('SELECT * FROM schools LIMIT 1'),
    pool.query('SELECT * FROM academic_sessions ORDER BY start_date DESC'),
    pool.query('SELECT * FROM terms ORDER BY start_date ASC'),
    pool.query('SELECT * FROM class_levels ORDER BY "order" ASC'),
    pool.query('SELECT * FROM class_sections ORDER BY name ASC'),
    pool.query('SELECT * FROM subjects ORDER BY name ASC'),
    pool.query('SELECT * FROM users ORDER BY name ASC'),
    pool.query('SELECT * FROM teachers'),
    pool.query('SELECT * FROM parents'),
    pool.query('SELECT * FROM students ORDER BY admission_number ASC'),
    pool.query('SELECT * FROM student_profiles'),
    pool.query('SELECT * FROM teacher_assignments'),
    pool.query('SELECT * FROM attendance_records ORDER BY date DESC'),
    pool.query('SELECT * FROM assessment_configs'),
    pool.query('SELECT * FROM result_submissions ORDER BY submitted_at DESC'),
    pool.query('SELECT * FROM score_items'),
    pool.query('SELECT * FROM announcements ORDER BY created_at DESC'),
    pool.query('SELECT * FROM timetable_slots'),
    pool.query('SELECT * FROM period_definitions ORDER BY start_time ASC'),
    pool.query('SELECT * FROM behavior_notes ORDER BY date DESC'),
    pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200'),
  ]);

  const schoolRow = schoolsRes.rows[0];
  const school: School = schoolRow
    ? {
        id: schoolRow.id,
        name: schoolRow.name,
        code: schoolRow.code,
        motto: schoolRow.motto,
        address: schoolRow.address,
        email: schoolRow.email,
        phone: schoolRow.phone,
        logo: schoolRow.logo || '',
        currentSessionId: schoolRow.current_session_id,
        currentTermId: schoolRow.current_term_id,
      }
    : seed.INITIAL_SCHOOL;

  const sessions: AcademicSession[] = sessionsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    name: r.name,
    startDate: r.start_date,
    endDate: r.end_date,
    isCurrent: r.is_current,
  }));

  const terms: Term[] = termsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    sessionId: r.session_id,
    name: r.name,
    startDate: r.start_date,
    endDate: r.end_date,
    isCurrent: r.is_current,
  }));

  const classLevels: ClassLevel[] = levelsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    name: r.name,
    order: r.order,
  }));

  const classSections: ClassSection[] = sectionsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    classLevelId: r.class_level_id,
    name: r.name,
    room: r.room || undefined,
    capacity: r.capacity || undefined,
  }));

  const subjects: Subject[] = subjectsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    name: r.name,
    code: r.code,
    category: r.category,
  }));

  const users: User[] = usersRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    name: r.name,
    email: r.email,
    role: r.role,
    avatar: r.avatar || '',
    phone: r.phone || '',
    password: r.password || '',
    isActive: r.is_active,
    createdAt: r.created_at,
  }));

  const teachers: Teacher[] = teachersRes.rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    schoolId: r.school_id,
    staffId: r.staff_id,
    qualification: r.qualification,
    specialization: r.specialization,
    joinedDate: r.joined_date,
  }));

  const parents: Parent[] = parentsRes.rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    schoolId: r.school_id,
    occupation: r.occupation,
    address: r.address,
    alternatePhone: r.alternate_phone || undefined,
    childrenStudentIds: Array.isArray(r.children_student_ids) ? r.children_student_ids : [],
  }));

  const students: Student[] = studentsRes.rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    schoolId: r.school_id,
    admissionNumber: r.admission_number,
    classSectionId: r.class_section_id,
    gender: r.gender,
    dob: r.dob,
    bloodGroup: r.blood_group || undefined,
    parentIds: Array.isArray(r.parent_ids) ? r.parent_ids : [],
    status: r.status,
    admissionDate: r.admission_date,
  }));

  const studentProfiles: Record<string, { name: string; avatar: string }> = {};
  for (const r of profilesRes.rows) {
    studentProfiles[r.user_id] = {
      name: r.name,
      avatar: r.avatar || '',
    };
  }

  const teacherAssignments: TeacherAssignment[] = assignmentsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    teacherId: r.teacher_id,
    classSectionId: r.class_section_id,
    subjectId: r.subject_id,
  }));

  const attendance: AttendanceRecord[] = attendanceRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    classSectionId: r.class_section_id,
    studentId: r.student_id,
    date: r.date,
    status: r.status,
    remarks: r.remarks || undefined,
    markedByTeacherId: r.marked_by_teacher_id,
    submittedAt: r.submitted_at,
  }));

  const assessmentConfigs: AssessmentWeightConfig[] = configsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    name: r.name,
    maxScore: parseFloat(r.max_score),
    weightPercent: parseFloat(r.weight_percent),
  }));

  const submissions: ResultSubmission[] = submissionsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    sessionId: r.session_id,
    termId: r.term_id,
    classSectionId: r.class_section_id,
    subjectId: r.subject_id,
    teacherId: r.teacher_id,
    status: r.status,
    submittedAt: r.submitted_at || undefined,
    reviewedByUserId: r.reviewed_by_user_id || undefined,
    reviewedAt: r.reviewed_at || undefined,
    correctionFeedback: r.correction_feedback || undefined,
    publishedAt: r.published_at || undefined,
  }));

  const scores: ScoreItem[] = scoresRes.rows.map(r => ({
    id: r.id,
    submissionId: r.submission_id,
    studentId: r.student_id,
    scores: typeof r.scores === 'object' && r.scores !== null ? r.scores : {},
    totalScore: parseFloat(r.total_score || '0'),
    grade: r.grade,
    remark: r.remark,
    teacherRemark: r.teacher_remark || undefined,
  }));

  const announcements: Announcement[] = announcementsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    title: r.title,
    content: r.content,
    category: r.category,
    authorId: r.author_id,
    authorName: r.author_name,
    authorRole: r.author_role,
    targetAudience: r.target_audience,
    targetClassSectionId: r.target_class_section_id || undefined,
    createdAt: r.created_at,
  }));

  const timetableSlots: TimetableSlot[] = timetableRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id,
    teacherId: r.teacher_id || '',
    classSectionId: r.class_section_id,
    subjectId: r.subject_id || '',
    day: r.day,
    periodNumber: r.period_number,
    startTime: r.start_time,
    endTime: r.end_time,
    room: r.room || undefined,
  }));

  const periodDefinitions: PeriodDefinition[] = periodsRes.rows.map(r => ({
    id: r.id,
    number: r.number,
    label: r.label,
    startTime: r.start_time,
    endTime: r.end_time,
    isBreak: r.is_break,
  }));

  const behaviorNotes: StudentBehaviorNote[] = behaviorRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id || '',
    studentId: r.student_id,
    teacherId: r.teacher_id || '',
    teacherName: r.teacher_name || '',
    date: r.date,
    category: r.category,
    title: r.title || '',
    description: r.description || '',
    severity: r.severity || undefined,
    visibleToParent: r.visible_to_parent ?? true,
    createdAt: r.created_at || '',
  }));

  const auditLogs: AuditLog[] = logsRes.rows.map(r => ({
    id: r.id,
    schoolId: r.school_id || 'sch_01',
    timestamp: r.timestamp,
    userId: r.user_id || undefined,
    userName: r.user_name || undefined,
    userRole: r.user_role || undefined,
    action: r.action,
    entityType: r.entity_type,
    details: r.details,
    entityId: r.entity_id || undefined,
  }));

  return {
    school,
    sessions,
    terms,
    classLevels,
    classSections,
    subjects,
    users,
    teachers,
    parents,
    students,
    studentProfiles,
    teacherAssignments,
    attendance,
    assessmentConfigs,
    gradingScale: seed.INITIAL_GRADING_SCALE,
    submissions,
    scores,
    announcements,
    timetableSlots,
    periodDefinitions,
    behaviorNotes,
    auditLogs,
  };
}

/**
 * Saves or updates a parent profile and their user record in PostgreSQL.
 */
export async function dbCreateParent(data: {
  newUser: User;
  newParent: Parent;
  linkedStudentIds: string[];
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert user
    await client.query(
      `INSERT INTO users (id, school_id, name, email, role, avatar, phone, password, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         password = EXCLUDED.password,
         avatar = EXCLUDED.avatar;`,
      [
        data.newUser.id,
        data.newUser.schoolId,
        data.newUser.name,
        data.newUser.email,
        data.newUser.role,
        data.newUser.avatar || null,
        data.newUser.phone || null,
        data.newUser.password || 'parent123',
        data.newUser.isActive,
        data.newUser.createdAt,
      ]
    );

    // 2. Insert parent
    await client.query(
      `INSERT INTO parents (id, user_id, school_id, occupation, address, children_student_ids)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         occupation = EXCLUDED.occupation,
         address = EXCLUDED.address,
         children_student_ids = EXCLUDED.children_student_ids;`,
      [
        data.newParent.id,
        data.newParent.userId,
        data.newParent.schoolId,
        data.newParent.occupation,
        data.newParent.address,
        JSON.stringify(data.newParent.childrenStudentIds || []),
      ]
    );

    // 3. Update student parentIds
    for (const studentId of data.linkedStudentIds) {
      await client.query(
        `UPDATE students 
         SET parent_ids = (
           SELECT jsonb_agg(DISTINCT elem) 
           FROM jsonb_array_elements_text(COALESCE(parent_ids, '[]'::jsonb) || jsonb_build_array($1::text)) AS elem
         )
         WHERE id = $2;`,
        [data.newParent.id, studentId]
      );
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Links students to an existing parent in PostgreSQL.
 */
export async function dbLinkStudentsToParent(studentIds: string[], parentId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update parent children_student_ids
    for (const sId of studentIds) {
      await client.query(
        `UPDATE parents 
         SET children_student_ids = (
           SELECT jsonb_agg(DISTINCT elem) 
           FROM jsonb_array_elements_text(COALESCE(children_student_ids, '[]'::jsonb) || jsonb_build_array($1::text)) AS elem
         )
         WHERE id = $2;`,
        [sId, parentId]
      );
    }

    // 2. Update students parent_ids
    for (const sId of studentIds) {
      await client.query(
        `UPDATE students 
         SET parent_ids = (
           SELECT jsonb_agg(DISTINCT elem) 
           FROM jsonb_array_elements_text(COALESCE(parent_ids, '[]'::jsonb) || jsonb_build_array($1::text)) AS elem
         )
         WHERE id = $2;`,
        [parentId, sId]
      );
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Syncs updated full state payload directly to PostgreSQL.
 */
export async function dbSyncState(payload: Partial<Awaited<ReturnType<typeof getFullDatabaseState>>>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // School
    if (payload.school) {
      const s = payload.school;
      await client.query(
        `INSERT INTO schools (id, name, code, motto, address, email, phone, logo, current_session_id, current_term_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           code = EXCLUDED.code,
           current_session_id = EXCLUDED.current_session_id,
           current_term_id = EXCLUDED.current_term_id;`,
        [s.id, s.name, s.code, s.motto, s.address, s.email, s.phone, s.logo || null, s.currentSessionId, s.currentTermId]
      );
    }

    // Sessions
    if (payload.sessions) {
      for (const s of payload.sessions) {
        await client.query(
          `INSERT INTO academic_sessions (id, school_id, name, start_date, end_date, is_current)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET is_current = EXCLUDED.is_current, name = EXCLUDED.name;`,
          [s.id, s.schoolId, s.name, s.startDate, s.endDate, s.isCurrent]
        );
      }
    }

    // Terms
    if (payload.terms) {
      for (const t of payload.terms) {
        await client.query(
          `INSERT INTO terms (id, school_id, session_id, name, start_date, end_date, is_current)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET is_current = EXCLUDED.is_current, name = EXCLUDED.name;`,
          [t.id, t.schoolId, t.sessionId, t.name, t.startDate, t.endDate, t.isCurrent]
        );
      }
    }

    // Parents
    if (payload.parents) {
      for (const p of payload.parents) {
        await client.query(
          `INSERT INTO parents (id, user_id, school_id, occupation, address, alternate_phone, children_student_ids)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             occupation = EXCLUDED.occupation,
             address = EXCLUDED.address,
             children_student_ids = EXCLUDED.children_student_ids;`,
          [p.id, p.userId, p.schoolId, p.occupation, p.address, p.alternatePhone || null, JSON.stringify(p.childrenStudentIds || [])]
        );
      }
    }

    // Students
    if (payload.students) {
      for (const st of payload.students) {
        await client.query(
          `INSERT INTO students (id, user_id, school_id, admission_number, class_section_id, gender, dob, blood_group, parent_ids, status, admission_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             class_section_id = EXCLUDED.class_section_id,
             parent_ids = EXCLUDED.parent_ids,
             status = EXCLUDED.status;`,
          [st.id, st.userId, st.schoolId, st.admissionNumber, st.classSectionId, st.gender, st.dob, st.bloodGroup || null, JSON.stringify(st.parentIds || []), st.status, st.admissionDate]
        );
      }
    }

    // Student Profiles
    if (payload.studentProfiles) {
      for (const [userId, prof] of Object.entries(payload.studentProfiles)) {
        await client.query(
          `INSERT INTO student_profiles (user_id, name, avatar)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar;`,
          [userId, prof.name, prof.avatar || null]
        );
      }
    }

    // Users
    if (payload.users) {
      for (const u of payload.users) {
        await client.query(
          `INSERT INTO users (id, school_id, name, email, role, avatar, phone, password, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             password = EXCLUDED.password,
             avatar = EXCLUDED.avatar,
             is_active = EXCLUDED.is_active;`,
          [u.id, u.schoolId, u.name, u.email, u.role, u.avatar || null, u.phone || null, u.password || null, u.isActive, u.createdAt]
        );
      }
    }

    // Attendance
    if (payload.attendance) {
      for (const att of payload.attendance) {
        await client.query(
          `INSERT INTO attendance_records (id, school_id, class_section_id, student_id, date, status, remarks, marked_by_teacher_id, submitted_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks;`,
          [att.id, att.schoolId, att.classSectionId, att.studentId, att.date, att.status, att.remarks || null, att.markedByTeacherId, att.submittedAt]
        );
      }
    }

    // Result Submissions
    if (payload.submissions) {
      for (const sub of payload.submissions) {
        await client.query(
          `INSERT INTO result_submissions (id, school_id, session_id, term_id, class_section_id, subject_id, teacher_id, status, submitted_at, reviewed_by_user_id, reviewed_at, correction_feedback, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             reviewed_by_user_id = EXCLUDED.reviewed_by_user_id,
             reviewed_at = EXCLUDED.reviewed_at,
             correction_feedback = EXCLUDED.correction_feedback,
             published_at = EXCLUDED.published_at;`,
          [sub.id, sub.schoolId, sub.sessionId, sub.termId, sub.classSectionId, sub.subjectId, sub.teacherId, sub.status, sub.submittedAt || null, sub.reviewedByUserId || null, sub.reviewedAt || null, sub.correctionFeedback || null, sub.publishedAt || null]
        );
      }
    }

    // Score Items
    if (payload.scores) {
      for (const sc of payload.scores) {
        await client.query(
          `INSERT INTO score_items (id, submission_id, student_id, scores, total_score, grade, remark, teacher_remark)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             scores = EXCLUDED.scores,
             total_score = EXCLUDED.total_score,
             grade = EXCLUDED.grade,
             remark = EXCLUDED.remark,
             teacher_remark = EXCLUDED.teacher_remark;`,
          [sc.id, sc.submissionId, sc.studentId, JSON.stringify(sc.scores || {}), sc.totalScore, sc.grade, sc.remark, sc.teacherRemark || null]
        );
      }
    }

    // Audit Logs
    if (payload.auditLogs) {
      for (const al of payload.auditLogs) {
        await client.query(
          `INSERT INTO audit_logs (id, timestamp, user_id, user_name, user_role, action, entity_type, details, entity_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING;`,
          [al.id, al.timestamp, al.userId || null, al.userName || null, al.userRole || null, al.action, al.entityType, al.details, al.entityId || null]
        );
      }
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
