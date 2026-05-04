import { RoleProvider } from './context/RoleContext';
import Navbar from './components/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-[var(--color-void)] text-white pt-16">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
    </RoleProvider>
  );
}
