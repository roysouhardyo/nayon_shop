"use client";

import { useState } from "react";
import StockBadge from "./StockBadge";

export default function ProductCardWithCarousel({ product, lang }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Show name with fallback
  const displayName =
    lang === "bn"
      ? product.name_bn || product.name_en
      : product.name_en || product.name_bn;

  return (
    <div className="bg-white rounded-xl shadow-md border-[3px] border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-primary-500 cursor-pointer">
      {/* Product Image Carousel */}
      <div className="relative w-full h-48 bg-gray-100 group">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={displayName}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows - Only show if multiple images */}
            {hasMultipleImages && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => goToImage(index, e)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-400"
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
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <div className="mb-2">
          {product.name_bn && (
            <h3 className="font-bold text-lg text-gray-900 bengali-text line-clamp-1">
              {product.name_bn}
            </h3>
          )}
          {product.name_en && (
            <h3
              className={`font-bold text-gray-900 line-clamp-1 ${
                product.name_bn ? "text-base" : "text-lg"
              }`}
            >
              {product.name_en}
            </h3>
          )}
        </div>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-3">
          {product.category_bn && (
            <span className="bengali-text">{product.category_bn}</span>
          )}
          {product.category_bn && product.category_en && (
            <span className="mx-1">•</span>
          )}
          {product.category_en && <span>{product.category_en}</span>}
          {(product.subCategory_bn || product.subCategory_en) && (
            <span>
              {" "}
              ›{" "}
              {product.subCategory_bn && (
                <span className="bengali-text">{product.subCategory_bn}</span>
              )}
              {product.subCategory_bn && product.subCategory_en && (
                <span className="mx-1">•</span>
              )}
              {product.subCategory_en && <span>{product.subCategory_en}</span>}
            </span>
          )}
        </p>

        {/* Brand & Model */}
        <div className="space-y-1 mb-3 pb-3 border-b border-gray-200">
          {product.brand && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">
                {lang === "bn" ? "ব্র্যান্ড" : "Brand"}:
              </span>
              <span className="font-medium text-gray-900">{product.brand}</span>
            </div>
          )}
          {product.compatibleModel && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">
                {lang === "bn" ? "মডেল" : "Model"}:
              </span>
              <span className="font-medium text-gray-900">
                {product.compatibleModel}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-lg p-3 mb-3 border-2 border-primary-200">
          <p className="text-xs text-gray-600 mb-1">
            {lang === "bn" ? "মূল্য" : "Price"}
          </p>
          <p className="text-2xl font-bold text-primary-600">
            {lang === "bn" ? "৳ " : "BDT "}
            {product.sellingPrice}
          </p>
        </div>

        {/* Current Stock */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border-2 border-gray-300">
          <StockBadge
            quantity={product.stockQuantity}
            minimumStock={product.minimumStockLevel}
          />
          <div className="text-right">
            <p className="text-xs text-gray-600">
              {lang === "bn" ? "স্টক" : "Stock"}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {product.stockQuantity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
