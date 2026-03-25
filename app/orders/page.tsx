"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllOrders, updateOrderStatus } from "@/app/lib/api/orders";
import ConfirmModal from "@/app/components/models/Model";

export default function AdminOrders() {
  const router = useRouter();

  // ✅ ALL hooks at top
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    getAllOrders()
      .then((data) => setOrders(data.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const filteredOrders = orders
    // 🔍 SEARCH (order_id / user_id)
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        o.order_id.toLowerCase().includes(q) ||
        o.user_id.toLowerCase().includes(q)
      );
    })

    // 🎯 STATUS FILTER
    .filter((o) => {
      if (statusFilter === "ALL") return true;
      return o.status === statusFilter;
    })

    // 📅 DATE RANGE FILTER
    .filter((o) => {
      const orderDate = new Date(o.created_at).getTime();
      const from = fromDate ? new Date(fromDate).getTime() : null;
      const to = toDate ? new Date(toDate).getTime() : null;

      if (from && orderDate < from) return false;
      if (to && orderDate > to) return false;
      return true;
    })

    // ⬇️ DATE SORT (LATEST FIRST)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

  // ✅ Confirm handler
  const handleConfirmUpdate = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      await updateOrderStatus(
        selectedOrder.order_id,
        selectedOrder.user_id,
        selectedOrder.status
      );
    } catch (err) {
      alert("Order update failed");
      console.error(err);
    } finally {
      setUpdating(false);
      setConfirmOpen(false);
      setSelectedOrder(null);
    }
  };

  // ✅ Safe returns AFTER hooks
  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search Order ID / User ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 text-sm rounded w-60"
        />

        {/* STATUS */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 text-sm rounded"
        >
          <option value="ALL">All Status</option>
          <option value="CREATED">Created</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* FROM DATE */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 text-sm rounded"
        />

        {/* TO DATE */}
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 text-sm rounded"
        />

        {/* RESET */}
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("ALL");
            setFromDate("");
            setToDate("");
          }}
          className="text-sm px-4 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Order ID</th>
            <th className="p-2">User</th>
            <th className="p-2">Status</th>
            <th className="p-2">Items</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody className="">
          {filteredOrders.map((order) => {
            console.log(order)
            if (!order.payable_amount) return;
            return (
              <tr key={order.order_id} className="border-t ">
                <td className="p-2 font-mono text-xs">
                  {order.order_id.slice(0, 10)}...
                </td>

                <td className="p-2 text-xs">
                  {order.user_id.slice(0, 8)}...
                </td>

                <td className="p-2">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      const value = e.target.value;
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.order_id === order.order_id
                            ? { ...o, status: value }
                            : o
                        )
                      );
                    }}
                    className="border text-xs px-2 py-1 rounded"
                  >
                    <option value="CREATED">Created</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>

                <td className="p-2 text-center">
                  {order.orders?.length || 0}
                </td>

                <td className="p-2 text-xs font-semibold">
                  ₹{(order.payable_amount).toLocaleString()}
                </td>

                <td className="p-2 text-xs">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>

                <td className="p-2 flex gap-3">
                  <button
                    onClick={() =>
                      router.push(`/orders/${order.order_id}`)
                    }
                    className="text-green-600 text-sm cursor-pointer"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setConfirmOpen(true);
                    }}
                    className="text-blue-600 text-sm cursor-pointer"
                  >
                    Update
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* ✅ Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Update Order Status"
        description={`Are you sure you want to update this order to "${selectedOrder?.status}"?`}
        confirmText="Yes, Update"
        cancelText="No"
        loading={updating}
        onConfirm={handleConfirmUpdate}
        onCancel={() => {
          if (!updating) {
            setConfirmOpen(false);
            setSelectedOrder(null);
          }
        }}
      />
    </div>
  );
}
