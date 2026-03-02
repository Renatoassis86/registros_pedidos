import Link from "next/link";
import { MapPin, Clock, ArrowRight, Instagram, Globe, Phone } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-[#0b1222] text-white py-20 font-sans border-t border-white/5 relative z-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-16">
                    <div className="space-y-8">
                        <div className="relative w-48">
                            <img src="/logo-education.png" alt="Cidade Viva Education" className="w-full h-auto brightness-0 invert" />
                        </div>
                        <p className="text-sm text-gray-400 max-w-md leading-relaxed font-light">
                            O Cidade Viva Education é o pilar educacional da Fundação Cidade Viva.
                            Módulo de Gestão de Pedidos e Ocorrências para Escolas Parceiras.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="https://instagram.com/cidadeviva.education" target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-amber-600 transition-all border border-white/10 shadow-xl">
                                <Instagram className="h-5 w-5 text-gray-400 hover:text-white" />
                            </a>
                            <a href="https://cidadeviva.education/" target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-blue-600 transition-all border border-white/10 shadow-xl">
                                <Globe className="h-5 w-5 text-gray-400 hover:text-white" />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-6">Suporte</h3>
                            <div className="space-y-6 text-sm text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-amber-500" />
                                    <span>(83) 3044-7700</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-amber-500" />
                                    <span>Aeroclube, João Pessoa - PB</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-6">Links Úteis</h3>
                            <div className="flex flex-col gap-4 text-sm text-gray-400">
                                <Link href="/portal" className="hover:text-white flex items-center justify-between group">
                                    Portal da Escola <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                                <Link href="/admin" className="hover:text-white flex items-center justify-between group">
                                    Administrativo <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-12 border-t border-white/5 text-center text-xs text-gray-500">
                    © 2026 Cidade Viva Education. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};
