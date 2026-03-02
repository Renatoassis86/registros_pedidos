"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, ArrowRight, Mail, Key, User, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import HeroVideo from '@/components/HeroVideo';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingSession = async () => {
      const schoolId = localStorage.getItem('school_portal_id');
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'admin') router.push('/admin');
        else router.push('/portal');
      } else if (schoolId) {
        router.push('/portal');
      }
    };
    checkExistingSession();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Tentar Login via Auth padrão
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/portal');
        }
        return;
      }

      // 2. Fallback: Verificar diretamente na tabela de escolas
      const { data: school } = await supabase
        .from('schools')
        .select('id, name')
        .eq('portal_email', email)
        .eq('portal_password', password)
        .single();

      if (school) {
        // Simular sessão para o portal
        localStorage.setItem('school_portal_id', school.id);
        localStorage.setItem('school_portal_name', school.name);
        router.push('/portal');
      } else {
        setError('Credenciais inválidas. Verifique seu e-mail e senha (CNPJ).');
      }
    } catch (err: any) {
      setError('Falha na conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center -mt-8 overflow-hidden">
      {/* Background Video from Recrutamento */}
      <HeroVideo />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Content */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            Cidade Viva Education • Logística
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
            Pedidos e <br />
            <span className="text-amber-500 italic">Registros</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed font-light">
            Plataforma oficial para gestão de materiais e suporte técnico das escolas parceiras Cidade Viva.
          </p>

          <div className="hidden lg:grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
            {[
              { label: "AGILIDADE", desc: "REPOSIÇÃO EXPRESSA" },
              { label: "CONTROLE", desc: "Estoque Real" },
              { label: "SUPORTE", desc: "Canal Direto" }
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <p className="text-amber-500 font-black text-[9px] tracking-widest uppercase italic">{item.label}</p>
                <p className="text-gray-500 text-xs font-bold leading-tight uppercase tracking-tighter">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="relative group animate-slide-up">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-700/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-card p-10 md:p-12 border border-white/10 bg-[#020617]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="mb-10">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Acesso ao <span className="text-amber-500">Portal</span></h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Identifique sua unidade escolar</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center italic animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] ml-2">E-mail Cadastrado</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-amber-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="escola@dominio.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:border-amber-500 outline-none transition-all focus:bg-white/10"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] ml-2">Senha de Acesso</label>
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-16 rounded-2xl shadow-xl shadow-amber-500/10 group active:scale-95 transition-all disabled:opacity-50"
              >
                <span className="font-black italic tracking-tighter text-xl uppercase leading-none">
                  {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PORTAL'}
                </span>
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center flex flex-col gap-3">
              <Link href="/admin/login" className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group/admin">
                <ShieldCheck className="w-3 h-3 text-amber-500/40 group-hover/admin:text-amber-500" />
                ÁREA ADMINISTRATIVA
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Global Bottom Features Bar (Mobile/Tablets) */}
      <div className="lg:hidden w-full bg-gradient-to-t from-[#020617] to-transparent py-10 px-6 border-t border-white/5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "AGILIDADE", desc: "Pedidos 24/7" },
            { label: "CONTROLE", desc: "Estoque Real" },
            { label: "SUPORTE", desc: "Canal Direto" }
          ].map((item, i) => (
            <div key={i} className="text-center space-y-1">
              <p className="text-amber-500 font-black text-[8px] tracking-widest uppercase italic">{item.label}</p>
              <p className="text-gray-300 text-[10px] font-bold tracking-tight uppercase">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
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
