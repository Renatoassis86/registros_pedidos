"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Truck,
    Search,
    Package,
    MapPin,
    Calendar,
    ExternalLink,
    Clock,
    ChevronRight,
    Filter,
    ArrowUpRight,
    Hash,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface OrderLogistics {
    id: string;
    protocol: string;
    status: string;
    tracking_code: string;
    estimated_delivery: string;
    schools: { name: string; state: string; address: string };
    updated_at: string;
}

export default function AdminLogistics() {
    const [orders, setOrders] = useState<OrderLogistics[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogisticsData();
    }, []);

    async function fetchLogisticsData() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('id, protocol, status, tracking_code, estimated_delivery, created_at, schools(name, state, address)')
                .in('status', ['approved', 'separated', 'shipped', 'delivered'])
                .order('created_at', { ascending: false });

            if (data) setOrders(data as any);
            if (error) console.error('Erro Logística:', error);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'approved': return { label: 'Aprovado', progress: '25%', color: 'bg-emerald-500' };
            case 'separated': return { label: 'Separado', progress: '50%', color: 'bg-amber-500' };
            case 'shipped': return { label: 'Em Trânsito', progress: '75%', color: 'bg-purple-500' };
            case 'delivered': return { label: 'Entregue', progress: '100%', color: 'bg-blue-500' };
            default: return { label: status, progress: '0%', color: 'bg-gray-500' };
        }
    };

    const filtered = orders.filter(o =>
        o.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.schools?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade pb-20">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                            <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operações Logísticas</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                        Controle <span className="text-amber-500">Logístico</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl">
                        Monitoramento de envios, rastreio em tempo real e previsão de entrega para toda rede Cidade Viva Education.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por escala, protocolo ou rastreio..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:border-amber-500 outline-none w-full md:w-80 transition-all placeholder:text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-24 text-center glass-card border-white/5 bg-slate-900/40">
                        <div className="w-10 h-10 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] animate-pulse italic">Rastreando Movimentações Éticas...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card py-24 text-center border-dashed border-white/5">
                        <Package className="w-16 h-16 text-gray-800 mx-auto mb-6 opacity-20" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nenhum pedido em trânsito no momento.</p>
                    </div>
                ) : (
                    filtered.map(order => {
                        const step = getStatusStep(order.status);
                        return (
                            <div key={order.id} className="glass-card bg-slate-900/40 border border-white/5 p-8 group relative overflow-hidden transition-all hover:bg-white/5">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>

                                <div className="flex flex-col xl:flex-row gap-12">
                                    {/* Unidade e Protocolo */}
                                    <div className="xl:w-1/3 space-y-4">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shrink-0">
                                                <Package className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{order.protocol}</h4>
                                                <p className="text-xs font-bold text-amber-500/60 uppercase tracking-widest mt-1">{order.schools?.name}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 bg-white/2 p-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                <MapPin className="w-3.5 h-3.5 text-gray-600" /> {order.schools?.address}, {order.schools?.state}
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5 text-gray-600" /> {order.estimated_delivery ? `Previsão: ${new Date(order.estimated_delivery).toLocaleDateString('pt-BR')}` : 'Sem previsão informada'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Visual e Rastreio */}
                                    <div className="flex-1 space-y-8">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] italic">Progresso do Envio: <span className="text-white">{step.label}</span></span>
                                            <span className="text-xl font-black text-white italic">{step.progress}</span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                            <div
                                                className={`h-full ${step.color} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.2)]`}
                                                style={{ width: step.progress }}
                                            ></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Código de Rastreio</p>
                                                <div className="flex items-center justify-between">
                                                    <code className="text-lg font-mono font-black text-white tracking-widest">{order.tracking_code || '---'}</code>
                                                    {order.tracking_code && (
                                                        <button className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-all">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 px-6 py-4 bg-white/2 rounded-2xl border border-white/5">
                                                <Clock className="w-5 h-5 text-gray-600" />
                                                <div className="text-left">
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Última Atualização</p>
                                                    <p className="text-xs font-bold text-gray-300 mt-1 uppercase italic tracking-tighter">Fluxo logístico em movimentação</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex flex-row xl:flex-col gap-3 shrink-0">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-amber-500 rounded-2xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group/btn"
                                        >
                                            Detalhes Logísticos
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        {order.status === 'shipped' && (
                                            <div className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                                <MapPin className="w-4 h-4" />
                                                Em Trânsito
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
