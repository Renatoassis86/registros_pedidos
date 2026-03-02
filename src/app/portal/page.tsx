"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
    Package,
    PlusCircle,
    AlertTriangle,
    History,
    HelpCircle,
    Clock,
    ChevronRight,
    TrendingUp,
    LayoutDashboard,
    ArrowUpRight,
    Truck
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { generateProtocol, getSchoolContext } from '@/lib/utils';

interface Activity {
    id: string;
    type: 'order' | 'ticket';
    title: string;
    status: string;
    date: string;
    protocol: string;
}

export default function SchoolDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const [schoolName, setSchoolName] = useState('Sua Escola');
    const [consignmentData, setConsignmentData] = useState({ returnableQty: 0, percentage: 0, globalQty: 0 });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        inTransit: 0,
        openTickets: 0,
        lastUpdate: '---'
    });

    useEffect(() => {
        const checkSession = async () => {
            const schoolId = localStorage.getItem('school_portal_id');
            const { data: { session } } = await supabase.auth.getSession();

            if (!schoolId && !session) {
                router.push('/');
                return;
            }
            fetchInitialData();
        };

        checkSession();
    }, []);

    async function fetchInitialData() {
        const schoolCtx = await getSchoolContext();
        if (!schoolCtx) return;

        setSchoolName(schoolCtx.name);

        // 1. Dados da Escola
        const { data: school } = await supabase
            .from('schools')
            .select('consignment_percentage, global_order_qty')
            .eq('id', schoolCtx.id)
            .single();

        if (school) {
            const returnable = Math.floor(school.global_order_qty * (school.consignment_percentage / 100));
            setConsignmentData({
                returnableQty: returnable,
                percentage: school.consignment_percentage,
                globalQty: school.global_order_qty
            });
        }

        // 2. Buscar Pedidos e Ocorrências para Métricas e Atividades
        const [ordersRes, ticketsRes] = await Promise.all([
            supabase.from('orders').select('*').eq('school_id', schoolCtx.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('tickets').select('*').eq('school_id', schoolCtx.id).order('created_at', { ascending: false }).limit(5)
        ]);

        const recentOrders = ordersRes.data || [];
        const recentTickets = ticketsRes.data || [];

        // Concatenar e formatar atividades
        const combinedActivities: Activity[] = [
            ...recentOrders.map(o => ({
                id: o.id,
                type: 'order' as const,
                title: `Pedido ${o.type === 'contract_initial' ? 'Inicial' : 'Complementar'}`,
                status: o.status,
                date: new Date(o.created_at).toLocaleDateString('pt-BR'),
                protocol: o.protocol
            })),
            ...recentTickets.map(t => ({
                id: t.id,
                type: 'ticket' as const,
                title: `Ocorrência: ${t.subject}`,
                status: t.status,
                date: new Date(t.created_at).toLocaleDateString('pt-BR'),
                protocol: t.protocol
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        setActivities(combinedActivities);

        // Calcular estatísticas
        setStats({
            total: recentOrders.length,
            inTransit: recentOrders.filter(o => ['approved', 'separated', 'shipped'].includes(o.status)).length,
            openTickets: recentTickets.filter(t => t.status === 'ABERTO').length,
            lastUpdate: new Date().toLocaleDateString('pt-BR')
        });
    }

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (['delivered', 'approved'].includes(s)) return 'text-emerald-400 bg-emerald-400/10';
        if (['shipped', 'separated', 'in_review'].includes(s)) return 'text-amber-500 bg-amber-500/10';
        if (['canceled', 'aberto'].includes(s)) return 'text-red-400 bg-red-400/10';
        return 'text-gray-400 bg-white/5';
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            {/* Seção Superior: Saudação e Stats Compactos */}
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-amber-500">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Portal da Escola</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Bem-vindo,<br />
                        <span className="text-amber-500">{schoolName}.</span>
                    </h1>
                </div>

                {/* Ultima Atualização Card */}
                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-amber-500">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Status do Sistema</p>
                        <p className="text-white font-bold text-sm leading-none">Última atualização: {stats.lastUpdate}</p>
                    </div>
                </div>
            </div>

            {/* Grid de Stats Primários */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total de Pedidos", value: stats.total, icon: Package, color: "text-blue-400", border: "border-blue-400/20", link: "/portal/orders" },
                    { label: "Em Trânsito", value: stats.inTransit, icon: Truck, color: "text-purple-500", border: "border-purple-400/20", link: "/portal/orders" },
                    { label: "Ocorrências em Aberto", value: stats.openTickets, icon: AlertTriangle, color: "text-red-400", border: "border-red-400/20", link: "/portal/tickets" },
                    { label: "Devolução Autorizada (Consignado)", value: consignmentData.returnableQty, icon: TrendingUp, color: "text-emerald-400", border: "border-emerald-400/20", sub: `Limite: ${consignmentData.percentage}% do inicial`, link: "/portal/consignments" },
                ].map((stat, i) => (
                    <Link
                        key={i}
                        href={stat.link}
                        className={`glass-card p-8 group hover:translate-y-[-4px] transition-all duration-300 border-b-2 ${stat.border} cursor-pointer block`}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                            <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        {stat.sub && <p className="text-[9px] text-emerald-400/60 font-medium mt-2">{stat.sub}</p>}
                    </Link>
                ))}
            </div>

            {/* Grid Principal: Movimentos e Ações */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Coluna de Pedidos (8 colunas) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Últimos Movimentos</h2>
                        </div>
                        <Link href="/portal/orders" className="text-[10px] font-black text-gray-400 hover:text-amber-500 transition-colors uppercase tracking-widest flex items-center gap-2">
                            Ver Histórico Completo <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {activities.length > 0 ? activities.map((activity) => (
                            <Link
                                key={activity.id}
                                href={activity.type === 'order' ? `/portal/orders/${activity.id}` : `/portal/tickets/${activity.id}`}
                                className="glass-card p-5 group flex items-center justify-between hover:bg-white/5 transition-all border border-white/5 cursor-pointer block"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-xl ${activity.type === 'order' ? 'bg-blue-400/10 text-blue-400' : 'bg-red-400/10 text-red-400'}`}>
                                        {activity.type === 'order' ? <Package className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold uppercase italic tracking-tight text-sm leading-tight">{activity.title}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                            {activity.protocol} • {activity.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${getStatusColor(activity.status)}`}>
                                        {activity.status}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                                </div>
                            </Link>
                        )) : (
                            <div className="glass-card min-h-[300px] flex flex-col items-center justify-center p-12 text-center border-dashed border-white/5">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                                    <Package className="w-10 h-10 text-gray-700" />
                                </div>
                                <p className="text-white font-bold text-lg mb-2">Nenhum pedido em trânsito</p>
                                <p className="text-gray-500 font-light max-w-xs text-sm">
                                    Seus novos pedidos e atualizações logísticas aparecerão aqui em tempo real.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna de Ações (4 colunas) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="px-2">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Ações Rápidas</h2>
                    </div>

                    <div className="space-y-4">
                        <Link href="/portal/new-order" className="btn-primary w-full py-5 rounded-2xl group shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20">
                            <PlusCircle className="w-5 h-5" />
                            SOLICITAR MATERIAIS
                        </Link>

                        <Link href="/portal/tickets/new" className="glass-card p-5 flex items-center gap-4 hover:bg-white/10 transition-all group border-l-4 border-l-red-500/50">
                            <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-white uppercase tracking-tight">Reportar Problema</p>
                                <p className="text-[10px] text-red-400/60 font-black uppercase">Trocas e Avarias</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                        </Link>

                        <Link href="/portal/help" className="glass-card p-5 flex items-center gap-4 hover:bg-white/10 transition-all group border-l-4 border-l-blue-500/50">
                            <div className="w-12 h-12 bg-blue-400/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-white uppercase tracking-tight">Central de Ajuda</p>
                                <p className="text-[10px] text-blue-400/60 font-black uppercase">Dúvidas Frequentes</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
