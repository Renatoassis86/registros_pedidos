"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UserHeader() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (!user) return null;

    return (
        <div className="user-header-actions">
            <div className="user-info">
                <span className="avatar">👤</span>
                <div className="text">
                    <strong>{user.email}</strong>
                    <span>Logado no Sistema</span>
                </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">Sair</button>

            <style jsx>{`
        .user-header-actions { display: flex; align-items: center; gap: 1.5rem; }
        .user-info { display: flex; align-items: center; gap: 0.75rem; border-right: 1px solid var(--border); padding-right: 1.5rem; }
        .avatar { background: #e2e8f0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1.25rem; }
        .text { display: flex; flex-direction: column; line-height: 1.2; }
        .text strong { font-size: 0.9rem; color: var(--secondary); }
        .text span { font-size: 0.7rem; color: var(--text-muted); }
        .logout-btn { background: none; border: 1px solid var(--border); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .logout-btn:hover { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
      `}</style>
        </div>
    );
}
