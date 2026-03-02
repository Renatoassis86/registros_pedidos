"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import {
    MessageSquare,
    ArrowLeft,
    Send,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    School,
    Trello,
    ChevronRight,
    Search,
    Info,
    History
} from 'lucide-react';

interface TicketUpdate {
    id: string;
    message: string;
    created_at: string;
    is_admin_reply: boolean;
    profiles?: { full_name: string };
}

interface Ticket {
    id: string;
    protocol: string;
    subject: string;
    description: string;
    status: string;
    created_at: string;
    school_id: string;
    schools: { name: string; email: string };
}

export default function AdminTicketDetail() {
    const router = useRouter();
    const params = useParams();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [updates, setUpdates] = useState<TicketUpdate[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = [
        { id: 'ABERTO', label: 'Aberto', icon: Clock, color: 'text-blue-400' },
        { id: 'EM_ANDAMENTO', label: 'Triagem', icon: Search, color: 'text-amber-500' },
        { id: 'RESPONDIDO', label: 'Respondido', icon: MessageSquare, color: 'text-purple-400' },
        { id: 'CONCLUIDO', label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-400' }
    ];

    useEffect(() => {
        if (params.id) {
            fetchTicketData();
        }
    }, [params.id]);

    async function fetchTicketData() {
        try {
            const { data: ticketData } = await supabase
                .from('tickets')
                .select('*, schools(name, email)')
                .eq('id', params.id)
                .single();

            if (ticketData) {
                setTicket(ticketData as any);
            }

            const { data: updatesData } = await supabase
                .from('ticket_updates')
                .select('*, profiles(full_name)')
                .eq('ticket_id', params.id)
                .order('created_at', { ascending: false });

            if (updatesData) setUpdates(updatesData as any);
        } catch (err) {
            console.error('Erro ao buscar dados da ocorrência:', err);
        }
    }

    async function handleStepTransition(statusId: string) {
        if (!ticket) return;

        const msg = prompt(`Descreva a ação tomada para mover o atendimento para "${statusId}":`);
        if (msg === null) return;

        try {
            setIsSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Update Ticket Status
            await supabase
                .from('tickets')
                .update({ status: statusId })
                .eq('id', ticket.id);

            // 2. Add Register Entry
            await supabase
                .from('ticket_updates')
                .insert({
                    ticket_id: ticket.id,
                    author_id: user?.id,
                    message: msg || `Status alterado para: ${statusId}`,
                    is_admin_reply: true,
                    // If we had status_at_time in ticket_updates, we'd add it here too
                });

            fetchTicketData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSendReply(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !ticket) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase
                .from('ticket_updates')
                .insert({
                    ticket_id: ticket.id,
                    author_id: user?.id,
                    message: newMessage,
                    is_admin_reply: true
                });

            // Update ticket metadata
            await supabase
                .from('tickets')
                .update({
                    last_admin_reply: newMessage,
                    last_reply_at: new Date().toISOString()
                })
                .eq('id', ticket.id);

            setNewMessage('');
            fetchTicketData();
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!ticket) return <div className="p-20 text-center text-gray-500 font-black uppercase tracking-widest text-[10px]">Lendo Ocorrência Escolar...</div>;

    const currentStepIndex = steps.findIndex(s => s.id === ticket.status);

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade">
            {/* Header / Contexto Admin Ocorrências */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4 text-left">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-amber-500 transition-colors uppercase tracking-[0.3em] mb-4 group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Retornar à Listagem
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-left">
                            <span className="text-[10px] font-black bg-white/5 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest leading-none">
                                Gestão de Ocorrência
                            </span>
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                Protocolo: {ticket.protocol}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 text-left">
                            Suporte <span className="text-amber-500">Técnico</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl text-left">
                            Escola Solicitante: <span className="text-white">{ticket.schools?.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="px-6 py-4 bg-white/2 rounded-2xl border border-white/5 text-right">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Abertura em</p>
                        <p className="text-xl font-black text-white italic tracking-tighter leading-none">
                            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </header>

            {/* Jornada do Atendimento (Ticket Kanban) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Trello className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">Jornada do Atendimento (Ocorrência)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {steps.map((step, i) => {
                        const isPast = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        const isNext = i === currentStepIndex + 1;

                        return (
                            <button
                                key={step.id}
                                disabled={!isNext && !isCurrent}
                                onClick={() => handleStepTransition(step.id)}
                                className={`glass-card p-6 border transition-all text-left relative group overflow-hidden ${isCurrent
                                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                                        : isPast
                                            ? 'bg-emerald-400/5 border-emerald-400/20 opacity-60'
                                            : isNext
                                                ? 'bg-white/5 border-white/10 hover:border-amber-500 cursor-pointer'
                                                : 'bg-white/2 border-white/5 opacity-30 cursor-not-allowed'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-4 border ${isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-gray-600'}`}>
                                    <step.icon className="w-4 h-4" />
                                </div>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {step.label}
                                </h4>
                                <p className="text-[9px] font-bold text-gray-700 uppercase">
                                    {isPast ? (isCurrent ? 'Trabalhando' : 'Concluído') : (isNext ? 'Avançar Fase' : 'Bloqueado')}
                                </p>

                                {isCurrent && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Coluna Principal: Interação e Respostas */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Descrição Original (Registro Escolar) */}
                    <div className="glass-card p-8 border border-white/10 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">Relato Original da Unidade</h3>
                        </div>
                        <p className="text-sm font-medium text-gray-300 leading-relaxed italic bg-white/5 p-6 rounded-2xl border-l-4 border-l-amber-500/20">
                            "{ticket.description}"
                        </p>
                    </div>

                    {/* Canal de Resposta Admin */}
                    <div className="glass-card p-2 rounded-[2.5rem] border border-white/10 bg-white/2 focus-within:bg-white/5 transition-all">
                        <form onSubmit={handleSendReply} className="flex gap-4 p-4 items-end">
                            <textarea
                                rows={3}
                                required
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Responda à escola ou registre uma atualização interna de atendimento..."
                                className="flex-grow bg-transparent p-4 text-sm font-medium text-gray-200 placeholder:text-gray-700 outline-none border-none resize-none"
                            ></textarea>
                            <button
                                disabled={isSubmitting}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-4 rounded-3xl transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 active:scale-95"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </form>
                    </div>

                    {/* Histórico do Registro */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <History className="w-4 h-4 text-gray-600" />
                            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic leading-none">Histórico de Encaminhamentos</h3>
                        </div>

                        {updates.length === 0 ? (
                            <div className="glass-card p-16 text-center border-dashed border-white/5">
                                <MessageSquare className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-none">Aguardando primeira movimentação</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {updates.map((update) => (
                                    <div key={update.id} className={`glass-card p-8 border border-white/5 hover:border-white/10 transition-all group text-left ${update.is_admin_reply ? 'border-amber-500/10' : ''}`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${update.is_admin_reply ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black italic text-white uppercase tracking-widest leading-none mb-1">
                                                        {update.is_admin_reply ? 'Renato Assis - Admin' : 'Unidade Parceira'}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                                        {update.is_admin_reply ? 'Cidade Viva Education' : ticket.schools.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">
                                                {new Date(update.created_at).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed bg-white/2 p-6 rounded-2xl border-l-4 border-l-amber-500/20">
                                            {update.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Dados de Contato e Instruções */}
                <div className="lg:col-span-4 space-y-6 shrink-0">
                    <div className="glass-card p-8 border border-white/5 space-y-8 bg-white/2 text-left">
                        <div>
                            <div className="flex items-center gap-3 mb-8 text-left">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                    <School className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 leading-none mb-1">Unidade Escolar</h3>
                                    <p className="font-black italic tracking-tighter text-xl uppercase leading-none text-white">{ticket.schools.name}</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-left">
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 leading-none italic">Assunto Reportado:</p>
                                    <p className="text-sm font-black text-white italic tracking-tight uppercase leading-none">{ticket.subject}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 leading-none italic">E-mail de Referência:</p>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-tight">{ticket.schools.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 text-left">
                            <div className="flex items-center gap-2 text-emerald-400 mb-4">
                                <CheckCircle2 className="w-4 h-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">SLA de Atendimento</h4>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
                                Este ticket deve ser <span className="text-white">Triado em até 24h</span> e <span className="text-white">Resolvido em até 72h</span> úteis conforme políticas internas da Cidade Viva Education.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-8 border border-amber-500/10 bg-amber-500/5 text-left">
                        <div className="flex items-center gap-2 text-amber-500 mb-4">
                            <Info className="w-4 h-4 shrink-0" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest italic leading-none">Nota Administrativa</h4>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
                            Toda alteração de fase na <span className="text-white">Jornada do Atendimento</span> deve ser acompanhada de um registro claro do que foi executado para fins de auditoria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
