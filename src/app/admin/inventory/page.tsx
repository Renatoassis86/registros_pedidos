"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Plus, Trash2, Edit2, Check, X, Search, Layers, Box, Info, Building2, BookOpen } from 'lucide-react';

interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    active: boolean;
}

interface School {
    id: string;
    name: string;
}

interface KitConfig {
    school_id: string;
    school_name: string;
    kit_id: string;
    kit_name: string;
    custom_price: number;
    components: string[];
}

export default function AdminInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [kitConfigs, setKitConfigs] = useState<KitConfig[]>([]);
    const [loading, setLoading] = useState(true);

    // Modais
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);

    // Estado para novo/editando produto
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        sku: '',
        name: '',
        category: 'Material Didático',
        price: 0,
        active: true
    });

    // Estado para Composição por Escola
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedParentProduct, setSelectedParentProduct] = useState('');
    const [compositionIds, setCompositionIds] = useState<string[]>([]);
    const [schoolPrice, setSchoolPrice] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Sincronizar dados quando escola ou kit mudar
    useEffect(() => {
        if (selectedSchool && selectedParentProduct) {
            fetchExistingConfig();
        } else {
            setCompositionIds([]);
            setSchoolPrice(0);
        }
    }, [selectedSchool, selectedParentProduct]);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const [prodRes, schoolRes, configRes, compRes] = await Promise.all([
                supabase.from('products').select('*').order('name'),
                supabase.from('schools').select('id, name').order('name'),
                supabase.from('school_products').select('*, schools(name), products(name)'),
                supabase.from('kit_compositions').select('*, products:component_product_id(name)')
            ]);

            if (prodRes.data) setProducts(prodRes.data);
            if (schoolRes.data) setSchools(schoolRes.data);

            if (configRes.data) {
                const combinedConfigs: KitConfig[] = configRes.data.map(config => {
                    const schoolMatch = config.schools as any;
                    const productMatch = config.products as any;

                    // Filtrar componentes para este kit/escola
                    const components = compRes.data
                        ? compRes.data
                            .filter((c: any) => c.school_id === config.school_id && c.parent_product_id === config.product_id)
                            .map((c: any) => c.products?.name)
                        : [];

                    return {
                        school_id: config.school_id,
                        school_name: schoolMatch?.name || '---',
                        kit_id: config.product_id,
                        kit_name: productMatch?.name || '---',
                        custom_price: config.custom_price,
                        components: components
                    };
                });
                setKitConfigs(combinedConfigs);
            }
        } catch (err: any) {
            console.error('Erro Fatal Fetch:', err.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchExistingConfig() {
        const { data: priceData } = await supabase
            .from('school_products')
            .select('custom_price')
            .eq('school_id', selectedSchool)
            .eq('product_id', selectedParentProduct)
            .single();

        if (priceData) setSchoolPrice(Number(priceData.custom_price));
        else {
            const baseProd = products.find(p => p.id === selectedParentProduct);
            setSchoolPrice(baseProd?.price || 0);
        }

        const { data: compData } = await supabase
            .from('kit_compositions')
            .select('component_product_id')
            .eq('school_id', selectedSchool)
            .eq('parent_product_id', selectedParentProduct);

        if (compData && compData.length > 0) {
            setCompositionIds(compData.map(c => c.component_product_id));
        } else {
            setCompositionIds([]);
        }
    }

    async function handleSaveProduct(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            sku: productForm.sku,
            name: productForm.name,
            category: productForm.category,
            price: productForm.price,
            active: productForm.active
        };

        let error;
        if (editingProduct) {
            const res = await supabase.from('products').update(payload).eq('id', editingProduct.id);
            error = res.error;
        } else {
            const res = await supabase.from('products').insert(payload);
            error = res.error;
        }

        if (!error) {
            setIsProductModalOpen(false);
            setEditingProduct(null);
            fetchInitialData();
        } else {
            alert('Erro: ' + error.message);
        }
    }

    async function handleEditConfig(config: KitConfig) {
        setSelectedSchool(config.school_id);
        setSelectedParentProduct(config.kit_id);
        setIsCompositionModalOpen(true);
        // O useEffect tratará de carregar os itens marcados e o preço via fetchExistingConfig
    }

    async function handleSaveComposition(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedSchool || !selectedParentProduct) {
            alert('Selecione uma escola e um kit primeiro!');
            return;
        }

        setLoading(true);
        await supabase.from('school_products').upsert({
            school_id: selectedSchool,
            product_id: selectedParentProduct,
            custom_price: schoolPrice,
            active: true
        }, { onConflict: 'school_id, product_id' });

        await supabase.from('kit_compositions').delete().eq('school_id', selectedSchool).eq('parent_product_id', selectedParentProduct);

        if (compositionIds.length > 0) {
            const items = compositionIds.map(id => ({
                school_id: selectedSchool,
                parent_product_id: selectedParentProduct,
                component_product_id: id,
                qty: 1
            }));
            await supabase.from('kit_compositions').insert(items);
        }

        await fetchInitialData();
        setLoading(false);
        alert('Kit configurado com sucesso para esta unidade!');
        setIsCompositionModalOpen(false);
    }

    async function handleDeleteConfig(schoolId: string, kitId: string) {
        if (!confirm('Deseja realmente remover esta configuração de kit desta escola?')) return;

        setLoading(true);
        await Promise.all([
            supabase.from('school_products').delete().eq('school_id', schoolId).eq('product_id', kitId),
            supabase.from('kit_compositions').delete().eq('school_id', schoolId).eq('parent_product_id', kitId)
        ]);
        await fetchInitialData();
        setLoading(false);
    }

    const toggleItem = (id: string) => {
        setCompositionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const componentList = products.filter(p => !p.sku.includes('KIT'))
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="animate-fade px-6 max-w-7xl mx-auto pb-20">
            <header className="page-header flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Gestão de <span className="text-amber-500">Catálogo</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-3 font-medium">Configure a composição de cada kit individualmente por escola.</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn-outline border-amber-500/20 text-amber-500 hover:bg-amber-500/10 h-14 px-8 rounded-2xl flex items-center gap-3 transition-all" onClick={() => setIsCompositionModalOpen(true)}>
                        <Layers className="w-5 h-5" />
                        <span className="font-bold italic uppercase tracking-tighter">Montar Kit Escola</span>
                    </button>
                    <button className="btn-primary h-14 px-8 rounded-2xl flex items-center gap-3 shadow-xl shadow-amber-500/10" onClick={() => { setEditingProduct(null); setProductForm({ sku: '', name: '', category: 'Material Didático', price: 0, active: true }); setIsProductModalOpen(true); }}>
                        <Plus className="w-5 h-5" />
                        <span className="font-bold italic uppercase tracking-tighter">Novo Produto</span>
                    </button>
                </div>
            </header>

            {/* Grid de Kits Agrupados por Escola */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Box className="w-6 h-6 text-amber-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Kits Autorizados por Unidade</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {Object.values(kitConfigs.reduce((acc: any, config) => {
                        if (!acc[config.school_id]) {
                            acc[config.school_id] = {
                                name: config.school_name,
                                kits: []
                            };
                        }
                        acc[config.school_id].kits.push(config);
                        return acc;
                    }, {})).map((schoolGroup: any, idx) => (
                        <div key={idx} className="glass-card p-10 border-l-4 border-l-amber-500 bg-slate-900/40 backdrop-blur-xl transition-all">
                            <div className="flex items-center gap-3 text-amber-500 mb-8 border-b border-white/5 pb-4">
                                <Building2 className="w-6 h-6" />
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{schoolGroup.name}</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {schoolGroup.kits.map((config: KitConfig, kIdx: number) => (
                                    <div key={kIdx} className="bg-white/5 border border-white/5 rounded-3xl p-6 relative group hover:bg-white/10 transition-all border-l-4 border-l-amber-500/30">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{config.kit_name}</h4>
                                                <div className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-2">Valor de Venda no Portal</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-amber-500 font-mono font-black text-2xl">R$ {Number(config.custom_price).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <BookOpen className="w-3 h-3" /> Materiais Inclusos
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {config.components.length > 0 ? config.components.map((comp, i) => (
                                                    <span key={i} className="text-[9px] bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-tight">
                                                        {comp}
                                                    </span>
                                                )) : <span className="text-[9px] text-red-400 opacity-60 uppercase font-black italic">Nenhum item vinculado ainda</span>}
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEditConfig(config)}
                                                className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteConfig(config.school_id, config.kit_id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {kitConfigs.length === 0 && (
                        <div className="py-16 text-center bg-white/2 rounded-3xl border-2 border-dashed border-white/5">
                            <Layers className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Nenhum kit personalizado foi configurado até o momento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabela Geral de Produtos */}
            <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Cátalogo Geral de Materiais</h2>
            </div>
            <div className="card overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl">
                <table className="admin-table w-full border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">SKU / Código</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Descrição do Material</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Segmento</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Preço Base</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.filter(p => !p.sku.includes('KIT') && p.category !== 'KIT').map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-6 border-b border-white/5">
                                    <code className="bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ring-amber-500/20">{p.sku}</code>
                                </td>
                                <td className="px-6 py-6 border-b border-white/5">
                                    <span className="font-bold text-white uppercase italic tracking-tighter text-lg leading-none">{p.name}</span>
                                </td>
                                <td className="px-6 py-6 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-400 px-3 py-1.5 rounded-full border border-white/5">{p.category}</span>
                                </td>
                                <td className="px-6 py-6 border-b border-white/5">
                                    <span className="font-mono text-amber-500 font-black text-lg">R$ {Number(p.price).toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-6 border-b border-white/5 text-right">
                                    <button onClick={() => { setEditingProduct(p); setProductForm({ sku: p.sku, name: p.name, category: p.category, price: p.price, active: p.active }); setIsProductModalOpen(true); }} className="p-3 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Composição PERSONALIZADA POR ESCOLA */}
            {isCompositionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card max-w-2xl border-l-4 border-amber-500 animate-slide-up h-[90vh] flex flex-col p-8 bg-[#020617]">
                        <header className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">Configurar <span className="text-amber-500">Kit da Escola</span></h3>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mt-1">Defina o catálogo exclusivo para cada parceiro</p>
                            </div>
                            <button onClick={() => setIsCompositionModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="text-gray-500 hover:text-white" /></button>
                        </header>

                        <div className="grid grid-cols-2 gap-4 mb-6 shrink-0 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="space-y-1">
                                <label className="label-admin text-amber-500/60 font-black">1. Unidade de Destino</label>
                                <select className="input-admin border-amber-500/20" value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
                                    <option value="">Selecione a escola...</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="label-admin text-amber-500/60 font-black">2. Kit de Referência</label>
                                <select className="input-admin border-amber-500/20" value={selectedParentProduct} onChange={e => setSelectedParentProduct(e.target.value)}>
                                    <option value="">Selecione o Kit...</option>
                                    {products.filter(p => p.sku.includes('KIT')).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col gap-4">
                            <div className="flex justify-between items-center shrink-0">
                                <label className="label-admin m-0">3. Composição do Kit (Selecione os Livros)</label>
                                <div className="relative">
                                    <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input placeholder="BUSCAR LIVROS..." className="bg-white/5 border border-white/10 py-2 pl-8 pr-4 rounded-full text-[9px] text-white focus:border-amber-500 outline-none w-40" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b1222] rounded-2xl border border-white/5 p-4 space-y-2">
                                {componentList.map(item => (
                                    <label key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${compositionIds.includes(item.id) ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/2 border-white/5 hover:border-white/10'}`}>
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${compositionIds.includes(item.id) ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-transparent border-gray-700'}`}>
                                            {compositionIds.includes(item.id) && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-black italic uppercase tracking-tighter text-base leading-none">{item.name}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{item.sku} • {item.category}</div>
                                        </div>
                                        {compositionIds.includes(item.id) && (
                                            <div className="animate-pulse bg-amber-500/20 text-amber-500 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Incluso</div>
                                        )}
                                        <input type="checkbox" className="hidden" checked={compositionIds.includes(item.id)} onChange={() => toggleItem(item.id)} />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 bg-amber-500/5 -mx-8 -mb-8 p-8 rounded-b-[2rem] flex justify-between items-center shrink-0">
                            <div>
                                <label className="label-admin text-amber-500 text-xs font-black">4. Valor Contratual (R$)</label>
                                <p className="text-[9px] font-bold text-amber-500/40 uppercase">Preço Final deste Kit no Portal da Escola</p>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black italic text-amber-500/40">R$</span>
                                <input type="number" step="0.01" className="bg-[#0b1222] border-2 border-amber-500/30 rounded-2xl py-4 pl-12 pr-6 text-2xl font-mono font-black text-white w-52 text-right focus:border-amber-500 outline-none" value={schoolPrice} onChange={e => setSchoolPrice(parseFloat(e.target.value))} />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4 shrink-0">
                            <button onClick={() => setIsCompositionModalOpen(false)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">Cancelar</button>
                            <button onClick={handleSaveComposition} className="flex-[2] btn-primary h-14 italic font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20">SALVAR CONFIGURAÇÃO</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Produto (Novo/Editar) */}
            {isProductModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card max-w-lg border-l-4 border-amber-500 animate-slide-up p-10 bg-[#020617]">
                        <header className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{editingProduct ? 'Editar' : 'Cadastrar'} <span className="text-amber-500">Material</span></h3>
                            <button onClick={() => setIsProductModalOpen(false)}><X className="text-gray-500 hover:text-white" /></button>
                        </header>
                        <form onSubmit={handleSaveProduct} className="space-y-6">
                            <div className="space-y-1">
                                <label className="label-admin">Nome do Material / Livro</label>
                                <input required className="input-admin" placeholder="Ex: Livro de Português Vol. 1" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="label-admin">SKU (Código Único)</label>
                                    <input required className="input-admin font-mono uppercase" placeholder="SKU-001" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="label-admin">Preço Base (R$)</label>
                                    <input required type="number" step="0.01" className="input-admin font-mono" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-admin">Segmento / Categoria</label>
                                <select className="input-admin" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                    <option value="Infantil">Infantil</option>
                                    <option value="Fundamental I">Fundamental I</option>
                                    <option value="Fundamental II">Fundamental II</option>
                                    <option value=" Médio">Ensino Médio</option>
                                    <option value="Material Didático">Outros</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-10">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">Sair</button>
                                <button type="submit" className="flex-[2] btn-primary h-14 italic font-black text-lg rounded-2xl uppercase">Gravar Catálogo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .label-admin { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 0.5rem; }
                .input-admin { width: 100%; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 1.1rem 1.4rem; color: white; transition: all 0.2s; font-weight: 600; font-size: 0.95rem; }
                .input-admin:focus { border-color: #f59e0b; outline: none; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.96); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
                .modal-content { width: 100%; background: #020617; border: 1px solid #1e293b; border-radius: 2.5rem; box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.9); }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            `}</style>
        </div>
    );
}
