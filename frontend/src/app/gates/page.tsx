"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAdminGates, useAdminZones } from "@/hooks/useApi";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { TableSkeleton, CardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Settings,
  Eye,
  ArrowRight,
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
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // API hooks
  const {
    data: gates,
    isLoading: gatesLoading,
    error: gatesError,
  } = useAdminGates();

  const { data: zones, isLoading: zonesLoading } = useAdminZones();

  // Filter and search gates
  const filteredGates = useMemo(() => {
    if (!gates) return [];

    return gates.filter(
      (gate) =>
        gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gate.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gates, searchTerm]);

  // Get zone names for a gate
  const getZoneNames = (zoneIds: string[]) => {
    if (!zones) return [];
    return zoneIds
      .map((id) => zones.find((zone) => zone.id === id)?.name)
      .filter(Boolean);
  };

  const handleCreateGate = () => {
    setShowCreateModal(true);
  };

  const handleEditGate = (gate: Gate) => {
    setSelectedGate(gate);
    setShowEditModal(true);
  };

  const handleViewGate = (gateId: string) => {
    router.push(`/gates/${gateId}`);
  };

  const handleDeleteGate = (gateId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete gate:", gateId);
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
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Gates</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone Count
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Any</option>
                        <option value="1">1 Zone</option>
                        <option value="2-5">2-5 Zones</option>
                        <option value="5+">5+ Zones</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Locations</option>
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
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

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Gate Management
                    </h3>
                    <p className="text-sm text-gray-500">
                      Configure gate settings and zone assignments
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardSkeleton>

              <CardSkeleton className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Zone Overview
                    </h3>
                    <p className="text-sm text-gray-500">
                      View all parking zones and their status
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardSkeleton>

              <CardSkeleton className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      System Settings
                    </h3>
                    <p className="text-sm text-gray-500">
                      Configure system-wide settings and preferences
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardSkeleton>
            </div>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
