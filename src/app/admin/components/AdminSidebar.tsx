"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  School,
  Users,
  Truck,
  AlertTriangle,
  LogOut,
  ExternalLink
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Vitrine de Produtos', href: '/admin/inventory', icon: ShoppingBag },
    { name: 'Escolas', href: '/admin/schools', icon: School },
    { name: 'Usuários', href: '/admin/users', icon: Users },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Controle Logístico', href: '/admin/logistics', icon: Truck },
    { name: 'Ocorrências', href: '/admin/tickets', icon: AlertTriangle },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#0b1222] border-r border-white/5 fixed left-0 top-0 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <span className="text-slate-950 font-black text-xl italic leading-none">CV</span>
          </div>
          <div>
            <h2 className="text-white font-black italic uppercase tracking-tighter text-lg leading-none">Admin</h2>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <nav className="flex-grow px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${isActive
                ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/10'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-gray-600 group-hover:text-amber-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-6 mt-auto border-t border-white/5 space-y-2">
        <Link
          href="/portal"
          className="flex items-center gap-4 px-6 py-3 rounded-xl text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all hover:bg-white/5 group"
        >
          <ExternalLink className="w-4 h-4 text-gray-700 group-hover:text-blue-400" />
          Ir para o Portal
        </Link>
        <button className="w-full flex items-center gap-4 px-6 py-3 rounded-xl text-[9px] font-black text-gray-500 hover:text-red-400 uppercase tracking-widest transition-all hover:bg-red-400/5 group">
          <LogOut className="w-4 h-4 text-gray-700 group-hover:text-red-400" />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
}
