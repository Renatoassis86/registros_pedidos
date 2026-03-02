"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Truck,
    MoreVertical,
    ChevronRight,
    ChevronLeft,
    Calendar,
    Package,
    Hash,
    Building2,
    MoveHorizontal,
    ArrowRightLeft,
    Clock,
    Search
} from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    protocol: string;
    status: string;
    type: string;
    schools: { name: string };
    created_at: string;
}

const STAGES = [
    { id: 'submitted', label: 'Submetidos', color: 'bg-blue-500' },
    { id: 'in_review', label: 'Em Análise', color: 'bg-indigo-500' },
    { id: 'approved', label: 'Aprovados', color: 'bg-emerald-500' },
    { id: 'separated', label: 'Separação', color: 'bg-amber-500' },
    { id: 'shipped', label: 'Transporte', color: 'bg-purple-500' },
    { id: 'delivered', label: 'Concluídos', color: 'bg-slate-500' }
];

export default function AdminOrdersKanban() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('id, protocol, status, type, created_at, schools(name)')
                .order('created_at', { ascending: false });

            if (data) setOrders(data as any);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function moveOrder(orderId: string, currentStatus: string, direction: 'next' | 'prev') {
        const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
        let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < STAGES.length) {
            const nextStatus = STAGES[newIndex].id;

            // Registrar movimentação
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: nextStatus })
                .eq('id', orderId);

            if (!updateError) {
                // Adicionar log na order_updates
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase.from('order_updates').insert({
                        order_id: orderId,
                        author_id: session.user.id,
                        status_at_time: nextStatus,
                        message: `Pedido movido para a fase: ${STAGES[newIndex].label}`,
                        is_admin_reply: true
                    });
                }

                // Atualizar estado local
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
            }
        }
    }

    const filtered = orders.filter(o =>
        o.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.schools?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-8 animate-fade overflow-hidden">
            <header className="flex items-center justify-between shrink-0">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Jornada <span className="text-amber-500">dos Pedidos</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Gestão Visual estilo Kanban Cidade Viva Education</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="FILTRAR REGISTROS..."
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-6 text-[10px] font-black text-white focus:border-amber-500 outline-none w-64 transition-all placeholder:text-gray-700 uppercase"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar flex gap-4 pb-4">
                {STAGES.map((stage) => {
                    const stageOrders = filtered.filter(o => o.status === stage.id);
                    return (
                        <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col h-full bg-white/2 border border-white/5 rounded-3xl overflow-hidden group">
                            <header className="p-5 border-b border-white/5 bg-white/2 shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-6 ${stage.color} rounded-full`}></div>
                                    <h3 className="font-black text-white italic uppercase tracking-tighter text-sm">{stage.label}</h3>
                                </div>
                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-500 font-black">{stageOrders.length}</span>
                            </header>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                {stageOrders.map((order) => (
                                    <div key={order.id} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-all group/card relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded leading-none shrink-0 inline-block">
                                                {order.protocol}
                                            </span>
                                            <Link href={`/admin/orders/${order.id}`} className="opacity-40 hover:opacity-100 transition-all">
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                            </Link>
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight mb-2 truncate">
                                            {order.schools?.name}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                                            <Clock className="w-3 h-3 text-gray-700" /> {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                        </div>

                                        <div className="flex items-center justify-between gap-1 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => moveOrder(order.id, order.status, 'prev')}
                                                disabled={stage.id === STAGES[0].id}
                                                className="flex-1 flex items-center justify-center p-2 bg-white/2 hover:bg-white/5 rounded-lg text-gray-600 hover:text-white transition-all disabled:opacity-0"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveOrder(order.id, order.status, 'next')}
                                                disabled={stage.id === STAGES[STAGES.length - 1].id}
                                                className="flex-[2] flex items-center justify-center gap-2 p-2 bg-amber-500/10 hover:bg-amber-500 rounded-lg text-amber-500 hover:text-slate-950 text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-0 disabled:pointer-events-none"
                                            >
                                                Avançar <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {stageOrders.length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <MoveHorizontal className="w-8 h-8 text-white/5 mb-3" />
                                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.2em]">Fluxo Vazio</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            `}</style>
        </div>
    );
}

function ExternalLink({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}
