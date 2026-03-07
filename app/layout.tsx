'use client'
import "./globals.css";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useState } from "react";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-gray-100">
          <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          <div className="flex-1">
            <AdminHeader setSidebarOpen={setSidebarOpen} />
            <main className="p-6">{children}</main>
          </div>
        </div>

      </body>
    </html>
  );
}