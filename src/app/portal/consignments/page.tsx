"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSchoolContext } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    ArrowLeft,
    Send,
    Box,
    Truck,
    AlertCircle,
    History,
    CheckCircle2
} from 'lucide-react';

export default function Consignments() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consignmentInfo, setConsignmentInfo] = useState({ percentage: 0, globalQty: 0, returnable: 0 });
    const [returns, setReturns] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        qty: '',
        tracking: '',
        notes: ''
    });

    useEffect(() => {
        fetchContextAndData();
    }, []);

    async function fetchContextAndData() {
        const schoolCtx = await getSchoolContext();
        if (!schoolCtx) return;

        // 1. Dados de Consignação
        const { data: school } = await supabase
            .from('schools')
            .select('consignment_percentage, global_order_qty')
            .eq('id', schoolCtx.id)
            .single();

        if (school) {
            const limit = Math.floor(school.global_order_qty * (school.consignment_percentage / 100));
            setConsignmentInfo({
                percentage: school.consignment_percentage,
                globalQty: school.global_order_qty,
                returnable: limit
            });
        }

        // 2. Histórico de Devoluções
        const { data: returnsData } = await supabase
            .from('returns')
            .select('*')
            .eq('school_id', schoolCtx.id)
            .order('created_at', { ascending: false });

        if (returnsData) setReturns(returnsData);
        setLoading(false);
    }

    async function handleSubmitReturn(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const schoolCtx = await getSchoolContext();
            if (!schoolCtx) throw new Error('Unidade não identificada');

            const { error } = await supabase.from('returns').insert({
                school_id: schoolCtx.id,
                quantity_returned: parseInt(formData.qty),
                tracking_code: formData.tracking,
                notes: formData.notes,
                status: 'PENDENTE_ENVIO'
            });

            if (error) throw error;

            alert('Encaminhamento de devolução registrado com sucesso!');
            setFormData({ qty: '', tracking: '', notes: '' });
            fetchContextAndData();
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-fade">
            {/* Header */}
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
                            Devolução <span className="text-emerald-400">Consignada</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-medium mt-2">Gerencie o envio de materiais não vendidos permitidos por contrato.</p>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
                    <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1 text-right">Limite de Devolução</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none text-right">
                            {consignmentInfo.returnable} Unid. <span className="text-xs text-gray-600 font-bold">({consignmentInfo.percentage}%)</span>
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card p-8 space-y-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                    <Box className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Novo Encaminhamento</h3>
                            </div>

                            <form onSubmit={handleSubmitReturn} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantidade a Devolver</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Ex: 50"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-400 outline-none transition-all font-black text-lg"
                                        value={formData.qty}
                                        onChange={e => setFormData({ ...formData, qty: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Código de Rastreio (Reenvio)</label>
                                    <div className="relative">
                                        <Truck className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="text"
                                            placeholder="Ex: QM123456789BR"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-400 outline-none transition-all uppercase font-bold"
                                            value={formData.tracking}
                                            onChange={e => setFormData({ ...formData, tracking: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Notas Adicionais</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Motivo da devolução ou detalhes sobre os itens..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-400 outline-none transition-all resize-none text-xs font-medium"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="btn-primary w-full py-5 rounded-2xl group border-none bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    <span className="font-black italic tracking-tighter text-lg">{isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR DEVOLUÇÃO'}</span>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8">
                        <div className="flex items-center gap-2 text-emerald-500 mb-3">
                            <AlertCircle className="w-4 h-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Informação Importante</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                            As devoluções estão sujeitas à conferência no Centro de Distribuição do Cidade Viva Education. Apenas materiais em perfeito estado serão aceitos para estorno do consignado.
                        </p>
                    </div>
                </div>

                {/* History Column */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <History className="w-4 h-4 text-gray-500" />
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Histórico de Encaminhamentos</h3>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center animate-pulse text-gray-700 font-black uppercase tracking-widest text-[10px]">Lendo Registro de Devoluções...</div>
                    ) : returns.length === 0 ? (
                        <div className="glass-card p-20 text-center border-dashed border-white/5">
                            <Box className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Nenhuma devolução registrada.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {returns.map(ret => (
                                <div key={ret.id} className="glass-card p-6 group hover:bg-white/5 transition-all border border-white/5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/30"></div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black italic uppercase tracking-tighter text-lg leading-none mb-1">
                                                    Retorno de {ret.quantity_returned} Unids.
                                                </h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    Rastreio: {ret.tracking_code || 'Não informado'} • {new Date(ret.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${ret.status === 'RECEBIDO' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                                            <CheckCircle2 className="w-3 h-3" />
                                            {ret.status}
                                        </div>
                                    </div>
                                    {ret.notes && (
                                        <p className="mt-4 text-[11px] text-gray-500 font-medium leading-relaxed bg-white/5 p-4 rounded-xl border-l-2 border-l-emerald-500/20 italic">
                                            "{ret.notes}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
