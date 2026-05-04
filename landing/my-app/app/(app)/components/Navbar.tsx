'use client';

import Link from 'next/link';
import { useRole } from '../context/RoleContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { role, user, logout } = useRole();
  const pathname = usePathname();

  const navItems = [
    { href: '/forum', blind: '社区论坛', volunteer: '社区论坛' },
    { href: '/video', blind: '🆘 视频求助', volunteer: '视频协助' },
    { href: '/map', blind: '附近帮助', volunteer: '援助地图' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="主导航"
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-void)]/90 backdrop-blur border-b border-[var(--color-cyan)]/30"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--color-cyan)] tracking-wider">
          LUMINA
        </Link>

        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--color-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)] rounded ${
                  isActive ? 'text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]' : ''
                } ${
                  item.href === '/video' && role === 'blind'
                    ? 'text-red-400 animate-pulse'
                    : 'text-white'
                }`}
              >
                {role === 'blind' ? item.blind : item.volunteer}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-xs text-[var(--color-gray)]">
              {user.name} ({role === 'blind' ? '盲人用户' : '志愿者'})
            </span>
          )}
          <button
            onClick={logout}
            className="text-xs text-[var(--color-gray)] hover:text-[var(--color-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)] px-2 py-1 rounded"
          >
            退出
          </button>
        </div>
      </div>
    </nav>
  );
}
