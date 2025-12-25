"use client";

import { useState, useEffect } from "react";

export default function ImageModal({
  images = [],
  initialIndex = 0,
  onClose,
  productName = "",
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Handle ESC key
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsZoomed(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsZoomed(false);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        <svg
          className="w-8 h-8"
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

      {/* Product Name */}
      <div className="absolute top-4 left-4 text-white z-10">
        <h3 className="text-lg font-semibold">{productName}</h3>
        <p className="text-sm text-gray-300">
          Image {currentIndex + 1} of {images.length}
        </p>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={images[currentIndex]}
          alt={`${productName} - ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain cursor-pointer transition-transform duration-300 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          onClick={toggleZoom}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all ${
              currentIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
            }`}
            aria-label="Previous image"
          >
            <svg
              className="w-6 h-6"
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

          <button
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all ${
              currentIndex === images.length - 1
                ? "opacity-30 cursor-not-allowed"
                : ""
            }`}
            aria-label="Next image"
          >
            <svg
              className="w-6 h-6"
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
        </>
      )}

      {/* Thumbnail Strip (Bottom) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-black/50 rounded-lg max-w-full overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-white scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
        {isZoomed ? "Click to zoom out" : "Click image to zoom in"}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs">
        <p>← → Navigate | ESC Close</p>
      </div>
    </div>
  );
}
