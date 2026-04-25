"use client";

import { useEffect, useState,useMemo } from "react";

type Contact = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
};

export default function ContactTablePage() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateSort, setDateSort] = useState<"latest" | "oldest">("latest");
  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://j69luztjw7.execute-api.ap-south-1.amazonaws.com/default/contectus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_action: "get_contacts",
          }),
        },
      );

      const result = await res.json();
      console.log("API result:", result);

      let contacts = [];

      if (Array.isArray(result)) {
        contacts = result;
      } else if (Array.isArray(result?.items)) {
        contacts = result.items;
      } else if (typeof result?.body === "string") {
        const parsedBody = JSON.parse(result.body);
        contacts = Array.isArray(parsedBody) ? parsedBody : [];
      } else if (Array.isArray(result?.body)) {
        contacts = result.body;
      }

      setData(contacts);
    } catch (err) {
      console.error("Fetch error", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
const filteredData = useMemo(() => {
  let temp = [...data];

  // 🔍 Search
  if (search) {
    temp = temp.filter((item) =>
      `${item.name} ${item.email} ${item.phone}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  // 🔤 Name Sort
  temp.sort((a, b) => {
    const nameA = a.name?.toLowerCase() || "";
    const nameB = b.name?.toLowerCase() || "";

    return sortOrder === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  // 📅 Date Sort
  temp.sort((a, b) => {
    const dateA = new Date(a.created_at || "").getTime();
    const dateB = new Date(b.created_at || "").getTime();

    return dateSort === "latest" ? dateB - dateA : dateA - dateB;
  });

  return temp;
}, [data, search, sortOrder, dateSort]);
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enquiry List</h1>
    <div className="flex flex-col md:flex-row gap-3 mb-4">

  {/* 🔍 Search */}
  <input
    type="text"
    placeholder="Search name, email, phone..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-3 py-2 rounded-lg w-full md:w-1/3"
  />

  {/* 🔤 Name Sort */}
  <select
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value as any)}
    className="border px-3 py-2 rounded-lg"
  >
    <option value="asc">Name A-Z</option>
    <option value="desc">Name Z-A</option>
  </select>

  {/* 📅 Date Sort */}
  <select
    value={dateSort}
    onChange={(e) => setDateSort(e.target.value as any)}
    className="border px-3 py-2 rounded-lg"
  >
    <option value="latest">Latest First</option>
    <option value="oldest">Oldest First</option>
  </select>

</div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full text-sm text-left">
            {/* HEADER */}
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Pincode</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.email}</td>
                    <td className="p-3">{item.phone}</td>
                    <td className="p-3">
                      {item.city}, {item.state}
                    </td>
                    <td className="p-3">{item.pincode}</td>
                    <td className="p-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
