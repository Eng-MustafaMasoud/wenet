"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  UserCheck,
  Shield,
  Mail,
  Phone,
} from "lucide-react";
import { adminApi, User as UserType } from "@/services/api";
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

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Administrator" },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<
    Partial<UserType & { password: string }>
  >({});
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load users
  const loadUsers = async () => {
    try {
      startLoading("users-load", "Loading users...", "admin");
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error: any) {
      notifications.showError("Failed to load users", error.message);
    } finally {
      stopLoading("users-load");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.role) {
      notifications.showError(
        "Validation Error",
        "Please fill in all required fields"
      );
      return;
    }

    // For new users, password is required
    if (!editingId && !formData.password) {
      notifications.showError(
        "Validation Error",
        "Password is required for new users"
      );
      return;
    }

    // Check for duplicate username
    const existingUser = users.find(
      (user) => user.username === formData.username && user.id !== editingId
    );
    if (existingUser) {
      notifications.showError(
        "Duplicate Username",
        "A user with this username already exists"
      );
      return;
    }

    try {
      if (editingId) {
        startLoading("user-update", "Updating user...", "admin");
        // For updates, we'll need to implement updateUser in the API
        notifications.showError(
          "Not Implemented",
          "User updates are not yet implemented in the backend"
        );
        return;
      } else {
        startLoading("user-create", "Creating user...", "admin");
        const { password, ...userData } = formData;
        const created = await adminApi.createUser(
          userData as Omit<UserType, "id">
        );
        setUsers((prev) => [...prev, created]);
        notifications.showSuccess("User created successfully");
      }

      resetForm();
    } catch (error: any) {
      notifications.showError("Operation failed", error.message);
    } finally {
      stopLoading(editingId ? "user-update" : "user-create");
    }
  };

  // Handle delete
  const handleDelete = async (id: string, username: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      startLoading("user-delete", "Deleting user...", "admin");
      // User deletion is not implemented in the current API
      notifications.showError(
        "Not Implemented",
        "User deletion is not yet implemented in the backend"
      );
    } catch (error: any) {
      notifications.showError("Delete failed", error.message);
    } finally {
      stopLoading("user-delete");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setIsCreating(false);
  };

  // Start editing
  const startEditing = (user: UserType) => {
    setFormData(user);
    setEditingId(user.id);
    setIsCreating(false);
  };

  // Start creating
  const startCreating = () => {
    setFormData({
      username: "",
      role: "employee",
      name: "",
      email: "",
      password: "",
    });
    setEditingId(null);
    setIsCreating(true);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    return role === "admin" ? Shield : UserCheck;
  };

  // Get role color
  const getRoleColor = (role: string) => {
    return role === "admin" ? "text-red-600" : "text-blue-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">
            Manage system users and their permissions
          </p>
        </div>
        <ButtonGroup>
          <LoadingButton
            onClick={startCreating}
            disabled={isCreating || editingId !== null}
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <ResponsiveCard title={editingId ? "Edit User" : "Create User"}>
          <AccessibleForm onSubmit={handleSubmit}>
            <ResponsiveGrid cols={2} gap="md">
              <FormField
                label="Username"
                name="username"
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                required
                placeholder="e.g., john.doe"
              />

              <SelectField
                label="Role"
                name="role"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as "admin" | "employee",
                  }))
                }
                options={ROLES}
                required
              />

              <FormField
                label="Full Name"
                name="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., John Doe"
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="e.g., john@example.com"
              />

              {!editingId && (
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required={!editingId}
                  hint="Minimum 6 characters"
                />
              )}
            </ResponsiveGrid>

            <ButtonGroup className="mt-6">
              <LoadingButton type="submit" variant="primary">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update User" : "Create User"}
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

      {/* Users List */}
      <ResponsiveCard title="Users">
        {isLoading("users-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first user.
            </p>
            <LoadingButton onClick={startCreating} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create User
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <RoleIcon
                            className={`w-4 h-4 mr-2 ${getRoleColor(
                              user.role
                            )}`}
                          />
                          <span
                            className={`text-sm font-medium capitalize ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          )}
                          {!user.email && (
                            <span className="text-gray-500">
                              No email provided
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ButtonGroup>
                          <LoadingButton
                            onClick={() => startEditing(user)}
                            disabled={isCreating || editingId !== null}
                            variant="secondary"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </LoadingButton>

                          <LoadingButton
                            onClick={() => handleDelete(user.id, user.username)}
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
