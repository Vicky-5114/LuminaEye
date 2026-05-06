'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_POSTS, ALL_CATEGORIES } from './mock-data';
import { PostCategory } from './types';
import PostCard from '../components/PostCard';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<PostCategory>('All');
  const [showModal, setShowModal] = useState(false);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const { role } = useRole();
  const { success } = useToast();

  const isBlind = role === 'blind';

  const bookmarkedIds = useMemo(() => {
    if (typeof window === 'undefined') return [] as string[];
    return JSON.parse(localStorage.getItem('lumina_bookmarks') || '[]') as string[];
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = MOCK_POSTS;
    if (showBookmarked) {
      posts = posts.filter((p) => bookmarkedIds.includes(p.id));
    } else if (activeCategory !== 'All') {
      posts = posts.filter((p) => p.category === activeCategory);
    }
    return posts;
  }, [activeCategory, showBookmarked, bookmarkedIds]);

  useEffect(() => {
    if (!isBlind) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setNeedsInteraction(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Delayed restart to avoid rapid start/stop flicker
      if (!showModal && recognitionRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try { recognitionRef.current?.start(); } catch {}
        }, 400);
      }
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (transcript.includes('post') && !showModal) {
          setShowModal(true);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        setNeedsInteraction(true);
      }
      // no-speech and aborted are normal; let onend handle restart
    };

    const tryStart = () => {
      if (!recognitionRef.current || showModal) return;
      try { recognitionRef.current.start(); } catch { setNeedsInteraction(true); }
    };

    if (!showModal) tryStart();

    const startOnInteraction = () => {
      if (!isListening && !showModal && recognitionRef.current) tryStart();
    };

    document.addEventListener('click', startOnInteraction, { once: true });
    document.addEventListener('keydown', startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      recognitionRef.current = null;
      try { recognition.stop(); } catch {}
    };
  }, [showModal, isBlind]);

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

      {isBlind && speechSupported && (
        <div className={`bg-[var(--color-card)] rounded-xl border p-3 transition-colors ${isListening ? 'border-[var(--color-success)] shadow-[0_0_12px_rgba(0,255,136,0.15)]' : 'border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-xl ${isListening ? 'animate-pulse' : ''}`}>🎙</span>
            <div>
              <div className="text-[var(--color-text)] font-medium text-sm">
                {isListening ? 'Listening...' : needsInteraction ? 'Click anywhere to enable voice commands' : 'Voice command ready'}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isListening ? 'Say "post" to create a new post automatically' : needsInteraction ? 'Microphone access requires a user gesture' : 'Initializing voice recognition...'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setShowBookmarked(false); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
              activeCategory === cat && !showBookmarked
                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowBookmarked(!showBookmarked)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            showBookmarked
              ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
          }`}
        >
          ★ Bookmarked
        </button>
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{showBookmarked ? '★' : '📝'}</div>
          <p className="text-[var(--color-text-secondary)] mb-4">
            {showBookmarked ? 'No bookmarked posts yet.' : 'No posts yet. Be the first to share!'}
          </p>
          {!showBookmarked && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              New Post
            </button>
          )}
        </div>
      )}

      {showModal && <PostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

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
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[var(--color-text-secondary)]">Title</label>
              <VoiceInputButton label="title" onTranscript={(text) => setTitle(text)} />
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors">
              {ALL_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[var(--color-text-secondary)]">Content</label>
              <VoiceInputButton label="content" onTranscript={(text) => setContent(text)} />
            </div>
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
