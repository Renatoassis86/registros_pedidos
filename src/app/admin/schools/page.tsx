"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Plus, Mail, Phone, MapPin, ShieldCheck, Search, Key, Trash2, Edit2, X, ChevronRight } from 'lucide-react';

interface School {
    id: string;
    name: string;
    cnpj: string;
    contact_email: string;
    phone: string;
    state: string;
    address: string;
    consignment_percentage: number;
    global_order_qty: number;
    portal_email: string;
    portal_password: string;
    created_at: string;
}

export default function AdminSchools() {
    const [schools, setSchools] = useState<School[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Estado para novo/editando escola
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [schoolForm, setSchoolForm] = useState({
        name: '',
        cnpj: '',
        contact_email: '',
        phone: '',
        state: '',
        address: '',
        consignment_percentage: 0,
        global_order_qty: 0,
        portal_email: '',
        portal_password: ''
    });

    useEffect(() => {
        if (!editingSchool) {
            setSchoolForm(prev => ({
                ...prev,
                portal_email: prev.contact_email,
                portal_password: prev.cnpj
            }));
        }
    }, [schoolForm.contact_email, schoolForm.cnpj, editingSchool]);

    useEffect(() => {
        fetchSchools();
    }, []);

    async function fetchSchools() {
        const { data } = await supabase.from('schools').select('*').order('name');
        if (data) setSchools(data);
    }

    async function handleSaveSchool(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            name: schoolForm.name,
            cnpj: schoolForm.cnpj,
            contact_email: schoolForm.contact_email,
            phone: schoolForm.phone,
            state: schoolForm.state,
            address: schoolForm.address,
            consignment_percentage: schoolForm.consignment_percentage,
            global_order_qty: schoolForm.global_order_qty,
            portal_email: schoolForm.portal_email,
            portal_password: schoolForm.portal_password
        };

        try {
            let error;
            if (editingSchool) {
                const res = await supabase.from('schools').update(payload).eq('id', editingSchool.id);
                error = res.error;
            } else {
                const res = await supabase.from('schools').insert(payload);
                error = res.error;
            }

            if (!error) {
                setIsModalOpen(false);
                setEditingSchool(null);
                setSchoolForm({
                    name: '', cnpj: '', contact_email: '', phone: '', state: '', address: '',
                    consignment_percentage: 0, global_order_qty: 0, portal_email: '', portal_password: ''
                });
                fetchSchools();
                alert(editingSchool ? 'Unidade atualizada!' : 'Unidade cadastrada com sucesso!');
            } else {
                throw error;
            }
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    }

    function openEdit(school: School) {
        setEditingSchool(school);
        setSchoolForm({
            name: school.name,
            cnpj: school.cnpj,
            contact_email: school.contact_email,
            phone: school.phone,
            state: school.state,
            address: school.address,
            consignment_percentage: Number(school.consignment_percentage),
            global_order_qty: Number(school.global_order_qty),
            portal_email: school.portal_email || '',
            portal_password: school.portal_password || ''
        });
        setIsModalOpen(true);
    }

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cnpj.includes(searchTerm)
    );

    return (
        <div className="animate-fade px-6 max-w-7xl mx-auto pb-20">
            <header className="page-header flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Gestão de <span className="text-amber-500">Unidades</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-3 font-medium">Controle de unidades escolares parceiras, margens de consignação e acessos ao portal.</p>
                </div>
                <button className="btn-primary shadow-2xl h-14 px-10 rounded-2xl flex items-center gap-3 transition-transform hover:scale-[1.03]" onClick={() => { setEditingSchool(null); setIsModalOpen(true); }}>
                    <Plus className="w-5 h-5" />
                    <span className="font-bold italic uppercase tracking-tighter">Cadastrar Escola</span>
                </button>
            </header>

            <div className="bg-white/5 p-2 rounded-2xl border border-white/5 mb-8 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome da escola ou CNPJ..."
                        className="w-full bg-transparent border-none py-4 px-12 text-white outline-none font-bold placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSchools.map(school => (
                    <div key={school.id} className="card group border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 hover:border-amber-500/30 transition-all cursor-default relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-14 h-14 bg-amber-500/10 flex items-center justify-center rounded-2xl border border-amber-500/20">
                                    <Building2 className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight">{school.name}</h3>
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{school.cnpj}</span>
                                </div>
                            </div>
                            <button onClick={() => openEdit(school)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-amber-500 transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Consignação</label>
                                <div className="text-xl font-black text-white italic tracking-tighter">{school.consignment_percentage}%</div>
                            </div>
                            <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Pedido Global</label>
                                <div className="text-xl font-black text-white italic tracking-tighter">{school.global_order_qty} un</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                <Mail className="w-4 h-4 text-gray-600" /> {school.contact_email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                <MapPin className="w-4 h-4 text-gray-600" /> {school.state}, {school.address}
                            </div>
                            <div className="flex items-center pt-4 border-t border-white/5 mt-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">Acesso ao Portal: {school.portal_email || 'PENDENTE'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card max-w-2xl border-l-4 border-amber-500 animate-slide-up overflow-y-auto max-h-[95vh] custom-scrollbar">
                        <header className="flex justify-between items-center mb-10 pb-4 border-b border-white/5 sticky top-[-3rem] bg-[#020617] pt-2 z-10">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{editingSchool ? 'Editar' : 'Cadastrar'} <span className="text-amber-500">Unidade</span></h3>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mt-1">Gestão de dados cadastrais e acessos</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="text-gray-500 hover:text-white" /></button>
                        </header>

                        <form onSubmit={handleSaveSchool} className="space-y-8">
                            <div className="space-y-6">
                                <div className="section-title text-[11px] font-black text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Dados da Instituição <div className="flex-1 h-[1px] bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1">
                                        <label className="label-admin">Nome da Escola / Unidade</label>
                                        <input required className="input-admin" placeholder="Ex: Colégio Cidade Viva" value={schoolForm.name} onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="label-admin">CNPJ</label>
                                        <input required className="input-admin" placeholder="00.000.000/0001-00" value={schoolForm.cnpj} onChange={e => setSchoolForm({ ...schoolForm, cnpj: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="label-admin">Telefone de Contato</label>
                                        <input className="input-admin" placeholder="(83) 99999-9999" value={schoolForm.phone} onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="label-admin">ESTADO / CIDADE / ENDEREÇO</label>
                                        <input className="input-admin" placeholder="EX: PB, João Pessoa - Bessa" value={schoolForm.address} onChange={e => setSchoolForm({ ...schoolForm, address: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="section-title text-[11px] font-black text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Configurações do Portal <div className="flex-1 h-[1px] bg-white/5"></div>
                                </div>
                                <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="label-admin text-amber-500">E-mail de Login do Portal</label>
                                            <input required type="email" className="input-admin border-amber-500/20" placeholder="escola@portal.com" value={schoolForm.portal_email} onChange={e => setSchoolForm({ ...schoolForm, portal_email: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="label-admin text-amber-500">Senha de Acesso</label>
                                            <input required className="input-admin border-amber-500/20" placeholder="Defina uma senha..." value={schoolForm.portal_password} onChange={e => setSchoolForm({ ...schoolForm, portal_password: e.target.value })} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest text-center italic">† Estas credenciais são exclusivas para o acesso da escola ao portal de pedidos.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="section-title text-[11px] font-black text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Acordo Comercial <div className="flex-1 h-[1px] bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="label-admin">Margem Consignação (%)</label>
                                        <input required type="number" step="0.1" className="input-admin" value={schoolForm.consignment_percentage} onChange={e => setSchoolForm({ ...schoolForm, consignment_percentage: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="label-admin">Pedido Global (Unidades)</label>
                                        <input required type="number" className="input-admin" value={schoolForm.global_order_qty} onChange={e => setSchoolForm({ ...schoolForm, global_order_qty: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10 pb-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">Descartar</button>
                                <button type="submit" disabled={isSaving} className="flex-[3] btn-primary h-14 italic font-black text-lg uppercase leading-none rounded-2xl transition-all hover:scale-[1.01]">
                                    {isSaving ? 'Gravando Unidade...' : (editingSchool ? 'SALVAR ATUALIZAÇÕES' : 'CONFIRMAR CADASTRO')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .label-admin { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 0.5rem; }
                .input-admin { width: 100%; background: #0b1222; border: 1px solid #1e293b; border-radius: 12px; padding: 1.1rem 1.4rem; color: white; transition: all 0.2s; font-weight: 600; font-size: 0.95rem; }
                .input-admin:focus { border-color: #f59e0b; outline: none; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
                .modal-content { width: 100%; background: #020617; border: 1px solid #1e293b; border-radius: 2.5rem; padding: 3rem; box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8); }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            `}</style>
        </div>
    );
}
