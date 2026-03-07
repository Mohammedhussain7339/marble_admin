const USER_API =
  "https://ddajt09tv0.execute-api.ap-south-1.amazonaws.com/default/marble_user";

/* ================= TYPES ================= */
export type UserAddress = {
  addressId?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  addressLine1: string;
  area: string;
  city: string;
  state: string;
  zip: string;
  mobileNumber: string;
  saveAs: string;
  type: string;
  countryCode: string;
  isdCode: string;
  isCurrent?: boolean;
};

export type GetAddressResponse = {
  address: (UserAddress & { _id: string })[];
  currentAddressId: string | null;
};

/* ================= ADD ================= */
export async function addAddress(userId: string, address: UserAddress) {
  const res = await fetch(USER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "add_address",
      user_id: userId,
      address,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Add failed");
  return data;
}

/* ================= GET ================= */
export async function getAddresses(
  userId: string
): Promise<GetAddressResponse> {
  const res = await fetch(USER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "get_addresses",
      user_id: userId,
    }),
  });

  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

/* ================= DELETE ================= */
export async function deleteAddress(userId: string, addressId: string) {
  const res = await fetch(USER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "delete_address",
      user_id: userId,
      addressId,
    }),
  });

  if (!res.ok) throw new Error("Delete failed");
}

/* ================= SET CURRENT ================= */
export async function setCurrentAddress(userId: string, addressId: string) {
  const res = await fetch(USER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "set_current_address",
      user_id: userId,
      addressId,
    }),
  });

  if (!res.ok) throw new Error("Set default failed");
}
