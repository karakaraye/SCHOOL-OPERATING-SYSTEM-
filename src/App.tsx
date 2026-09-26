import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { DeviceProvider } from './context/DeviceContext';
import { ToastProvider } from './components/common/Toast';
import { AppLayout } from './components/layout/AppLayout';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentsView } from './components/admin/StudentsView';
import { ParentsView } from './components/admin/ParentsView';
import { TeachersView } from './components/admin/TeachersView';
import { AcademicSetupView } from './components/admin/AcademicSetupView';
import { AttendanceAdminView } from './components/admin/AttendanceAdminView';
import { ResultsAdminView } from './components/admin/ResultsAdminView';
import { AnnouncementsView } from './components/admin/AnnouncementsView';
import { ReportsAndAuditView } from './components/admin/ReportsAndAuditView';
import { AdminTimetableView } from './components/admin/AdminTimetableView';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherClassesView } from './components/teacher/TeacherClassesView';
import { TeacherAttendanceView } from './components/teacher/TeacherAttendanceView';
import { TeacherScoreEntryView } from './components/teacher/TeacherScoreEntryView';
import { TeacherTimetableView } from './components/teacher/TeacherTimetableView';

// Parent Components
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ParentAttendanceView } from './components/parent/ParentAttendanceView';
import { ParentReportCardView } from './components/parent/ParentReportCardView';
import { ParentAnnouncementsView } from './components/parent/ParentAnnouncementsView';

// Auth Components
import { LoginView } from './components/auth/LoginView';

const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useSchool();
  const [currentTab, setCurrentTab] = useState<string>('admin_dashboard');

  // Auto-switch default landing tab whenever simulated role changes
  useEffect(() => {
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SCHOOL_ADMIN') {
      if (!currentTab.startsWith('admin_')) {
        setCurrentTab('admin_dashboard');
      }
    } else if (currentUser.role === 'TEACHER') {
      if (!currentTab.startsWith('teacher_')) {
        setCurrentTab('teacher_dashboard');
      }
    } else if (currentUser.role === 'PARENT') {
      if (!currentTab.startsWith('parent_')) {
        setCurrentTab('parent_dashboard');
      }
    }
  }, [currentUser.role]);

  const renderCurrentView = () => {
    switch (currentTab) {
      // Admin Views
      case 'admin_dashboard':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'admin_students':
        return <StudentsView />;
      case 'admin_parents':
        return <ParentsView />;
      case 'admin_teachers':
        return <TeachersView />;
      case 'admin_timetable':
        return <AdminTimetableView />;
      case 'admin_academic':
        return <AcademicSetupView initialTab="classes" />;
      case 'admin_academic_setup':
        return <AcademicSetupView initialTab="sessions" />;
      case 'admin_attendance':
        return <AttendanceAdminView />;
      case 'admin_results':
        return <ResultsAdminView />;
      case 'admin_announcements':
        return <AnnouncementsView />;
      case 'admin_reports_audit':
        return <ReportsAndAuditView />;

      // Teacher Views
      case 'teacher_dashboard':
        return <TeacherDashboard onNavigate={setCurrentTab} />;
      case 'teacher_classes':
        return <TeacherClassesView />;
      case 'teacher_timetable':
        return <TeacherTimetableView />;
      case 'teacher_attendance':
        return <TeacherAttendanceView />;
      case 'teacher_scores':
        return <TeacherScoreEntryView />;
      case 'teacher_announcements':
        return <AnnouncementsView />;

      // Parent Views
      case 'parent_dashboard':
        return <ParentDashboard onNavigate={setCurrentTab} />;
      case 'parent_attendance':
        return <ParentAttendanceView />;
      case 'parent_reports':
        return <ParentReportCardView />;
      case 'parent_notices':
        return <ParentAnnouncementsView />;

      default:
        return <AdminDashboard onNavigate={setCurrentTab} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <AppLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderCurrentView()}
    </AppLayout>
  );
};

export function App() {
  return (
    <DeviceProvider>
      <SchoolProvider>
        <ToastProvider>
          <MainContent />
        </ToastProvider>
      </SchoolProvider>
    </DeviceProvider>
  );
}

export default App;
