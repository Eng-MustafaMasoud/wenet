"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Car,
  MapPin,
  Clock,
  DollarSign,
  Activity,
  RefreshCw,
} from "lucide-react";
import { adminApi, masterApi, Zone, Category, Gate } from "@/services/api";
import { useNotifications } from "@/components/ui/NotificationSystem";
import { useLoading } from "@/components/ui/LoadingStateManager";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ButtonGroup,
} from "@/components/layout/AppProviders";
import LoadingButton from "@/components/ui/EnhancedLoadingButton";

interface ParkingStats {
  totalZones: number;
  totalGates: number;
  totalCategories: number;
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  reservedSlots: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  openZones: number;
  closedZones: number;
}

export default function ReportsAnalytics() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [stats, setStats] = useState<ParkingStats | null>(null);
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load data
  const loadData = async () => {
    try {
      startLoading("reports-load", "Loading reports data...", "admin");
      const [zonesData, categoriesData, gatesData] = await Promise.all([
        adminApi.getParkingState(),
        masterApi.getCategories(),
        masterApi.getGates(),
      ]);

      setZones(zonesData);
      setCategories(categoriesData);
      setGates(gatesData);

      // Calculate stats
      const totalSlots = zonesData.reduce(
        (sum, zone) => sum + zone.totalSlots,
        0
      );
      const occupiedSlots = zonesData.reduce(
        (sum, zone) => sum + zone.occupied,
        0
      );
      const freeSlots = zonesData.reduce((sum, zone) => sum + zone.free, 0);
      const reservedSlots = zonesData.reduce(
        (sum, zone) => sum + zone.reserved,
        0
      );
      const availableForVisitors = zonesData.reduce(
        (sum, zone) => sum + zone.availableForVisitors,
        0
      );
      const availableForSubscribers = zonesData.reduce(
        (sum, zone) => sum + zone.availableForSubscribers,
        0
      );
      const openZones = zonesData.filter((zone) => zone.open).length;
      const closedZones = zonesData.filter((zone) => !zone.open).length;

      setStats({
        totalZones: zonesData.length,
        totalGates: gatesData.length,
        totalCategories: categoriesData.length,
        totalSlots,
        occupiedSlots,
        freeSlots,
        reservedSlots,
        availableForVisitors,
        availableForSubscribers,
        openZones,
        closedZones,
      });
    } catch (error: any) {
      notifications.showError("Failed to load reports data", error.message);
    } finally {
      stopLoading("reports-load");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate occupancy rate
  const getOccupancyRate = () => {
    if (!stats || stats.totalSlots === 0) return 0;
    return Math.round((stats.occupiedSlots / stats.totalSlots) * 100);
  };

  // Calculate utilization rate
  const getUtilizationRate = () => {
    if (!stats || stats.totalSlots === 0) return 0;
    return Math.round(
      ((stats.occupiedSlots + stats.reservedSlots) / stats.totalSlots) * 100
    );
  };

  // Get zone status color
  const getZoneStatusColor = (zone: Zone) => {
    const occupancyRate = (zone.occupied / zone.totalSlots) * 100;
    if (occupancyRate >= 90) return "text-red-600";
    if (occupancyRate >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  // Get zone status icon
  const getZoneStatusIcon = (zone: Zone) => {
    const occupancyRate = (zone.occupied / zone.totalSlots) * 100;
    if (occupancyRate >= 90) return "🔴";
    if (occupancyRate >= 70) return "🟡";
    return "🟢";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h2>
          <p className="text-gray-600">
            Parking system overview and statistics
          </p>
        </div>
        <ButtonGroup>
          <LoadingButton onClick={loadData} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Key Metrics */}
      {stats && (
        <ResponsiveGrid cols={4} gap="md">
          <ResponsiveCard>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Zones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalZones}
                </p>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSlots}
                </p>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Occupancy Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getOccupancyRate()}%
                </p>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Utilization Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getUtilizationRate()}%
                </p>
              </div>
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>
      )}

      {/* Detailed Statistics */}
      {stats && (
        <ResponsiveGrid cols={2} gap="md">
          <ResponsiveCard title="Slot Distribution">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.occupiedSlots}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.occupiedSlots / stats.totalSlots) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reserved</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.reservedSlots}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.reservedSlots / stats.totalSlots) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Available for Visitors
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.availableForVisitors}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (stats.availableForVisitors / stats.totalSlots) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Available for Subscribers
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.availableForSubscribers}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (stats.availableForSubscribers / stats.totalSlots) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard title="Zone Status">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Open Zones</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.openZones}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Closed Zones</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.closedZones}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Categories</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalCategories}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Gates</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalGates}
                </span>
              </div>
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>
      )}

      {/* Zone Details */}
      <ResponsiveCard title="Zone Details">
        {isLoading("reports-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading zone details...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No zones found
            </h3>
            <p className="text-gray-600">No zone data available.</p>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.map((zone) => {
                  const occupancyRate = Math.round(
                    (zone.occupied / zone.totalSlots) * 100
                  );

                  return (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {zone.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {zone.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {getZoneStatusIcon(zone)}
                          </span>
                          <span
                            className={`text-sm font-medium ${getZoneStatusColor(
                              zone
                            )}`}
                          >
                            {zone.open ? "Open" : "Closed"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {zone.totalSlots} slots
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-blue-600" />
                            {zone.occupied} ({occupancyRate}%)
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className={`h-1 rounded-full ${
                                occupancyRate >= 90
                                  ? "bg-red-500"
                                  : occupancyRate >= 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Visitors: {zone.availableForVisitors}</div>
                          <div>Subscribers: {zone.availableForSubscribers}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            ${zone.rateNormal}/hr
                          </div>
                          <div className="flex items-center text-orange-600">
                            <Clock className="w-4 h-4 mr-1" />$
                            {zone.rateSpecial}/hr
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ResponsiveCard>

      {/* Categories Overview */}
      <ResponsiveCard title="Categories Overview">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600">No category data available.</p>
          </div>
        ) : (
          <ResponsiveGrid cols={3} gap="md">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {category.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    ID: {category.id}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {category.description}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Normal Rate:</span>
                    <span className="font-medium text-green-600">
                      ${category.rateNormal}/hr
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Special Rate:</span>
                    <span className="font-medium text-orange-600">
                      ${category.rateSpecial}/hr
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        )}
      </ResponsiveCard>
    </div>
  );
}
