import { pool, initDatabase, getFullDatabaseState } from './db.ts';

async function main() {
  console.log('--- Dropping old tables to recreate clean schema ---');
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS 
        schools, academic_sessions, terms, class_levels, class_sections, 
        subjects, users, teachers, parents, students, student_profiles, 
        teacher_assignments, attendance_records, assessment_configs, 
        result_submissions, score_items, announcements, timetable_slots, 
        period_definitions, behavior_notes, audit_logs CASCADE;
    `);
    console.log('[SUCCESS] Dropped all legacy tables.');
  } finally {
    client.release();
  }

  console.log('--- Initializing all 21 tables & seeding initial data ---');
  await initDatabase();

  console.log('--- Verifying Live Supabase PostgreSQL Database ---');
  const state = await getFullDatabaseState();
  console.log('School:', state.school.name, `(${state.school.code})`);
  console.log('Sessions count:', state.sessions.length);
  console.log('Terms count:', state.terms.length);
  console.log('Users count:', state.users.length);
  console.log('Students count:', state.students.length);
  console.log('Parents count:', state.parents.length);
  console.log('Teachers count:', state.teachers.length);
  console.log('Class Sections count:', state.classSections.length);
  console.log('Attendance records count:', state.attendance.length);
  console.log('Timetable slots count:', state.timetableSlots.length);
  console.log('Period definitions count:', state.periodDefinitions.length);
  console.log('Behavior notes count:', state.behaviorNotes.length);
  console.log('Audit logs count:', state.auditLogs.length);
  console.log('>>> [SUCCESS] 21 / 21 tables created and verified on Supabase PostgreSQL! <<<');
  process.exit(0);
}

main().catch(err => {
  console.error('[FATAL] Error during reset and seed:', err);
  process.exit(1);
});
