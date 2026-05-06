import { Suspense } from 'react';
import PostContent from './PostContent';

export default function PostDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[var(--color-text-secondary)]">Loading...</div>}>
      <PostContent />
    </Suspense>
  );
}
