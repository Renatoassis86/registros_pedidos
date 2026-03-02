"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, UserPlus, Mail, Key, Trash2, Edit2, X, Search, Shield, Building2, Eye, EyeOff } from 'lucide-react';

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    email?: string;
    school_id?: string;
    schools?: { name: string };
    password?: string; // Para exibir as credenciais do portal
    is_portal_user?: boolean;
}

export default function AdminUsers() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'school_user', schoolId: '' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const [profRes, schoolRes] = await Promise.all([
                supabase.from('profiles').select('*, schools(name)'),
                supabase.from('schools').select('*').order('name')
            ]);

            let combinedUsers: UserProfile[] = [];

            // Adicionar perfis normais (Admins e usuários criados via Auth)
            if (profRes.data) {
                combinedUsers = [...(profRes.data as any)];
            }

            // Adicionar Portais de Escolas que possuem credenciais definidas
            if (schoolRes.data) {
                setSchools(schoolRes.data.map(s => ({ id: s.id, name: s.name })));

                const portalUsers: UserProfile[] = schoolRes.data
                    .filter(s => s.portal_email)
                    .map(s => ({
                        id: `school-${s.id}`,
                        full_name: `PORTAL: ${s.name}`,
                        role: 'portal_acesso',
                        email: s.portal_email,
                        school_id: s.id,
                        schools: { name: s.name },
                        password: s.portal_password,
                        is_portal_user: true
                    }));

                combinedUsers = [...combinedUsers, ...portalUsers];
            }

            setProfiles(combinedUsers);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // Se for usuário de escola, opcionalmente poderíamos atualizar a tabela schools diretamente
            // Mas seguindo o padrão original do projeto que usa Auth:
            const { data, error: authError } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.fullName,
                        role: newUser.role,
                        school_id: newUser.role === 'school_user' ? newUser.schoolId : null
                    }
                }
            });

            if (authError) throw authError;

            alert('Usuário cadastrado com sucesso!');
            setIsModalOpen(false);
            fetchInitialData();
            setNewUser({ fullName: '', email: '', password: '', role: 'school_user', schoolId: '' });
        } catch (err: any) {
            alert('Falha ao criar usuário: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    const togglePassword = (id: string) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredProfiles = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade px-6 max-w-7xl mx-auto pb-20">
            <header className="page-header items-center flex justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Controle de <span className="text-amber-500">Acessos</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Gerencie permissões de administradores e usuários de escolas parceiras.</p>
                </div>
                <button className="btn-primary shadow-xl shadow-amber-500/10 h-14 px-8 rounded-2xl flex items-center gap-3" onClick={() => setIsModalOpen(true)}>
                    <UserPlus className="w-5 h-5" />
                    <span className="font-bold italic uppercase tracking-tighter">Novo Usuário</span>
                </button>
            </header>

            <div className="flex gap-4 mb-8 bg-white/5 p-2 rounded-2xl border border-white/5">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, e-mail ou escola..."
                        className="w-full bg-transparent border-none py-4 px-12 text-white outline-none font-bold"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl">
                <table className="admin-table w-full border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Identificação / Credenciais</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Função</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Senha do Portal</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={4} className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest animate-pulse">Consultando base de dados...</td></tr>
                        )}
                        {!loading && filteredProfiles.map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-6 border-b border-white/5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white uppercase italic tracking-tighter text-lg leading-none">{p.full_name || 'NOME INDISPONÍVEL'}</span>
                                        <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-mono tracking-tight underline underline-offset-4 decoration-amber-500/30">
                                            <Mail className="w-3 h-3 text-amber-500" /> {p.email}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 border-b border-white/5">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${p.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-400/20'}`}>
                                        {p.role === 'admin' ? <Shield className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{p.role === 'portal_acesso' ? 'PORTAL ESCOLA' : p.role?.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 border-b border-white/5">
                                    {p.password ? (
                                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-fit">
                                            <Key className="w-3 h-3 text-amber-500" />
                                            <code className="text-white font-mono text-sm tracking-widest font-bold">
                                                {showPasswords[p.id] ? p.password : '••••••••'}
                                            </code>
                                            <button onClick={() => togglePassword(p.id)} className="text-gray-600 hover:text-white transition-colors">
                                                {showPasswords[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest italic">Criptografado</span>
                                    )}
                                </td>
                                <td className="px-6 py-6 border-b border-white/5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredProfiles.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-20 text-gray-600 text-xs font-black uppercase tracking-[0.2em]">Nenhum usuário localizado na base atual.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card max-w-lg border-l-4 border-amber-500 animate-slide-up">
                        <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Cadastrar <span className="text-amber-500">Acesso</span></h3>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mt-1">Defina o perfil de acesso ao portal</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="text-gray-500 hover:text-white" /></button>
                        </header>

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="space-y-1">
                                <label className="label-admin text-amber-500/60 ml-1">Nome Completo do Usuário</label>
                                <input required className="input-admin" placeholder="Ex: João da Silva" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="label-admin text-amber-500/60 ml-1">E-mail Corporativo</label>
                                    <input required type="email" className="input-admin" placeholder="email@dominio.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="label-admin text-amber-500/60 ml-1">Senha (Mín. 6 carecteres)</label>
                                    <input required type="password" minLength={6} className="input-admin" placeholder="********" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="label-admin text-amber-500/60 ml-1">Nível de Permissão</label>
                                <select className="input-admin" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value, schoolId: e.target.value === 'admin' ? '' : newUser.schoolId })}>
                                    <option value="school_user">USUÁRIO DE ESCOLA (PORTAL)</option>
                                    <option value="admin">ADMINISTRADOR (PAINEL GERAL)</option>
                                </select>
                            </div>

                            {newUser.role === 'school_user' && (
                                <div className="animate-fade-in-down space-y-1">
                                    <label className="label-admin text-amber-500/60 ml-1">Instituição Vinculada</label>
                                    <select required className="input-admin border-amber-500/20" value={newUser.schoolId} onChange={e => setNewUser({ ...newUser, schoolId: e.target.value })}>
                                        <option value="">Selecione uma escola...</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4 pt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">Cancelar</button>
                                <button type="submit" disabled={loading} className="flex-[2] btn-primary italic font-black text-sm uppercase leading-none h-14 rounded-2xl transition-all hover:scale-[1.02]">
                                    {loading ? 'Processando Autenticação...' : 'CONFIRMAR CADASTRO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-header { margin-bottom: 3.5rem; }
                .label-admin { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
                .input-admin { width: 100%; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 1.1rem 1.4rem; color: white; transition: all 0.2s; font-weight: 600; font-size: 0.95rem; }
                .input-admin:focus { border-color: #f59e0b; outline: none; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
                .modal-content { width: 100%; background: #020617; border: 1px solid #1e293b; border-radius: 2.5rem; padding: 3rem; box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8); }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
}
