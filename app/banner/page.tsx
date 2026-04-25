"use client";

import { useState, useEffect } from "react";
import { callApi } from "../lib/api/banner";
import { uploadSingleImage } from "../lib/api/uploadImg";

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

export default function PosterPage() {
  const [category, setCategory] = useState("");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateDesktopFile, setUpdateDesktopFile] = useState<File | null>(null);
  const [updateMobileFile, setUpdateMobileFile] = useState<File | null>(null);
  // ================= FILE HANDLER =================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (type === "desktop") {
      setDesktopFile(file);
      setDesktopPreview(preview);
    } else {
      setMobileFile(file);
      setMobilePreview(preview);
    }
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    if (!category) return alert("Select category");

    setLoading(true);

    try {
      let desktopData = null;
      let mobileData = null;

      if (desktopFile) {
        desktopData = await uploadSingleImage(desktopFile, "posters/desktop");
      }

      if (mobileFile) {
        mobileData = await uploadSingleImage(mobileFile, "posters/mobile");
      }

      await callApi({
        action: "create_poster",
        category,
        poster_desktop_url: desktopData?.url,
        poster_desktop_key: desktopData?.key,
        poster_mobile_url: mobileData?.url,
        poster_mobile_key: mobileData?.key,
        custom_url: customUrl,
        heading,
        subheading,
      });

      alert("Poster created ✅");

      // reset
      setCategory("");
      setDesktopFile(null);
      setMobileFile(null);
      setDesktopPreview("");
      setMobilePreview("");
      setCustomUrl("");
      setHeading("");
      setSubheading("");
      fetchPosters();
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH =================
  const fetchPosters = async () => {
    try {
      const data = await callApi({
        action: "get_posters",
      });
      setPosters(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);
const getImageUrl = (key: string) => {
  if (!key) return "";
  return `https://marble-imgs-our.s3.amazonaws.com/${key}`;
};
  // ================= DELETE =================
  const handleDelete = async (poster_id: string) => {
    if (!confirm("Delete this poster?")) return;

    try {
      await callApi({
        action: "delete_poster",
        poster_id,
      });

      alert("Deleted ✅");
      fetchPosters();
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };
  const openUpdateModal = (poster: any) => {
    setEditData(poster);
    setIsModalOpen(true);
  };
  // ================= UPDATE =================
const handleUpdateSubmit = async () => {
  try {
    let desktopData = null;
    let mobileData = null;

    // upload new desktop image
    if (updateDesktopFile) {
      desktopData = await uploadSingleImage(updateDesktopFile, "posters/desktop");
    }

    // upload new mobile image
    if (updateMobileFile) {
      mobileData = await uploadSingleImage(updateMobileFile, "posters/mobile");
    }

    await callApi({
      action: "update_poster",
      poster_id: editData.poster_id,
      poster_category: editData.poster_category,
      custom_url: editData.custom_url,
      heading: editData.heading,
      subheading: editData.subheading,

      // ✅ send only if updated
      ...(desktopData && {
        poster_desktop_key: desktopData.key,
        poster_desktop_url: desktopData.url,
      }),

      ...(mobileData && {
        poster_mobile_key: mobileData.key,
        poster_mobile_url: mobileData.url,
      }),
    });

    alert("Updated ✅");
    setIsModalOpen(false);
    fetchPosters();
  } catch (err) {
    console.error(err);
    alert("Update failed ❌");
  }
};

  // ================= UI =================
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white p-5 rounded-xl shadow border mb-5">
        <h2 className="font-semibold mb-3">Create Poster</h2>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500">
          <option value="">Select Category</option>
          {MARBLE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Enter URL"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Subheading"
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
        />
      </div>{" "}
      {/* DESKTOP IMAGE */}
      <div className="mb-4">
        <p className="text-sm mb-1">Desktop Image</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "desktop")}
        />
        {desktopPreview && (
          <img src={desktopPreview} className="w-40 mt-2 rounded border" />
        )}
      </div>
      {/* MOBILE IMAGE */}
      <div className="mb-4">
        <p className="text-sm mb-1">Mobile Image</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "mobile")}
        />
        {mobilePreview && (
          <img src={mobilePreview} className="w-40 mt-2 rounded border" />
        )}
      </div>
      {/* CREATE BUTTON */}
<button
  onClick={handleCreate}
  disabled={loading || posters.length >= 6}
  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
>
  {posters.length >= 6
    ? "Max 6 banners reached"
    : loading
    ? "Uploading..."
    : "Upload Poster"}
</button>      {/* POSTER LIST */}
      <div className=" flex gap-3 p-4 mt-6">
        {posters.map((p, index) => (
          <div key={p.poster_id} className="border p-3 rounded">
            {/* INDEX + CATEGORY */}
            <p className="text-sm font-medium mb-2">
              {index + 1}. {p.poster_category}
            </p>

            {/* IMAGES */}
            {p.poster_desktop_url && (
              <img
                src={p.poster_desktop_url}
                className="w-full h-40 object-cover rounded"
              />
            )}

            {p.poster_mobile_url && (
              <img
                src={p.poster_mobile_url}
                className="w-full h-40 object-cover mt-2 rounded"
              />
            )}
            <p className="text-blue-600 text-sm break-all">{p.custom_url}</p>

            <p className="font-semibold">{p.heading}</p>

            <p className="text-gray-500 text-sm">{p.subheading}</p>
            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => openUpdateModal(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                Update
              </button>

              {/* <button
                onClick={() => handleDelete(p.poster_id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                Delete
              </button> */}
            </div>
          </div>
        ))}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[400px]">
              <h2 className="text-lg font-semibold mb-4">Update Poster</h2>

              <select
                value={editData.poster_category}
                onChange={(e) =>
                  setEditData({ ...editData, poster_category: e.target.value })
                }
                className="w-full p-2 border mb-3 rounded">
                {MARBLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={editData.custom_url || ""}
                onChange={(e) =>
                  setEditData({ ...editData, custom_url: e.target.value })
                }
                placeholder="URL"
                className="w-full p-2 border mb-3 rounded"
              />

              <input
                type="text"
                value={editData.heading || ""}
                onChange={(e) =>
                  setEditData({ ...editData, heading: e.target.value })
                }
                placeholder="Heading"
                className="w-full p-2 border mb-3 rounded"
              />

              <textarea
                value={editData.subheading || ""}
                onChange={(e) =>
                  setEditData({ ...editData, subheading: e.target.value })
                }
                placeholder="Subheading"
                className="w-full p-2 border mb-3 rounded"
              />
              {updateDesktopFile && (
  <img
    src={URL.createObjectURL(updateDesktopFile)}
    className="w-32 mb-2"
  />
)}
              {/* DESKTOP IMAGE UPDATE */}
<input
  type="file"
  accept="image/*"
  onChange={(e) => setUpdateDesktopFile(e.target.files?.[0] || null)}
  className="w-full mb-3"
/>

{/* MOBILE IMAGE UPDATE */}
<input
  type="file"
  accept="image/*"
  onChange={(e) => setUpdateMobileFile(e.target.files?.[0] || null)}
  className="w-full mb-3"
/>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded">
                  Cancel
                </button>

                <button
                  onClick={handleUpdateSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
