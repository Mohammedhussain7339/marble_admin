// components/EditProductModal.tsx
"use client";
import { useState, useRef, ChangeEvent } from "react";
import ImageGrid from "./ImageGrid";
import { FullProduct } from "../page"; // Import type
import { IMAGE_UPLOAD_API_URL, marble_products_api } from "@/app/api/apis";
import { Select } from "../../addProduct/page";

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

interface EditProductModalProps {
  product: FullProduct;
  onSave: () => void;
  onClose: () => void;
}

export type ImageState =
  | { status: "uploading" }
  | { status: "uploaded"; key: string; url: string };

const generateUniqueId = () =>
  `marble_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export default function EditProductModal({
  product,
  onSave,
  onClose,
}: EditProductModalProps) {
  const [form, setForm] = useState<Partial<FullProduct>>({
    ...product,
    meta_data: product.meta_data || "",
    marble_category: Array.isArray(product.marble_category)
      ? product.marble_category
      : product.marble_category
        ? [product.marble_category]
        : [],
    marble_size: product.marble_size || { width: 0, height: 0, depth: 0 },
    stone_material: product.stone_material || "",
  });
  const [imagesState, setImagesState] = useState<ImageState[]>(
    product.marble_images.map((img) => ({
      status: "uploaded" as const,
      ...img,
    })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(
    null,
  ) as React.RefObject<HTMLInputElement>;

  const uploadSingleImage = async (
    file: File,
  ): Promise<{ key: string; url: string }> => {
    const uuid_val = generateUniqueId();
    const description = form.marble_name
      ? `Image for ${form.marble_name}`
      : "Marble Product Image";
    const imageDetails = {
      user_id: "anonymous",
      design_uuid_val: uuid_val,
      description,
      operation: "upload",
    };

    // 1️⃣ Get signed URL
    const res = await fetch(IMAGE_UPLOAD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(imageDetails),
    });

    if (!res.ok) throw new Error("Failed to get signed URL");

    const uploadData = await res.json();
    const s3UploadUrl = uploadData.s3_url;

    console.log("Uploading to S3 URL:", s3UploadUrl);

    // 2️⃣ PUT file to S3
    const putRes = await fetch(s3UploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload image to S3");
    }

    // 3️⃣ Get download URL
    const downloadDetails = {
      ...imageDetails,
      operation: "download",
    };
    const downloadRes = await fetch(IMAGE_UPLOAD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(downloadDetails),
    });

    if (!downloadRes.ok) throw new Error("Failed to get download URL");

    const downloadData = await downloadRes.json();

    return {
      key: downloadData.s3_key,
      url: downloadData.s3_url,
    };
  };

  const handleImageAdd = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || imagesState.length >= 10) return;

    setImagesState((prev) => [...prev, { status: "uploading" }]);
    setForm((prev) => ({
      ...prev,
      marble_images: [...(prev.marble_images || []), { key: "", url: "" }],
    }));

    try {
      const uploaded = await uploadSingleImage(file);
      console.log("Uploaded image:", uploaded);
      setImagesState((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { status: "uploaded", ...uploaded };
        return updated;
      });
      setForm((prev) => {
        const updated = { ...prev };
        const images = [...(updated.marble_images || [])];
        images[images.length - 1] = uploaded;
        updated.marble_images = images;
        return updated;
      });
      setMessage("Image uploaded successfully");
    } catch (err: any) {
      setMessage(`❌ Failed to upload image: ${err.message}`);
      setImagesState((prev) => prev.slice(0, -1));
      setForm((prev) => ({
        ...prev,
        marble_images: (prev.marble_images || []).slice(0, -1),
      }));
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImagesState((prev) => prev.filter((_, j) => j !== index));
    setForm((prev) => ({
      ...prev,
      marble_images: (prev.marble_images || []).filter((_, j) => j !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplicationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      applications: e.target.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
  };

  console.log(product.stone_material);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        operation: "update_product",
        product_id: product.product_id,
        data: {
          price: Number(form.price),
          tags: form.tags || [],
          key_features: form.key_features || [],
          marble_images: form.marble_images || [],
          marble_name: form.marble_name || "",
          meta_data: form.meta_data || "",
          marble_category: form.marble_category ?? [], // ✅ FIX
          marble_type: form.marble_type || "",
          origin: form.origin || "",
          finish: form.finish || "",
          availability: form.availability || "In Stock",
          price_unit: form.price_unit || "per_sq_ft",
          product_id: product.product_id,
          description: form.description || "",
          marble_size: form.marble_size || { width: 0, height: 0, depth: 0 },
          stone_material: form.stone_material || "",
        },
      };

      const res = await fetch(marble_products_api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update product");
      onSave();
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const [editStoneMaterial, setEditStoneMaterial] = useState(
    !product.stone_material,
  );

  const updateSize = (key: "width" | "height" | "depth", value: string) => {
    setForm((prev) => ({
      ...prev,
      marble_size: {
        width: prev.marble_size?.width ?? 0,
        height: prev.marble_size?.height ?? 0,
        depth: prev.marble_size?.depth ?? 0,
        [key]: Number(value),
      },
    }));
  };

  const replaceImage = async (index: number, file: File) => {
    if (!file) return;

    // Set uploading state at same index
    setImagesState((prev) => {
      const updated = [...prev];
      updated[index] = { status: "uploading" };
      return updated;
    });

    try {
      const uploaded = await uploadSingleImage(file);

      // Update imagesState at SAME index
      setImagesState((prev) => {
        const updated = [...prev];
        updated[index] = { status: "uploaded", ...uploaded };
        return updated;
      });

      // Update form.marble_images at SAME index
      setForm((prev) => {
        const updatedImages = [...(prev.marble_images || [])];
        updatedImages[index] = uploaded;

        return {
          ...prev,
          marble_images: updatedImages,
        };
      });

      setMessage("Image replaced successfully");
    } catch (err: any) {
      setMessage(`❌ Failed to replace image: ${err.message}`);
    }
  };

  function onImageAdd(e: ChangeEvent<HTMLInputElement>) {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full  max-h-[100vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-900">Edit Product</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marble Name
              </label>
              <input
                name="marble_name"
                value={form.marble_name || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Meta Data (SEO)
  </label>

  <textarea
    name="meta_data"
    value={form.meta_data || ""}
    onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
    rows={2}
    placeholder="Enter SEO meta data"
    className={`w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
      form.meta_data
        ? "border-gray-300 focus:ring-blue-500"
        : "border-yellow-400 bg-yellow-50 focus:ring-yellow-500"
    }`}
  />

  {/* Status */}
  {!form.meta_data && (
    <p className="text-xs text-yellow-600 mt-1">
      ⚠ Meta data missing (important for SEO)
    </p>
  )}
</div>
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {MARBLE_CATEGORIES.map((cat) => {
                    const selected = (
                      form.marble_category as string[]
                    )?.includes(cat);

                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded-md
    ${selected ? "bg-blue-50 text-blue-700" : ""}`}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            setForm((prev) => {
                              const current = (prev.marble_category ||
                                []) as string[];
                              return {
                                ...prev,
                                marble_category: e.target.checked
                                  ? [...current, cat]
                                  : current.filter((c) => c !== cat),
                              };
                            });
                          }}
                          className="accent-blue-600"
                        />

                        <span className="flex items-center gap-1">
                          {cat}
                          {selected && (
                            <span className="text-green-600 font-bold">✓</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stone Material
              </label>

              {!editStoneMaterial && product.stone_material ? (
                // ✅ Read-only view
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-100">
                  <span className="text-gray-700">
                    {product.stone_material}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setEditStoneMaterial(true);
                      setForm((prev) => ({
                        ...prev,
                        stone_material: product.stone_material,
                      }));
                    }}
                    className="text-sm text-blue-600 hover:underline">
                    Edit
                  </button>
                </div>
              ) : (
                // ✅ Editable select
                <select
                  name="stone_material"
                  value={form.stone_material || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Material</option>
                  <option value="white_marble">Rajasthan White / Agaria</option>
                  <option value="makrana_marble">Makrana White Marble</option>
                  <option value="vietnam_white_marble">
                    Vietnam White Marble
                  </option>
                  <option value="bheslana_marble_black">
                    Bheslana Marble/Black
                  </option>
                  <option value="baswara_marble_look_italian">
                    Baswara Marble/Look-Italian
                  </option>
                  <option value="granite_south_black_stone">
                    Granite South Black Stone
                  </option>
                  <option value="granite_red_stone">Granite Red Stone</option>
                  <option value="makrana_pink_marble">
                    Makrana Pink Marble
                  </option>
                  <option value="jaisalmer_sandstone_marble">
                    Jaisalmer SandStone Marble
                  </option>
                  <option value="khatu_sandstone_marble">
                    Khatu SandStone Marble
                  </option>
                  <option value="gwalior_mint_marble">
                    Gwalior Mint Marble
                  </option>
                  <option value="udaipur_green_marble">
                    Udaipur Green Marble
                  </option>
                  <option value="makrana_kumari_marble">
                    Makrana Kumari Marble
                  </option>
                  <option value="onyx">Onyx</option>
                  <option value="italian_marble">Italian Marble</option>
                </select>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marble Size (in inches)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Width"
                  value={form.marble_size?.width || ""}
                  onChange={(e) => updateSize("width", e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Height"
                  value={form.marble_size?.height || ""}
                  onChange={(e) => updateSize("height", e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Depth"
                  value={form.marble_size?.depth || ""}
                  onChange={(e) => updateSize("depth", e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
        <Select
          label="Marble Type"
          name="marble_type"
          value={form.marble_type || ""}
          onChange={handleChange}
          options={[
            { value: "fixed", label: "fixed" },
            { value: "customized", label: "customized" },
          ]}
        />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin
              </label>
              <input
                name="origin"
                value={form.origin || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish
              </label>
              <input
                name="finish"
                value={form.finish || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                name="availability"
                value={form.availability || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Limited Stock">Limited Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <input
                name="price"
                type="number"
                value={form.price || 0}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Unit
              </label>
              <select
                name="price_unit"
                value={form.price_unit || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="per_sq_ft">Per Sq Ft</option>
                <option value="per_unit">Per Unit</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="md:col-span-2">
                <label className="label">Tags</label>

                <input
                  type="text"
                  placeholder="Type application and press Enter"
                  className="w-full border-2 border-gray-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black
    "
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (!value) return;

                      setForm((prev) => ({
                        ...prev,
                        tags: [...(prev.tags || []), value],
                      }));

                      e.currentTarget.value = "";
                    }
                  }}
                />

                {/* Show saved applications */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.tags || []).map((app, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {app}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            tags: prev.tags?.filter((_, j) => j !== i),
                          }))
                        }
                        className="text-red-500 font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="md:col-span-2">
                <label className="label">Key Features</label>

                <input
                  type="text"
                  placeholder="Type application and press Enter"
                  className="w-full border-2 border-gray-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black
    "
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (!value) return;

                      setForm((prev) => ({
                        ...prev,
                        key_features: [...(prev.key_features || []), value],
                      }));

                      e.currentTarget.value = "";
                    }
                  }}
                />

                {/* Show saved applications */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.key_features || []).map((app, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {app}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            key_features: prev.key_features?.filter((_, j) => j !== i),
                          }))
                        }
                        className="text-red-500 font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2 md:col-span-2">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="md:col-span-2">
              <ImageGrid
                imagesState={imagesState}
                onImageAdd={handleImageAdd}
                onRemoveImage={removeImage}
                onReplaceImage={replaceImage}   // 👈 add this
                fileInputRef={fileInputRef}
              />
            </div>
          </div>
{/* {imagesState.map((img, index) => (
  <div key={index} className="relative group">
    {img.status === "uploading" ? (
      <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
        Uploading...
      </div>
    ) : (
      <>
        <img
          src={img.url}
          alt=""
          className="w-32 h-32 object-cover rounded-lg cursor-pointer"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.dataset.index = String(index);
              fileInputRef.current.click();
            }
          }}
        />

        <button
          type="button"
          onClick={() => onRemoveImage(index)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2"
        >
          ×
        </button>
      </>
    )}
  </div>
))} */}
{imagesState.map((img, index) => (
  <div key={index} className="relative group">
    {img.status === "uploading" ? (
      <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
        Uploading...
      </div>
    ) : (
      <>
        <img
          src={img.url}
          alt=""
          className="w-32 h-32 object-cover rounded-lg cursor-pointer"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.dataset.index = String(index);
              fileInputRef.current.click();
            }
          }}
        />

        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2"
        >
          ×
        </button>
      </>
    )}
  </div>
))}
<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  className="hidden"
  onChange={(e) => {
    const index = fileInputRef.current?.dataset.index;

if (index !== undefined) {
  replaceImage(Number(index), e.target.files![0]);
  delete fileInputRef.current!.dataset.index;
} else {
  handleImageAdd(e);
}
    e.target.value = "";
  }}
/>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
