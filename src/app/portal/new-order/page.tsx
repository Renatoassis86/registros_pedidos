"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateProtocol, getSchoolContext } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, Send, Info, ChevronRight, Check } from 'lucide-react';

interface AvailableProduct {
    school_id: string;
    product_id: string;
    product_name: string;
    sku: string;
    category: string;
    final_price: number;
}

export default function NewOrderComplementary() {
    const router = useRouter();
    const [products, setProducts] = useState<AvailableProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuthorizedProducts();
    }, []);

    async function fetchAuthorizedProducts() {
        try {
            const schoolCtx = await getSchoolContext();
            if (!schoolCtx) return;

            // Buscar kits autorizados através da View
            const { data, error } = await supabase
                .from('available_school_kits')
                .select('*')
                .eq('school_id', schoolCtx.id);

            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching authorized products:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedProduct) return;
        setIsSubmitting(true);

        const product = products.find(p => p.product_id === selectedProduct);
        const protocol = generateProtocol('ORD');

        try {
            const schoolCtx = await getSchoolContext();
            if (!schoolCtx) throw new Error('Unidade não identificada');

            // Obter ID do usuário se estiver logado via Auth, senão null
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Criar o Pedido
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    protocol,
                    school_id: schoolCtx.id,
                    type: 'complementary',
                    status: 'submitted',
                    total_amount: (product?.final_price || 0) * quantity,
                    notes,
                    created_by: user?.id || null
                })
                .select()
                .single();

            if (order && !orderError) {
                // 2. Criar o Item do Pedido
                await supabase.from('order_items').insert({
                    order_id: order.id,
                    product_id: selectedProduct,
                    qty: quantity,
                    unit_price: product?.final_price || 0
                });

                // 3. Registrar no Outbox
                await supabase.from('email_outbox').insert({
                    order_id: order.id,
                    subject: `Novo Pedido: ${order.protocol} [${product?.product_name}]`,
                    body: `A escola ${schoolCtx.name} solicitou ${quantity}x ${product?.product_name}. Protocolo: ${order.protocol}`,
                    status: 'queued'
                });

                alert(`Pedido enviado com sucesso! Protocolo: ${order.protocol}`);
                router.push('/portal/orders');
            }
        } catch (error: any) {
            alert('Falha ao processar: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
            <header className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Portal
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Package className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                        Solicitar <span className="text-amber-500">Materiais</span>
                    </h1>
                </div>
                <p className="text-gray-500 text-sm font-medium">Abaixo estão listados apenas os kits e produtos vinculados à sua unidade.</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-8 space-y-8 border-l-4 border-l-amber-500 bg-slate-900/40 backdrop-blur-xl">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <ChevronRight className="w-3 h-3 text-amber-500" />
                                Escolha o Kit Autorizado
                            </label>

                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="py-10 text-center text-gray-600 uppercase text-[10px] font-black tracking-widest animate-pulse">Consultando seu catálogo...</div>
                                ) : products.length > 0 ? products.map(p => (
                                    <label
                                        key={p.product_id}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${selectedProduct === p.product_id ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-white/2 border-white/5 hover:border-white/10'}`}
                                        onClick={() => setSelectedProduct(p.product_id)}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedProduct === p.product_id ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-gray-700'}`}>
                                            {selectedProduct === p.product_id && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-black italic uppercase tracking-tighter text-lg leading-none">{p.product_name}</div>
                                            <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">{p.sku} • {p.category}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-amber-500 font-black font-mono text-sm leading-none">R$ {Number(p.final_price).toFixed(2)}</div>
                                            <div className="text-[8px] text-gray-600 uppercase mt-1">Valor Unitário</div>
                                        </div>
                                    </label>
                                )) : (
                                    <div className="py-10 text-center bg-white/2 rounded-2xl border border-dashed border-white/5">
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nenhum material vinculado à sua escola.</p>
                                        <p className="text-[9px] text-gray-600 mt-2 uppercase">Entre em contato com o administrativo.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantidade Desejada</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(parseInt(e.target.value))}
                                    required
                                    className="w-full bg-[#0b1222] border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-all font-mono font-bold text-xl"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                    <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Total Estimado</p>
                                    <p className="text-2xl font-black text-white italic tracking-tighter">
                                        R$ {((products.find(p => p.product_id === selectedProduct)?.final_price || 0) * quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Observações ou Motivo do Pedido</label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Ex: Alunos novos matriculados agora em Fevereiro..."
                                className="w-full bg-[#0b1222] border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-all resize-none text-sm font-medium"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 space-y-6 bg-slate-900/40 backdrop-blur-xl sticky top-6 border border-white/5">
                        <div className="flex items-center gap-3 text-amber-500">
                            <Info className="w-5 h-5" />
                            <h3 className="font-black text-white uppercase italic text-xs tracking-widest">Informações Logísticas</h3>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            <p>• O pedido passará por aprovação administrativa.</p>
                            <p>• O tempo de entrega é de 15 a 20 dias (a depender da região).</p>
                            <p>• Você receberá atualizações de status via e-mail e portal.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedProduct}
                            className="btn-primary w-full py-5 rounded-2xl group shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            <span className="font-black italic tracking-tighter text-lg">{isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR SOLICITAÇÃO'}</span>
                            {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </button>

                        <div className="pt-4 text-center">
                            <p className="text-[8px] text-gray-600 uppercase tracking-[0.2em] font-black">
                                Protocolo gerado automaticamente
                            </p>
                        </div>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            `}</style>
        </div>
    );
}
