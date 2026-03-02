"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSchoolContext } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import {
    Truck,
    ArrowLeft,
    Package,
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    Hash,
    ShoppingBag,
    Box,
    FileText,
    TrendingUp,
    History,
    User,
    Info,
    ArrowUpRight
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
}

export default function OrderDetail() {
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [updates, setUpdates] = useState<OrderUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [schoolName, setSchoolName] = useState('Unidade Escolar');

    useEffect(() => {
        if (params.id) {
            fetchOrderData();
            loadSchoolContext();
        }
    }, [params.id]);

    async function loadSchoolContext() {
        const ctx = await getSchoolContext();
        if (ctx?.name) setSchoolName(ctx.name);
    }

    async function fetchOrderData() {
        try {
            const { data: orderData } = await supabase
                .from('orders')
                .select('*')
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

    if (loading) return <div className="py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">Lendo Registro Logístico...</div>;
    if (!order) return <div className="py-20 text-center text-red-400 font-bold">Pedido não encontrado.</div>;

    const steps = [
        { label: 'Submetido', status: 'submitted', icon: Clock },
        { label: 'Aprovado', status: 'approved', icon: CheckCircle2 },
        { label: 'Em Separação', status: 'separated', icon: Box },
        { label: 'Em Trânsito', status: 'shipped', icon: Truck },
        { label: 'Entregue', status: 'delivered', icon: MapPin }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status);

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-12 animate-fade">
            {/* Header / Registro Protocolado */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4 text-left">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-amber-500 transition-colors uppercase tracking-[0.3em] mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retornar ao Histórico
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-left">
                            <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg border border-amber-600 uppercase tracking-widest leading-none">
                                {order.protocol}
                            </span>
                            <span className="text-[10px] font-black bg-white/5 text-gray-500 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest leading-none italic">
                                {order.type === 'contract_initial' ? 'Fixo/Contrato' : 'Complementar'}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 text-left">
                            Registro de <span className="text-amber-500">Logística</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl text-left">
                            Acompanhe em tempo real a jornada física do seu material educativo.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-right">Custo Total</p>
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
                            R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Jornada do Atendimento (Timeline Dinâmica) */}
            <div className="glass-card p-12 border border-white/5 relative overflow-hidden bg-white/2">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 -ml-16 -mt-16 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        {steps.map((step, i) => {
                            const isPast = i <= currentStepIndex;
                            const isCurrent = i === currentStepIndex;
                            return (
                                <div key={step.status} className="flex flex-col items-center gap-4 text-center min-w-[120px]">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${isCurrent
                                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xl shadow-amber-500/40 scale-110'
                                        : isPast
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 scale-95'
                                            : 'bg-white/5 border-white/5 text-gray-800'
                                        }`}>
                                        <step.icon className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPast ? 'text-white' : 'text-gray-800'}`}>{step.label}</p>
                                        <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">{isPast ? (isCurrent ? 'Em Andamento' : 'Concluído') : 'Aguardando'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Barra de progresso visual */}
                    <div className="hidden lg:block absolute top-7 left-14 right-14 h-0.5 bg-white/5 -z-10">
                        <div
                            className="h-full bg-amber-500/30 transition-all duration-1000 ease-out"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-10">
                    {/* Linha do Tempo de Atualizações Administrativas */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <History className="w-4 h-4 text-gray-600" />
                            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic leading-none">Registro Logístico e Movimentações</h3>
                        </div>

                        {updates.length === 0 ? (
                            <div className="glass-card p-16 text-center border-dashed border-white/5 bg-white/2">
                                <Package className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Aguardando registro de movimentação inicial</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {updates.map((update) => {
                                    const stepInfo = steps.find(s => s.status === update.status_at_time);
                                    return (
                                        <div key={update.id} className="glass-card p-8 border border-white/5 bg-white/2 hover:border-white/10 transition-all text-left">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10">
                                                        <User className="w-4 h-4 text-amber-500" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black italic text-white uppercase tracking-widest leading-none mb-1">
                                                            {update.is_admin_reply ? 'Cidade Viva Education' : schoolName}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest italic">
                                                            {update.is_admin_reply ? 'Núcleo de Suprimentos' : 'Unidade Parceira'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-left">
                                                    {stepInfo && (
                                                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-amber-500 italic">
                                                            <stepInfo.icon className="w-3 h-3" />
                                                            Fase: {stepInfo.label}
                                                        </div>
                                                    )}
                                                    <span className="text-[8px] font-bold text-gray-700 uppercase tracking-tighter">
                                                        {new Date(update.created_at).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed bg-white/2 p-6 rounded-2xl border-l-4 border-l-amber-500/20 italic">
                                                {update.message}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Composição do Pedido */}
                    <div className="glass-card border border-white/5 overflow-hidden bg-white/2">
                        <div className="p-8 border-b border-white/5 flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5 text-amber-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">Composição do Material</h3>
                        </div>
                        <div className="p-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] w-2/3">Manual / Coleção</th>
                                        <th className="py-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">Unidades</th>
                                        <th className="py-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-right">Investimento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map(item => (
                                        <tr key={item.id} className="group transition-colors">
                                            <td className="py-6 pr-4">
                                                <p className="text-base font-black text-white uppercase italic tracking-tight mb-1">{item.products?.name}</p>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">SKU Ref: {item.products?.sku}</p>
                                            </td>
                                            <td className="py-6 text-center text-sm font-black text-amber-500 italic uppercase leading-none">{item.qty} kits</td>
                                            <td className="py-6 text-right text-sm font-bold text-gray-400">R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Contextual */}
                <div className="lg:col-span-4 space-y-8 shrink-0">
                    <div className="glass-card p-10 bg-amber-500 border border-amber-600 text-slate-950 shadow-2xl shadow-amber-500/10 relative overflow-hidden text-left">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-950/5 -mb-16 -mr-16 rounded-full blur-3xl"></div>
                        <div className="flex justify-between items-start mb-10 text-left">
                            <div className="text-left">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-2 opacity-50 italic">Informação Global</h3>
                                <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">{order.status === 'shipped' ? 'Em Trânsito' : 'Processando'}</p>
                            </div>
                            <Truck className="w-10 h-10 opacity-30 rotate-12" />
                        </div>

                        <div className="space-y-8 text-left">
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-2 opacity-55 italic">Tracking CV-ED</p>
                                <p className="text-sm font-black tracking-[0.2em] uppercase truncate bg-slate-950/10 p-4 rounded-xl border border-slate-950/5 text-center">
                                    {order.tracking_code || "Aguardando Código"}
                                </p>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-2 opacity-55 italic">Janela de Recebimento</p>
                                <p className="text-sm font-black tracking-tight uppercase flex items-center gap-3 italic">
                                    <Calendar className="w-5 h-5 opacity-60" />
                                    {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('pt-BR') : "Analise Logística"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-10 border border-white/5 space-y-8 text-left bg-white/2">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <TrendingUp className="w-5 h-5 font-black uppercase italic" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest italic">Nota de Auditoria</h4>
                        </div>
                        <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                            <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
                                Este registro é auditado periodicamente para garantir a integridade do material entregue em cada unidade escolar parceira.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
