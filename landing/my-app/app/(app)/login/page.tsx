'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRole, UserRole } from '../context/RoleContext';

const MOCK_VOLUNTEERS: Record<string, { password: string; name: string }> = {
  'volunteer1@example.com': { password: '123456', name: '志愿者小李' },
  'volunteer2@example.com': { password: '123456', name: '志愿者小张' },
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'blind';
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const { login } = useRole();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-[var(--color-panel)] border border-[var(--color-cyan)]/50 p-8 relative">
        {/* HUD corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-cyan)]" />

        <h1 className="text-2xl font-bold text-center mb-8 tracking-wider">LUMINA</h1>

        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('blind')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-2 ${
              activeTab === 'blind'
                ? 'border-[var(--color-lime)] text-[var(--color-lime)]'
                : 'border-transparent text-[var(--color-gray)] hover:text-white'
            }`}
          >
            👁 盲人用户
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-2 ${
              activeTab === 'volunteer'
                ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]'
                : 'border-transparent text-[var(--color-gray)] hover:text-white'
            }`}
          >
            🙋 志愿者
          </button>
        </div>

        {activeTab === 'blind' ? <BlindForm login={login} /> : <VolunteerForm login={login} />}
      </div>
    </div>
  );
}

function BlindForm({ login }: { login: (user: { id: string; name: string; role: 'blind'; glassesId: string }) => void }) {
  const [glassesId, setGlassesId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!glassesId.trim()) {
      setError('请输入眼镜编号');
      return;
    }
    if (!/^GL-\d{4}-\d{3}$/.test(glassesId)) {
      setError('眼镜编号格式不正确（例：GL-2025-001）');
      return;
    }
    if (!name.trim()) {
      setError('请输入您的称呼');
      return;
    }

    login({
      id: glassesId,
      name: name.trim(),
      role: 'blind',
      glassesId: glassesId.trim(),
    });

    window.location.href = '/forum';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">眼镜编号</label>
        <input
          type="text"
          value={glassesId}
          onChange={(e) => setGlassesId(e.target.value)}
          placeholder="例：GL-2025-001"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-lime)] focus:ring-1 focus:ring-[var(--color-lime)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">您的称呼</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="您的称呼"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-lime)] focus:ring-1 focus:ring-[var(--color-lime)]"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-[var(--color-lime)] text-black font-bold hover:bg-[var(--color-lime)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-lime)]"
      >
        进入系统
      </button>
    </form>
  );
}

function VolunteerForm({ login }: { login: (user: { id: string; name: string; role: 'volunteer'; email: string }) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }

    if (isLogin) {
      const found = MOCK_VOLUNTEERS[email];
      if (!found) {
        setError('该邮箱未注册');
        return;
      }
      if (found.password !== password) {
        setError('密码错误，请重试');
        return;
      }
      login({ id: email, name: found.name, role: 'volunteer', email });
    } else {
      if (!name.trim()) {
        setError('请输入您的称呼');
        return;
      }
      if (MOCK_VOLUNTEERS[email]) {
        setError('该邮箱已注册，请直接登录');
        return;
      }
      MOCK_VOLUNTEERS[email] = { password, name: name.trim() };
      login({ id: email, name: name.trim(), role: 'volunteer', email });
    }

    window.location.href = '/forum';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="至少 6 位"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]"
        />
      </div>
      {!isLogin && (
        <div>
          <label className="block text-sm text-[var(--color-gray)] mb-1">您的称呼</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="您的称呼"
            className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]"
          />
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-[var(--color-cyan)] text-black font-bold hover:bg-[var(--color-cyan)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
      >
        {isLogin ? '登录' : '注册'}
      </button>
      <p className="text-center text-sm text-[var(--color-gray)]">
        {isLogin ? '没有账号？' : '已有账号？'}
        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="text-[var(--color-cyan)] hover:underline ml-1"
        >
          {isLogin ? '立即注册' : '立即登录'}
        </button>
      </p>
    </form>
  );
}
