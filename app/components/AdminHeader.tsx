"use client";

import { Menu, Bell, Search, User } from "lucide-react";
import Link from "next/link";

export default function AdminHeader({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-600 text-white flex items-center justify-center font-bold">
            M
          </div>
          <h1 className="text-lg font-semibold tracking-wide">
          <Link href="/"> Marble Legacy </Link>
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search (desktop only) */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm ml-2 w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
          A
        </div>
      </div>
    </header>
  );
}
