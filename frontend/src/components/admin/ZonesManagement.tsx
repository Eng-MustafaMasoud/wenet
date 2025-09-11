"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Activity,
} from "lucide-react";
import { adminApi, masterApi, Category, Zone, Gate } from "@/services/api";
import { useNotifications } from "@/components/ui/NotificationSystem";
import { useLoading } from "@/components/ui/LoadingStateManager";
import {
  AccessibleForm,
  FormField,
  SelectField,
} from "@/components/ui/AccessibleForm";
import LoadingButton from "@/components/ui/EnhancedLoadingButton";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ButtonGroup,
} from "@/components/layout/AppProviders";

export default function ZonesManagement() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Zone>>({});
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load data
  const loadData = async () => {
    try {
      startLoading("zones-load", "Loading zones data...", "admin");
      const [zonesData, categoriesData, gatesData] = await Promise.all([
        adminApi.getZones(),
        masterApi.getCategories(),
        masterApi.getGates(),
      ]);
      setZones(zonesData);
      setCategories(categoriesData);
      setGates(gatesData);
    } catch (error: any) {
      notifications.showError("Failed to load data", error.message);
    } finally {
      stopLoading("zones-load");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.categoryId ||
      !formData.gateIds?.length ||
      !formData.totalSlots
    ) {
      notifications.showError(
        "Validation Error",
        "Please fill in all required fields"
      );
      return;
    }

    try {
      if (editingId) {
        startLoading("zone-update", "Updating zone...", "admin");
        const updated = await adminApi.updateZone(editingId, formData);
        setZones((prev) =>
          prev.map((zone) => (zone.id === editingId ? updated : zone))
        );
        notifications.showSuccess("Zone updated successfully");
      } else {
        startLoading("zone-create", "Creating zone...", "admin");
        const created = await adminApi.createZone(formData as any);
        setZones((prev) => [...prev, created]);
        notifications.showSuccess("Zone created successfully");
      }

      resetForm();
    } catch (error: any) {
      notifications.showError("Operation failed", error.message);
    } finally {
      stopLoading(editingId ? "zone-update" : "zone-create");
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
      startLoading("zone-delete", "Deleting zone...", "admin");
      await adminApi.deleteZone(id);
      setZones((prev) => prev.filter((zone) => zone.id !== id));
      notifications.showSuccess("Zone deleted successfully");
    } catch (error: any) {
      notifications.showError("Delete failed", error.message);
    } finally {
      stopLoading("zone-delete");
    }
  };

  // Toggle zone open/closed
  const toggleZoneOpen = async (id: string, currentOpen: boolean) => {
    try {
      startLoading("zone-toggle", "Updating zone status...", "admin");
      const updated = await adminApi.updateZoneOpen(id, !currentOpen);
      setZones((prev) => prev.map((zone) => (zone.id === id ? updated : zone)));
      notifications.showSuccess(
        `Zone ${!currentOpen ? "opened" : "closed"} successfully`
      );
    } catch (error: any) {
      notifications.showError("Toggle failed", error.message);
    } finally {
      stopLoading("zone-toggle");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsCreating(false);
  };

  // Start editing
  const startEditing = (zone: Zone) => {
    setFormData(zone);
    setEditingId(zone.id);
    setIsCreating(false);
  };

  // Start creating
  const startCreating = () => {
    setFormData({
      name: "",
      categoryId: "",
      gateIds: [],
      totalSlots: 0,
      open: true,
    });
    setEditingId(null);
    setIsCreating(true);
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  // Get gate names
  const getGateNames = (gateIds: string[]) => {
    return gateIds
      .map((id) => gates.find((gate) => gate.id === id)?.name || id)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zones Management</h2>
          <p className="text-gray-600">
            Manage parking zones and their settings
          </p>
        </div>
        <ButtonGroup>
          <LoadingButton
            onClick={startCreating}
            disabled={isCreating || editingId !== null}
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Zone
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <ResponsiveCard title={editingId ? "Edit Zone" : "Create Zone"}>
          <AccessibleForm onSubmit={handleSubmit}>
            <ResponsiveGrid cols={2} gap="md">
              <FormField
                label="Zone Name"
                name="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="e.g., Zone A, Premium Area"
              />

              <SelectField
                label="Category"
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                placeholder="Select a category"
                required
              />

              <FormField
                label="Total Slots"
                name="totalSlots"
                type="number"
                min="1"
                value={formData.totalSlots || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalSlots: parseInt(e.target.value) || 0,
                  }))
                }
                required
                hint="Maximum number of parking slots"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Associated Gates
                </label>
                <div className="space-y-2">
                  {gates.map((gate) => (
                    <label key={gate.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.gateIds?.includes(gate.id) || false}
                        onChange={(e) => {
                          const gateIds = formData.gateIds || [];
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              gateIds: [...gateIds, gate.id],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              gateIds: gateIds.filter((id) => id !== gate.id),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {gate.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </ResponsiveGrid>

            <ButtonGroup className="mt-6">
              <LoadingButton type="submit" variant="primary">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Zone" : "Create Zone"}
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

      {/* Zones List */}
      <ResponsiveCard title="Zones">
        {isLoading("zones-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No zones found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first zone.
            </p>
            <LoadingButton onClick={startCreating} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Zone
            </LoadingButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
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
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {zone.name}
                      </div>
                      <div className="text-sm text-gray-500">ID: {zone.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCategoryName(zone.categoryId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {getGateNames(zone.gateIds)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-1 text-blue-600" />
                            {zone.occupied}/{zone.totalSlots}
                          </div>
                          <div className="text-xs text-gray-500">
                            {zone.free} free, {zone.reserved} reserved
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleZoneOpen(zone.id, zone.open)}
                        disabled={isLoading("zone-toggle")}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          zone.open
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {zone.open ? (
                          <ToggleRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ToggleLeft className="w-3 h-3 mr-1" />
                        )}
                        {zone.open ? "Open" : "Closed"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ButtonGroup>
                        <LoadingButton
                          onClick={() => startEditing(zone)}
                          disabled={isCreating || editingId !== null}
                          variant="secondary"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </LoadingButton>

                        <LoadingButton
                          onClick={() => handleDelete(zone.id, zone.name)}
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
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
