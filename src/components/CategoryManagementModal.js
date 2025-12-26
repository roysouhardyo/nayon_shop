"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { useNotification } from "@/components/NotificationProvider";

export default function CategoryManagementModal({ lang, onClose, onSuccess }) {
  const notification = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name_bn: "",
    name_en: "",
    id: "",
  });
  const [subCategoryData, setSubCategoryData] = useState({
    bn: "",
    en: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    type: null,
    item: null,
    subIndex: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        // Sort categories: 'others' always at the end, rest by order
        const sortedCategories = data.categories.sort((a, b) => {
          if (a.id === "others") return 1;
          if (b.id === "others") return -1;
          return (a.order || 999) - (b.order || 999);
        });
        setCategories(sortedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        notification.success(
          lang === "bn" ? "ক্যাটাগরি যোগ হয়েছে" : "Category added"
        );
        setFormData({ name_bn: "", name_en: "", id: "" });
        setShowAddCategory(false);
        fetchCategories();
        onSuccess();
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error adding category:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const updatedSubCategories = [
        ...(selectedCategory.subCategories || []),
        subCategoryData,
      ];

      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedCategory._id,
          subCategories: updatedSubCategories,
        }),
      });

      const data = await response.json();

      if (data.success) {
        notification.success(
          lang === "bn" ? "সাব-ক্যাটাগরি যোগ হয়েছে" : "Sub-category added"
        );
        setSubCategoryData({ bn: "", en: "" });
        setShowAddSubCategory(false);
        setSelectedCategory(null);
        fetchCategories();
        onSuccess();
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error adding sub-category:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        notification.success(
          lang === "bn" ? "ক্যাটাগরি মুছে ফেলা হয়েছে" : "Category deleted"
        );
        fetchCategories();
        onSuccess();
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
    setDeleteConfirm({ show: false, type: null, item: null, subIndex: null });
  };

  const handleDeleteSubCategory = async (category, subIndex) => {
    try {
      const token = localStorage.getItem("authToken");
      const updatedSubCategories = category.subCategories.filter(
        (_, i) => i !== subIndex
      );

      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: category._id,
          subCategories: updatedSubCategories,
        }),
      });

      const data = await response.json();

      if (data.success) {
        notification.success(
          lang === "bn"
            ? "সাব-ক্যাটাগরি মুছে ফেলা হয়েছে"
            : "Sub-category deleted"
        );
        fetchCategories();
        onSuccess();
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error deleting sub-category:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
    setDeleteConfirm({ show: false, type: null, item: null, subIndex: null });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={lang === "bn" ? "ক্যাটাগরি ম্যানেজমেন্ট" : "Category Management"}
      size="xl"
    >
      <div className="space-y-4">
        {/* Add Category Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3
            className={`text-base sm:text-lg font-semibold ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "সব ক্যাটাগরি" : "All Categories"}
          </h3>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="btn btn-primary text-sm w-full sm:w-auto py-3 sm:py-2"
          >
            + {lang === "bn" ? "নতুন ক্যাটাগরি" : "New Category"}
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <form
            onSubmit={handleAddCategory}
            className="bg-blue-50 p-4 rounded-lg space-y-3"
          >
            <h4
              className={`font-semibold text-sm sm:text-base ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "নতুন ক্যাটাগরি যোগ করুন" : "Add New Category"}
            </h4>

            {/* Mobile: Stack vertically, Desktop: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === "bn" ? "বাংলা নাম" : "Bangla Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_bn}
                  onChange={(e) =>
                    setFormData({ ...formData, name_bn: e.target.value })
                  }
                  className="input bengali-text text-base"
                  placeholder="যেমন: মোটরসাইকেল পার্টস"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name - {lang === "bn" ? "ঐচ্ছিক" : "Optional"}
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                  className="input text-base"
                  placeholder="e.g: Motorcycle Parts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID (Unique) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="input text-base"
                  placeholder="e.g: motorcycle-parts"
                />
              </div>
            </div>

            {/* Mobile-friendly buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="btn btn-primary text-sm py-3 sm:py-2 flex-1"
              >
                {lang === "bn" ? "যোগ করুন" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setFormData({ name_bn: "", name_en: "", id: "" });
                }}
                className="btn btn-secondary text-sm py-3 sm:py-2 flex-1"
              >
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 border-4 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category._id}
                className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-primary-300 transition-colors"
              >
                {/* Category Header - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-gray-900 text-base sm:text-lg ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? category.name_bn
                        : category.name_en || category.name_bn}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {category.id}
                    </p>
                  </div>

                  {/* Action buttons - Mobile friendly */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowAddSubCategory(true);
                      }}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                      + {lang === "bn" ? "সাব-ক্যাটাগরি" : "Sub-Category"}
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          show: true,
                          type: "category",
                          item: category,
                          subIndex: null,
                        })
                      }
                      className="px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                    >
                      {lang === "bn" ? "মুছুন" : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Sub-categories */}
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        {lang === "bn" ? "সাব-ক্যাটাগরি:" : "Sub-Categories:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.subCategories.map((sub, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                          >
                            <span
                              className={`text-gray-900 ${
                                lang === "bn" ? "bengali-text" : ""
                              }`}
                            >
                              {lang === "bn" ? sub.bn : sub.en || sub.bn}
                            </span>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  show: true,
                                  type: "subcategory",
                                  item: category,
                                  subIndex: index,
                                })
                              }
                              className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Add Sub-Category Modal - Mobile Optimized */}
        {showAddSubCategory && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div
              className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md flex flex-col"
              style={{ maxHeight: "70vh" }}
            >
              {/* Mobile: Drag handle */}
              <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Scrollable content area */}
              <div className="overflow-y-auto flex-1 px-4 sm:px-6">
                <h3
                  className={`text-base sm:text-lg font-semibold mb-3 pt-1 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn"
                    ? "সাব-ক্যাটাগরি যোগ করুন"
                    : "Add Sub-Category"}
                </h3>

                <div className="bg-blue-50 rounded-lg p-2.5 mb-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {lang === "bn" ? "ক্যাটাগরি:" : "Category:"}{" "}
                    <span
                      className={`font-semibold text-gray-900 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? selectedCategory.name_bn
                        : selectedCategory.name_en || selectedCategory.name_bn}
                    </span>
                  </p>
                </div>

                <form
                  onSubmit={handleAddSubCategory}
                  className="space-y-3 pb-3"
                >
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      {lang === "bn" ? "বাংলা নাম" : "Bangla Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={subCategoryData.bn}
                      onChange={(e) =>
                        setSubCategoryData({
                          ...subCategoryData,
                          bn: e.target.value,
                        })
                      }
                      className="input bengali-text text-base"
                      placeholder="যেমন: ইঞ্জিন পার্টস"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      English Name - {lang === "bn" ? "ঐচ্ছিক" : "Optional"}
                    </label>
                    <input
                      type="text"
                      value={subCategoryData.en}
                      onChange={(e) =>
                        setSubCategoryData({
                          ...subCategoryData,
                          en: e.target.value,
                        })
                      }
                      className="input text-base"
                      placeholder="e.g: Engine Parts"
                    />
                  </div>
                </form>
              </div>

              {/* Fixed button area at bottom */}
              <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 bg-white rounded-b-2xl sm:rounded-b-lg">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleAddSubCategory}
                    className="flex-1 btn btn-primary py-2.5 sm:py-2 text-sm sm:text-base font-medium"
                  >
                    {lang === "bn" ? "যোগ করুন" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSubCategory(false);
                      setSelectedCategory(null);
                      setSubCategoryData({ bn: "", en: "" });
                    }}
                    className="flex-1 btn btn-secondary py-2.5 sm:py-2 text-sm sm:text-base font-medium"
                  >
                    {lang === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <Modal
            isOpen={true}
            onClose={() =>
              setDeleteConfirm({
                show: false,
                type: null,
                item: null,
                subIndex: null,
              })
            }
            title={lang === "bn" ? "নিশ্চিত করুন" : "Confirm Delete"}
            size="sm"
          >
            <div className="space-y-4">
              <p
                className={`text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn"
                  ? "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?"
                  : "Are you sure you want to delete this?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      type: null,
                      item: null,
                      subIndex: null,
                    })
                  }
                  className="flex-1 btn btn-secondary"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === "category") {
                      handleDeleteCategory(deleteConfirm.item._id);
                    } else if (deleteConfirm.type === "subcategory") {
                      handleDeleteSubCategory(
                        deleteConfirm.item,
                        deleteConfirm.subIndex
                      );
                    }
                  }}
                  className="flex-1 btn btn-danger"
                >
                  {lang === "bn" ? "মুছুন" : "Delete"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
}
