import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[var(--color-text-secondary)]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
