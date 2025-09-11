"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, DollarSign, Clock } from "lucide-react";
import { adminApi, Category } from "@/services/api";
import { useNotifications } from "@/components/ui/NotificationSystem";
import { useLoading } from "@/contexts/LoadingContext";
import { AccessibleForm, FormField } from "@/components/ui/AccessibleForm";
import LoadingButton from "@/components/ui/LoadingButton";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ButtonGroup,
} from "@/components/layout/AppProviders";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const notifications = useNotifications();
  const { showLoading, hideLoading } = useLoading();

  // Load categories
  const loadCategories = async () => {
    try {
      showLoading("Loading categories...");
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      notifications.showError("Failed to load categories", error.message);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name || !formData.rateNormal || !formData.rateSpecial) {
      notifications.showError(
        "Validation Error",
        "Please fill in all required fields"
      );
      return;
    }

    try {
      if (editingId) {
        showLoading("Updating category...");
        const updated = await adminApi.updateCategory(editingId, formData);
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editingId ? updated : cat))
        );
        notifications.showSuccess("Category updated successfully");
      } else {
        showLoading("Creating category...");
        const created = await adminApi.createCategory(
          formData as Omit<Category, "id">
        );
        setCategories((prev) => [...prev, created]);
        notifications.showSuccess("Category created successfully");
      }

      resetForm();
    } catch (error: any) {
      notifications.showError("Operation failed", error.message);
    } finally {
      hideLoading();
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      showLoading("Deleting category...");
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      notifications.showSuccess("Category deleted successfully");
    } catch (error: any) {
      notifications.showError("Delete failed", error.message);
    } finally {
      hideLoading();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsCreating(false);
  };

  // Start editing
  const startEditing = (category: Category) => {
    setFormData(category);
    setEditingId(category.id);
    setIsCreating(false);
  };

  // Start creating
  const startCreating = () => {
    setFormData({
      name: "",
      description: "",
      rateNormal: 0,
      rateSpecial: 0,
    });
    setEditingId(null);
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Categories Management
          </h2>
          <p className="text-gray-600">Manage parking categories and pricing</p>
        </div>
        <ButtonGroup>
          <LoadingButton
            onClick={startCreating}
            disabled={isCreating || editingId !== null}
            variant="primary"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </span>
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <ResponsiveCard title={editingId ? "Edit Category" : "Create Category"}>
          <AccessibleForm onSubmit={handleSubmit}>
            <ResponsiveGrid cols={2} gap="md">
              <FormField
                label="Category Name"
                name="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="e.g., Premium, Standard"
              />

              <FormField
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the category"
              />

              <FormField
                label="Normal Rate ($/hour)"
                name="rateNormal"
                type="number"
                step="0.01"
                min="0"
                value={formData.rateNormal || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rateNormal: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                hint="Rate during normal hours"
              />

              <FormField
                label="Special Rate ($/hour)"
                name="rateSpecial"
                type="number"
                step="0.01"
                min="0"
                value={formData.rateSpecial || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rateSpecial: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                hint="Rate during rush hours"
              />
            </ResponsiveGrid>

            <ButtonGroup className="mt-6">
              <LoadingButton
                type="submit"
                onClick={handleSubmit}
                variant="primary"
              >
                <span className="inline-flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? "Update Category" : "Create Category"}
                </span>
              </LoadingButton>

              <LoadingButton
                type="button"
                onClick={resetForm}
                variant="secondary"
              >
                <span className="inline-flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </span>
              </LoadingButton>
            </ButtonGroup>
          </AccessibleForm>
        </ResponsiveCard>
      )}

      {/* Categories List */}
      <ResponsiveCard title="Categories">
        {false ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first category.
            </p>
            <LoadingButton onClick={startCreating} variant="primary">
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Category
              </span>
            </LoadingButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Normal Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Special Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {category.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />$
                        {category.rateNormal.toFixed(2)}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-1 text-orange-600" />$
                        {category.rateSpecial.toFixed(2)}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ButtonGroup>
                        <LoadingButton
                          onClick={() => startEditing(category)}
                          disabled={isCreating || editingId !== null}
                          variant="secondary"
                          size="sm"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </span>
                        </LoadingButton>

                        <LoadingButton
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                          variant="danger"
                          size="sm"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </span>
                        </LoadingButton>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ResponsiveCard>
    </div>
  );
}
