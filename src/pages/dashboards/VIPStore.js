import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminAPI } from "../../lib/api";
import { storageService } from "../../lib/storage";
import toast from "react-hot-toast";

export default function VIPStore({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    points: "",
    description: "",
    stock: "",
    images: ["", "", ""],
    imageFiles: [null, null, null], // Store actual file objects
    isActive: true,
  });

  // Fetch all VIP products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["vipProducts", selectedClubId],
    queryFn: () => superAdminAPI.getVipProducts(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      // Upload images first - USE SAME METHOD AS FNB!
      const uploadedImageUrls = [];
      for (let i = 0; i < 3; i++) {
        if (data.imageFiles[i]) {
          try {
            // Use storageService.uploadDocument (same as FNB)
            const publicUrl = await storageService.uploadDocument(
              data.imageFiles[i],
              selectedClubId,
              'vip-store'
            );
            uploadedImageUrls.push({ url: publicUrl });
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
            toast.error(`Failed to upload image ${i + 1}`);
          }
        } else if (data.images[i] && data.images[i].trim() !== "") {
          // Use URL if provided
          uploadedImageUrls.push({ url: data.images[i] });
        }
      }

      return await superAdminAPI.createVipProduct(selectedClubId, {
        title: data.title,
        points: parseInt(data.points),
        description: data.description,
        stock: parseInt(data.stock) || 0,
        images: uploadedImageUrls,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries(["vipProducts", selectedClubId]);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }) => {
      // Upload new images first - USE SAME METHOD AS FNB!
      const uploadedImageUrls = [];
      for (let i = 0; i < 3; i++) {
        if (data.imageFiles[i]) {
          try {
            // Use storageService.uploadDocument (same as FNB)
            const publicUrl = await storageService.uploadDocument(
              data.imageFiles[i],
              selectedClubId,
              'vip-store'
            );
            uploadedImageUrls.push({ url: publicUrl });
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
            toast.error(`Failed to upload image ${i + 1}`);
          }
        } else if (data.images[i] && data.images[i].trim() !== "") {
          // Keep existing URL
          uploadedImageUrls.push({ url: data.images[i] });
        }
      }

      return await superAdminAPI.updateVipProduct(selectedClubId, productId, {
        title: data.title,
        points: parseInt(data.points),
        description: data.description,
        stock: parseInt(data.stock) || 0,
        images: uploadedImageUrls,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["vipProducts", selectedClubId]);
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      return await superAdminAPI.deleteVipProduct(selectedClubId, productId);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["vipProducts", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const resetForm = () => {
    setProductForm({
      title: "",
      points: "",
      description: "",
      stock: "",
      images: ["", "", ""],
      imageFiles: [null, null, null],
      isActive: true,
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      toast.error("Product title is required");
      return;
    }
    if (!productForm.points || parseInt(productForm.points) <= 0) {
      toast.error("Valid points value is required");
      return;
    }
    createProductMutation.mutate(productForm);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      points: product.points.toString(),
      description: product.description || "",
      stock: product.stock?.toString() || "0",
      images: [
        product.images?.[0]?.url || "",
        product.images?.[1]?.url || "",
        product.images?.[2]?.url || "",
      ],
      imageFiles: [null, null, null],
      isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      toast.error("Product title is required");
      return;
    }
    if (!productForm.points || parseInt(productForm.points) <= 0) {
      toast.error("Valid points value is required");
      return;
    }
    updateProductMutation.mutate({
      productId: selectedProduct.id,
      data: productForm,
    });
  };

  const handleDelete = (productId, productTitle) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">VIP Store Management</h1>
          <p className="text-gray-400">Manage products that players can redeem with VIP points</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg"
        >
          + Add New Product
        </button>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No products in the VIP Store yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 transition-all shadow-lg"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-slate-700">
                {product.images && product.images.length > 0 && product.images[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    product.images && product.images.length > 0 && product.images[0]?.url ? "hidden" : "flex"
                  }`}
                >
                  <div className="text-6xl text-gray-600">🎁</div>
                </div>
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description || "No description"}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-yellow-400 font-bold text-lg">
                      {product.points.toLocaleString()} Points
                    </div>
                    <div className="text-gray-400 text-sm">
                      Stock: {product.stock || 0}
                    </div>
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div className="text-gray-400 text-sm">
                      +{product.images.length - 1} more {product.images.length === 2 ? "image" : "images"}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.title)}
                    disabled={deleteProductMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductModal
          title="Create New Product"
          form={productForm}
          setForm={setProductForm}
          onSubmit={handleCreateSubmit}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isLoading={createProductMutation.isPending}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <ProductModal
          title="Edit Product"
          form={productForm}
          setForm={setProductForm}
          onSubmit={handleUpdateSubmit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            resetForm();
          }}
          isLoading={updateProductMutation.isPending}
        />
      )}
    </div>
  );
}

// Product Form Modal Component
function ProductModal({ title, form, setForm, onSubmit, onClose, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full my-8 border border-slate-700 max-h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Product Title */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Product Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Premium Poker Chips Set"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Points & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                VIP Points <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                placeholder="e.g., 5000"
                min="1"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Stock Quantity
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="e.g., 50"
                min="0"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Product Images (Up to 3) */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Product Images (Up to 3)
            </label>
            {[0, 1, 2].map((index) => (
              <div key={index} className="mb-3">
                <div className="flex gap-2">
                  {/* File Upload Button */}
                  <label className="flex-shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (5MB max)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image must be less than 5MB");
                            return;
                          }
                          const newFiles = [...form.imageFiles];
                          newFiles[index] = file;
                          setForm({ ...form, imageFiles: newFiles });
                        }
                      }}
                    />
                    {form.imageFiles[index] ? "✓ File Selected" : "Choose File"}
                  </label>
                  
                  {/* OR URL Input */}
                  <input
                    type="url"
                    value={form.images[index]}
                    onChange={(e) => {
                      const newImages = [...form.images];
                      newImages[index] = e.target.value;
                      setForm({ ...form, images: newImages });
                    }}
                    placeholder={`Or paste URL ${index + 1}${index === 0 ? " (Primary)" : " (Optional)"}`}
                    disabled={!!form.imageFiles[index]}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                  
                  {/* Clear Button */}
                  {(form.imageFiles[index] || form.images[index]) && (
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = [...form.imageFiles];
                        const newImages = [...form.images];
                        newFiles[index] = null;
                        newImages[index] = "";
                        setForm({ ...form, imageFiles: newFiles, images: newImages });
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
                {form.imageFiles[index] && (
                  <p className="text-green-400 text-xs mt-1">
                    📁 {form.imageFiles[index].name} ({(form.imageFiles[index].size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            ))}
            <p className="text-gray-500 text-xs mt-2">
              Upload image files (max 5MB each) or paste direct URLs
            </p>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-5 h-5 text-purple-600 bg-slate-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-gray-300 font-semibold">
              Product is Active (Available for redemption)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? "Saving..." : title === "Create New Product" ? "Create Product" : "Update Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

