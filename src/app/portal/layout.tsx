import PortalNavigation from '@/components/PortalNavigation';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b1222] text-white">
      {/* O Navbar global já cuida do header, mas adicionamos a navegação local do portal */}
      <main className="animate-fade py-8 max-w-7xl mx-auto px-6">
        <PortalNavigation />
        {children}
      </main>
    </div>
  );
}
