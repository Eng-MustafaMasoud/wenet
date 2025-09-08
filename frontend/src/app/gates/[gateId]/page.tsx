"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAdminGates, useAdminZones, useParkingState } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { CardSkeleton, ChartSkeleton } from "@/components/ui/SkeletonLoader";
import {
  Car,
  MapPin,
  Users,
  Clock,
  Settings,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
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

export default function GateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gateId = params.gateId as string;
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { connectionState } = useWebSocket();

  // API hooks
  const {
    data: gates,
    isLoading: gatesLoading,
    error: gatesError,
  } = useAdminGates();

  const { data: zones, isLoading: zonesLoading } = useAdminZones();

  const { data: parkingState, isLoading: parkingLoading } = useParkingState();

  // Find current gate
  const currentGate = useMemo(() => {
    return gates?.find((gate) => gate.id === gateId);
  }, [gates, gateId]);

  // Get zones for this gate
  const gateZones = useMemo(() => {
    if (!zones || !currentGate) return [];
    return zones.filter((zone) => currentGate.zoneIds.includes(zone.id));
  }, [zones, currentGate]);

  // Get parking state for gate zones
  const gateZoneStates = useMemo(() => {
    if (!parkingState || !gateZones) return [];
    return parkingState.filter((state) =>
      gateZones.some((zone) => zone.id === state.id)
    );
  }, [parkingState, gateZones]);

  // Calculate gate statistics
  const gateStats = useMemo(() => {
    if (!gateZones || !gateZoneStates) {
      return {
        totalSlots: 0,
        totalOccupied: 0,
        totalFree: 0,
        totalReserved: 0,
        occupancyRate: 0,
        openZones: 0,
        closedZones: 0,
        availableForVisitors: 0,
        availableForSubscribers: 0,
      };
    }

    const totalSlots = gateZones.reduce(
      (sum, zone) => sum + zone.totalSlots,
      0
    );
    const totalOccupied = gateZoneStates.reduce(
      (sum, state) => sum + state.occupied,
      0
    );
    const totalFree = gateZoneStates.reduce(
      (sum, state) => sum + state.free,
      0
    );
    const totalReserved = gateZoneStates.reduce(
      (sum, state) => sum + state.reserved,
      0
    );
    const occupancyRate =
      totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;
    const openZones = gateZoneStates.filter((state) => state.open).length;
    const closedZones = gateZoneStates.length - openZones;
    const availableForVisitors = gateZoneStates.reduce(
      (sum, state) => sum + state.availableForVisitors,
      0
    );
    const availableForSubscribers = gateZoneStates.reduce(
      (sum, state) => sum + state.availableForSubscribers,
      0
    );

    return {
      totalSlots,
      totalOccupied,
      totalFree,
      totalReserved,
      occupancyRate,
      openZones,
      closedZones,
      availableForVisitors,
      availableForSubscribers,
    };
  }, [gateZones, gateZoneStates]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!gateZones || !gateZoneStates) return [];

    return gateZones
      .map((zone) => {
        const state = gateZoneStates.find((s) => s.id === zone.id);
        if (!state) return null;

        const occupancyRate =
          zone.totalSlots > 0 ? (state.occupied / zone.totalSlots) * 100 : 0;

        return {
          name: zone.name,
          occupied: state.occupied,
          free: state.free,
          reserved: state.reserved,
          total: zone.totalSlots,
          occupancyRate: Math.round(occupancyRate),
          availableVisitors: state.availableForVisitors,
          availableSubscribers: state.availableForSubscribers,
          open: state.open,
        };
      })
      .filter(Boolean);
  }, [gateZones, gateZoneStates]);

  // Zone status distribution
  const zoneStatusData = useMemo(() => {
    if (!gateZoneStates) return [];

    const available = gateZoneStates.filter(
      (state) => state.open && state.availableForVisitors > 0
    ).length;
    const full = gateZoneStates.filter(
      (state) => state.open && state.availableForVisitors === 0
    ).length;
    const closed = gateZoneStates.filter((state) => !state.open).length;

    return [
      { name: "Available", value: available, color: "#10B981" },
      { name: "Full", value: full, color: "#EF4444" },
      { name: "Closed", value: closed, color: "#6B7280" },
    ];
  }, [gateZoneStates]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (gatesLoading || zonesLoading || parkingLoading) {
    return (
      <MainLayout title="Gate Details - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>

            {/* Zones Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (gatesError || !currentGate) {
    return (
      <MainLayout title="Gate Details - ParkFlow">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gate Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The gate you're looking for doesn't exist or has been removed.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => router.push("/gates")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gates
              </Button>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout title={`${currentGate.name} - ParkFlow`}>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/gates")}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {currentGate.name}
                    </h1>
                    <p className="mt-2 text-gray-600">
                      {currentGate.location} • {gateZones.length} zone
                      {gateZones.length !== 1 ? "s" : ""}
                    </p>
                  </div>
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
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Slots
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {gateStats.totalSlots}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Occupied
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {gateStats.totalOccupied}
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
                      {gateStats.totalFree}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Occupancy Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {gateStats.occupancyRate.toFixed(1)}%
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
                  Zone Occupancy
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

            {/* Zone Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Zone List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Zone Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {gateZones.map((zone) => {
                      const state = gateZoneStates.find(
                        (s) => s.id === zone.id
                      );
                      if (!state) return null;

                      const occupancyRate =
                        zone.totalSlots > 0
                          ? (state.occupied / zone.totalSlots) * 100
                          : 0;

                      return (
                        <div
                          key={zone.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {zone.name}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                state.open
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {state.open ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {state.open ? "Open" : "Closed"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {state.occupied}
                              </div>
                              <div className="text-xs text-gray-500">
                                Occupied
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {state.free}
                              </div>
                              <div className="text-xs text-gray-500">
                                Available
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Total Slots:
                              </span>
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
                              <span className="text-gray-600">
                                Available for Visitors:
                              </span>
                              <span
                                className={`font-medium ${
                                  state.availableForVisitors > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {state.availableForVisitors}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Available for Subscribers:
                              </span>
                              <span
                                className={`font-medium ${
                                  state.availableForSubscribers > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {state.availableForSubscribers}
                              </span>
                            </div>
                          </div>

                          {/* Occupancy Bar */}
                          <div className="mt-3">
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <Button
                      onClick={() => router.push(`/gates/${gateId}/visitor`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Visitor Check-in
                    </Button>
                    <Button
                      onClick={() => router.push(`/gates/${gateId}/subscriber`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Subscriber Check-in
                    </Button>
                    <Button
                      onClick={() => router.push("/checkpoint")}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white justify-start"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Checkout
                    </Button>
                    {isAuthenticated && user?.role === "admin" && (
                      <Button
                        onClick={() => router.push(`/gates/${gateId}/settings`)}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gate Settings
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
