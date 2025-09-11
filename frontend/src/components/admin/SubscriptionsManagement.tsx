"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  adminApi,
  masterApi,
  Subscription,
  Category,
  Car as CarType,
} from "@/services/api";
import { useNotifications } from "@/components/ui/NotificationSystem";
import { useLoading } from "@/components/ui/LoadingStateManager";
import {
  AccessibleForm,
  FormField,
  SelectField,
  TextAreaField,
} from "@/components/ui/AccessibleForm";
import LoadingButton from "@/components/ui/EnhancedLoadingButton";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ButtonGroup,
} from "@/components/layout/AppProviders";

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<
    Partial<Subscription & { newCar: CarType }>
  >({});
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load data
  const loadData = async () => {
    try {
      startLoading("subscriptions-load", "Loading subscriptions...", "admin");
      const [subscriptionsData, categoriesData] = await Promise.all([
        adminApi.getSubscriptions(),
        masterApi.getCategories(),
      ]);
      setSubscriptions(subscriptionsData);
      setCategories(categoriesData);
    } catch (error: any) {
      notifications.showError("Failed to load data", error.message);
    } finally {
      stopLoading("subscriptions-load");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.userName ||
      !formData.category ||
      !formData.startsAt ||
      !formData.expiresAt
    ) {
      notifications.showError(
        "Validation Error",
        "Please fill in all required fields"
      );
      return;
    }

    // Validate date range
    const startDate = new Date(formData.startsAt);
    const endDate = new Date(formData.expiresAt);

    if (startDate >= endDate) {
      notifications.showError(
        "Invalid Date Range",
        "Expiration date must be after start date"
      );
      return;
    }

    // Ensure at least one car is provided
    if (!formData.cars || formData.cars.length === 0) {
      notifications.showError(
        "Validation Error",
        "At least one car must be provided"
      );
      return;
    }

    try {
      if (editingId) {
        startLoading(
          "subscription-update",
          "Updating subscription...",
          "admin"
        );
        const updated = await adminApi.updateSubscription(editingId, formData);
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === editingId ? updated : sub))
        );
        notifications.showSuccess("Subscription updated successfully");
      } else {
        startLoading(
          "subscription-create",
          "Creating subscription...",
          "admin"
        );
        const created = await adminApi.createSubscription(formData as any);
        setSubscriptions((prev) => [...prev, created]);
        notifications.showSuccess("Subscription created successfully");
      }

      resetForm();
    } catch (error: any) {
      notifications.showError("Operation failed", error.message);
    } finally {
      stopLoading(editingId ? "subscription-update" : "subscription-create");
    }
  };

  // Handle delete
  const handleDelete = async (id: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete subscription for "${userName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      startLoading("subscription-delete", "Deleting subscription...", "admin");
      // Subscription deletion is not implemented in the current API
      notifications.showError(
        "Not Implemented",
        "Subscription deletion is not yet implemented in the backend"
      );
    } catch (error: any) {
      notifications.showError("Delete failed", error.message);
    } finally {
      stopLoading("subscription-delete");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsCreating(false);
  };

  // Start editing
  const startEditing = (subscription: Subscription) => {
    setFormData(subscription);
    setEditingId(subscription.id);
    setIsCreating(false);
  };

  // Start creating
  const startCreating = () => {
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    setFormData({
      userName: "",
      active: true,
      category: "",
      cars: [],
      startsAt: today,
      expiresAt: nextYear.toISOString().split("T")[0],
      newCar: { plate: "", brand: "", model: "", color: "" },
    });
    setEditingId(null);
    setIsCreating(true);
  };

  // Add car
  const addCar = () => {
    if (
      !formData.newCar?.plate ||
      !formData.newCar?.brand ||
      !formData.newCar?.model
    ) {
      notifications.showError(
        "Validation Error",
        "Please fill in all car fields"
      );
      return;
    }

    const cars = formData.cars || [];
    setFormData((prev) => ({
      ...prev,
      cars: [...cars, prev.newCar!],
      newCar: { plate: "", brand: "", model: "", color: "" },
    }));
  };

  // Remove car
  const removeCar = (index: number) => {
    const cars = formData.cars || [];
    setFormData((prev) => ({
      ...prev,
      cars: cars.filter((_, i) => i !== index),
    }));
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if subscription is active
  const isSubscriptionActive = (subscription: Subscription) => {
    if (!subscription.active) return false;
    const now = new Date();
    const startDate = new Date(subscription.startsAt);
    const endDate = new Date(subscription.expiresAt);
    return now >= startDate && now <= endDate;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Subscriptions Management
          </h2>
          <p className="text-gray-600">
            Manage user subscriptions and their vehicles
          </p>
        </div>
        <ButtonGroup>
          <LoadingButton
            onClick={startCreating}
            disabled={isCreating || editingId !== null}
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <ResponsiveCard
          title={editingId ? "Edit Subscription" : "Create Subscription"}
        >
          <AccessibleForm onSubmit={handleSubmit}>
            <ResponsiveGrid cols={2} gap="md">
              <FormField
                label="User Name"
                name="userName"
                value={formData.userName || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userName: e.target.value }))
                }
                required
                placeholder="e.g., John Doe"
              />

              <SelectField
                label="Category"
                name="category"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                placeholder="Select a category"
                required
              />

              <FormField
                label="Start Date"
                name="startsAt"
                type="date"
                value={formData.startsAt || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startsAt: e.target.value }))
                }
                required
              />

              <FormField
                label="Expiration Date"
                name="expiresAt"
                type="date"
                value={formData.expiresAt || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiresAt: e.target.value,
                  }))
                }
                required
              />
            </ResponsiveGrid>

            {/* Cars Section */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vehicles
              </h3>

              {/* Existing Cars */}
              {formData.cars && formData.cars.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.cars.map((car, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Car className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{car.plate}</div>
                          <div className="text-sm text-gray-600">
                            {car.brand} {car.model} - {car.color}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCar(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Car */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Add Vehicle
                </h4>
                <ResponsiveGrid cols={4} gap="md">
                  <FormField
                    label="License Plate"
                    name="newCarPlate"
                    value={formData.newCar?.plate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newCar: { ...prev.newCar!, plate: e.target.value },
                      }))
                    }
                    placeholder="e.g., ABC-123"
                  />

                  <FormField
                    label="Brand"
                    name="newCarBrand"
                    value={formData.newCar?.brand || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newCar: { ...prev.newCar!, brand: e.target.value },
                      }))
                    }
                    placeholder="e.g., Toyota"
                  />

                  <FormField
                    label="Model"
                    name="newCarModel"
                    value={formData.newCar?.model || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newCar: { ...prev.newCar!, model: e.target.value },
                      }))
                    }
                    placeholder="e.g., Corolla"
                  />

                  <FormField
                    label="Color"
                    name="newCarColor"
                    value={formData.newCar?.color || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newCar: { ...prev.newCar!, color: e.target.value },
                      }))
                    }
                    placeholder="e.g., White"
                  />
                </ResponsiveGrid>

                <ButtonGroup className="mt-3">
                  <LoadingButton
                    type="button"
                    onClick={addCar}
                    variant="secondary"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </LoadingButton>
                </ButtonGroup>
              </div>
            </div>

            <ButtonGroup className="mt-6">
              <LoadingButton type="submit" variant="primary">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Subscription" : "Create Subscription"}
              </LoadingButton>

              <LoadingButton
                type="button"
                onClick={resetForm}
                variant="secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </LoadingButton>
            </ButtonGroup>
          </AccessibleForm>
        </ResponsiveCard>
      )}

      {/* Subscriptions List */}
      <ResponsiveCard title="Subscriptions">
        {isLoading("subscriptions-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No subscriptions found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first subscription.
            </p>
            <LoadingButton onClick={startCreating} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Subscription
            </LoadingButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => {
                  const isActive = isSubscriptionActive(subscription);

                  return (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {subscription.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCategoryName(subscription.category)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {subscription.cars.length} vehicle
                          {subscription.cars.length !== 1 ? "s" : ""}
                          {subscription.cars.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {subscription.cars
                                .map((car) => car.plate)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            {formatDate(subscription.startsAt)} -{" "}
                            {formatDate(subscription.expiresAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isActive ? (
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isActive ? "text-green-800" : "text-red-800"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ButtonGroup>
                          <LoadingButton
                            onClick={() => startEditing(subscription)}
                            disabled={isCreating || editingId !== null}
                            variant="secondary"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </LoadingButton>

                          <LoadingButton
                            onClick={() =>
                              handleDelete(
                                subscription.id,
                                subscription.userName
                              )
                            }
                            variant="danger"
                            size="sm"
                            disabled={true} // Disabled until backend supports deletion
                          >
                            <Trash2 className="w-4 h-4" />
                          </LoadingButton>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ResponsiveCard>
    </div>
  );
}
