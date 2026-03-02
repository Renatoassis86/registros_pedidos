"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
    Truck,
    Search,
    Plus,
    FileText,
    ChevronRight,
    Calendar,
    Hash,
    Filter,
    Package,
    ArrowUpRight,
    MapPin,
    AlertCircle,
    Trello,
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
    schools: { name: string };
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOrder, setNewOrder] = useState({ schoolId: '', productId: '', qty: 1, notes: '' });

    useEffect(() => {
        fetchOrders();
        fetchSchoolsAndProducts();
    }, []);

    async function fetchSchoolsAndProducts() {
        const { data: schoolsData } = await supabase.from('schools').select('id, name').order('name');
        const { data: productsData } = await supabase.from('products').select('id, name, price').eq('active', true);
        if (schoolsData) setSchools(schoolsData);
        if (productsData) setProducts(productsData);
    }

    async function fetchOrders() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, schools(name)')
                .order('created_at', { ascending: false });

            if (data) setOrders(data as any);
            if (error) console.error('Erro ao buscar pedidos:', error);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateInitialOrder(e: React.FormEvent) {
        e.preventDefault();
        const product = products.find(p => p.id === newOrder.productId);
        const protocol = `INI-${Date.now().toString().slice(-6)}`;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                protocol,
                school_id: newOrder.schoolId,
                type: 'contract_initial',
                status: 'approved',
                total_amount: (product?.price || 0) * newOrder.qty,
                notes: newOrder.notes
            })
            .select()
            .single();

        if (order) {
            await supabase.from('order_items').insert({
                order_id: order.id,
                product_id: newOrder.productId,
                qty: newOrder.qty,
                unit_price: product?.price || 0
            });
            setIsModalOpen(false);
            fetchOrders();
            setNewOrder({ schoolId: '', productId: '', qty: 1, notes: '' });
        }
    }

    const getStatusInfo = (status: string) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'submitted': return { label: 'Submetido', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
            case 'approved': return { label: 'Aprovado', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
            case 'separated': return { label: 'Em Separação', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
            case 'shipped': return { label: 'Em Trânsito', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' };
            case 'delivered': return { label: 'Entregue', color: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30' };
            case 'canceled': return { label: 'Cancelado', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
            default: return { label: status, color: 'text-gray-400 bg-white/5 border-white/10' };
        }
    };

    const filteredOrders = orders.filter(o =>
        o.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.schools?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade">
            {/* Header / Barra de Ações */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                            <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logística Operacional</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                        Gestão de <span className="text-amber-500">Pedidos</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl">
                        Controle total sobre o fluxo de suprimentos e materiais escolares do ecossistema.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
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
                        href="/admin/orders/kanban"
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:border-amber-500 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all shadow-xl active:scale-95"
                    >
                        <Trello className="w-4 h-4 text-amber-500" />
                        Jornada Kanban
                    </Link>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-[10px] font-black text-slate-950 uppercase tracking-widest transition-all shadow-xl shadow-amber-500/10 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Pedido
                    </button>
                </div>
            </header>

            {/* Listagem de Pedidos de Alta Performance */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center space-y-4 glass-card border-white/5">
                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest leading-none">Analisando Fluxo Logístico...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-20 text-center border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-6">
                            <Package className="w-12 h-12 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Sem movimentações</h3>
                        <p className="text-gray-500 text-sm max-w-sm mt-2">Não encontramos registros de pedidos para os filtros aplicados.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const status = getStatusInfo(order.status);
                        return (
                            <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="glass-card hover:bg-white/5 transition-all group overflow-hidden border border-white/5 p-1 relative block"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-white/2 rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 transition-all shrink-0">
                                            <Package className="w-8 h-8 text-gray-700 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <div className="flex flex-wrap items-center gap-3 text-left">
                                                <h4 className="text-white font-black italic uppercase tracking-tighter text-2xl leading-none">
                                                    {order.protocol}
                                                </h4>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {status.label}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${order.type === 'contract_initial' ? 'bg-amber-500/10 text-amber-500' :
                                                        order.type === 'occurrence' ? 'bg-red-400/10 text-red-400' :
                                                            'bg-blue-400/10 text-blue-400'
                                                    }`}>
                                                    {order.type === 'contract_initial' ? 'Contratual' :
                                                        order.type === 'occurrence' ? 'Ocorrência' :
                                                            'Complementar'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2 text-left">
                                                <span className="text-sm font-black text-amber-500 uppercase tracking-tighter truncate max-w-md">
                                                    {order.schools?.name}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">
                                                <div className="flex items-center gap-2 text-white/80"><Hash className="w-3.5 h-3.5 text-amber-500/80" /> R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-700" /> Registro em {new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                                                <div className="flex items-center gap-2"><ArrowUpRight className="w-3.5 h-3.5 text-gray-700" /> Registro Logístico</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end gap-10 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto text-left">
                                        <div className="lg:text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-right">Controle Logístico</p>
                                            <p className="text-xs font-bold text-gray-400 flex items-center gap-2 justify-end">
                                                <ChevronRight className="w-3 h-3" />
                                                Gerenciar Etapas
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-amber-500 rounded-2xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-amber-500/10">
                                            Ver Detalhes
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Evolução de Pedidos (Global / Por Unidade) */}
            <div className="pt-20 border-t border-white/5">
                <OrderEvolution isAdmin={true} />
            </div>

            {/* Modal de Novo Pedido - Redesenhado */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#0b1222]/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="glass-card w-full max-w-lg p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-8">
                            <header className="space-y-2 text-left">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                                    Lançar <span className="text-amber-500">Pedido Base</span>
                                </h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Inicie um novo fornecimento de contrato para unidade.</p>
                            </header>

                            <form onSubmit={handleCreateInitialOrder} className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Unidade Destino</label>
                                    <select
                                        required
                                        value={newOrder.schoolId}
                                        onChange={e => setNewOrder({ ...newOrder, schoolId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-300 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">Escolher Unidade...</option>
                                        {schools.map(s => <option key={s.id} value={s.id} className="bg-slate-900 italic font-bold">{s.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Kit / Material</label>
                                        <select
                                            required
                                            value={newOrder.productId}
                                            onChange={e => setNewOrder({ ...newOrder, productId: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-gray-300 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">Selecionar...</option>
                                            {products.map(p => <option key={p.id} value={p.id} className="bg-slate-900 italic font-bold">{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Quantidade</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={newOrder.qty}
                                            onChange={e => setNewOrder({ ...newOrder, qty: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-amber-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Notas Administrativas</label>
                                    <textarea
                                        rows={2}
                                        value={newOrder.notes}
                                        onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                                        placeholder="Ex: Entrega prioritária contratual..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-amber-500 outline-none transition-all resize-none placeholder:text-gray-700"
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-4 pt-4 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-grow py-4 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-grow-[2] bg-amber-500 hover:bg-amber-600 py-4 rounded-2xl text-[10px] font-black text-slate-950 uppercase tracking-widest transition-all shadow-xl shadow-amber-500/10 active:scale-95"
                                    >
                                        Efetivar Pedido
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
