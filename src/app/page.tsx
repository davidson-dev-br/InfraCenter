"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/datacenter");
  }, [router]);

  return (
     <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </div>
  )
}
