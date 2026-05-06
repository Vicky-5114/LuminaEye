'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MOCK_POSTS } from '../mock-data';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';

function VoiceInputButton({ onTranscript, label }: { onTranscript: (text: string) => void; label: string }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    try { recognition.start(); } catch {}
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
        listening
          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30 animate-pulse'
          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
      }`}
      aria-label={`Voice input for ${label}`}
    >
      {listening ? '🎙 Listening...' : '🎙 Voice'}
    </button>
  );
}

export default function PostContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const { user } = useRole();
  const { success } = useToast();
  const [commentText, setCommentText] = useState('');

  const localPosts = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('lumina_posts') || '[]' : '[]');
  const allPosts = [...localPosts, ...MOCK_POSTS];
  const post = allPosts.find((p: any) => p.id === postId);

  if (!post) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">Post not found</div>;
  }

  const isBlind = post.author.role === 'blind';

  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (JSON.parse(localStorage.getItem('lumina_likes') || '[]') as string[]).includes(post.id);
  });

  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === 'undefined') return false;
    const marks = JSON.parse(localStorage.getItem('lumina_bookmarks') || '[]') as string[];
    return marks.includes(post.id);
  });

  const toggleBookmark = () => {
    const marks = JSON.parse(localStorage.getItem('lumina_bookmarks') || '[]') as string[];
    const next = marks.includes(post.id)
      ? marks.filter((id) => id !== post.id)
      : [...marks, post.id];
    localStorage.setItem('lumina_bookmarks', JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  const handleLike = () => {
    const likes = JSON.parse(localStorage.getItem('lumina_likes') || '[]') as string[];
    if (likes.includes(post.id)) return;
    likes.push(post.id);
    localStorage.setItem('lumina_likes', JSON.stringify(likes));
    setIsLiked(true);
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
      createdAt: new Date().toLocaleString('en-US'),
    });
    localStorage.setItem('lumina_comments', JSON.stringify(comments));
    success('Comment added');
    window.location.reload();
  };

  const localComments = typeof window !== 'undefined'
    ? (JSON.parse(localStorage.getItem('lumina_comments') || '{}') as Record<string, unknown[]>)[post.id] || []
    : [];
  const allComments = [...localComments, ...post.comments];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <a href="/forum" className="text-sm text-[var(--color-accent)] hover:underline">← Back to Forum</a>

      <article className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl border-l-4 p-6 transition-colors dark:hover:border-cyan-500/20 ${isBlind ? 'border-l-[var(--color-success)]' : 'border-l-[var(--color-accent)]'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isBlind ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'}`}>
            {post.author.name[0]}
          </div>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">{post.createdAt}</div>
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${isBlind ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'}`}>
            {isBlind ? 'Blind User' : 'Volunteer'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">{post.title}</h1>
        <p className="text-[var(--color-text)]/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-400' : 'text-[var(--color-text-secondary)] hover:text-red-400'}`}
          >
            ❤️ {post.likes + (isLiked ? 1 : 0)}
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">💬 {allComments.length}</span>
          <button
            onClick={toggleBookmark}
            className={`text-sm ${bookmarked ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-warning)]'}`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        </div>
      </article>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Comments ({allComments.length})</h2>
        {allComments.map((comment: any) => (
          <div key={comment.id} className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg border-l-2 p-4 ${comment.author.role === 'blind' ? 'border-l-[var(--color-success)]' : 'border-l-[var(--color-accent)]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-[var(--color-text)]">{comment.author.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{comment.createdAt}</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{comment.content}</p>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleComment} className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[var(--color-text-secondary)]">Write your comment...</span>
            <VoiceInputButton label="comment" onTranscript={(text) => setCommentText(text)} />
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
            className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors"
          />
          <button type="submit" className="px-6 py-2 bg-[var(--color-accent)] text-white font-bold text-sm rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">
            Post Comment
          </button>
        </form>
      )}
    </div>
  );
}
