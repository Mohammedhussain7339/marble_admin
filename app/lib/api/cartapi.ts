const CART_API =
  "https://i6lndb1qdj.execute-api.ap-south-1.amazonaws.com/Marble_wishlist_cart/";

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1
) {
  const res = await fetch(CART_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "addToCart",
      user_id: userId,
      product_id: productId,
      quantity,
    }),
  });

  if (!res.ok) {
    throw new Error("Add to cart failed");
  }

  return res.json();
}
  
// export default async function getCartLength(
//   userId: string
// ): Promise<number> {
//   const res = await fetch(CART_API, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       user_action: "getCartItem",
//       user_id: userId,
//     }),
//   });

//   if (!res.ok) return 0;

//   const data = await res.json();

//   // ✅ Correct response handling
//   if (typeof data.total_items === "number") {
//     return data.total_items;
//   }

//   if (Array.isArray(data.items)) {
//     return data.items.length;
//   }

//   return 0;
// }
export async function deleteCartItem(
  userId: string,
  productId: string
) {
  const res = await fetch(CART_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "deleteCartItem",
      user_id: userId,
      product_id: productId,
    }),
  });

  if (!res.ok) {
    throw new Error("Delete cart item failed");
  }

  return res.json();
}

export type CartItems = {
  product_id: string;
  product_name?: string;
  price?: number;
  quantity: number;
  product_image?: {
    url: string;
    key: string;
  }[];
};

export async function getCartItems(
  userId: string
): Promise<CartItems[]> {
  const res = await fetch(CART_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "getCartItem",
      user_id: userId,
    }),
  });

  if (!res.ok) {
    throw new Error("Get cart items failed");
  }

  const data = await res.json();

  // ✅ Normalize safely
  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}