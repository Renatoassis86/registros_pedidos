"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import {
    Truck,
    ArrowLeft,
    Package,
    Calendar,
    CheckCircle2,
    Clock,
    Send,
    User,
    Hash,
    ShoppingBag,
    Box,
    FileText,
    Trello,
    ChevronRight,
    MapPin,
    AlertCircle,
    Info
} from 'lucide-react';

interface OrderItem {
    id: string;
    product_id: string;
    qty: number;
    unit_price: number;
    products?: { name: string; sku: string };
}

interface OrderUpdate {
    id: string;
    message: string;
    status_at_time: string;
    created_at: string;
    is_admin_reply: boolean;
    profiles?: { full_name: string };
}

interface Order {
    id: string;
    protocol: string;
    type: string;
    status: string;
    total_amount: number;
    created_at: string;
    notes: string;
    tracking_code: string;
    estimated_delivery: string;
    schools: { name: string; email: string };
}

export default function AdminOrderDetail() {
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [updates, setUpdates] = useState<OrderUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = [
        { id: 'submitted', label: 'Submetido', icon: Clock, color: 'text-blue-400' },
        { id: 'approved', label: 'Aprovado', icon: CheckCircle2, color: 'text-emerald-400' },
        { id: 'separated', label: 'Em Separação', icon: Box, color: 'text-amber-500' },
        { id: 'shipped', label: 'Em Trânsito', icon: Truck, color: 'text-purple-400' },
        { id: 'delivered', label: 'Entregue', icon: MapPin, color: 'text-emerald-500' }
    ];

    useEffect(() => {
        if (params.id) {
            fetchOrderData();
        }
    }, [params.id]);

    async function fetchOrderData() {
        try {
            const { data: orderData } = await supabase
                .from('orders')
                .select('*, schools(name, email)')
                .eq('id', params.id)
                .single();

            if (orderData) setOrder(orderData as any);

            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*, products(name, sku)')
                .eq('order_id', params.id);

            if (itemsData) setItems(itemsData as any);

            const { data: updatesData } = await supabase
                .from('order_updates')
                .select('*, profiles(full_name)')
                .eq('order_id', params.id)
                .order('created_at', { ascending: false });

            if (updatesData) setUpdates(updatesData as any);
        } catch (err) {
            console.error('Erro ao buscar dados do pedido:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStepTransition(statusId: string) {
        if (!order) return;

        // Basic tracking info request for 'shipped'
        let tracking = order.tracking_code;
        let delivery = order.estimated_delivery;

        if (statusId === 'shipped') {
            const code = prompt('Informe o Código de Rastreio (ou deixe vazio para manter atual):', order.tracking_code || '');
            const date = prompt('Informe a Previsão de Entrega (AAAA-MM-DD):', order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '');
            if (code !== null) tracking = code;
            if (date) delivery = new Date(date).toISOString();
        }

        const msg = prompt(`Descreva o que foi feito nesta etapa (${statusId}):`);
        if (msg === null) return;

        try {
            setIsSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Update Order Status
            await supabase
                .from('orders')
                .update({
                    status: statusId,
                    tracking_code: tracking,
                    estimated_delivery: delivery
                })
                .eq('id', order.id);

            // 2. Add History Entry
            await supabase
                .from('order_updates')
                .insert({
                    order_id: order.id,
                    author_id: user?.id,
                    message: msg || `Etapa movida para: ${statusId}`,
                    status_at_time: statusId,
                    is_admin_reply: true
                });

            fetchOrderData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSendReply(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !order) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase
                .from('order_updates')
                .insert({
                    order_id: order.id,
                    author_id: user?.id,
                    message: newMessage,
                    status_at_time: order.status,
                    is_admin_reply: true
                });

            setNewMessage('');
            fetchOrderData();
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) return <div className="p-20 text-center text-gray-500 font-black uppercase tracking-widest text-[10px]">Lendo Atendimento Administrativo...</div>;
    if (!order) return <div className="p-20 text-center text-red-400">Pedido não encontrado.</div>;

    const currentStepIndex = steps.findIndex(s => s.id === order.status);

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade">
            {/* Header / Contexto Admin */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4 text-left">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-amber-500 transition-colors uppercase tracking-[0.3em] mb-4 group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Retornar ao Fluxo
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-left">
                            <span className="text-[10px] font-black bg-white/5 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest leading-none">
                                Gestão Administrativa
                            </span>
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                Protocolo: {order.protocol}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 text-left">
                            Atendimento de <span className="text-amber-500">Logística</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl text-left">
                            Unidade Parceira: <span className="text-white">{order.schools?.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8 text-left">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-right">Valor do Atendimento</p>
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
                            R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Jornada do Atendimento (Kanban / Trello Style) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Trello className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">Jornada do Atendimento</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                                    {isPast ? (isCurrent ? 'Ação Requerida' : 'Concluído') : (isNext ? 'Próxima Fase' : 'Aguardando')}
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
                {/* Coluna Principal: Registro de Histórico e Interações */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Canal de Resposta */}
                    <div className="glass-card p-2 rounded-[2.5rem] border border-white/10 bg-white/2 focus-within:bg-white/5 transition-all">
                        <form onSubmit={handleSendReply} className="flex gap-4 p-4 items-end">
                            <textarea
                                rows={3}
                                required
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Descreva aqui o despacho ou atualização para que a escola possa acompanhar em tempo real..."
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

                    {/* Linha do Tempo / Registro Logístico */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic leading-none">Registro de Movimentações</h3>
                        </div>

                        {updates.length === 0 ? (
                            <div className="glass-card p-16 text-center border-dashed border-white/5">
                                <FileText className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Nenhuma movimentação registrada</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {updates.map((update) => {
                                    const stepInfo = steps.find(s => s.id === update.status_at_time);
                                    return (
                                        <div key={update.id} className="glass-card p-8 border border-white/5 hover:border-white/10 transition-all group text-left">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black italic text-white uppercase tracking-widest leading-none mb-1">Renato Assis - Admin</p>
                                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Cidade Viva Education</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-left">
                                                    {stepInfo && (
                                                        <div className={`px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${stepInfo.color}`}>
                                                            <stepInfo.icon className="w-3 h-3" />
                                                            Fase: {stepInfo.label}
                                                        </div>
                                                    )}
                                                    <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">
                                                        {new Date(update.created_at).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed bg-white/2 p-6 rounded-2xl border-l-4 border-l-amber-500/20">
                                                {update.message}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Detalhes do Registro Administrativo */}
                <div className="lg:col-span-4 space-y-6 shrink-0">
                    <div className="glass-card p-8 border border-white/5 space-y-8 bg-white/2 text-left">
                        <div>
                            <div className="flex items-center gap-3 mb-6 text-left">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">Composição do Registro</h3>
                            </div>

                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-left">
                                            <p className="text-xs font-black text-white italic uppercase tracking-tight leading-none mb-1">{item.products?.name}</p>
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">SKU: {item.products?.sku}</p>
                                        </div>
                                        <span className="text-xs font-black text-amber-500">{item.qty}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-6 text-left">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 leading-none">Solicitante</p>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <User className="w-3.5 h-3.5 text-blue-400" />
                                    </div>
                                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-tight">{order.schools?.email}</p>
                                </div>
                            </div>

                            <div className="text-left">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 leading-none">Relato Escolar</p>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 italic text-[11px] text-gray-400 font-medium leading-relaxed">
                                    "{order.notes || "Sem notas adicionais."}"
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumo Logístico */}
                    <div className="glass-card p-8 border border-amber-500/20 bg-amber-500/5 text-left">
                        <div className="flex items-center gap-2 text-amber-500 mb-6">
                            <Truck className="w-4 h-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest italic leading-none">Informações de Despacho</h4>
                        </div>

                        <div className="space-y-6 text-left">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1.5 leading-none">Código Global de Rastreio</p>
                                <p className="text-xs font-black text-white uppercase tracking-widest bg-white/5 px-4 py-3 rounded-xl border border-white/10 inline-block min-w-[120px] text-center">
                                    {order.tracking_code || "NÃO DISPONÍVEL"}
                                </p>
                            </div>

                            <div className="text-left">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1.5 leading-none">Previsão de Entrega</p>
                                <div className="flex items-center gap-3 text-sm font-black text-white italic tracking-tighter">
                                    <Calendar className="w-4 h-4 text-emerald-400" />
                                    {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('pt-BR') : "PENDENTE"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-amber-500/10 flex items-center gap-3 text-amber-500">
                            <Info className="w-4 h-4 shrink-0" />
                            <p className="text-[9px] font-bold uppercase tracking-tight leading-relaxed">
                                A escola recebe notificações sobre cada etapa movida na jornada.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
