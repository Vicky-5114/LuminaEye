import { Post } from '../forum/types';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const isBlind = post.author.role === 'blind';
  const borderColor = isBlind ? 'border-l-[var(--color-lime)]' : 'border-l-[var(--color-cyan)]';

  return (
    <a
      href={`/forum/post?id=${post.id}`}
      className={`block bg-[var(--color-panel)] border-l-4 ${borderColor} p-5 hover:bg-[var(--color-panel)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'
          }`}
        >
          {post.author.name[0]}
        </div>
        <span className="text-sm text-white">{post.author.name}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'
          }`}
        >
          {isBlind ? '盲人用户' : '志愿者'}
        </span>
        <span className="text-xs text-[var(--color-gray)] ml-auto">{post.createdAt}</span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{post.title}</h3>
      <p className="text-sm text-[var(--color-gray)] line-clamp-2 mb-3">{post.summary}</p>

      <div className="flex items-center gap-4 text-sm text-[var(--color-gray)]">
        <span>💬 {post.comments.length}</span>
        <span>❤️ {post.likes}</span>
        <span className="ml-auto text-xs px-2 py-0.5 border border-[var(--color-gray)]/30 rounded">{post.category}</span>
      </div>
    </a>
  );
}
