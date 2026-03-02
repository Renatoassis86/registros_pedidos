"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, ChevronRight, Lock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Simple check: for now we assume if they can login here, they are admin 
            // In a real app we'd check a 'role' column in profiles
            router.push('/admin');
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials'
                ? 'Credenciais inválidas para o acesso administrativo.'
                : err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0b1222] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10 space-y-8 animate-fade">
                <header className="text-center space-y-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-[0.3em] mb-4 group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Retornar ao Site
                    </Link>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-500/20 rotate-6 hover:rotate-0 transition-all duration-500">
                            <ShieldCheck className="w-10 h-10 text-slate-950" />
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Portal do <span className="text-amber-500">Administrador</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                            Acesso restrito para equipe <span className="text-white">Cidade Viva Education</span>
                        </p>
                    </div>
                </header>

                <div className="glass-card p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20"></div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">E-mail Corporativo</label>
                            <div className="relative group">
                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:border-amber-500 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="adm@cidadeviva.org"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Chave de Segurança</label>
                            <div className="relative group">
                                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:border-amber-500 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-400/10 border border-red-400/20 rounded-2xl animate-shake">
                                <div className="p-1 bg-red-400/20 rounded-md">
                                    <Lock className="w-3 h-3 text-red-400" />
                                </div>
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 py-4 rounded-2xl text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Autenticar Acesso
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <footer className="text-center">
                    <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">
                        Sistema Integrado de Logística Educativa <br />
                        &copy; 2026 Cidade Viva Education
                    </p>
                </footer>
            </div>
        </div>
    );
}
