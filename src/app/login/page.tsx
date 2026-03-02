"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import HeroVideo from '@/components/HeroVideo';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const schoolId = localStorage.getItem('school_portal_id');
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                if (profile?.role === 'admin') router.push('/admin');
                else router.push('/portal');
            } else if (schoolId) {
                router.push('/portal');
            }
        };
        checkSession();
    }, [router]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Standard Auth
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

            if (!authError && data.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
                if (profile?.role === 'admin') router.push('/admin');
                else router.push('/portal');
                return;
            }

            // Fallback Schools Table
            const { data: school } = await supabase.from('schools').select('id, name').eq('portal_email', email).eq('portal_password', password).single();
            if (school) {
                localStorage.setItem('school_portal_id', school.id);
                localStorage.setItem('school_portal_name', school.name);
                router.push('/portal');
            } else {
                setError('Credenciais inválidas.');
            }
        } catch (err) {
            setError('Falha de sistema.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-6rem)] -mt-12 flex items-center justify-center bg-[#0b1222] overflow-hidden">
            <HeroVideo />

            <div className="relative z-10 w-full max-w-[480px] px-6 animate-slide-up">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-700/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative glass-card p-10 md:p-12 border border-white/10 bg-[#020617]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="mb-10 text-center">
                            <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl mb-6">
                                <ShieldCheck className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Acesso ao <span className="text-amber-500">Portal</span></h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Identifique sua unidade</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center italic animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] ml-2">E-mail</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-amber-500 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="seu@dominio.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:border-amber-500 outline-none transition-all focus:bg-white/10"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] ml-2">Senha</label>
                                <div className="relative group/input">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-amber-500 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:border-amber-500 outline-none transition-all focus:bg-white/10"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full h-16 rounded-2xl shadow-xl shadow-amber-500/10 group active:scale-95 transition-all disabled:opacity-50">
                                <span className="font-black italic tracking-tighter text-xl uppercase leading-none">
                                    {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
                                </span>
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <button onClick={() => router.push('/')} className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                                Voltar para a Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    );
}
