"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, ShieldAlert } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // Redundância: se já estiver na página de login, não precisa da guarda
        if (pathname?.includes('/admin/login')) {
            setLoading(false);
            setAuthorized(true);
            return;
        }

        async function checkAdmin() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.replace('/admin/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role === 'admin') {
                setAuthorized(true);
            } else {
                router.replace('/admin/login?error=unauthorized');
            }
            setLoading(false);
        }

        checkAdmin();
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 bg-[#020617] text-gray-500">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none italic animate-pulse">Sincronizando Gestão CV-ED...</p>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
