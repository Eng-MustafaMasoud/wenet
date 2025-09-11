"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Calendar, Clock } from "lucide-react";
import { adminApi, Vacation } from "@/services/api";
import { useNotifications } from "@/components/ui/NotificationSystem";
import { useLoading } from "@/components/ui/LoadingStateManager";
import { AccessibleForm, FormField } from "@/components/ui/AccessibleForm";
import LoadingButton from "@/components/ui/EnhancedLoadingButton";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ButtonGroup,
} from "@/components/layout/AppProviders";

export default function VacationsManagement() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Vacation>>({});
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load vacations
  const loadVacations = async () => {
    try {
      startLoading("vacations-load", "Loading vacations...", "admin");
      const data = await adminApi.getVacations();
      setVacations(data);
    } catch (error: any) {
      notifications.showError("Failed to load vacations", error.message);
    } finally {
      stopLoading("vacations-load");
    }
  };

  useEffect(() => {
    loadVacations();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.from || !formData.to) {
      notifications.showError(
        "Validation Error",
        "Please fill in all required fields"
      );
      return;
    }

    // Validate date range
    const fromDate = new Date(formData.from);
    const toDate = new Date(formData.to);

    if (fromDate >= toDate) {
      notifications.showError(
        "Invalid Date Range",
        "End date must be after start date"
      );
      return;
    }

    // Check for overlapping vacations
    const overlapping = vacations.filter(
      (v) =>
        v.id !== editingId &&
        ((fromDate >= new Date(v.from) && fromDate <= new Date(v.to)) ||
          (toDate >= new Date(v.from) && toDate <= new Date(v.to)) ||
          (fromDate <= new Date(v.from) && toDate >= new Date(v.to)))
    );

    if (overlapping.length > 0) {
      notifications.showError(
        "Overlapping Vacation",
        "This vacation period overlaps with an existing vacation"
      );
      return;
    }

    try {
      if (editingId) {
        startLoading("vacation-update", "Updating vacation...", "admin");
        const updated = await adminApi.updateVacation(editingId, formData);
        setVacations((prev) =>
          prev.map((vacation) =>
            vacation.id === editingId ? updated : vacation
          )
        );
        notifications.showSuccess("Vacation updated successfully");
      } else {
        startLoading("vacation-create", "Creating vacation...", "admin");
        const created = await adminApi.createVacation(
          formData as Omit<Vacation, "id">
        );
        setVacations((prev) => [...prev, created]);
        notifications.showSuccess("Vacation created successfully");
      }

      resetForm();
    } catch (error: any) {
      notifications.showError("Operation failed", error.message);
    } finally {
      stopLoading(editingId ? "vacation-update" : "vacation-create");
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
      startLoading("vacation-delete", "Deleting vacation...", "admin");
      await adminApi.deleteVacation(id);
      setVacations((prev) => prev.filter((vacation) => vacation.id !== id));
      notifications.showSuccess("Vacation deleted successfully");
    } catch (error: any) {
      notifications.showError("Delete failed", error.message);
    } finally {
      stopLoading("vacation-delete");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsCreating(false);
  };

  // Start editing
  const startEditing = (vacation: Vacation) => {
    setFormData(vacation);
    setEditingId(vacation.id);
    setIsCreating(false);
  };

  // Start creating
  const startCreating = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      name: "",
      from: today,
      to: today,
    });
    setEditingId(null);
    setIsCreating(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate duration
  const calculateDuration = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if vacation is active
  const isActive = (from: string, to: string) => {
    const now = new Date();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return now >= fromDate && now <= toDate;
  };

  // Check if vacation is upcoming
  const isUpcoming = (from: string) => {
    const now = new Date();
    const fromDate = new Date(from);
    return fromDate > now;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Vacations Management
          </h2>
          <p className="text-gray-600">Manage special periods and holidays</p>
        </div>
        <ButtonGroup>
          <LoadingButton
            onClick={startCreating}
            disabled={isCreating || editingId !== null}
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vacation
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <ResponsiveCard title={editingId ? "Edit Vacation" : "Create Vacation"}>
          <AccessibleForm onSubmit={handleSubmit}>
            <ResponsiveGrid cols={3} gap="md">
              <FormField
                label="Vacation Name"
                name="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="e.g., Eid Al-Fitr, Christmas"
              />

              <FormField
                label="Start Date"
                name="from"
                type="date"
                value={formData.from || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, from: e.target.value }))
                }
                required
              />

              <FormField
                label="End Date"
                name="to"
                type="date"
                value={formData.to || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, to: e.target.value }))
                }
                required
              />
            </ResponsiveGrid>

            <ButtonGroup className="mt-6">
              <LoadingButton type="submit" variant="primary">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Vacation" : "Create Vacation"}
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

      {/* Vacations List */}
      <ResponsiveCard title="Vacations">
        {isLoading("vacations-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vacations...</p>
          </div>
        ) : vacations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No vacations configured
            </h3>
            <p className="text-gray-600 mb-4">
              Set up special periods and holidays.
            </p>
            <LoadingButton onClick={startCreating} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Vacation
            </LoadingButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vacation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {vacations.map((vacation) => {
                  const duration = calculateDuration(
                    vacation.from,
                    vacation.to
                  );
                  const active = isActive(vacation.from, vacation.to);
                  const upcoming = isUpcoming(vacation.from);

                  return (
                    <tr key={vacation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vacation.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {vacation.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <div className="text-sm text-gray-900">
                            <div>{formatDate(vacation.from)}</div>
                            <div className="text-gray-500">
                              to {formatDate(vacation.to)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-600" />
                          <div className="text-sm text-gray-900">
                            {duration} day{duration !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            active
                              ? "bg-green-100 text-green-800"
                              : upcoming
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {active ? "Active" : upcoming ? "Upcoming" : "Past"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ButtonGroup>
                          <LoadingButton
                            onClick={() => startEditing(vacation)}
                            disabled={isCreating || editingId !== null}
                            variant="secondary"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </LoadingButton>

                          <LoadingButton
                            onClick={() =>
                              handleDelete(vacation.id, vacation.name)
                            }
                            variant="danger"
                            size="sm"
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
