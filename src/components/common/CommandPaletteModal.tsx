import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Search,
  X,
  GraduationCap,
  UserCheck,
  BookOpen,
  CalendarCheck2,
  Megaphone,
  Users,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { ModalPortal } from './ModalPortal';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const {
    students,
    studentProfiles,
    teachers,
    classSections,
    allUsers,
    switchUser,
    theme,
    toggleTheme,
  } = useSchool();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle global keyboard shortcut Ctrl+K / Cmd+K & Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build searchable items
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'STUDENT' | 'TEACHER' | 'CLASS' | 'ACTION' | 'NAV';
      icon: React.ElementType;
      action: () => void;
    }> = [];

    // Quick Actions
    const actions = [
      {
        id: 'action-enroll',
        title: 'Enroll New Student',
        subtitle: 'Add student & allocate to class section',
        category: 'ACTION' as const,
        icon: GraduationCap,
        action: () => {
          onNavigate('admin_students');
          onClose();
        },
      },
      {
        id: 'action-attendance',
        title: 'Mark Daily Attendance',
        subtitle: 'Record student attendance & punctuality',
        category: 'ACTION' as const,
        icon: CalendarCheck2,
        action: () => {
          onNavigate('admin_attendance');
          onClose();
        },
      },
      {
        id: 'action-timetable',
        title: 'Master Timetable & Lesson Schedule',
        subtitle: 'Manage school-wide class periods & scheduling',
        category: 'ACTION' as const,
        icon: Calendar,
        action: () => {
          onNavigate('admin_timetable');
          onClose();
        },
      },
      {
        id: 'action-allocations',
        title: 'Subject Teacher Allocation Matrix (JS 1 → SS 3)',
        subtitle: 'Allocate teachers across grade levels & subjects',
        category: 'ACTION' as const,
        icon: Layers,
        action: () => {
          onNavigate('admin_timetable');
          onClose();
        },
      },
      {
        id: 'action-broadcast',
        title: 'Post School Broadcast',
        subtitle: 'Send announcement to parents & staff',
        category: 'ACTION' as const,
        icon: Megaphone,
        action: () => {
          onNavigate('admin_announcements');
          onClose();
        },
      },
      {
        id: 'action-theme',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle application theme appearance',
        category: 'ACTION' as const,
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'action-sim-admin',
        title: 'Simulate Super Admin (Dr. Evelyn Vance)',
        subtitle: 'Switch actor context to Super Admin',
        category: 'ACTION' as const,
        icon: ShieldCheck,
        action: () => {
          switchUser('usr_super_admin');
          onClose();
        },
      },
      {
        id: 'action-sim-teacher',
        title: 'Simulate Math Teacher (Mr. David Adeleke)',
        subtitle: 'Switch actor context to Teacher Workspace',
        category: 'ACTION' as const,
        icon: UserCheck,
        action: () => {
          switchUser('usr_tch_1');
          onClose();
        },
      },
      {
        id: 'action-sim-parent',
        title: 'Simulate Guardian (Dr. Michael Okonkwo)',
        subtitle: 'Switch actor context to Parent Guardian Portal',
        category: 'ACTION' as const,
        icon: Users,
        action: () => {
          switchUser('usr_prt_1');
          onClose();
        },
      },
    ];

    if (!q) {
      return actions.slice(0, 5);
    }

    // Filter Actions
    actions.forEach(act => {
      if (act.title.toLowerCase().includes(q) || act.subtitle.toLowerCase().includes(q)) {
        results.push(act);
      }
    });

    // Students
    students.forEach(st => {
      const profile = studentProfiles[st.userId];
      const name = profile?.name || 'Student';
      const classSec = classSections.find(c => c.id === st.classSectionId);
      if (
        name.toLowerCase().includes(q) ||
        st.admissionNumber.toLowerCase().includes(q) ||
        classSec?.name.toLowerCase().includes(q)
      ) {
        results.push({
          id: `stu-${st.id}`,
          title: name,
          subtitle: `${st.admissionNumber} • ${classSec?.name || 'Unassigned'} • ${st.status}`,
          category: 'STUDENT',
          icon: GraduationCap,
          action: () => {
            onNavigate('admin_students');
            onClose();
          },
        });
      }
    });

    // Teachers
    teachers.forEach(t => {
      const u = allUsers.find(x => x.id === t.userId);
      const name = u?.name || 'Teacher';
      if (
        name.toLowerCase().includes(q) ||
        t.staffId.toLowerCase().includes(q) ||
        t.specialization.toLowerCase().includes(q)
      ) {
        results.push({
          id: `tch-${t.id}`,
          title: name,
          subtitle: `Staff ID: ${t.staffId} • ${t.specialization}`,
          category: 'TEACHER',
          icon: UserCheck,
          action: () => {
            onNavigate('admin_teachers');
            onClose();
          },
        });
      }
    });

    // Classes
    classSections.forEach(c => {
      if (c.name.toLowerCase().includes(q) || (c.room && c.room.toLowerCase().includes(q))) {
        results.push({
          id: `sec-${c.id}`,
          title: c.name,
          subtitle: `Room ${c.room || 'Main Block'} • Capacity: ${c.capacity} students`,
          category: 'CLASS',
          icon: BookOpen,
          action: () => {
            onNavigate('admin_academic');
            onClose();
          },
        });
      }
    });

    return results;
  }, [query, students, studentProfiles, teachers, classSections, allUsers, theme, onNavigate, onClose, switchUser, toggleTheme]);

  // Handle keyboard arrow navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].action();
      }
    }
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div
        className="modal-content !max-w-2xl !p-0 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3 bg-[var(--bg-surface)]">
          <Search size={20} className="text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, student name, teacher, or class..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent border-none text-base text-[var(--text-primary)] placeholder-slate-400 outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 p-1 rounded"
            >
              <X size={16} />
            </button>
          )}
          <span className="kbd text-xs">ESC</span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles size={24} className="mx-auto text-indigo-400/50" />
              <p className="text-sm">No matching records or actions found for "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for students, faculty, or quick actions</p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-100 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'hover:bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{item.title}</div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-indigo-100' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--bg-surface-soft)] text-slate-400 border border-[var(--border-subtle)]'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      size={14}
                      className={isSelected ? 'text-white' : 'text-slate-500'}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="kbd">↑</span> <span className="kbd">↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="kbd">↵</span> Select
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Sparkles size={12} />
            <span>SchoolOS Quick Search</span>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
