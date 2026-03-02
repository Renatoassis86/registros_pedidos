"use client";
export const dynamic = 'force-dynamic';
import Link from 'next/link';

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard py-10">
            <header className="page-header mb-12 space-y-4">
                <div className="flex items-center gap-3 text-red-400 mb-2">
                    <div className="p-1.5 bg-red-400/10 rounded-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Área de Controle Restrita</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                    Portal do <span className="text-amber-500">Administrador</span>
                </h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-2xl text-left">
                    Este acesso é exclusivo para os administradores do <span className="text-white border-b border-amber-500/30">Cidade Viva Education</span>. Gerencie pedidos, ocorrências e logística escolar através deste painel de controle centralizado.
                </p>
            </header>

            <div className="stats-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="card stat-box bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                    <span className="label text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block text-left">Escolas Ativas</span>
                    <span className="number text-4xl font-black text-white italic tracking-tighter block text-left">25</span>
                    <div className="trend positive text-emerald-400 text-[10px] font-bold mt-2 text-left">↑ 12% este mês</div>
                </div>

                <div className="card stat-box bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                    <span className="label text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block text-left">Pedidos Pendentes</span>
                    <span className="number text-4xl font-black text-white italic tracking-tighter block text-left">08</span>
                    <div className="trend text-amber-500 text-[10px] font-bold mt-2 text-left">Aguardando separação</div>
                </div>

                <div className="card stat-box bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                    <span className="label text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block text-left">Ocorrências Abertas</span>
                    <span className="number text-4xl font-black text-white italic tracking-tighter block text-left">03</span>
                    <div className="trend negative text-red-400 text-[10px] font-bold mt-2 text-left">Críticas: 01</div>
                </div>

                <div className="card stat-box bg-amber-500 p-8 rounded-2xl relative overflow-hidden group shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all">
                    <span className="label text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 block text-left">Faturamento Total</span>
                    <span className="number text-4xl font-black text-slate-950 italic tracking-tighter block text-left">R$ 142k</span>
                    <div className="trend text-slate-800 text-[10px] font-bold mt-2 text-left">Previsão 2026</div>
                </div>
            </div>

            <div className="admin-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="card recent-activity lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-6">Alertas Operacionais</h3>
                    <ul className="activity-list space-y-4">
                        <li className="activity-item flex items-start gap-5 p-4 bg-white/2 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                            <span className="dot warning w-3 h-3 bg-amber-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                            <div className="info flex-grow">
                                <strong className="text-white text-sm uppercase italic font-black">Nova Ocorrência: Colégio Gauss</strong>
                                <p className="text-xs text-gray-500 tracking-tight mt-1">Livros danificados no protocolo REQ-2026-1042</p>
                            </div>
                            <span className="time text-[10px] font-bold text-gray-600 uppercase tracking-widest">10 min atrás</span>
                        </li>
                        <li className="activity-item flex items-start gap-5 p-4 bg-white/2 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                            <span className="dot success w-3 h-3 bg-emerald-400 rounded-full mt-1.5 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                            <div className="info flex-grow">
                                <strong className="text-white text-sm uppercase italic font-black">Pedido Enviado: Escola Coram Deo</strong>
                                <p className="text-xs text-gray-500 tracking-tight mt-1">Kit Completo Infantil 3 despachado via Transportadora</p>
                            </div>
                            <span className="time text-[10px] font-bold text-gray-600 uppercase tracking-widest">2 horas atrás</span>
                        </li>
                    </ul>
                </div>

                <div className="card quick-access lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-4">Gestão de Acesso</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8 leading-relaxed">Links rápidos para as tarefas frequentes do administrador.</p>
                    <div className="grid-links grid grid-cols-1 gap-3">
                        <Link href="/admin/schools" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-amber-500 rounded-xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group">
                            <span className="opacity-60 group-hover:opacity-100">👥</span> Gerenciar Escolas
                        </Link>
                        <Link href="/admin/inventory" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-amber-500 rounded-xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group">
                            <span className="opacity-60 group-hover:opacity-100">📑</span> Vitrine & Preços
                        </Link>
                        <Link href="/admin/orders" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-amber-500 rounded-xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group">
                            <span className="opacity-60 group-hover:opacity-100">🚢</span> Logística de Envio
                        </Link>
                        <Link href="/admin/reports" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-amber-500 rounded-xl text-[10px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-widest transition-all group">
                            <span className="opacity-60 group-hover:opacity-100">📊</span> Relatórios CSV
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
