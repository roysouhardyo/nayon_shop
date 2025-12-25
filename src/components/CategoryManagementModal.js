"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

export default function CategoryManagementModal({ lang, onClose, onSuccess }) {
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
          // If 'a' is 'others', it should come after 'b'
          if (a.id === "others") return 1;
          // If 'b' is 'others', it should come after 'a'
          if (b.id === "others") return -1;
          // Otherwise sort by order
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
        alert(lang === "bn" ? "ক্যাটাগরি যোগ হয়েছে" : "Category added");
        setFormData({ name_bn: "", name_en: "", id: "" });
        setShowAddCategory(false);
        fetchCategories();
        onSuccess();
      } else {
        alert(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
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
        alert(
          lang === "bn" ? "সাব-ক্যাটাগরি যোগ হয়েছে" : "Sub-category added"
        );
        setSubCategoryData({ bn: "", en: "" });
        setShowAddSubCategory(false);
        setSelectedCategory(null);
        fetchCategories();
        onSuccess();
      } else {
        alert(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error adding sub-category:", error);
      alert(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm(lang === "bn" ? "আপনি কি নিশ্চিত?" : "Are you sure?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        alert(
          lang === "bn" ? "ক্যাটাগরি মুছে ফেলা হয়েছে" : "Category deleted"
        );
        fetchCategories();
        onSuccess();
      } else {
        alert(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
  };

  const handleDeleteSubCategory = async (category, subIndex) => {
    if (!confirm(lang === "bn" ? "আপনি কি নিশ্চিত?" : "Are you sure?")) return;

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
        alert(
          lang === "bn"
            ? "সাব-ক্যাটাগরি মুছে ফেলা হয়েছে"
            : "Sub-category deleted"
        );
        fetchCategories();
        onSuccess();
      } else {
        alert(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error deleting sub-category:", error);
      alert(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    }
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
        <div className="flex justify-between items-center">
          <h3
            className={`text-lg font-semibold ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "সব ক্যাটাগরি" : "All Categories"}
          </h3>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="btn btn-primary text-sm"
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
              className={`font-semibold ${lang === "bn" ? "bengali-text" : ""}`}
            >
              {lang === "bn" ? "নতুন ক্যাটাগরি যোগ করুন" : "Add New Category"}
            </h4>
            <div className="grid grid-cols-3 gap-3">
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
                  className="input bengali-text"
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
                  className="input"
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
                  className="input"
                  placeholder="e.g: motorcycle-parts"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary text-sm">
                {lang === "bn" ? "যোগ করুন" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setFormData({ name_bn: "", name_en: "", id: "" });
                }}
                className="btn btn-secondary text-sm"
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4
                      className={`font-semibold text-gray-900 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? category.name_bn
                        : category.name_en || category.name_bn}
                    </h4>
                    <p className="text-xs text-gray-500">ID: {category.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowAddSubCategory(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + {lang === "bn" ? "সাব-ক্যাটাগরি" : "Sub-Category"}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {lang === "bn" ? "মুছুন" : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Sub-categories */}
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <p className="text-xs text-gray-600 font-medium">
                        {lang === "bn" ? "সাব-ক্যাটাগরি:" : "Sub-Categories:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.subCategories.map((sub, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                                handleDeleteSubCategory(category, index)
                              }
                              className="text-red-600 hover:text-red-800"
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

        {/* Add Sub-Category Modal */}
        {showAddSubCategory && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "সাব-ক্যাটাগরি যোগ করুন" : "Add Sub-Category"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {lang === "bn" ? "ক্যাটাগরি:" : "Category:"}{" "}
                <span className="font-semibold">
                  {lang === "bn"
                    ? selectedCategory.name_bn
                    : selectedCategory.name_en || selectedCategory.name_bn}
                </span>
              </p>
              <form onSubmit={handleAddSubCategory} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="input bengali-text"
                    placeholder="যেমন: ইঞ্জিন পার্টস"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="input"
                    placeholder="e.g: Engine Parts"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 btn btn-primary">
                    {lang === "bn" ? "যোগ করুন" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSubCategory(false);
                      setSelectedCategory(null);
                      setSubCategoryData({ bn: "", en: "" });
                    }}
                    className="flex-1 btn btn-secondary"
                  >
                    {lang === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
