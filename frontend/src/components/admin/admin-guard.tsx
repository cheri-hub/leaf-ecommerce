"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.roles?.includes("Admin");

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
