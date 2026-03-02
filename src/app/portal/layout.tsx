"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PortalNavigation from '@/components/PortalNavigation';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const schoolId = localStorage.getItem('school_portal_id');
      const { data: { session } } = await supabase.auth.getSession();

      if (!schoolId && !session) {
        router.push('/');
        return;
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1222]">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1222] text-white">
      <main className="animate-fade py-8 max-w-7xl mx-auto px-6">
        <PortalNavigation />
        {children}
      </main>
    </div>
  );
}
