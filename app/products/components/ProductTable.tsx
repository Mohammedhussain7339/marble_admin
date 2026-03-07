import { FullProduct } from "../page";
import ConfirmModal from "@/app/components/models/Model";
import { useMemo, useState } from "react";

const MARBLE_CATEGORIES = [
  "Marble temple",
  "Fountain",
  "Artistic work",
  "Inlay work",
  "Handicraft",
  "Marble services",
  "Marble slabs",
  "Mosque work",
  "Marble table",
  "Marble Washbasin",
];

interface ProductTableProps {
  products: FullProduct[];
  onEdit: (product: FullProduct) => void;
  totalCount: number;   // ✅ ADD THIS
  onDelete: (id: string) => Promise<void>;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onToggleReady: (product: FullProduct) => void;

}

export default function ProductTable({
  products,
  onEdit,
  totalCount,
  onDelete,
  onLoadMore, // ✅ ADD THIS
  hasMore,
  loading,
  onToggleReady, // ✅ ADD THIS

}: ProductTableProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alphabet, setAlphabet] = useState<string>("ALL");

  // 🔍 search & filter state
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"NEW" | "OLD">("NEW");
  const [category, setCategory] = useState("ALL");
  const [confirmReadyOpen, setConfirmReadyOpen] = useState(false);
const [readyProduct, setReadyProduct] = useState<FullProduct | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };


  // ✅ filtered + searched + sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.marble_name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) =>
        availability === "ALL" ? true : p.availability === availability,
      )
      .filter((p) =>
        category === "ALL" ? true : p.marble_category?.includes(category),
      )

      .sort((a, b) =>
        sortOrder === "NEW"
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
       .filter((p) =>
      alphabet === "ALL"
        ? true
        : p.marble_name
            .toUpperCase()
            .startsWith(alphabet)
    )
     .sort((a, b) =>
      a.marble_name.localeCompare(b.marble_name, "en", {
        sensitivity: "base",
      })
    );
  }, [products, search, availability, category, sortOrder, alphabet]);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        />

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm">
          <option value="ALL">All Availability</option>
          <option value="In Stock">In Stock</option>
          <option value="Limited Stock">Limited Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm">
          <option value="ALL">All Categories</option>
          {MARBLE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="border px-3 py-2 rounded-md text-sm">
          <option value="NEW">Newest First</option>
          <option value="OLD">Oldest First</option>
        </select>
      </div>
        {/* 🔤 Alphabet Filter */}
<div className="flex flex-wrap gap-1 mb-4">
  <button
    onClick={() => setAlphabet("ALL")}
    className={`px-2 py-1 text-xs rounded ${
      alphabet === "ALL"
        ? "bg-gray-900 text-white"
        : "bg-gray-100 hover:bg-gray-200"
    }`}
  >
    All
  </button>

  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((char) => (
    <button
      key={char}
      onClick={() => setAlphabet(char)}
      className={`px-2 py-1 text-xs rounded ${
        alphabet === char
          ? "bg-gray-900 text-white"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {char}
    </button>
  ))}
</div>
<div className="flex justify-between items-center mb-3 text-sm text-gray-600">
  <span>
    Showing {filteredProducts.length} of {totalCount} products
  </span>

  <span>
    Loaded: {products.length}
  </span>
</div>

      {/* 📋 Table */}
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium">
              Availability
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium">Images</th>
            <th className="px-6 py-3 text-left text-xs font-medium">IsReady</th>
            <th className="px-6 py-3 text-right text-xs font-medium">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {filteredProducts.map((p) => (
            <tr key={p.product_id} className="hover:bg-gray-50">
              <td>
                {p.marble_images[0] ? (
                  <img
                    src={p.marble_images[0].url}
                    alt={p.marble_name}
                    className="w-16 h-16 object-cover rounded-md mx-4 my-2"
                  />
                )  : (
                  <div className="w-16 h-16 bg-gray-200 rounded-md mx-4 my-2 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </td>
              <td className="px-6 py-4">{p.marble_name}</td>
              <td className="px-6 py-4">₹{p.price}</td>
              <td className="px-6 py-4">{p.availability}</td>
              <td className="px-6 py-4">{p.marble_images.length}</td>
<td className="px-6 py-4">
  <button
    onClick={() => {
      setReadyProduct(p);
      setConfirmReadyOpen(true);
    }}
    className={`flex items-center gap-2 cursor-pointer px-5 py-1.5 rounded-full border text-xs font-medium transition
      ${
        p.isReady
          ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
          : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
      }`}
    title={p.isReady ? "Click to mark Not Ready" : "Click to mark Ready"}
  >
    <span
      className={`w-2.5 h-2.5 rounded-full ${
        p.isReady ? "bg-green-500" : "bg-red-500"
      }`}
    />
    {p.isReady ? "Ready" : "Not Ready"}
  </button>
</td>



              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(p)} className="text-green-600">
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(p.product_id)}
                  className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-gray-500">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-5 py-2 cursor-pointer bg-gray-900 text-white rounded-md disabled:opacity-50">
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-6 text-sm text-gray-500">
          All products loaded
        </div>
      )}

      {/* ❌ Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Product?"
        description="This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
      <ConfirmModal
  open={confirmReadyOpen}
  title={readyProduct?.isReady ? "Mark as Not Ready?" : "Mark as Ready?"}
  description={
    readyProduct?.isReady
      ? "This product will be marked as Not Ready."
      : "This product will be marked as Ready."
  }
  confirmText="Yes, Confirm"
  cancelText="Cancel"
  loading={false}
  onConfirm={() => {
    if (readyProduct) {
      onToggleReady(readyProduct);
    }
    setConfirmReadyOpen(false);
    setReadyProduct(null);
  }}
  onCancel={() => {
    setConfirmReadyOpen(false);
    setReadyProduct(null);
  }}
/>

    </div>
  );
}
