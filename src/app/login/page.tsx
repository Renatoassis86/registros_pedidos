"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('Credenciais inválidas. Verifique seu e-mail e senha.');
            setLoading(false);
            return;
        }

        // Buscar o perfil para saber o redirecionamento
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profile?.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/portal');
        }
    }

    return (
        <div className="login-page">
            <div className="login-card card animate-fade">
                <div className="logo">
                    <span className="blue">CIDADE VIVA</span>
                    <span className="orange"> EDUCATION</span>
                </div>

                <h2>Portal de Pedidos</h2>
                <p>Identifique-se para acessar o sistema.</p>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Autenticando...' : 'Entrar no Sistema'}
                    </button>
                </form>

                <div className="footer-links">
                    <a href="#">Esqueceu sua senha?</a>
                </div>
            </div>

            <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #f8fafc 0%, #cbd5e1 100%);
          padding: 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem 2.5rem;
          text-align: center;
        }

        .logo { font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; }
        .logo .blue { color: var(--secondary); }
        .logo .orange { color: var(--primary); }

        h2 { font-size: 1.5rem; color: var(--secondary); margin-bottom: 0.5rem; }
        p { color: var(--text-muted); margin-bottom: 2.5rem; }

        .form-group { text-align: left; margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        
        input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .error-box {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .w-full { width: 100%; padding: 1rem; margin-top: 1rem; }
        .footer-links { margin-top: 2rem; font-size: 0.85rem; }
        .footer-links a { color: var(--primary); font-weight: 600; }
      `}</style>
        </div>
    );
}
