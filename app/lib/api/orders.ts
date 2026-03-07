// lib/api/orders.ts


const API_URL ="https://apbbkbn0oi.execute-api.ap-south-1.amazonaws.com/default/marble_orders";

export async function getUserOrders(userId: string) {
  const res = await fetch(
    API_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_action: "get_user_orders",
        user_id: userId,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export async function getAllOrders() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "get_all_orders", // admin-only action
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  userId: string,
  status: string
) {
  const res = await fetch(
    "https://apbbkbn0oi.execute-api.ap-south-1.amazonaws.com/default/marble_orders",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_action: "update_order_status",
        order_id: orderId,
        user_id: userId,
        status,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update order");
  }

  return res.json();
}


