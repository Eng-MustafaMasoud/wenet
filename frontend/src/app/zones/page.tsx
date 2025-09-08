"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useAdminZones,
  useParkingState,
  useAdminCategories,
} from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import {
  MetricCardSkeleton,
  ChartSkeleton,
} from "@/components/ui/SkeletonLoader";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Car,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}

export default function ZonesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "occupancy" | "availability">(
    "name"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "closed" | "full"
  >("all");

  // API hooks
  const {
    data: zones,
    isLoading: zonesLoading,
    error: zonesError,
  } = useAdminZones();

  const { data: parkingState, isLoading: parkingLoading } = useParkingState();

  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();

  const { connectionState } = useWebSocket();

  // Enrich zones with parking state data
  const enrichedZones = useMemo(() => {
    if (!zones || !parkingState) return [];

    return zones.map((zone) => {
      const state = parkingState.find((state) => state.id === zone.id);
      return state ? { ...zone, ...state } : zone;
    });
  }, [zones, parkingState]);

  // Filter and sort zones
  const filteredZones = useMemo(() => {
    if (!enrichedZones) return [];

    const filtered = enrichedZones.filter((zone) => {
      const matchesSearch =
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.categoryId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && zone.open) ||
        (statusFilter === "closed" && !zone.open) ||
        (statusFilter === "full" &&
          zone.open &&
          zone.availableForVisitors === 0);

      return matchesSearch && matchesStatus;
    });

    // Sort zones
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "occupancy":
          const aOccupancy =
            a.totalSlots > 0 ? (a.occupied / a.totalSlots) * 100 : 0;
          const bOccupancy =
            b.totalSlots > 0 ? (b.occupied / b.totalSlots) * 100 : 0;
          return bOccupancy - aOccupancy;
        case "availability":
          return b.availableForVisitors - a.availableForVisitors;
        default:
          return 0;
      }
    });

    return filtered;
  }, [enrichedZones, searchTerm, statusFilter, sortBy]);

  // Calculate zone statistics
  const zoneStats = useMemo(() => {
    if (!enrichedZones) {
      return {
        totalZones: 0,
        totalSlots: 0,
        totalOccupied: 0,
        totalFree: 0,
        totalReserved: 0,
        openZones: 0,
        closedZones: 0,
        fullZones: 0,
        avgOccupancyRate: 0,
        totalRevenue: 0,
      };
    }

    const totalZones = enrichedZones.length;
    const totalSlots = enrichedZones.reduce(
      (sum, zone) => sum + zone.totalSlots,
      0
    );
    const totalOccupied = enrichedZones.reduce(
      (sum, zone) => sum + zone.occupied,
      0
    );
    const totalFree = enrichedZones.reduce((sum, zone) => sum + zone.free, 0);
    const totalReserved = enrichedZones.reduce(
      (sum, zone) => sum + zone.reserved,
      0
    );
    const openZones = enrichedZones.filter((zone) => zone.open).length;
    const closedZones = totalZones - openZones;
    const fullZones = enrichedZones.filter(
      (zone) => zone.open && zone.availableForVisitors === 0
    ).length;
    const avgOccupancyRate =
      totalZones > 0
        ? enrichedZones.reduce((sum, zone) => {
            const occupancy =
              zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0;
            return sum + occupancy;
          }, 0) / totalZones
        : 0;

    return {
      totalZones,
      totalSlots,
      totalOccupied,
      totalFree,
      totalReserved,
      openZones,
      closedZones,
      fullZones,
      avgOccupancyRate,
      totalRevenue: 0, // TODO: Calculate from actual revenue data
    };
  }, [enrichedZones]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!enrichedZones) return [];

    return enrichedZones.map((zone) => {
      const occupancyRate =
        zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0;
      const category = categories?.find((cat) => cat.id === zone.categoryId);

      return {
        name: zone.name,
        occupied: zone.occupied,
        free: zone.free,
        reserved: zone.reserved,
        total: zone.totalSlots,
        occupancyRate: Math.round(occupancyRate),
        category: category?.name || zone.categoryId,
        availableVisitors: zone.availableForVisitors,
        availableSubscribers: zone.availableForSubscribers,
        rateNormal: zone.rateNormal,
        open: zone.open,
      };
    });
  }, [enrichedZones, categories]);

  // Zone status distribution
  const zoneStatusData = useMemo(() => {
    if (!enrichedZones) return [];

    const available = enrichedZones.filter(
      (zone) => zone.open && zone.availableForVisitors > 0
    ).length;
    const full = enrichedZones.filter(
      (zone) => zone.open && zone.availableForVisitors === 0
    ).length;
    const closed = enrichedZones.filter((zone) => !zone.open).length;

    return [
      { name: "Available", value: available, color: "#10B981" },
      { name: "Full", value: full, color: "#EF4444" },
      { name: "Closed", value: closed, color: "#6B7280" },
    ];
  }, [enrichedZones]);

  const handleCreateZone = () => {
    // TODO: Implement create zone functionality
    console.log("Create zone");
  };

  const handleViewZone = (zoneId: string) => {
    router.push(`/zones/${zoneId}`);
  };

  const handleEditZone = (zone: Zone) => {
    // TODO: Implement edit zone functionality
    console.log("Edit zone:", zone.id);
  };

  const handleDeleteZone = (zoneId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete zone:", zoneId);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((cat) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  if (zonesLoading || parkingLoading || categoriesLoading) {
    return (
      <MainLayout title="Zones - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>

            {/* Filters Skeleton */}
            <div className="mb-6">
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (zonesError) {
    return (
      <MainLayout title="Zones - ParkFlow">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Zones
            </h2>
            <p className="text-gray-600 mb-4">
              {zonesError?.message || "Failed to load zones data"}
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
      <MainLayout title="Zones - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Parking Zones
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage parking zones, availability, and pricing
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm ${
                      connectionState === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {connectionState === "open" ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                    <span>
                      {connectionState === "open"
                        ? "Connected"
                        : "Disconnected"}
                    </span>
                  </div>
                  {isAuthenticated && user?.role === "admin" && (
                    <Button
                      onClick={handleCreateZone}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Zone
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Zones
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {zoneStats.totalZones}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Car className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Slots
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {zoneStats.totalSlots}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Available
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {zoneStats.totalFree}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Occupancy
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {zoneStats.avgOccupancyRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Zone Occupancy Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Zone Occupancy Overview
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="occupied" fill="#EF4444" name="Occupied" />
                      <Bar dataKey="free" fill="#10B981" name="Available" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Zone Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Zone Status Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={zoneStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent = 0 }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {zoneStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search zones by name, ID, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <div className="flex border border-gray-300 rounded-md">
                    <Button
                      variant={viewType === "grid" ? "primary" : "outline"}
                      onClick={() => setViewType("grid")}
                      className="rounded-r-none border-r-0"
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewType === "list" ? "primary" : "outline"}
                      onClick={() => setViewType("list")}
                      className="rounded-l-none"
                    >
                      List
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filter Panel */}
              {filterOpen && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Zones</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="full">Full</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Name</option>
                        <option value="occupancy">Occupancy Rate</option>
                        <option value="availability">Availability</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Categories</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupancy Range
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Any</option>
                        <option value="0-25">0-25%</option>
                        <option value="25-50">25-50%</option>
                        <option value="50-75">50-75%</option>
                        <option value="75-100">75-100%</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zones Grid/List */}
            {filteredZones.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No zones found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first zone"}
                </p>
                {isAuthenticated && user?.role === "admin" && (
                  <Button
                    onClick={handleCreateZone}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Zone
                  </Button>
                )}
              </div>
            ) : viewType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredZones.map((zone) => {
                  const occupancyRate =
                    zone.totalSlots > 0
                      ? (zone.occupied / zone.totalSlots) * 100
                      : 0;
                  const categoryName = getCategoryName(zone.categoryId);

                  return (
                    <div
                      key={zone.id}
                      className="bg-white rounded-lg shadow-sm border overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {zone.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {categoryName}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              zone.open
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {zone.open ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {zone.open ? "Open" : "Closed"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {zone.occupied}
                            </div>
                            <div className="text-xs text-gray-500">
                              Occupied
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {zone.free}
                            </div>
                            <div className="text-xs text-gray-500">
                              Available
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Slots:</span>
                            <span className="font-medium">
                              {zone.totalSlots}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Occupancy Rate:
                            </span>
                            <span className="font-medium">
                              {occupancyRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Rate:</span>
                            <span className="font-medium">
                              ${zone.rateNormal}/hr
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Available for Visitors:
                            </span>
                            <span
                              className={`font-medium ${
                                zone.availableForVisitors > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {zone.availableForVisitors}
                            </span>
                          </div>
                        </div>

                        {/* Occupancy Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Occupancy</span>
                            <span>{occupancyRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                occupancyRate > 90
                                  ? "bg-red-500"
                                  : occupancyRate > 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(occupancyRate, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => handleViewZone(zone.id)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {isAuthenticated && user?.role === "admin" && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEditZone(zone)}
                                variant="outline"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteZone(zone.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    All Zones ({filteredZones.length})
                  </h3>
                </div>
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
                          Occupancy
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Availability
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
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
                      {filteredZones.map((zone) => {
                        const occupancyRate =
                          zone.totalSlots > 0
                            ? (zone.occupied / zone.totalSlots) * 100
                            : 0;
                        const categoryName = getCategoryName(zone.categoryId);

                        return (
                          <tr key={zone.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {zone.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {zone.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {categoryName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {zone.occupied}/{zone.totalSlots}
                              </div>
                              <div className="text-sm text-gray-500">
                                {occupancyRate.toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {zone.availableForVisitors} visitors
                              </div>
                              <div className="text-sm text-gray-500">
                                {zone.availableForSubscribers} subscribers
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ${zone.rateNormal}/hr
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  zone.open
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {zone.open ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {zone.open ? "Open" : "Closed"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewZone(zone.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {isAuthenticated && user?.role === "admin" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditZone(zone)}
                                      className="text-yellow-600 hover:text-yellow-900"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteZone(zone.id)}
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
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
