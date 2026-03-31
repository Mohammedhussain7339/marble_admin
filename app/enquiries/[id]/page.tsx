// app/admin/requests/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type RequestType = {
  request_id: string;
  user_id: string;
  product_id: string;
  mobile_no: string;
  connection_option: string;
  stone_type: string;
  additional_details: string;
  status: string;
  created_at: string;
  size: {
    width?: number;
    height?: number;
    depth?: number;
  };
  reference_images?: {
    key: string;
    url: string;
  }[];
};
type ReferenceProduct = {
  marble_name: string;
  description: string;
  price: number;
  origin: string;
  marble_category: string;
  price_unit: string;
  marble_images?: { url: string }[];
};

/* ================= PAGE ================= */

export default function RequestDetailsPage() {
  const API_URL =
    "https://r80r8aguf1.execute-api.ap-south-1.amazonaws.com/default/Customize_marble_our";

  const params = useParams();
  const { id: requestId } = params as { id: string };

  const [request, setRequest] = useState<RequestType | null>(null);
  const [product, setProduct] = useState<ReferenceProduct | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_action: "get_requestByid",
        request_id: requestId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const req = data?.item || data?.body?.item || null;
        setRequest(req);
        setProduct(req ? req.product_details : null);
        console.log("Fetched request data:", req);
        // setReferenceProduct(d.refrence_product || null);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  /* ================= GUARDS ================= */

  if (loading) return <Loading />;
  if (!request) return <EmptyState />;

  const S3_BASE_URL = "https://YOUR_BUCKET_NAME.s3.ap-south-1.amazonaws.com/";

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Admin – Request Details</h1>

      {/* REQUEST INFO */}
      <section className="border rounded p-4 bg-white space-y-2">
        <p>
          <b>Request ID:</b> {request.request_id}
        </p>
        <p>
          <b>User ID:</b> {request.user_id}
        </p>
        <p>
          <b>Product ID:</b> {request.product_id}
        </p>

        <p>
          <b>Stone Type:</b> {request.stone_type}
        </p>

        <p>
          <b>Size:</b> {request.size?.width ?? "-"} ×{" "}
          {request.size?.height ?? "-"} × {request.size?.depth ?? "-"}
        </p>

        <p>
          <b>Additional Details:</b> {request.additional_details || "—"}
        </p>
        <p>
          <b>Connection Option:</b> {request.connection_option}
        </p>
        <p>
          <b>Status:</b> {request.status}
        </p>

        <p className="text-sm text-gray-500">
          Created on: {new Date(request.created_at).toLocaleString("en-IN")}
        </p>
      </section>

      {/* REFERENCE IMAGES */}
      {request.reference_images && request.reference_images.length > 0 && (
        <section className="border rounded p-4 bg-white">
          <h2 className="font-medium mb-2">Reference Images</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {request.reference_images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt="Reference"
                className="w-full h-40 object-cover border rounded"
              />
            ))}
          </div>
        </section>
      )}

      {/* CUSTOMER DETAILS */}
      <section className="border rounded p-4 bg-white">
        <h2 className="font-medium mb-2">Customer Details</h2>
        <p>📞 {request.mobile_no}</p>
      </section>
    </div>
  );
}

/* ================= HELPERS ================= */

function Loading() {
  return (
    <div className="p-8 text-center text-gray-500">
      Loading request details...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-gray-500">No request data found.</div>
  );
}
