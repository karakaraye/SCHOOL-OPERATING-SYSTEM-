import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Megaphone,
  Plus,
  Pin,
  Clock,
  Users,
  X,
  Send,
} from 'lucide-react';
import type { Announcement } from '../../types';
import { ModalPortal } from '../common/ModalPortal';

export const AnnouncementsView: React.FC = () => {
  const {
    announcements,
    createAnnouncement,
    classSections,
  } = useSchool();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('GENERAL');
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>('ALL');
  const [targetClassSectionId, setTargetClassSectionId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createAnnouncement(
      title.trim(),
      content.trim(),
      category,
      targetAudience,
      targetAudience === 'CLASS_SECTION' ? targetClassSectionId : undefined,
      isPinned
    );

    setShowCreateModal(false);
    setTitle('');
    setContent('');
    setCategory('GENERAL');
    setTargetAudience('ALL');
    setTargetClassSectionId('');
    setIsPinned(false);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[10px]">Institutional Communication</span>
            <span className="text-xs text-[var(--text-secondary)]">Broadcast Dispatcher</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            School Announcements & Notices
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Publish targeted broadcasts to teachers, parents, or specific class sections with instant portal delivery.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md self-start sm:self-auto shadow-md shadow-indigo-600/30"
        >
          <Plus size={16} />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.map(ann => {
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
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                    {ann.authorName.charAt(0)}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{ann.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  <Users size={12} />
                  <span>
                    {ann.targetAudience === 'CLASS_SECTION'
                      ? targetClass?.name
                      : `Audience: ${ann.targetAudience}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Announcement Modal */}
      <ModalPortal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="modal-content p-6 space-y-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                Post Institutional Broadcast
              </h3>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="input-label">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. End of First Term Examination Schedule & Guidelines"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-control"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="select-control"
                >
                  <option value="GENERAL">General Notice</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="EVENT">School Event</option>
                  <option value="URGENT">Urgent Alert</option>
                </select>
              </div>
              <div>
                <label className="input-label">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as any)}
                  className="select-control"
                >
                  <option value="ALL">School-Wide (Everyone)</option>
                  <option value="PARENTS">Parents & Guardians Only</option>
                  <option value="TEACHERS">Teachers & Faculty Only</option>
                  <option value="CLASS_SECTION">Specific Class Section Arm</option>
                </select>
              </div>
            </div>

            {targetAudience === 'CLASS_SECTION' && (
              <div>
                <label className="input-label">Target Class Section</label>
                <select
                  value={targetClassSectionId}
                  onChange={e => setTargetClassSectionId(e.target.value)}
                  className="select-control"
                  required
                >
                  <option value="">— Select Class Arm —</option>
                  {classSections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="input-label">Notice Content</label>
              <textarea
                rows={4}
                required
                placeholder="Type the full announcement message here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="textarea-control"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinCheck"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="pinCheck" className="text-xs text-[var(--text-secondary)] cursor-pointer font-medium">
                Pin this announcement to top of dashboard noticeboards
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-md">
                <Send size={14} />
                <span>Publish Broadcast</span>
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>
    </div>
  );
};
