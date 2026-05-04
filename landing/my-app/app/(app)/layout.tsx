import { RoleProvider } from './context/RoleContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-[var(--color-void)] text-white">
        {children}
      </div>
    </RoleProvider>
  );
}
