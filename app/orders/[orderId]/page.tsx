"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllOrders } from "@/app/lib/api/orders";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((data) => {
      const found = data.items?.find(
        (o: any) => o.order_id === orderId
      );
      setOrder(found || null);
      setLoading(false);
    });
  }, [orderId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6">Order not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="text-blue-600 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      {/* ORDER INFO */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-6">
        <p><b>Order ID:</b> {order.order_id}</p>
        <p><b>User ID:</b> {order.user_id}</p>
        <p><b>Status:</b> {order.status}</p>
        <p><b>Total Items:</b> {order.orders.length}</p>
        <p><b>Total Amount:</b> ₹{order.amount} {console.log(order.amount)}</p>
        <p>
          <b>Order Date:</b>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <hr className="my-4" />

      {/* ADDRESS */}
      <h2 className="font-semibold mb-3">Delivery Address</h2>

      <div className="border rounded p-4 text-sm space-y-1 mb-6">
        <p className="font-medium capitalize">
          {order.address.fullName}
        </p>
        <p className="capitalize">
          {order.address.addressLine1}
        </p>
        <p className="capitalize">
          {order.address.city}, {order.address.state} –{" "}
          {order.address.zip}
        </p>
        <p>
          <b>Mobile:</b> {order.address.mobileNumber}
        </p>
        <p className="text-gray-600">
          <b>Type:</b> {order.address.saveAs}
        </p>
      </div>

      <hr className="my-4" />

      {/* PRODUCTS */}
      <h2 className="font-semibold mb-3">Products</h2>

      {order.orders.map((item: any, i: number) => (
        <div
          key={i}
          className="flex gap-4 border-b py-3 last:border-none"
        >
          <img
            src={
              item.product_image?.[0]?.url ||
              "https://placehold.co/80"
            }
            alt={item.product_name}
            className="w-16 h-16 rounded border object-cover"
          />

          <div className="text-sm">
            <p className="font-medium capitalize">
              {item.product_name}
            </p>
            <p className="font-bold">ProductId: {item.product_id}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ₹{item.price}</p>
            <p className="font-semibold">
              Subtotal: ₹{item.price * item.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
