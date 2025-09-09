"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGates,
  useAllZones,
  useCreateGate,
  useUpdateGate,
  useDeleteGate,
} from "@/hooks/useApi";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

export default function GatesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneCountFilter, setZoneCountFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    zoneIds: [] as string[],
  });

  // API hooks
  const {
    data: gates,
    isLoading: gatesLoading,
    error: gatesError,
  } = useGates();

  const { data: zones } = useAllZones();

  // CRUD mutations
  const createGateMutation = useCreateGate();
  const updateGateMutation = useUpdateGate();
  const deleteGateMutation = useDeleteGate();

  // Filter and search gates
  const filteredGates = useMemo(() => {
    if (!gates) return [];

    return gates.filter((gate) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gate.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Location filter
      const matchesLocation =
        locationFilter === "" ||
        gate.location.toLowerCase().includes(locationFilter.toLowerCase());

      // Zone count filter
      let matchesZoneCount = true;
      if (zoneCountFilter !== "") {
        const zoneCount = gate.zoneIds.length;
        switch (zoneCountFilter) {
          case "1":
            matchesZoneCount = zoneCount === 1;
            break;
          case "2-5":
            matchesZoneCount = zoneCount >= 2 && zoneCount <= 5;
            break;
          case "5+":
            matchesZoneCount = zoneCount > 5;
            break;
        }
      }

      // Status filter (all gates are active for now since backend doesn't have status field)
      const matchesStatus = statusFilter === "" || statusFilter === "active";

      return (
        matchesSearch && matchesLocation && matchesZoneCount && matchesStatus
      );
    });
  }, [gates, searchTerm, statusFilter, zoneCountFilter, locationFilter]);

  // Get zone names for a gate
  const getZoneNames = (zoneIds: string[]) => {
    if (!zones) return [];
    return zoneIds
      .map((id) => zones.find((zone: any) => zone.id === id)?.name)
      .filter(Boolean);
  };

  const handleCreateGate = () => {
    setFormData({ name: "", location: "", zoneIds: [] });
    setShowCreateModal(true);
  };

  const handleEditGate = (gate: Gate) => {
    setSelectedGate(gate);
    setFormData({
      name: gate.name,
      location: gate.location,
      zoneIds: gate.zoneIds,
    });
    setShowEditModal(true);
  };

  const handleSubmitForm = async () => {
    try {
      if (showCreateModal) {
        await createGateMutation.mutateAsync(formData);
        alert("Gate created successfully!");
      } else if (showEditModal && selectedGate) {
        await updateGateMutation.mutateAsync({
          id: selectedGate.id,
          data: formData,
        });
        alert("Gate updated successfully!");
      }
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedGate(null);
      setFormData({ name: "", location: "", zoneIds: [] });
    } catch (error) {
      console.error("Failed to save gate:", error);
      if (error instanceof Error) {
        if (error.message.includes("403")) {
          alert("Admin access required. Please login as administrator.");
        } else if (
          error.message.includes("not available in the current backend")
        ) {
          alert(error.message);
        } else {
          alert("Failed to save gate. Please try again.");
        }
      } else {
        alert("Failed to save gate. Please try again.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedGate(null);
    setFormData({ name: "", location: "", zoneIds: [] });
  };

  const handleViewGate = (gateId: string) => {
    router.push(`/gates/${gateId}`);
  };

  const handleDeleteGate = async (gateId: string) => {
    if (window.confirm("Are you sure you want to delete this gate?")) {
      try {
        await deleteGateMutation.mutateAsync(gateId);
        alert("Gate deleted successfully!");
      } catch (error) {
        console.error("Failed to delete gate:", error);
        if (error instanceof Error) {
          if (error.message.includes("403")) {
            alert("Admin access required. Please login as administrator.");
          } else if (
            error.message.includes("not available in the current backend")
          ) {
            alert(error.message);
          } else {
            alert("Failed to delete gate. Please try again.");
          }
        } else {
          alert("Failed to delete gate. Please try again.");
        }
      }
    }
  };

  if (gatesLoading) {
    return (
      <MainLayout title="Gates - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Filters Skeleton */}
            <div className="mb-6">
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Table Skeleton */}
            <TableSkeleton rows={8} columns={5} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (gatesError) {
    const is404Error = (gatesError as any)?.response?.status === 404;

    if (is404Error) {
      return (
        <MainLayout title="Gates - ParkFlow">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚧 Under Construction
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gates management is currently being developed. This feature will
                be available soon with full CRUD operations for managing parking
                gates.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Coming Soon:</strong> Create, edit, and manage parking
                  gates with zone assignments and location tracking.
                </p>
              </div>
              <Button
                onClick={() => window.history.back()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go Back
              </Button>
            </div>
          </div>
        </MainLayout>
      );
    }

    return (
      <MainLayout title="Gates - ParkFlow">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Gates
            </h2>
            <p className="text-gray-600 mb-4">
              {gatesError?.message || "Failed to load gates data"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout title="Gates - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gates</h1>
                  <p className="mt-2 text-gray-600">
                    Manage parking gates and their zone assignments
                  </p>
                </div>
                {isAuthenticated && user?.role === "admin" && (
                  <Button
                    onClick={handleCreateGate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gate
                  </Button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search gates by name, location, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filter Panel */}
              {filterOpen && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-900">
                          All Gates
                        </option>
                        <option value="active" className="text-gray-900">
                          Active
                        </option>
                        <option value="inactive" className="text-gray-900">
                          Inactive
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone Count
                      </label>
                      <select
                        value={zoneCountFilter}
                        onChange={(e) => setZoneCountFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-900">
                          Any
                        </option>
                        <option value="1" className="text-gray-900">
                          1 Zone
                        </option>
                        <option value="2-5" className="text-gray-900">
                          2-5 Zones
                        </option>
                        <option value="5+" className="text-gray-900">
                          5+ Zones
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-900">
                          All Locations
                        </option>
                        <option value="north" className="text-gray-900">
                          North
                        </option>
                        <option value="south" className="text-gray-900">
                          South
                        </option>
                        <option value="east" className="text-gray-900">
                          East
                        </option>
                        <option value="west" className="text-gray-900">
                          West
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gates Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  All Gates ({filteredGates.length})
                </h3>
              </div>

              {filteredGates.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No gates found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Get started by creating your first gate"}
                  </p>
                  {isAuthenticated && user?.role === "admin" && (
                    <Button
                      onClick={handleCreateGate}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Gate
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGates.map((gate) => {
                        const zoneNames = getZoneNames(gate.zoneIds);
                        return (
                          <tr key={gate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {gate.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {gate.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                {gate.location}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {zoneNames.length} zone
                                {zoneNames.length !== 1 ? "s" : ""}
                              </div>
                              <div className="text-sm text-gray-500">
                                {zoneNames.slice(0, 2).join(", ")}
                                {zoneNames.length > 2 &&
                                  ` +${zoneNames.length - 2} more`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewGate(gate.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {isAuthenticated && user?.role === "admin" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditGate(gate)}
                                      className="text-yellow-600 hover:text-yellow-900"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteGate(gate.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div
            className="fixed inset-0 bg-[#00000010]  backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showCreateModal ? "Create New Gate" : "Edit Gate"}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitForm();
                }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gate Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg h-12 px-4 text-base"
                      placeholder="Enter gate name (e.g., Main Entrance)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <select
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-base h-12 appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="text-gray-900">
                          Select gate location
                        </option>
                        <option value="North" className="text-gray-900">
                          🧭 North
                        </option>
                        <option value="South" className="text-gray-900">
                          🗺️ South
                        </option>
                        <option value="East" className="text-gray-900">
                          🌅 East
                        </option>
                        <option value="West" className="text-gray-900">
                          🌇 West
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Associated Zones
                    </label>
                    <div className="relative">
                      <select
                        multiple
                        value={formData.zoneIds}
                        onChange={(e) => {
                          const selectedOptions = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          );
                          setFormData({
                            ...formData,
                            zoneIds: selectedOptions,
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-base h-36 resize-none"
                      >
                        {zones?.map((zone: any) => (
                          <option
                            key={zone.id}
                            value={zone.id}
                            className="text-gray-900 py-2 px-1 hover:bg-blue-50"
                          >
                            🅿️ {zone.name} ({zone.totalSlots} slots)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Hold Ctrl/Cmd and click to select multiple zones
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                    disabled={
                      createGateMutation.isPending ||
                      updateGateMutation.isPending
                    }
                  >
                    {createGateMutation.isPending ||
                    updateGateMutation.isPending ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </div>
                    ) : showCreateModal ? (
                      "Create Gate"
                    ) : (
                      "Update Gate"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </MainLayout>
    </ErrorBoundary>
  );
}
