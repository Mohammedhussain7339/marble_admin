"use client";

type LoginRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export default function LoginRequiredModal({
  open,
  onClose,
  onLogin,
}: LoginRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-[90%] max-w-sm p-6 text-center shadow-2xl">
        <h2 className="text-lg font-serif text-[#2F2621]">Login Required</h2>

        <p className="mt-3 text-sm text-[#6F6353]">
          Please login to continue with this action.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="
              w-1/2 py-2.5 rounded-full text-sm
              border border-gray-300
              text-gray-600
              hover:bg-gray-100 transition
            "
          >
            Cancel
          </button>

          <button
            onClick={onLogin}
            className="
              w-1/2 py-2.5 rounded-full text-sm
              bg-[#2F2621] text-white
              hover:bg-[#C6A75E] transition
            "
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
