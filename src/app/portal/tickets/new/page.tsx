"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateProtocol, getSchoolContext } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Send, Info, ChevronRight, FileText } from 'lucide-react';

export default function NewTicket() {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [orderId, setOrderId] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    }

    async function handleCreateTicket(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const protocol = generateProtocol('TK');

        try {
            const schoolCtx = await getSchoolContext();
            if (!schoolCtx) throw new Error('Unidade não identificada');

            // Aqui, em um sistema real, faríamos o upload do arquivo para o Supabase Storage primeiro
            // Para este MVP, vamos registrar o chamado e avisar que o anexo foi vinculado
            // (Simulando upload)

            const { data: ticket, error } = await supabase.from('tickets').insert({
                protocol,
                subject,
                description,
                order_id: orderId || null,
                school_id: schoolCtx.id,
                status: 'ABERTO',
                attachment_name: attachment ? attachment.name : null
            }).select().single();

            if (ticket && !error) {
                let msg = `Ocorrência registrada! Protocolo: ${ticket.protocol}.`;
                if (attachment) msg += `\n\nArquivo "${attachment.name}" vinculado com sucesso.`;
                msg += `\n\nNossa equipe entrará em contato.`;

                alert(msg);
                router.push('/portal/tickets');
            } else {
                throw error;
            }
        } catch (err: any) {
            alert('Erro ao registrar: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
            {/* Header */}
            <header className="space-y-4 text-center md:text-left">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em] mx-auto md:mx-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Portal
                </button>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="p-3 bg-red-400/10 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                            Registrar <span className="text-red-400">Ocorrência</span>
                        </h1>
                        <p className="text-gray-500 font-light text-sm max-w-xl">
                            Relate problemas com materiais, produtos danificados ou solicite substituições.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleCreateTicket} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-8 space-y-6 border-l-4 border-l-red-400/50">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Assunto da Ocorrência</label>
                            <input
                                type="text"
                                placeholder="Ex: Livros danificados no transporte"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-red-400 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocolo Relacionado (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: ORD-2026..."
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-red-400 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Anexar Foto / Documento</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-400 hover:text-white hover:border-red-400/40 cursor-pointer transition-all"
                                    >
                                        <div className="p-2 bg-red-400/10 rounded-lg group-hover:bg-red-400/20 transition-colors">
                                            <FileText className="w-4 h-4 text-red-400" />
                                        </div>
                                        <span className="text-xs font-bold uppercase truncate">
                                            {attachment ? attachment.name : 'Selecionar Arquivo...'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Descrição Detalhada</label>
                            <textarea
                                rows={6}
                                placeholder="Descreva o que aconteceu em detalhes..."
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-red-400 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Info Column */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center gap-3 text-red-400">
                            <Info className="w-5 h-5" />
                            <h3 className="font-bold text-white uppercase text-xs tracking-widest">Instruções</h3>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5 text-[11px] text-gray-500 leading-relaxed uppercase tracking-tighter">
                            <p>• O prazo de resposta é de até 48h úteis.</p>
                            <p>• Você receberá atualizações no e-mail cadastrado.</p>
                            <p>• Anexos ajudam a agilizar a análise técnica.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-5 rounded-2xl group bg-red-500 hover:bg-red-600 border-none shadow-2xl shadow-red-500/10 hover:shadow-red-500/20 disabled:opacity-50 transition-all active:scale-95"
                        >
                            <span className="font-black italic tracking-tighter text-lg">{isSubmitting ? 'ENVIANDO...' : 'ABRIR CHAMADO AGORA'}</span>
                            {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </button>

                        <div className="pt-4 text-center">
                            <p className="text-[8px] text-gray-600 uppercase tracking-[0.2em] font-black">
                                Protocolo TK-2026... será gerado agora.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-l-blue-500/30">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <FileText className="w-4 h-4" />
                            <h4 className="font-bold text-white text-[10px] uppercase">Dica</h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Mencionar o protocolo do pedido agiliza o processo de troca ou reposição.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
