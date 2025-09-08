"use client";

import { useState } from "react";
import { useUsers, useCreateUser } from "@/hooks/useApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  Users,
  Plus,
  User,
  Shield,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  role: "admin" | "employee";
  name?: string;
  email?: string;
}

interface CreateUserForm {
  username: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "employee";
}

export default function EmployeeManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateUserForm>({
    username: "",
    password: "",
    confirmPassword: "",
    role: "employee",
  });
  const [formError, setFormError] = useState("");

  // API hooks
  const { data: users, isLoading, refetch } = useUsers();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();

  const handleCreateUser = () => {
    setFormError("");

    // Validation
    if (!formData.username.trim()) {
      setFormError("Username is required");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    // Check if username already exists
    if (users?.some((user) => user.username === formData.username.trim())) {
      setFormError("Username already exists");
      return;
    }

    createUser(
      {
        username: formData.username.trim(),
        role: formData.role,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setFormData({
            username: "",
            password: "",
            confirmPassword: "",
            role: "employee",
          });
          setFormError("");
          refetch();
        },
        onError: (error: any) => {
          setFormError(
            error.response?.data?.message || "Failed to create user"
          );
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      role: "employee",
    });
    setFormError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Employee Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage system users and their access permissions
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Users</h3>
        </div>

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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.role === "admin" ? (
                          <Shield className="h-4 w-4 text-red-600 mr-2" />
                        ) : (
                          <Users className="h-4 w-4 text-blue-600 mr-2" />
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      —
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      —
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No users found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new user account.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New User"
      >
        <div className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
            disabled={isCreating}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as "admin" | "employee",
                }))
              }
              disabled={isCreating}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={isCreating}
            required
            helperText="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            disabled={isCreating}
            required
          />

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={isCreating}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
