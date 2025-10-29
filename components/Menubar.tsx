"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMenubar } from "@/contexts/MenubarContext";

export function Menubar() {
  const { userInfo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { title, isVisible } = useMenubar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleMenubar = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile */}
      {isVisible && (
        <div className="flex items-center justify-between sticky top-0 z-50 lg:hidden bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            {!isMenuOpen && (
              <button
                onClick={toggleMenubar}
                className=" left-4 top-4 z-50 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            {!!title && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            )}
          </div>

          {/* Mobile Sidebar */}
          <div className="lg:hidden">
            {/* Backdrop */}
            <div
              className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${
                isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar */}
            <nav
              className={`fixed left-0 top-0 z-40 h-full w-80 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex h-full flex-col p-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* User Info */}
                <div className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userInfo?.details?.first_name} {userInfo?.details?.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userInfo?.details?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 space-y-2">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-5 w-5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Top Menubar */}
      <nav className="sticky top-0 z-50 hidden border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>

            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-200">
                    {userInfo?.details?.first_name || userInfo?.details?.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="py-1" role="menu">
                      <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {userInfo?.details?.first_name} {userInfo?.details?.last_name}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {userInfo?.details?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
