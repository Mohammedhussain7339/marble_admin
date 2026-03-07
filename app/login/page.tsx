"use client";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-6">Admin Login</h2>

        <input
          placeholder="Email"
          className="w-full border px-4 py-2 rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-4 py-2 rounded mb-6"
        />

        <button className="w-full bg-gray-900 text-white py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
