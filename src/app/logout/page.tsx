"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogoutPage() {
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      } finally {
        // Garante o redirecionamento mesmo se o logout falhar
        router.push('/login');
      }
    };

    performLogout();
  }, [auth, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <p className="mt-2 font-semibold">Saindo...</p>
      </div>
    </div>
  );
}
