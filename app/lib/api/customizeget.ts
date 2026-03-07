// src/lib/api/customizeget.ts

export type EnquiryStatus =
  | "NEW"
  | "INREVIEW"
  | "CONSULTATION"
  | "DEVELOPMENT"
  | "DELIVERED";

export type Enquiry = {
  request_id: string;
  user_id: string;
  product_id: string;
  size: {
    height: string;
    width: string;
    depth: string;
  };
  stone_type: string;
  mobile_no: string;
  email_address?: string;
  connection_option: "call" | "whatsapp" | "email";
  additional_details: string;
  refrence_images: string[];
  status: EnquiryStatus;
  created_at: string;
  [key: string]: any;
};

const API_URL =
  "https://r80r8aguf1.execute-api.ap-south-1.amazonaws.com/default/Customize_marble_our";

/* -------------------- helpers -------------------- */
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.body)) return data.body;
  if (Array.isArray(data?.body?.Items)) return data.body.Items;
  if (Array.isArray(data?.Items)) return data.Items;

  if (data && typeof data === "object") {
    for (const k in data) {
      const found = extractArray(data[k]);
      if (found.length) return found;
    }
  }
  return [];
}

function normalize(item: any): Enquiry {
  return {
    request_id: item.request_id ?? item.RequestID ?? item.id ?? "",
    user_id: item.user_id ?? item.UserID ?? item.userId ?? "",
    product_id: item.product_id ?? item.ProductID ?? item.productId ?? "",
    size: {
      height: item.size?.height ?? item.height ?? "0",
      width: item.size?.width ?? item.width ?? "0",
      depth: item.size?.depth ?? item.depth ?? "0",
    },
    stone_type: item.stone_type ?? item.StoneType ?? item.stone ?? "",
    mobile_no: item.mobile_no ?? item.MobileNo ?? item.mobile ?? item.phone ?? "",
    email_address:
  item.email_address ??
  item.EmailAddress ??
  item.email ??
  item.Email ??
  "",

    connection_option:
      (item.connection_option ??
        item.ConnectionOption ??
        "call") as Enquiry["connection_option"],
    additional_details:
      item.additional_details ?? item.AdditionalDetails ?? "",
    refrence_images:
      item.refrence_images ?? item.RefrenceImages ?? item.images ?? [],
    status: ((item.status ?? item.Status ?? "NEW") as string).toUpperCase() as EnquiryStatus,
    created_at:
      item.created_at ?? item.CreatedAt ?? item.timestamp ?? new Date().toISOString(),
  };
}

/* -------------------- APIs -------------------- */

export async function getAllEnquiries(
  signal?: AbortSignal
): Promise<Enquiry[]> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_action: "all_request" }),
    signal,
  });

  if (!res.ok) throw new Error(`API failed with ${res.status}`);

  const data = await res.json();
  const arr = extractArray(data);
  return arr.map(normalize);
}

/* -------------------- counters -------------------- */

export function getNewEnquiryCount(enquiries: Enquiry[]): number {
  return enquiries.reduce(
    (c, e) => (e.status === "NEW" ? c + 1 : c),
    0
  );
}

export function getStatusCounts(enquiries: Enquiry[]) {
  return enquiries.reduce(
    (acc, e) => {
      acc[e.status] += 1;
      return acc;
    },
    { NEW: 0, INREVIEW: 0, CONSULTATION: 0, DEVELOPMENT: 0, DELIVERED: 0 } as Record<EnquiryStatus, number>
  );
}

/* -------------------- update status -------------------- */

export async function updateEnquiryStatus(
  request_id: string,
  user_id: string,
  status: EnquiryStatus
): Promise<void> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_action: "update_request",
      request_id,
      user_id,
      status,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update enquiry status");
  }
}
