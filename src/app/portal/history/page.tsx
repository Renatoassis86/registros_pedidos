"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSchoolContext } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Package,
    AlertTriangle,
    ArrowLeft,
    ChevronRight,
    Clock,
    Search,
    Filter,
    History as HistoryIcon,
    ArrowUpRight,
    Truck,
    CheckCircle2,
    XCircle,
    Calendar,
    Hash
} from 'lucide-react';

interface Activity {
    id: string;
    protocol: string;
    type: 'order' | 'ticket';
    title: string;
    status: string;
    date: string;
    amount?: number;
}

export default function UnifiedHistory() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'tickets'>(
        (searchParams.get('type') === 'order' ? 'orders' : searchParams.get('type') === 'ticket' ? 'tickets' : 'all') as any
    );

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        try {
            const schoolCtx = await getSchoolContext();
            if (!schoolCtx) return;

            const [ordersRes, ticketsRes] = await Promise.all([
                supabase.from('orders').select('*').eq('school_id', schoolCtx.id).order('created_at', { ascending: false }),
                supabase.from('tickets').select('*').eq('school_id', schoolCtx.id).order('created_at', { ascending: false })
            ]);

            const all: Activity[] = [
                ...(ordersRes.data || []).map(o => ({
                    id: o.id,
                    protocol: o.protocol,
                    type: 'order' as const,
                    title: `Pedido ${o.type === 'contract_initial' ? 'Inicial' : 'Complementar'}`,
                    status: o.status,
                    date: o.created_at,
                    amount: o.total_amount
                })),
                ...(ticketsRes.data || []).map(t => ({
                    id: t.id,
                    protocol: t.protocol,
                    type: 'ticket' as const,
                    title: `Ocorrência: ${t.subject}`,
                    status: t.status,
                    date: t.created_at
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setActivities(all);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = activities.filter(a => {
        const matchesTab = activeTab === 'all' || (activeTab === 'orders' && a.type === 'order') || (activeTab === 'tickets' && a.type === 'ticket');
        const matchesSearch =
            a.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusInfo = (status: string, type: 'order' | 'ticket') => {
        const s = status?.toLowerCase();
        if (type === 'ticket') {
            switch (s) {
                case 'aberto': return { label: 'Aberto', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: Clock };
                case 'em_andamento': return { label: 'Em Análise', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock };
                case 'respondido': return { label: 'Respondido', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: CheckCircle2 };
                case 'concluido': return { label: 'Resolvido', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 };
                default: return { label: status, color: 'text-gray-400 bg-white/5 border-white/10', icon: Clock };
            }
        }
        // Orders
        switch (s) {
            case 'shipped': return { label: 'Em Trânsito', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: Truck };
            case 'approved': return { label: 'Aprovado', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 };
            case 'delivered': return { label: 'Entregue', color: 'text-emerald-500 bg-emerald-500/20', icon: CheckCircle2 };
            case 'canceled': return { label: 'Cancelado', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle };
            default: return { label: 'Submetido', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock };
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
            {/* Header unificado */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/portal')}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Dashboard
                    </button>
                    <div>
                        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Histórico <span className="text-amber-500">Completo</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-medium mt-2">Registro de todos os seus pedidos e ocorrências de suporte.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar protocolo ou assunto..."
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm text-white focus:border-amber-500 outline-none w-full md:w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Abas e Filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'orders', label: 'Pedidos' },
                        { id: 'tickets', label: 'Suporte' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Exibindo {filtered.length} registros
                </div>
            </div>

            {/* Listagem Estilo Registro */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center space-y-4 animate-pulse">
                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Compilando Registro...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-20 text-center border-dashed border-white/5">
                        <HistoryIcon className="w-16 h-16 text-gray-800 mb-6" />
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Nenhum registro encontrado</h3>
                        <p className="text-gray-500 text-sm max-w-sm mt-2">Tente ajustar seus filtros ou busca.</p>
                    </div>
                ) : (
                    filtered.map(activity => {
                        const status = getStatusInfo(activity.status, activity.type);
                        return (
                            <div
                                key={activity.id}
                                onClick={() => router.push(activity.type === 'order' ? `/portal/orders/${activity.id}` : `/portal/tickets/${activity.id}`)}
                                className="glass-card group hover:bg-white/5transition-all cursor-pointer border border-white/5 relative overflow-hidden"
                            >
                                {/* Barra lateral de tipo */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${activity.type === 'order' ? 'bg-blue-500/40' : 'bg-red-500/40'}`}></div>

                                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${activity.type === 'order' ? 'bg-blue-500/5 border-blue-500/10 text-blue-400 group-hover:border-blue-500/30' : 'bg-red-500/5 border-red-500/10 text-red-400 group-hover:border-red-500/30'}`}>
                                            {activity.type === 'order' ? <Package className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-white font-black italic uppercase tracking-tighter text-xl leading-none">
                                                    {activity.title}
                                                </h4>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                    <status.icon className="w-3 h-3" />
                                                    {status.label}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-amber-500/50" /> {activity.protocol || activity.id.slice(0, 8)}</div>
                                                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-600" /> {new Date(activity.date).toLocaleDateString('pt-BR')}</div>
                                                {activity.amount && <div className="flex items-center gap-1.5"><ArrowUpRight className="w-3.5 h-3.5 text-emerald-500/50" /> R$ {activity.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Evolução</p>
                                            <p className="text-xs font-bold text-gray-400">Ver Registro</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl text-amber-500 group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
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
