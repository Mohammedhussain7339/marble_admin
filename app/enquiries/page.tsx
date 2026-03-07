"use client";

import { useEffect, useState } from "react";
import {
  getAllEnquiries,
  Enquiry,
  updateEnquiryStatus,
  EnquiryStatus,
} from "@/app/lib/api/customizeget";
import { useRouter } from "next/navigation";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "ALL">(
    "ALL",
  );
  const [dateFilter, setDateFilter] = useState("");
  const router = useRouter();
  const filteredEnquiries = enquiries.filter((enquiry) => {
    // 🔍 Search (user id / product id / mobile)
    const matchesSearch =
      enquiry.user_id.toLowerCase().includes(search.toLowerCase()) ||
      enquiry.product_id.toLowerCase().includes(search.toLowerCase()) ||
      enquiry.mobile_no.includes(search);

    // 📌 Status
    const matchesStatus =
      statusFilter === "ALL" || enquiry.status === statusFilter;

    // 📅 Date
    const matchesDate =
      !dateFilter ||
      new Date(enquiry.created_at).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  useEffect(() => {
    const loadEnquiries = async () => {
      try {
        console.log("🔄 Fetching enquiries...");

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        clearTimeout(timeoutId);

        const data = await getAllEnquiries();
        console.log("✅ Processed data:", data);

        if (data && Array.isArray(data)) {
          setEnquiries(data);
        } else {
          setEnquiries([]);
        }
      } catch (err) {
        console.error("❌ Error loading enquiries:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadEnquiries();
  }, []);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newStatus, setNewStatus] = useState<Enquiry["status"]>("NEW");
  const [updating, setUpdating] = useState(false);
  const ENQUIRY_STATUS_STYLES: Record<EnquiryStatus, string> = {
    NEW: "bg-blue-100 text-blue-800",
    INREVIEW: "bg-purple-100 text-purple-800",
    CONSULTATION: "bg-yellow-100 text-yellow-800",
    DEVELOPMENT: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-700">
              Loading Enquiries
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fetching data from server...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">!</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">
                  Error Loading Data
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Customization Enquiries
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all customization requests from customers
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Total Enquiries</div>
            <div className="text-2xl font-bold mt-1">{enquiries.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">New</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {enquiries.filter((e) => e.status === "NEW").length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Contacted</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {enquiries.filter((e) => e.status === "CONSULTATION").length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Closed</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {enquiries.filter((e) => e.status === "DELIVERED").length}
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by user, product, mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="INREVIEW">In Review</option>
              <option value="CONSULTATION">Consultation</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />

            {/* Reset */}
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setDateFilter("");
              }}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Enquiries Table */}
        {enquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700">
              No Enquiries Found
            </h3>
            <p className="text-gray-500 mt-2">
              There are no customization requests at the moment.
            </p>

            {/* Debug Section */}
            {rawResponse && (
              <div className="mt-8 text-left">
                <details className="border rounded-lg">
                  <summary className="p-4 cursor-pointer font-medium text-blue-600">
                    View API Response for Debugging
                  </summary>
                  <div className="p-4 bg-gray-50 border-t">
                    <pre className="text-xs bg-gray-900 text-white p-4 rounded overflow-auto max-h-96">
                      {JSON.stringify(rawResponse, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEnquiries.map((enquiry) => (
                      <tr key={enquiry.request_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {enquiry.request_id.slice(0, 10)}...
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              User: {enquiry.user_id.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              📱 {enquiry.mobile_no}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Via: {enquiry.connection_option}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Product: {enquiry.product_id.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              🪨 {enquiry.stone_type}
                            </div>
                            <div className="text-xs text-gray-500">
                              Size: {enquiry.size.height}×{enquiry.size.width}×
                              {enquiry.size.depth}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-700 line-clamp-2">
                              {enquiry.additional_details ||
                                "No additional details"}
                            </div>
                            {enquiry.refrence_images.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {enquiry.refrence_images
                                  .slice(0, 3)
                                  .map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`Ref ${idx + 1}`}
                                      className="w-8 h-8 rounded border object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "https://placehold.co/50x50/e5e7eb/6b7280?text=IMG";
                                      }}
                                    />
                                  ))}
                                {enquiry.refrence_images.length > 3 && (
                                  <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      +{enquiry.refrence_images.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
    ${ENQUIRY_STATUS_STYLES[enquiry.status]}`}>
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(enquiry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                            onClick={() =>
                              router.push(
                                `/mladmin/enquiries/${enquiry.request_id}`,
                              )
                            }>
                            View
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 font-medium"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setNewStatus(enquiry.status);
                            }}>
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination/Info */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredEnquiries.length} of {enquiries.length}{" "}
                enquiries
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border rounded text-sm">
                  Previous
                </button>
                <button className="px-3 py-1 border rounded text-sm">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[400px] p-6">
            <h3 className="text-lg font-semibold mb-4">
              Update Enquiry Status
            </h3>

            <p className="text-sm text-gray-600 mb-2">Request ID:</p>
            <code className="block text-xs bg-gray-100 p-2 rounded mb-4">
              {selectedEnquiry.request_id}
            </code>

            {/* STATUS SELECT */}
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as Enquiry["status"])
              }
              className="w-full border rounded-lg px-3 py-2 mb-6">
              <option value="NEW">New</option>
              <option value="INREVIEW">In Review</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONSULTATION">Consultation</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 text-sm border rounded-lg">
                Cancel
              </button>

              <button
                disabled={updating}
                onClick={async () => {
                  if (!selectedEnquiry) return;

                  try {
                    setUpdating(true);

                    // ✅ Call separated API function
                    await updateEnquiryStatus(
                      selectedEnquiry.request_id,
                      selectedEnquiry.user_id,
                      newStatus,
                    );

                    // ✅ Optimistic UI update
                    setEnquiries((prev) =>
                      prev.map((e) =>
                        e.request_id === selectedEnquiry.request_id
                          ? { ...e, status: newStatus }
                          : e,
                      ),
                    );

                    setSelectedEnquiry(null);
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update status");
                  } finally {
                    setUpdating(false);
                  }
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
