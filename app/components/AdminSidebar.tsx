"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Box,
  Mail,
  PlusSquare,
} from "lucide-react";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Box },
  { name: "Create Products", href: "/addProduct", icon: PlusSquare },
  { name: "Enquiries", href: "/enquiries", icon: Mail },
  { name: "ContactUs ", href: "/contactus", icon: Mail },
  { name: "Orders", href: "/orders", icon: Mail },
  { name: "Banner", href: "/banner", icon: Mail },
];

export default function AdminSidebar({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50
          w-72 h-screen
          bg-white border-r
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo / Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b bg-gradient-to-r from-gray-900 to-gray-700 text-white">
          <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">
            M
          </div>
          <span className="text-lg font-semibold tracking-wide">
            Marble Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {menu.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                  transition-all duration-300
                  ${
                    active
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {/* Active Indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-white" />
                )}

                {/* Icon */}
                <div
                  className={`
                    h-9 w-9 rounded-lg flex items-center justify-center
                    transition-all duration-300
                    ${
                      active
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }
                  `}
                >
                  <Icon size={18} />
                </div>

                {/* Text */}
                <span className="font-medium tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
