"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface MenubarContextType {
  isVisible: boolean;
  showMenubar: () => void;
  hideMenubar: () => void;
  title: string;
  setTitle: (title: string) => void;
}

export const MenubarContext = createContext<MenubarContextType | undefined>(undefined);

interface MenubarProviderProps {
  children: ReactNode;
}

export function MenubarProvider({ children }: MenubarProviderProps) {
  // Mobile sidebar is hidden by default
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");

  const showMenubar = () => setIsVisible(true);
  const hideMenubar = () => setIsVisible(false);

  return (
    <MenubarContext.Provider
      value={{ isVisible, showMenubar, hideMenubar, title, setTitle }}
    >
      {children}
    </MenubarContext.Provider>
  );
}

export const useMenubar = () => {
  const context = useContext(MenubarContext);
  if (context === undefined) {
    throw new Error("useMenubar must be used within a MenubarProvider");
  }
  return context;
};
