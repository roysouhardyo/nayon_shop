"use client";

import { useState, useRef } from "react";

export default function ImageUpload({
  images = [],
  onChange,
  lang = "bn",
  maxImages = 5,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > maxImages) {
      alert(
        lang === "bn"
          ? `সর্বোচ্চ ${maxImages}টি ছবি আপলোড করতে পারবেন`
          : `Maximum ${maxImages} images allowed`
      );
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      // Debug: Check if cloud name is available
      if (!cloudName) {
        console.error(
          "Cloudinary cloud name not found in environment variables"
        );
        alert(
          lang === "bn"
            ? "Cloudinary কনফিগারেশন পাওয়া যায়নি। সার্ভার রিস্টার্ট করুন।"
            : "Cloudinary configuration not found. Please restart the server."
        );
        setUploading(false);
        return;
      }

      console.log("Uploading to Cloudinary:", cloudName);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "nayonshop"); // Correct preset name
        formData.append("folder", "products");

        console.log("Uploading file:", file.name);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        console.log("Upload response:", data);

        if (data.error) {
          console.error("Cloudinary error:", data.error);
          alert(
            lang === "bn"
              ? `ত্রুটি: ${data.error.message}`
              : `Error: ${data.error.message}`
          );
          break;
        }

        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
          console.log("Image uploaded successfully:", data.secure_url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        lang === "bn"
          ? `ছবি আপলোড করতে সমস্যা হয়েছে: ${error.message}`
          : `Error uploading images: ${error.message}`
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label
          className={`block text-sm font-medium text-gray-700 mb-2 ${
            lang === "bn" ? "bengali-text" : ""
          }`}
        >
          {lang === "bn" ? "পণ্যের ছবি" : "Product Images"}
          <span className="text-gray-500 text-xs ml-2">
            ({lang === "bn" ? "সর্বোচ্চ" : "Max"} {maxImages})
          </span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />

        <label
          htmlFor="image-upload"
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
            uploading || images.length >= maxImages
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {uploading
            ? lang === "bn"
              ? "আপলোড হচ্ছে..."
              : "Uploading..."
            : lang === "bn"
            ? "ছবি নির্বাচন করুন"
            : "Select Images"}
        </label>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
            >
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title={lang === "bn" ? "মুছুন" : "Remove"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {lang === "bn" ? "প্রধান" : "Primary"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {lang === "bn"
          ? "প্রথম ছবিটি প্রধান ছবি হিসেবে দেখানো হবে। ছবি টেনে সাজাতে পারবেন।"
          : "First image will be shown as primary. You can drag to reorder."}
      </p>
    </div>
  );
}
