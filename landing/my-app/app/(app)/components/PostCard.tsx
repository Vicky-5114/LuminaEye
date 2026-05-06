import { useState } from "react";
import { Post } from "../forum/types";

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const isBlind = post.author.role === "blind";
  const isOnline = post.author.name.charCodeAt(0) % 3 === 0;

  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    const marks = JSON.parse(localStorage.getItem("lumina_bookmarks") || "[]") as string[];
    return marks.includes(post.id);
  });

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const marks = JSON.parse(localStorage.getItem("lumina_bookmarks") || "[]") as string[];
    const next = marks.includes(post.id)
      ? marks.filter((id) => id !== post.id)
      : [...marks, post.id];
    localStorage.setItem("lumina_bookmarks", JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  return (
    <a
      href={`/forum/post?id=${post.id}`}
      className="block bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:hover:border-cyan-500/30 dark:hover:shadow-[0_0_12px_rgba(0,240,255,0.1)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
            isBlind
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
          }`}
        >
          {post.author.name[0]}
        </div>
        <span className="text-sm font-medium text-[var(--color-text)]">{post.author.name}</span>
        {isOnline && <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse"></span>}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isBlind
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
          }`}
        >
          {isBlind ? "Blind User" : "Volunteer"}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)] ml-auto">{post.createdAt}</span>
      </div>

      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 line-clamp-1">{post.title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">{post.summary}</p>

      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {post.comments.length}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {post.likes}
        </span>
        <button
          onClick={toggleBookmark}
          className={`text-sm ${bookmarked ? "text-[var(--color-warning)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-warning)]"}`}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {bookmarked ? "★" : "☆"}
        </button>
        <span className="ml-auto text-xs px-2 py-0.5 border border-[var(--color-border)] rounded-full">{post.category}</span>
      </div>
    </a>
  );
}
