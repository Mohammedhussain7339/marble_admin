"use client";

import { useState, useRef } from "react";
import { IMAGE_UPLOAD_API_URL, marble_products_api } from "@/app/api/apis";
/* ================= HELPERS ================= */
const generateUniqueId = () =>
  `marble_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
const urlToFile = async (url: string): Promise<File> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], "image.png", { type: blob.type });
};
const requiredFields = [
  "marble_name",
  "meta_data",
  "marble_category",
  "marble_type",
  "description",
  "origin",
  "price",
  "price_unit",
  "availability",
  "marble_size",
  "stone_material",
];

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

export type marbleProductType = {
  marble_name: string;
  meta_data: string;
  marble_category: string[]; // ✅ changed
  marble_type: string;
  description: string;
  origin: string;
  price: number;
  price_unit: string;
  finish: string;
  availability: string;
  tags: string[];
  key_features: string[];
  marble_size: {
    width: number;
    height: number;
    depth: number;
  };
  stone_material: string[];
  marble_images: {
    key: string;
    url: string;
  }[];
};

// Type for image state
type ImageState =
  | { status: "uploading" }
  | { status: "uploaded"; key: string; url: string };

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [keyFeatureInput, setKeyFeatureInput] = useState("");
  const [imagesState, setImagesState] = useState<ImageState[]>([]);
  const [form, setForm] = useState<Partial<marbleProductType>>({
    marble_name: "",
    meta_data: "",
    marble_category: [], // ✅ array
    origin: "",
    description: "",
    price: 0,
    price_unit: "",
    availability: "",
    tags: [],
    key_features: [],
    marble_size: {
      width: 0,
      height: 0,
      depth: 0,
    },
    stone_material: [],
    marble_images: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = imagesState.some((img) => img.status === "uploading");

  const isSubmitDisabled = loading || isUploading;

  /* ================= HANDLERS ================= */
  const handleChange = (e: any) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const removeImage = (index: number) => {
    setImagesState((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      marble_images: prev.marble_images?.filter((_, i) => i !== index),
    }));
  };
  /* ================= SINGLE IMAGE UPLOAD ================= */
  const uploadSingleImage = async (
    file: File,
    p0: string,
  ): Promise<{ key: string; url: string }> => {
    const uuid_val = generateUniqueId();
    const imageDetails = {
      user_id: "anonymous",
      design_uuid_val: uuid_val,
      description: form.marble_name
        ? `Image for ${form.marble_name}`
        : "Marble Product Image",
      operation: "upload",
    };

    const res = await fetch(IMAGE_UPLOAD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(imageDetails),
    });

    if (!res.ok) throw new Error("Failed to get upload URL");

    const { s3_url } = await res.json();

    const putRes = await fetch(s3_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) throw new Error("Upload failed");

    const downloadRes = await fetch(IMAGE_UPLOAD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...imageDetails, operation: "download" }),
    });

    if (!downloadRes.ok) throw new Error("Failed to get image URL");

    const data = await downloadRes.json();
    return { key: data.s3_key, url: data.s3_url };
  };
  const handleCategoryChange = (category: string) => {
    setForm((prev) => {
      const existing = prev.marble_category || [];

      return {
        ...prev,
        marble_category: existing.includes(category)
          ? existing.filter((c) => c !== category) // remove
          : [...existing, category], // add
      };
    });
  };

  const handleImageAdd = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || imagesState.length >= 10) return;

    setImagesState((prev) => [...prev, { status: "uploading" }]);
    setForm((prev) => ({
      ...prev,
      marble_images: [...(prev.marble_images || []), { key: "", url: "" }],
    }));

    try {
      const uploaded = await uploadSingleImage(file, "marble_products");

      setImagesState((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          status: "uploaded",
          key: uploaded.key,
          url: uploaded.url,
        };
        return updated;
      });

      setForm((prev) => {
        const imgs = [...(prev.marble_images || [])];
        imgs[imgs.length - 1] = uploaded;
        return { ...prev, marble_images: imgs };
      });
    } catch (err: any) {
      setMessage("❌ Image upload failed");
      setImagesState((prev) => prev.slice(0, -1));
      setForm((prev) => ({
        ...prev,
        marble_images: prev.marble_images?.slice(0, -1),
      }));
    } finally {
      e.target.value = "";
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (isUploading) {
      setMessage("⏳ Please wait for image upload to finish");
      return;
    }

    for (const field of requiredFields) {
      if (!form[field as keyof typeof form]) {
        setMessage(`❌ ${field.replace("_", " ")} is required`);
        return;
      }
    }

    if (!form.tags?.length) {
      setMessage("❌ At least one tag is required");
      return;
    }

    if (!form.marble_images?.length) {
      setMessage("❌ At least one image is required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        operation: "create_product",
        ...form,
        price: Number(form.price),
        finish: form.finish || "default",
      };

      const res = await fetch(marble_products_api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server error");

      setMessage("✅ Product added successfully");
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl bg-white py-8  mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Add New Marble Product</h1>
      <p className="text-gray-500 mb-6">
        Fill the details below to add a new marble product.
      </p>

      {/* STEP 1 */}
      <div title="1️⃣ Product Details">
        <Input
          label="Marble Name"
          name="marble_name"
          value={form.marble_name || ""}
          onChange={handleChange}
        />
        <Input
          label="Meta Data"
          name="meta_data"
          value={form.meta_data || ""}
          onChange={handleChange}
        />
        <div title="Category">
          <div className="md:col-span-2">
            <label className="label mb-2 block">Select Categories *</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MARBLE_CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={(form.marble_category || []).includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Input
          label="Origin"
          name="origin"
          value={form.origin || ""}
          onChange={handleChange}
        />
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
        <div className="w-full">
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={4}
            className="
      sm:w-[810px] w-[100%]
      border-2 border-gray-400
      rounded-lg
      px-3 py-2
      text-sm
      resize-none
      focus:outline-none
      focus:border-black
      focus:ring-1
      focus:ring-black
    "
            placeholder="Enter product description"
          />
        </div>
      </div>

      {/* STEP 2 */}
      <Card title="2️⃣ Pricing Information">
        <Select
          label="Price Unit"
          name="price_unit"
          value={form.price_unit || ""}
          onChange={handleChange}
          options={[
            { value: "per_sq_ft", label: "Per Sq Ft" },
            { value: "per_unit", label: "Per Unit" },
          ]}
        />
        <Input
          label="Price"
          name="price"
          type="number"
          min={0}
          value={form.price || 0}
          onChange={handleChange}
        />
      </Card>
      <Select
        label="Stone Material"
        name="stone_material"
        value={form.stone_material || ""}
        onChange={handleChange}
        options={[
          { value: "white_marble", label: "Rajasthan White / Agaria" },
          { value: "makrana_marble", label: "Makrana White Marble" },
          { value: "vietnam_white_marble", label: "Vietnam White Marble" },
          { value: "bheslana_marble_black", label: "Bheslana Marble / Black" },
          {
            value: "baswara_marble_look_italian",
            label: "Baswara Marble / Look-Italian",
          },
          {
            value: "granite_south_black_stone",
            label: "Granite South Black Stone",
          },
          { value: "granite_red_stone", label: "Granite Red Stone" },
          { value: "makrana_pink_marble", label: "Makrana Pink Marble" },
          {
            value: "jaisalmer_sandstone_marble",
            label: "Jaisalmer SandStone Marble",
          },
          { value: "khatu_sandstone_marble", label: "Khatu SandStone Marble" },
          { value: "gwalior_mint_marble", label: "Gwalior Mint Marble" },
          { value: "udaipur_green_marble", label: "Udaipur Green Marble" },
          { value: "makrana_kumari_marble", label: "Makrana Kumari Marble" },
          { value: "onyx", label: "Onyx" },
          {
            value: "marquina_black_italian_marble",
            label: "Marquina Black Italian Marble ",
          },
          { value: "italian_marble", label: "Italian Marble" },
        ]}
      />

      <div className="grid grid-cols-4 gap-4 bg-white w-full h-auto shadow-md p-4 rounded-md my-2">
        <label htmlFor="">Feet</label>

        <input
          placeholder="Width"
          type="number"
          min={0}
          className="bg-white border-gray-500 rounded-lg border-2 p-2"
          value={form.marble_size?.width || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              marble_size: {
                width: Number(e.target.value),
                height: prev.marble_size?.height ?? 0,
                depth: prev.marble_size?.depth ?? 0,
              },
            }))
          }
        />
        <input
          placeholder="Height"
          type="number"
          min={0}
          className="bg-white border-gray-500 rounded-lg border-2 p-2"
          value={form.marble_size?.height || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              marble_size: {
                width: prev.marble_size?.width ?? 0,
                height: Number(e.target.value),
                depth: prev.marble_size?.depth ?? 0,
              },
            }))
          }
        />

        <input
          placeholder="Depth"
          type="number"
          min={0}
          className="bg-white border-gray-500 rounded-lg border-2 p-2"
          value={form.marble_size?.depth || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              marble_size: {
                width: prev.marble_size?.width ?? 0,
                height: prev.marble_size?.height ?? 0,
                depth: Number(e.target.value),
              },
            }))
          }
        />
      </div>
      {/* STEP 3 */}
      <Card title="3️⃣ Image & Availability">
        <div className="md:col-span-2">
          <label className="label">Tags</label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = tagInput.trim();
              if (!value) return;

              setForm((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), value],
              }));

              setTagInput("");
            }}
          >
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Type application and press Enter"
              className="
      w-full border-2 border-gray-400 rounded-lg px-3 py-2.5 text-sm
      focus:outline-none focus:border-black focus:ring-1 focus:ring-black
    "
            />
          </form>

          {/* Show saved applications */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(form.tags || []).map((app, i) => (
              <span
                key={i}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {app}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      tags: prev.tags?.filter((_, j) => j !== i),
                    }))
                  }
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="label">Key Features</label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = keyFeatureInput.trim(); // ✅ FIXED
              if (!value) return;

              setForm((prev) => ({
                ...prev,
                key_features: [...(prev.key_features || []), value],
              }));

              setKeyFeatureInput(""); // ✅ FIXED
            }}
          >
            <input
              type="text"
              value={keyFeatureInput}
              onChange={(e) => setKeyFeatureInput(e.target.value)}
              placeholder="Type Key Features and press Enter"
              className="
      w-full border-2 border-gray-400 rounded-lg px-3 py-2.5 text-sm
      focus:outline-none focus:border-black focus:ring-1 focus:ring-black
    "
            />
          </form>

          {/* Show saved applications */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(form.key_features || []).map((app, i) => (
              <span
                key={i}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {app}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      key_features: prev.key_features?.filter(
                        (_, j) => j !== i,
                      ),
                    }))
                  }
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <Select
          label="Availability"
          name="availability"
          value={form.availability || ""}
          onChange={handleChange}
          options={[
            { value: "In Stock", label: "In Stock" },
            { value: "Out of Stock", label: "Out of Stock" },
            { value: "Limited Stock", label: "Limited Stock" },
          ]}
        />

        <div className="md:col-span-2">
          <label className="label block mb-2">Add Images *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageAdd}
            className="hidden"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {imagesState.map((img, i) => (
              <div key={i} className="relative group">
                {img.status === "uploading" ? (
                  // Skeleton loader
                  <div className="h-32 w-full rounded border bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                ) : (
                  // Uploaded image
                  <>
                    <img
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      className="h-32 w-full rounded border object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
            {imagesState.length < 10 && (
              <div
                className="h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-gray-400 text-2xl font-semibold">+</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className={`px-6 py-3 rounded-md ${
          isSubmitDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white"
        }`}
      >
        {loading
          ? "Saving..."
          : isUploading
            ? "Uploading images..."
            : "Add Product"}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}

/* ================= UI HELPERS ================= */
function Card({ title, children }: any) {
  return (
    <section className="bg-white p-5 rounded-lg shadow mb-6">
      <h2 className="font-medium mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        required
        {...props}
        className="
          w-full
          border-2 border-gray-400
          rounded-lg
          px-3 py-2.5
          text-sm
          bg-white
          text-gray-900
          focus:outline-none
          focus:border-black
          focus:ring-1
          focus:ring-black
          transition
          duration-200
        "
      />
    </div>
  );
}

export function Select({ label, name, value, options, onChange }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        required
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          border-2 border-gray-400
          rounded-lg
          px-3 py-2.5
          text-sm
          bg-white
          text-gray-900
          focus:outline-none
          focus:border-black
          focus:ring-1
          focus:ring-black
          transition
          duration-200
        "
      >
        <option value="">Select {label}</option>

        {options.map((o: any) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
