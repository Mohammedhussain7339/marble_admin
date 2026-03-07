"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  Inbox,
} from "lucide-react";

import {
  marble_products_api,
  marble_orders_api_url,
} from "./api/apis";

import {
  getAllEnquiries,
  getNewEnquiryCount,
  Enquiry,
} from "@/app/lib/api/customizeget";

export default function AdminDashboardPage() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        /* Products */
        const productRes = await fetch(marble_products_api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: "list_products" }),
        });
        const productData = await productRes.json();
        setTotalProducts(productData.products?.length || 0);

        /* Orders */
        const orderRes = await fetch(marble_orders_api_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: "list_orders" }),
        });
        const orderData = await orderRes.json();
        setTotalOrders(orderData.orders?.length || 0);

        /* Enquiries */
        const enquiryList = await getAllEnquiries();
        setEnquiries(enquiryList);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const totalEnquiries = enquiries.length;
  const newEnquiries = getNewEnquiryCount(enquiries);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of products, enquiries, and orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Products"
          value={loading ? "…" : totalProducts}
          icon={Package}
          color="bg-blue-100 text-blue-600"
        />

        <DashboardCard
          title="New Enquiries"
          value={loading ? "…" : newEnquiries}
          icon={Inbox}
          color="bg-green-100 text-green-600"
        />

        <DashboardCard
          title="Total Enquiries"
          value={loading ? "…" : totalEnquiries}
          icon={MessageSquare}
          color="bg-purple-100 text-purple-600"
        />

        <DashboardCard
          title="Orders"
          value={loading ? "…" : totalOrders}
          icon={ShoppingCart}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-sm text-gray-600">
          <li>• New enquiry received</li>
          <li>• Product added</li>
          <li>• Order placed</li>
          <li>• Enquiry status updated</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- Dashboard Card ---------- */
interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
}

function DashboardCard({ title, value, icon: Icon, color }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 hover:shadow-lg transition">
      <div
        className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon size={22} />
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-semibold text-gray-900">
          {value}
        </h2>
      </div>
    </div>
  );
}
