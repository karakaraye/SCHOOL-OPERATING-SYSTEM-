import { initDatabase, getFullDatabaseState } from './db.ts';

async function main() {
  console.log('--- Initializing Live Supabase PostgreSQL Database ---');
  await initDatabase();
  console.log('--- Fetching Live Database State Verification ---');
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
  console.log('[SUCCESS] All PostgreSQL tables created and verified on Supabase!');
  process.exit(0);
}

main().catch(err => {
  console.error('[FATAL] Failed to initialize DB:', err);
  process.exit(1);
});
