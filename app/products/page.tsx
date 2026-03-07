// components/AdminProducts.tsx
"use client";
import { useEffect, useState } from "react";
import ProductTable from "./components/ProductTable";
import EditProductModal from "./components/EditProductModal";
import { marble_products_api } from "@/app/api/apis";

export type FullProduct = {
  created_at: string | number | Date;
  stone_material: string;
  marble_size: { width: number; height: number; depth: number; };
  product_id: string;
  marble_name: string;
  marble_category: string[];
  marble_type: string;
  origin: string;
  finish: string;
  availability: string;
  applications: string[];
  price: number;
  price_unit: string;
  marble_images: { key: string; url: string }[];
  tags: string[];
  key_features: string[]; // ✅ ADD THIS
  description: string;
  isReady: boolean;
  
};

export default function AdminProducts() {
const LIMIT = 25;

  const [products, setProducts] = useState<FullProduct[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [message, setMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);

 const fetchProducts = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(marble_products_api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "list_products",
          skip: reset ? 0 : skip,
          limit: LIMIT,
        }),
      });

const data = await res.json();

const newProducts = data.products || [];
setTotalCount(data.totalCount || 0);

      setProducts((prev) =>
        reset ? newProducts : [...prev, ...newProducts]
      );

      setSkip((prev) => (reset ? LIMIT : prev + LIMIT));
      if (newProducts.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchProducts(true);
  }, []);

  /* ================= ACTIONS ================= */
  const handleEdit = (product: FullProduct) => {
    setEditingProduct(product);
  };

  const handleSave = () => {
    setEditingProduct(null);
    setSkip(0);
    setHasMore(true);
    fetchProducts(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(marble_products_api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "delete_product", product_id: id }),
    });

    setSkip(0);
    setHasMore(true);
    fetchProducts(true);
  };
  const handleCloseModal = () => {
    setEditingProduct(null);
    setMessage(""); // Clear message on close
  };
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editPreview, setEditPreview] = useState<string[]>([]);
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setEditImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setEditPreview(previews);
  };
  useEffect(() => {
    if (!editingProduct) return;

    // Existing images from backend
    const existing = editingProduct.marble_images || [];

    setEditPreview(existing.map((img: any) => img.url));
    setEditImages([]); // new uploads start empty
  }, [editingProduct]);

const toggleReady = async (product: FullProduct) => {
  try {
    await fetch(marble_products_api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "update_product",
        product_id: product.product_id,
        data: {
          ...product,
          isReady: !product.isReady,
        },
      }),
    });

    // ✅ update state immutably
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === product.product_id
          ? { ...p, isReady: !p.isReady }
          : p
      )
    );
  } catch (err) {
    console.error("Failed to update isReady", err);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - Products</h1>
          {/* <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button> */}
        </div>

        {/* {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )} */}

<ProductTable
  products={products}
    totalCount={totalCount}   // ✅ ADD THIS

  onEdit={handleEdit}
  onDelete={handleDelete}
  onLoadMore={() => fetchProducts()}
  hasMore={hasMore}
  loading={loading}
  onToggleReady={toggleReady}
/>

        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onSave={handleSave}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}