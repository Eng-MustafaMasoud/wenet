"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Clock, Calendar } from "lucide-react";
import { adminApi, RushHour } from "@/services/api";
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

const WEEKDAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export default function RushHoursManagement() {
  const [rushHours, setRushHours] = useState<RushHour[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<RushHour>>({});
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load rush hours
  const loadRushHours = async () => {
    try {
      startLoading("rush-hours-load", "Loading rush hours...", "admin");
      const data = await adminApi.getRushHours();
      setRushHours(data);
    } catch (error: any) {
      notifications.showError("Failed to load rush hours", error.message);
    } finally {
      stopLoading("rush-hours-load");
    }
  };

  useEffect(() => {
    loadRushHours();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.weekDay || !formData.from || !formData.to) {
      notifications.showError(
        "Validation Error",
        "Please fill in all required fields"
      );
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.from) || !timeRegex.test(formData.to)) {
      notifications.showError(
        "Invalid Time",
        "Please use HH:MM format (24-hour)"
      );
      return;
    }

    // Validate time range
    if (formData.from >= formData.to) {
      notifications.showError(
        "Invalid Time Range",
        "End time must be after start time"
      );
      return;
    }

    try {
      if (editingId) {
        startLoading("rush-hour-update", "Updating rush hour...", "admin");
        const updated = await adminApi.updateRushHour(editingId, formData);
        setRushHours((prev) =>
          prev.map((rh) => (rh.id === editingId ? updated : rh))
        );
        notifications.showSuccess("Rush hour updated successfully");
      } else {
        startLoading("rush-hour-create", "Creating rush hour...", "admin");
        const created = await adminApi.createRushHour(
          formData as Omit<RushHour, "id">
        );
        setRushHours((prev) => [...prev, created]);
        notifications.showSuccess("Rush hour created successfully");
      }

      resetForm();
    } catch (error: any) {
      notifications.showError("Operation failed", error.message);
    } finally {
      stopLoading(editingId ? "rush-hour-update" : "rush-hour-create");
    }
  };

  // Handle delete
  const handleDelete = async (
    id: string,
    weekday: number,
    from: string,
    to: string
  ) => {
    const weekdayName =
      WEEKDAYS.find((w) => w.value === weekday.toString())?.label || "Unknown";
    if (
      !confirm(
        `Are you sure you want to delete the rush hour for ${weekdayName} (${from} - ${to})?`
      )
    ) {
      return;
    }

    try {
      startLoading("rush-hour-delete", "Deleting rush hour...", "admin");
      await adminApi.deleteRushHour(id);
      setRushHours((prev) => prev.filter((rh) => rh.id !== id));
      notifications.showSuccess("Rush hour deleted successfully");
    } catch (error: any) {
      notifications.showError("Delete failed", error.message);
    } finally {
      stopLoading("rush-hour-delete");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsCreating(false);
  };

  // Start editing
  const startEditing = (rushHour: RushHour) => {
    setFormData(rushHour);
    setEditingId(rushHour.id);
    setIsCreating(false);
  };

  // Start creating
  const startCreating = () => {
    setFormData({
      weekDay: 1,
      from: "07:00",
      to: "09:00",
    });
    setEditingId(null);
    setIsCreating(true);
  };

  // Get weekday name
  const getWeekdayName = (weekDay: number) => {
    return (
      WEEKDAYS.find((w) => w.value === weekDay.toString())?.label || "Unknown"
    );
  };

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Rush Hours Management
          </h2>
          <p className="text-gray-600">
            Manage special pricing periods during peak hours
          </p>
        </div>
        <ButtonGroup>
          <LoadingButton
            onClick={startCreating}
            disabled={isCreating || editingId !== null}
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rush Hour
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <ResponsiveCard
          title={editingId ? "Edit Rush Hour" : "Create Rush Hour"}
        >
          <AccessibleForm onSubmit={handleSubmit}>
            <ResponsiveGrid cols={3} gap="md">
              <SelectField
                label="Weekday"
                name="weekDay"
                value={formData.weekDay?.toString() || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weekDay: parseInt(e.target.value),
                  }))
                }
                options={WEEKDAYS}
                required
              />

              <FormField
                label="Start Time"
                name="from"
                type="time"
                value={formData.from || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, from: e.target.value }))
                }
                required
                hint="24-hour format (HH:MM)"
              />

              <FormField
                label="End Time"
                name="to"
                type="time"
                value={formData.to || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, to: e.target.value }))
                }
                required
                hint="24-hour format (HH:MM)"
              />
            </ResponsiveGrid>

            <ButtonGroup className="mt-6">
              <LoadingButton type="submit" variant="primary">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Rush Hour" : "Create Rush Hour"}
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

      {/* Rush Hours List */}
      <ResponsiveCard title="Rush Hours">
        {isLoading("rush-hours-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading rush hours...</p>
          </div>
        ) : rushHours.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No rush hours configured
            </h3>
            <p className="text-gray-600 mb-4">
              Set up special pricing periods for peak hours.
            </p>
            <LoadingButton onClick={startCreating} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Rush Hour
            </LoadingButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekday
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rushHours.map((rushHour) => {
                  const startTime = new Date(`2000-01-01T${rushHour.from}:00`);
                  const endTime = new Date(`2000-01-01T${rushHour.to}:00`);
                  const duration =
                    (endTime.getTime() - startTime.getTime()) /
                    (1000 * 60 * 60);

                  return (
                    <tr key={rushHour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <div className="text-sm font-medium text-gray-900">
                            {getWeekdayName(rushHour.weekDay)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-600" />
                          <div className="text-sm text-gray-900">
                            {formatTime(rushHour.from)} -{" "}
                            {formatTime(rushHour.to)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {duration} hours
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ButtonGroup>
                          <LoadingButton
                            onClick={() => startEditing(rushHour)}
                            disabled={isCreating || editingId !== null}
                            variant="secondary"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </LoadingButton>

                          <LoadingButton
                            onClick={() =>
                              handleDelete(
                                rushHour.id,
                                rushHour.weekDay,
                                rushHour.from,
                                rushHour.to
                              )
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
