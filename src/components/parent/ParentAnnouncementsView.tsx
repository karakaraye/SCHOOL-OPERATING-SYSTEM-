import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Pin,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Announcement } from '../../types';

export const ParentAnnouncementsView: React.FC = () => {
  const {
    announcements,
    currentUser,
    parents,
    students,
    classSections,
  } = useSchool();

  const currentParent = parents.find(p => p.userId === currentUser.id) || parents[0];
  const linkedStudentIds = currentParent?.childrenStudentIds || [];
  const linkedStudents = students.filter(s => linkedStudentIds.includes(s.id));
  const myClassSectionIds = linkedStudents.map(s => s.classSectionId);

  // Filter announcements for parents & their child cohorts
  const visibleAnnouncements = announcements.filter(ann => {
    if (ann.targetAudience === 'ALL' || ann.targetAudience === 'PARENTS') return true;
    if (ann.targetAudience === 'CLASS_SECTION' && ann.targetClassSectionId) {
      return myClassSectionIds.includes(ann.targetClassSectionId);
    }
    return false;
  });

  const getCategoryBadge = (cat: Announcement['category']) => {
    switch (cat) {
      case 'URGENT':
        return <span className="badge badge-danger">URGENT</span>;
      case 'ACADEMIC':
        return <span className="badge badge-primary">ACADEMIC</span>;
      case 'EVENT':
        return <span className="badge badge-cyan">EVENT</span>;
      case 'GENERAL':
        return <span className="badge badge-muted">GENERAL</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-primary text-[10px]">Guardian Noticeboard</span>
          <span className="text-xs text-[var(--text-secondary)]">Official Circulars</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
          School & Class Circulars
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Official bulletins, academic schedules, and school circulars published for parents and your children's classes.
        </p>
      </div>

      {/* Announcements Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleAnnouncements.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2 glass-card">
            <Sparkles size={28} className="mx-auto text-indigo-400/40" />
            <p className="text-sm font-medium">No circulars currently posted.</p>
          </div>
        ) : (
          visibleAnnouncements.map(ann => {
            const targetClass = classSections.find(c => c.id === ann.targetClassSectionId);
            return (
              <div
                key={ann.id}
                className={`glass-card p-6 flex flex-col justify-between space-y-4 transition-all ${
                  ann.isPinned ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 to-slate-900/60 shadow-lg' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(ann.category)}
                      {ann.isPinned && (
                        <span className="badge badge-warning text-[9px] flex items-center gap-1">
                          <Pin size={10} /> PINNED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[var(--text-primary)] mt-3 font-heading">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                {/* Footer author & audience */}
                <div className="pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">
                    Issued by {ann.authorName}
                  </span>
                  <span className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {ann.targetAudience === 'CLASS_SECTION'
                      ? targetClass?.name
                      : `For: ${ann.targetAudience}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
