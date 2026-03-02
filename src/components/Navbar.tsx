import React from 'react';
import Link from 'next/link';
import { User, Menu } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="h-24 bg-[#0b1222]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 h-full flex items-center justify-between">
                <Link href="/" className="relative w-40 sm:w-48">
                    <img src="/logo-education.png" alt="Cidade Viva Education" className="w-full h-auto brightness-0 invert" />
                </Link>

                <div className="flex items-center gap-8">
                    <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Link href="/portal" className="hover:text-amber-500 transition-colors">Portal da Escola</Link>
                        <Link href="/admin/login" className="hover:text-amber-500 transition-colors">Portal do Administrador</Link>
                    </nav>

                    <div className="flex items-center gap-4 pl-8 border-l border-white/10">
                        <button className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-full transition-all shadow-lg shadow-amber-500/20">
                            <User className="w-5 h-5" />
                        </button>
                        <button className="md:hidden text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
