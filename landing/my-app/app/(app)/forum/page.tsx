'use client';

import { useState, useMemo } from 'react';
import { MOCK_POSTS, ALL_CATEGORIES } from './mock-data';
import { PostCategory } from './types';
import PostCard from '../components/PostCard';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<PostCategory>('All');
  const [showModal, setShowModal] = useState(false);
  const { success } = useToast();

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return MOCK_POSTS;
    return MOCK_POSTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Lumina Community</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-1 dark:hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]"
        >
          + New Post
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
              activeCategory === cat
                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-[var(--color-text-secondary)] mb-4">No posts yet. Be the first to share!</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            New Post
          </button>
        </div>
      )}

      {showModal && <PostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function PostModal({ onClose }: { onClose: () => void }) {
  const { user } = useRole();
  const { success } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PostCategory>('Q&A');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) { setError('Title must be at least 2 characters'); return; }
    if (content.trim().length < 10) { setError('Content must be at least 10 characters'); return; }

    const newPost = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      author: { id: user?.id || 'unknown', name: user?.name || 'Anonymous', role: user?.role || 'blind' },
      category,
      summary: content.trim().slice(0, 100) + '...',
      content: content.trim(),
      comments: [],
      likes: 0,
      createdAt: new Date().toLocaleString('en-US'),
    };

    const existing = JSON.parse(localStorage.getItem('lumina_posts') || '[]');
    existing.unshift(newPost);
    localStorage.setItem('lumina_posts', JSON.stringify(existing));

    success('Post published successfully');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-lg p-6 relative transition-colors">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">✕</button>
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors">
              {ALL_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}
