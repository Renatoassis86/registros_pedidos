"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSchoolContext } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Package,
    ChevronRight,
    Calendar,
    Hash,
    Tag,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    XCircle,
    Search,
    Filter,
    PlusCircle,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import OrderEvolution from '@/components/OrderEvolution';

interface Order {
    id: string;
    protocol: string;
    type: string;
    status: string;
    total_amount: number;
    created_at: string;
}

export default function OrderHistory() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [schoolId, setSchoolId] = useState<string | null>(null);

    useEffect(() => {
        loadSchool();
        fetchOrders();
    }, []);

    async function loadSchool() {
        const ctx = await getSchoolContext();
        if (ctx) setSchoolId(ctx.id);
    }

    async function fetchOrders() {
        try {
            const schoolCtx = await getSchoolContext();
            if (!schoolCtx) return;

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('school_id', schoolCtx.id)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
        } catch (err) {
            console.error('Erro ao buscar pedidos:', err);
        } finally {
            setLoading(false);
        }
    }

    const getStatusInfo = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'submitted': return { label: 'Enviado', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock };
            case 'approved': return { label: 'Aprovado', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 };
            case 'separated': return { label: 'Em Separação', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Tag };
            case 'shipped': return { label: 'Em Trânsito', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: Truck };
            case 'delivered': return { label: 'Entregue', color: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30', icon: CheckCircle2 };
            case 'canceled': return { label: 'Cancelado', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle };
            default: return { label: status, color: 'text-gray-400 bg-white/5 border-white/10', icon: AlertCircle };
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'contract_initial': return 'Pedido Inicial';
            case 'complementary': return 'Pedido Complementar';
            case 'replacement': return 'Reposição';
            case 'occurrence': return 'Ocorrência';
            default: return type;
        }
    };

    const filteredOrders = orders.filter(o =>
        o.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTypeLabel(o.type).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade">
            {/* Action Bar */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Pedidos <span className="text-amber-500">Complementares</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Gerencie suas solicitações e acompanhe o fluxo logístico.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar protocolo..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:border-amber-500 outline-none w-full md:w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link href="/portal/new-order" className="btn-primary px-8 py-4 rounded-2xl group border-none shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20">
                        <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        <span className="font-black italic tracking-tighter uppercase text-sm">Nova Solicitação</span>
                    </Link>
                </div>
            </header>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center space-y-4 glass-card border-white/5">
                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest leading-none">Sincronizando Histórico...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-20 text-center border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-6">
                            <Package className="w-12 h-12 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Nenhum registro encontrado</h3>
                        <p className="text-gray-500 text-sm max-w-sm mt-2">Sua busca não retornou resultados ou você ainda não possui pedidos registrados.</p>
                        <Link
                            href="/portal/new-order"
                            className="btn-primary mt-8 px-8 py-4 rounded-2xl font-black italic uppercase text-sm"
                        >
                            Fazer meu primeiro pedido
                        </Link>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const status = getStatusInfo(order.status);
                        return (
                            <div key={order.id} className="glass-card hover:bg-white/5 transition-all group overflow-hidden border border-white/5 p-1 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-white/2 rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 transition-all shrink-0">
                                            <Package className="w-8 h-8 text-gray-700 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h4 className="text-white font-black italic uppercase tracking-tighter text-2xl leading-none">
                                                    {getTypeLabel(order.type)}
                                                </h4>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                    <status.icon className="w-3 h-3" />
                                                    {status.label}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <div className="flex items-center gap-2 text-white/80"><Hash className="w-3.5 h-3.5 text-amber-500" /> {order.protocol || "S/P"}</div>
                                                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-700" /> {new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                                                <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-gray-700" /> R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end gap-10 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                        <div className="lg:text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-right">Última Atualização</p>
                                            <p className="text-xs font-bold text-gray-400">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</p>
                                        </div>
                                        <Link
                                            href={`/portal/orders/${order.id}`}
                                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-amber-500 rounded-2xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group-hover:scale-[1.02] active:scale-95 group-hover:shadow-xl group-hover:shadow-amber-500/10 outline-none"
                                        >
                                            Ver Detalhes
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Evolução Estrutural (Novo Quadro) */}
            <div className="pt-20 border-t border-white/5">
                <OrderEvolution schoolId={schoolId} />
            </div>
        </div>
    );
}
