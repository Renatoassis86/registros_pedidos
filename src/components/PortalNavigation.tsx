"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function PortalNavigation() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dados Gerais', href: '/portal', icon: LayoutDashboard },
        { name: 'Pedidos Complementares', href: '/portal/orders', icon: ShoppingBag },
        { name: 'Registro de Ocorrências', href: '/portal/tickets', icon: AlertTriangle },
    ];

    return (
        <nav className="mb-12">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 flex flex-col md:flex-row items-center gap-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto justify-center ${isActive
                                    ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-gray-600'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
