'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MOCK_POSTS } from '../mock-data';
import { useRole } from '../../context/RoleContext';

export default function PostDetailPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const { user } = useRole();
  const [commentText, setCommentText] = useState('');

  const localPosts = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('lumina_posts') || '[]' : '[]');
  const allPosts = [...localPosts, ...MOCK_POSTS];
  const post = allPosts.find((p: any) => p.id === postId);

  if (!post) {
    return <div className="text-center py-20 text-[var(--color-gray)]">帖子不存在</div>;
  }

  const isBlind = post.author.role === 'blind';
  const isLiked = (JSON.parse(localStorage.getItem('lumina_likes') || '[]') as string[]).includes(post.id);

  const handleLike = () => {
    const likes = JSON.parse(localStorage.getItem('lumina_likes') || '[]') as string[];
    if (likes.includes(post.id)) return;
    likes.push(post.id);
    localStorage.setItem('lumina_likes', JSON.stringify(likes));
    window.location.reload();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const comments = JSON.parse(localStorage.getItem('lumina_comments') || '{}') as Record<string, unknown[]>;
    if (!comments[post.id]) comments[post.id] = [];
    comments[post.id].push({
      id: `c-${Date.now()}`,
      author: { id: user.id, name: user.name, role: user.role },
      content: commentText.trim(),
      createdAt: new Date().toLocaleString('zh-CN'),
    });
    localStorage.setItem('lumina_comments', JSON.stringify(comments));
    window.location.reload();
  };

  const localComments = (JSON.parse(localStorage.getItem('lumina_comments') || '{}') as Record<string, unknown[]>)[post.id] || [];
  const allComments = [...localComments, ...post.comments];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <a href="/forum" className="text-sm text-[var(--color-cyan)] hover:underline">← 返回论坛</a>

      <article className={`bg-[var(--color-panel)] border-l-4 p-6 ${isBlind ? 'border-l-[var(--color-lime)]' : 'border-l-[var(--color-cyan)]'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'}`}>
            {post.author.name[0]}
          </div>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-xs text-[var(--color-gray)]">{post.createdAt}</div>
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'}`}>
            {isBlind ? '盲人用户' : '志愿者'}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--color-gray)]/20">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-400' : 'text-[var(--color-gray)] hover:text-red-400'}`}
          >
            ❤️ {post.likes + (isLiked ? 1 : 0)}
          </button>
          <span className="text-sm text-[var(--color-gray)]">💬 {allComments.length}</span>
        </div>
      </article>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">评论 ({allComments.length})</h2>
        {allComments.map((comment: any) => (
          <div key={comment.id} className={`bg-[var(--color-panel)] border-l-2 p-4 ${comment.author.role === 'blind' ? 'border-l-[var(--color-lime)]' : 'border-l-[var(--color-cyan)]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-[var(--color-gray)]">{comment.createdAt}</span>
            </div>
            <p className="text-sm text-white/80">{comment.content}</p>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)]"
          />
          <button type="submit" className="px-6 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm hover:bg-[var(--color-cyan)]/90">
            发表评论
          </button>
        </form>
      )}
    </div>
  );
}
