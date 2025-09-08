"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAdminZones,
  useParkingState,
  useAdminCategories,
  useTickets,
} from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import ClientTime from "@/components/ui/ClientTime";
import {
  MapPin,
  Car,
  Users,
  Clock,
  Activity,
  DollarSign,
  ArrowLeft,
  Settings,
  Wifi,
  WifiOff,
  Star,
  Lock,
  Unlock,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params?.zoneId as string;

  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");

  // API hooks
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: parkingState, isLoading: stateLoading } = useParkingState();
  const { data: categories } = useAdminCategories();
  const { data: tickets } = useTickets();
  const { connectionState } = useWebSocket();

  const isLoading = zonesLoading || stateLoading;

  // Find the specific zone
  const zone = zones?.find((z) => z.id === zoneId);
  const zoneState = parkingState?.find((state) => state.id === zoneId);
  const category = categories?.find((cat) => cat.id === zone?.categoryId);

  // Combine zone data with state
  const enrichedZone = zone && zoneState ? { ...zone, ...zoneState } : zone;

  // Get zone-related tickets
  const zoneTickets =
    tickets?.filter((ticket) => ticket.zoneId === zoneId) || [];
  const activeTickets = zoneTickets.filter((ticket) => !ticket.checkoutAt);

  if (isLoading) {
    return (
      <MainLayout title="Zone Details - ParkFlow">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!enrichedZone) {
    return (
      <MainLayout title="Zone Not Found - ParkFlow">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Zone not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The zone you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => router.push("/zones")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Zones
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const occupancyRate =
    enrichedZone.totalSlots > 0
      ? (enrichedZone.occupied / enrichedZone.totalSlots) * 100
      : 0;
  const currentRate = enrichedZone.rateNormal;

  return (
    <MainLayout title={`${enrichedZone.name} - ParkFlow`}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => router.back()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {enrichedZone.name}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {category?.name || enrichedZone.categoryId} • Zone ID:{" "}
                      {enrichedZone.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Zone Status */}
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm ${
                      enrichedZone.open
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {enrichedZone.open ? (
                      <Unlock className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span>{enrichedZone.open ? "Open" : "Closed"}</span>
                  </div>

                  {/* Connection Status */}
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
                      {connectionState === "open" ? "Live" : "Offline"}
                    </span>
                  </div>

                  {/* Current Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <ClientTime />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Occupancy Stats */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Current Occupancy
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {enrichedZone.totalSlots}
                    </div>
                    <div className="text-sm text-gray-500">Total Slots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {enrichedZone.occupied}
                    </div>
                    <div className="text-sm text-gray-500">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {enrichedZone.free}
                    </div>
                    <div className="text-sm text-gray-500">Free</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {enrichedZone.reserved}
                    </div>
                    <div className="text-sm text-gray-500">Reserved</div>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Occupancy Rate</span>
                    <span>{occupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        occupancyRate > 90
                          ? "bg-red-500"
                          : occupancyRate > 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Availability Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Availability Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        For Visitors
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {enrichedZone.availableForVisitors}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.max(
                            10,
                            (enrichedZone.availableForVisitors /
                              enrichedZone.totalSlots) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        For Subscribers
                      </span>
                      <span className="text-lg font-bold text-purple-600">
                        {enrichedZone.availableForSubscribers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.max(
                            10,
                            (enrichedZone.availableForSubscribers /
                              enrichedZone.totalSlots) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Pricing Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Pricing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Rate:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${currentRate}/hr
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Normal Rate:</span>
                      <span className="font-medium">
                        ${enrichedZone.rateNormal}/hr
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Special Rate:</span>
                      <span className="font-medium text-orange-600">
                        ${enrichedZone.rateSpecial}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Zone Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Category:</span>
                    <div className="font-medium">
                      {category?.name || enrichedZone.categoryId}
                    </div>
                    {category?.description && (
                      <div className="text-sm text-gray-500">
                        {category.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">
                      Connected Gates:
                    </span>
                    <div className="mt-1">
                      {enrichedZone.gateIds &&
                      enrichedZone.gateIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {enrichedZone.gateIds.map((gateId) => (
                            <span
                              key={gateId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {gateId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No gates connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push(`/admin?tab=zones`)}
                    fullWidth
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Zone
                  </Button>

                  {enrichedZone.gateIds && enrichedZone.gateIds.length > 0 && (
                    <Button
                      onClick={() =>
                        router.push(`/gate/${enrichedZone.gateIds[0]}`)
                      }
                      fullWidth
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Access Gate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Tickets */}
          {activeTickets.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Tickets ({activeTickets.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeTickets.map((ticket) => {
                      const checkinTime = new Date(ticket.checkinAt);
                      const duration = Date.now() - checkinTime.getTime();
                      const hours = Math.floor(duration / (1000 * 60 * 60));
                      const minutes = Math.floor(
                        (duration % (1000 * 60 * 60)) / (1000 * 60)
                      );

                      return (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ticket.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ticket.type === "subscriber"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ticket.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {checkinTime.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {hours}h {minutes}m
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
  );
}
