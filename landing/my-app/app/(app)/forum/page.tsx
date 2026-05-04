'use client';

import { useState, useMemo } from 'react';
import { MOCK_POSTS, ALL_CATEGORIES } from './mock-data';
import { PostCategory } from './types';
import PostCard from '../components/PostCard';
import { useRole } from '../context/RoleContext';

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<PostCategory>('全部');
  const [showModal, setShowModal] = useState(false);

  const filteredPosts = useMemo(() => {
    if (activeCategory === '全部') return MOCK_POSTS;
    return MOCK_POSTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)] tracking-wider">Lumina 社区</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm hover:bg-[var(--color-cyan)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
        >
          + 发布帖子
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] ${
              activeCategory === cat
                ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]'
                : 'border-[var(--color-gray)]/30 text-[var(--color-gray)] hover:text-white'
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

      {showModal && <PostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function PostModal({ onClose }: { onClose: () => void }) {
  const { user } = useRole();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PostCategory>('求助问答');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) { setError('标题至少需要 2 个字'); return; }
    if (content.trim().length < 10) { setError('内容至少需要 10 个字'); return; }

    const newPost = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      author: { id: user?.id || 'unknown', name: user?.name || '匿名', role: user?.role || 'blind' },
      category,
      summary: content.trim().slice(0, 100) + '...',
      content: content.trim(),
      comments: [],
      likes: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    const existing = JSON.parse(localStorage.getItem('lumina_posts') || '[]');
    existing.unshift(newPost);
    localStorage.setItem('lumina_posts', JSON.stringify(existing));

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[var(--color-panel)] border border-[var(--color-cyan)]/50 p-6 w-full max-w-lg relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-cyan)]" />

        <h2 className="text-xl font-bold mb-4">发布帖子</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-gray)] mb-1">标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyan)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-gray)] mb-1">分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyan)]">
              {ALL_CATEGORIES.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-gray)] mb-1">内容</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyan)]" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-[var(--color-cyan)] text-black font-bold hover:bg-[var(--color-cyan)]/90">发布</button>
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-[var(--color-gray)]/30 text-white hover:bg-[var(--color-gray)]/50">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}
