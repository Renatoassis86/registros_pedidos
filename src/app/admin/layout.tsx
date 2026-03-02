"use client";
import AdminSidebar from "./components/AdminSidebar";
import AdminGuard from "./components/AdminGuard";
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname?.includes('/admin/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-content flex-grow">
          {children}
        </main>

        <style jsx>{`
          .admin-layout {
            display: flex;
            min-height: 100vh;
          }

          .admin-content {
            margin-left: 280px;
            flex: 1;
            padding: 3rem 4rem;
            background: #0b1222;
            min-height: 100vh;
          }
        `}</style>
      </div>
    </AdminGuard>
  );
}
