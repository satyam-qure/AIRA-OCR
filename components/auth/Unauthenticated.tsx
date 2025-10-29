"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Unauthenticated({ children }: { children: React.ReactNode }) {
  const { userInfo, isLoading, refetchProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      if (!isLoading && userInfo) {
        await refetchProfile();
        router.push("/upload");
      }
    };
    checkStatus();
  }, [userInfo, isLoading, refetchProfile, router]);

  if (isLoading || userInfo) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent dark:border-white"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
