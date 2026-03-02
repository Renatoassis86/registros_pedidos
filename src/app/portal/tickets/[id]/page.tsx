"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSchoolContext } from '@/lib/utils';
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
    Paperclip,
    ExternalLink,
    FileText,
    History,
    Hash,
    Info
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
    order_id: string;
    attachment_url: string;
    attachment_name: string;
}

export default function TicketRegistrationPortal() {
    const router = useRouter();
    const params = useParams();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [updates, setUpdates] = useState<TicketUpdate[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [schoolName, setSchoolName] = useState('Unidade Escolar');

    useEffect(() => {
        if (params.id) {
            fetchTicketData();
            loadSchoolContext();
        }
    }, [params.id]);

    async function loadSchoolContext() {
        const ctx = await getSchoolContext();
        if (ctx?.name) setSchoolName(ctx.name);
    }

    async function fetchTicketData() {
        const { data: ticketData } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', params.id)
            .single();

        if (ticketData) {
            setTicket(ticketData as any);
        }

        const { data: updatesData } = await supabase
            .from('ticket_updates')
            .select('*, profiles(full_name)')
            .eq('ticket_id', params.id)
            .order('created_at', { ascending: true });

        if (updatesData) setUpdates(updatesData as any);
    }

    async function handleSendUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !ticket) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('ticket_updates')
                .insert({
                    ticket_id: ticket.id,
                    author_id: user?.id,
                    message: newMessage,
                    is_admin_reply: false
                });

            if (error) throw error;

            setNewMessage('');
            fetchTicketData();
        } catch (err: any) {
            alert('Erro ao enviar mensagem: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!ticket) return <div className="p-20 text-center text-gray-500 font-black uppercase tracking-widest text-[10px]">Acessando Registro de Atendimento...</div>;

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ABERTO': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'EM_ANDAMENTO': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'RESPONDIDO': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'CONCLUIDO': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            default: return 'text-gray-400 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10 animate-fade">
            {/* Header unificado */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Histórico
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-black bg-white/5 text-gray-500 px-2 py-1 rounded uppercase tracking-widest border border-white/10">
                                Protocolo: {ticket.protocol}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Registro de <span className="text-amber-500">Ocorrência</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Abertura em</p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <Calendar className="w-5 h-5 text-gray-600" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Coluna Principal: Chat e Evolução */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Descrição Original do Usuário */}
                    <div className="glass-card p-10 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none mb-1">Relato da Unidade</h3>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{ticket.subject}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 font-medium leading-relaxed bg-white/5 p-6 rounded-2xl border-l-4 border-l-amber-500/30">
                                "{ticket.description}"
                            </p>

                            {/* Anexo se existir */}
                            {ticket.attachment_name && (
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group/file hover:border-amber-500/30 transition-all cursor-pointer">
                                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover/file:bg-amber-500/20 transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-left">Documento em Anexo</p>
                                        <p className="text-xs font-bold text-gray-300 truncate text-left">{ticket.attachment_name}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-700 group-hover/file:text-amber-500 transition-colors" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Evolução / Mensagens - Registro */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <History className="w-4 h-4 text-gray-500" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Evolução do Atendimento (Registro)</h3>
                        </div>

                        {updates.length === 0 ? (
                            <div className="glass-card p-12 text-center border-dashed border-white/5">
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Aguardando análise da equipe técnica...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {updates.map((update) => (
                                    <div
                                        key={update.id}
                                        className={`p-6 rounded-3xl border transition-all ${update.is_admin_reply ? 'glass-card border-blue-500/20 ml-12 bg-blue-500/5' : 'glass-card border-white/5 mr-12'}`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${update.is_admin_reply ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-600'}`}>
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${update.is_admin_reply ? 'text-blue-400' : 'text-gray-500'}`}>
                                                    {update.is_admin_reply ? 'Renato Assis - Cidade Viva Education' : schoolName}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-bold text-gray-700 uppercase tracking-tighter">
                                                {new Date(update.created_at).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed">{update.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input de Mensagem */}
                    <form onSubmit={handleSendUpdate} className="glass-card p-2 rounded-[2rem] border border-white/10 flex items-center gap-2 pr-4 bg-white/5">
                        <textarea
                            rows={1}
                            placeholder="Adicionar comentário ao registro..."
                            className="flex-grow bg-transparent p-4 text-sm font-medium text-white placeholder:text-gray-600 outline-none border-none resize-none"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        ></textarea>
                        <button
                            disabled={isSubmitting}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-3 h-12 w-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Sidebar: Status e Contexto */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 border border-white/5 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 text-red-400 mb-4">
                                <Clock className="w-4 h-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest italic">Prazos de Suporte</h4>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed tracking-tight">
                                    Tempo estimado para definição do encaminhamento: <span className="text-white">Até 48h úteis.</span>
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-6">
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-2">Pedido Relacionado</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                                    <Hash className="w-3.5 h-3.5" />
                                    {ticket.order_id || "Não Vínculado"}
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-2">Tipo de Atendimento</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
                                    <FileText className="w-3.5 h-3.5" />
                                    Trocas / Avarias
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card de Informação Adicional */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-8">
                        <div className="flex items-center gap-2 text-amber-500 mb-3">
                            <Info className="w-4 h-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Nota do Sistema</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                            Toda alteração feita pela escola ou pela nossa equipe é registrada neste histórico permanentemente para fins de auditoria e controle de qualidade.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
