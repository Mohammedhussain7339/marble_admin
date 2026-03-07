// components/ImageGrid.tsx
import { useRef } from "react";
import { ImageState } from "./EditProductModal"; // Import type

interface ImageGridProps {
  imagesState: ImageState[];
  onImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onReplaceImage: (index: number, file: File) => void; // 👈 add
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function ImageGrid({ imagesState, onImageAdd, onRemoveImage, fileInputRef }: ImageGridProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 10)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageAdd}
        className="hidden"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imagesState.map((img, i) => (
          <div key={i} className="relative group">
            {img.status === 'uploading' ? (
              <div className="h-32 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            ) : (
              <>
                <img
                  src={img.url}
                  alt={`Product image ${i + 1}`}
                  className="h-32 w-full rounded-lg border object-cover cursor-pointer hover:opacity-80 transition"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(i);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
        {imagesState.length < 10 && (
          <div
            className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-gray-400 text-3xl font-bold">+</span>
            <p className="text-xs text-gray-500 mt-1">Add Image</p>
          </div>
        )}
      </div>
      {imagesState.length >= 10 && (
        <p className="text-sm text-gray-500 mt-2">Maximum 10 images reached.</p>
      )}
    </div>
  );
}