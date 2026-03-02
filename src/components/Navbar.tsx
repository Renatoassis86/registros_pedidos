"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Menu, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const schoolId = localStorage.getItem('school_portal_id');

            if (session || schoolId) {
                setIsLoggedIn(true);
                // Check if admin
                if (session) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();
                    if (profile?.role === 'admin') setIsAdmin(true);
                }
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsLoggedIn(true);
            } else if (!localStorage.getItem('school_portal_id')) {
                setIsLoggedIn(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('school_portal_id');
        localStorage.removeItem('school_portal_name');
        setIsLoggedIn(false);
        setIsAdmin(false);
        router.push('/');
    };

    // If we are on the home/login page, we definitely don't want the links
    const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/admin/login';

    return (
        <nav className="h-24 bg-[#0b1222]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 h-full flex items-center justify-between">
                <Link href="/" className="relative w-40 sm:w-48">
                    <img src="/logo-education.png" alt="Cidade Viva Education" className="w-full h-auto brightness-0 invert" />
                </Link>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 pl-8 border-l border-white/10">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2.5 rounded-full transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 px-4"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Sair</span>
                            </button>
                        ) : (
                            <Link href="/login" className="bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-500 p-2.5 rounded-full transition-all border border-amber-500/20 flex items-center gap-2 px-4">
                                <User className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Acessar</span>
                            </Link>
                        )}
                        <button className="md:hidden text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
