"use client";

import { ReactNode } from "react";
import { Menubar } from "@/components/Menubar";

interface LayoutClientProps {
  children: ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Menubar />
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl h-full">{children}</div>
      </div>
    </div>
  );
}
