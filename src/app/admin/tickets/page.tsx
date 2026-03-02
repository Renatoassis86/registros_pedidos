"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
    AlertTriangle,
    ChevronRight,
    Calendar,
    Hash,
    Search,
    MessageSquare,
    Clock,
    CheckCircle2,
    ShieldAlert,
    School,
    ArrowUpRight,
    Trello
} from 'lucide-react';

interface Ticket {
    id: string;
    protocol: string;
    subject: string;
    status: string;
    created_at: string;
    schools: { name: string };
}

export default function AdminTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    async function fetchTickets() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tickets')
                .select('*, schools(name)')
                .order('created_at', { ascending: false });

            if (data) setTickets(data as any);
            if (error) console.error('Erro ao buscar tickets:', error);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    }

    const getStatusInfo = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'ABERTO': return { label: 'Aberto', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: ShieldAlert };
            case 'EM_ANDAMENTO': return { label: 'Em Análise', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock };
            case 'RESPONDIDO': return { label: 'Aguardando Unidade', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: ShieldAlert };
            case 'CONCLUIDO': return { label: 'Concluído', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 };
            default: return { label: status, color: 'text-gray-400 bg-white/5 border-white/10', icon: AlertTriangle };
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.schools?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade">
            {/* Header / Barra de Ações */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestão Operacional</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                        Gestão de <span className="text-amber-500">Ocorrências</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl">
                        Acompanhe e responda aos chamados de suporte técnico e logístico das escolas parceiras.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar escola ou protocolo..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:border-amber-500 outline-none w-full md:w-80 transition-all placeholder:text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        href="/admin/tickets/kanban"
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:border-amber-500 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all shadow-xl active:scale-95"
                    >
                        <Trello className="w-4 h-4 text-amber-500" />
                        Jornada Kanban
                    </Link>
                </div>
            </header>

            {/* Listagem de Ocorrências Administrativas */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center space-y-4 glass-card border-white/5">
                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest leading-none">Carregando Fluxo de Suporte...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-20 text-center border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-6">
                            <MessageSquare className="w-12 h-12 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Sem chamados pendentes</h3>
                        <p className="text-gray-500 text-sm max-w-sm mt-2">Nao encontramos registros de ocorrências para os filtros aplicados.</p>
                    </div>
                ) : (
                    filteredTickets.map(ticket => {
                        const status = getStatusInfo(ticket.status);
                        return (
                            <Link
                                key={ticket.id}
                                href={`/admin/tickets/${ticket.id}`}
                                className="glass-card hover:bg-white/5 transition-all group overflow-hidden border border-white/5 p-1 relative block"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-white/2 rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 transition-all shrink-0">
                                            <School className="w-8 h-8 text-gray-700 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h4 className="text-white font-black italic uppercase tracking-tighter text-2xl leading-none">
                                                    {ticket.subject}
                                                </h4>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                    <status.icon className="w-3 h-3" />
                                                    {status.label}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded">
                                                    {ticket.schools?.name}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <div className="flex items-center gap-2 text-white/80"><Hash className="w-3.5 h-3.5 text-amber-500/80" /> {ticket.protocol || "S/P"}</div>
                                                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-700" /> Aberto em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</div>
                                                <div className="flex items-center gap-2"><ArrowUpRight className="w-3.5 h-3.5 text-gray-700" /> Atendimento via Admin</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end gap-10 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto">
                                        <div className="lg:text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-right">Ação Administrativa</p>
                                            <p className="text-xs font-bold text-gray-400 flex items-center gap-2 justify-end">
                                                <MessageSquare className="w-3 h-3" />
                                                Dar Atendimento
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-amber-500 rounded-2xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-amber-500/10">
                                            Responder
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
