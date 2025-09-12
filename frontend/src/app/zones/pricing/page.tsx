"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminZones, useAdminCategories } from "@/hooks/useApi";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import ClientTime from "@/components/ui/ClientTime";
import {
  DollarSign,
  Clock,
  ArrowLeft,
  Star,
  TrendingUp,
  Info,
  Filter,
  Eye,
} from "lucide-react";

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
  specialActive?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  rateNormal: number;
  rateSpecial: number;
}

interface PricingStats {
  totalZones: number;
  normalRateZones: number;
  specialRateZones: number;
  avgNormalRate: number;
  avgSpecialRate: number;
  minRate: number;
  maxRate: number;
}

export default function ZonesPricingPage() {
  const router = useRouter();
  const [filterBy, setFilterBy] = useState<"all" | "normal" | "special">("all");
  const [sortBy, setSortBy] = useState<"name" | "normal-rate" | "special-rate">(
    "name"
  );

  // API hooks
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();

  const isLoading = zonesLoading || categoriesLoading;

  // Group zones by category and calculate pricing stats
  const pricingData = useMemo((): {
    zonesByCategory: Record<string, Zone[]>;
    stats: PricingStats;
  } => {
    const empty: {
      zonesByCategory: Record<string, Zone[]>;
      stats: PricingStats;
    } = {
      zonesByCategory: {},
      stats: {
        totalZones: 0,
        normalRateZones: 0,
        specialRateZones: 0,
        avgNormalRate: 0,
        avgSpecialRate: 0,
        minRate: 0,
        maxRate: 0,
      },
    };

    if (!zones || !categories) return empty;

    const zonesByCategory: Record<string, Zone[]> = {};
    const stats: PricingStats = {
      totalZones: zones.length,
      normalRateZones: 0,
      specialRateZones: 0,
      avgNormalRate: 0,
      avgSpecialRate: 0,
      minRate: Infinity,
      maxRate: 0,
    };

    // Group zones by category
    zones.forEach((zone) => {
      if (!zonesByCategory[zone.categoryId]) {
        zonesByCategory[zone.categoryId] = [];
      }
      zonesByCategory[zone.categoryId].push(zone);

      // Calculate stats
      stats.normalRateZones++;

      const currentRate = zone.rateNormal;
      stats.minRate = Math.min(stats.minRate, currentRate);
      stats.maxRate = Math.max(stats.maxRate, currentRate);
    });

    // Calculate average rates
    const allNormalRates = zones.map((z) => z.rateNormal);
    stats.avgNormalRate =
      allNormalRates.reduce((sum, rate) => sum + rate, 0) /
      allNormalRates.length;
    stats.avgSpecialRate = 0;

    if (stats.minRate === Infinity) stats.minRate = 0;

    return { zonesByCategory, stats };
  }, [zones, categories]);

  // Filter and sort zones
  const filteredZones = useMemo(() => {
    if (!zones) return [];

    let filtered = zones;

    // Apply filter
    if (filterBy === "normal") {
      filtered = zones.filter(
        (zone) => zone.rateSpecial === 0 || !zone.rateSpecial
      );
    } else if (filterBy === "special") {
      filtered = zones.filter((zone) => zone.rateSpecial > 0);
    }

    // Apply sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "normal-rate":
          return b.rateNormal - a.rateNormal;
        case "special-rate":
          return b.rateSpecial - a.rateSpecial;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [zones, filterBy, sortBy]);

  const getCategoryInfo = (categoryId: string) => {
    return categories?.find((cat) => cat.id === categoryId);
  };

  if (isLoading) {
    return (
      <MainLayout title="Zone Pricing - ParkFlow">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Zone Pricing - ParkFlow">
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
                      Zone Pricing
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Current rates and pricing information
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <ClientTime />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Normal Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pricingData.stats.avgNormalRate?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Special Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pricingData.stats.avgSpecialRate?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Rate Range
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pricingData.stats.minRate} - ${pricingData.stats.maxRate}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Info className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Special Active
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pricingData.stats.specialRateZones} zones
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter:
                  </span>
                </div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                >
                  <option value="all">All Zones</option>
                  <option value="normal">Normal Rate Only</option>
                  <option value="special">Special Rate Active</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                  >
                    <option value="name">Name</option>
                    <option value="normal-rate">Normal Rate</option>
                    <option value="special-rate">Special Rate</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Pricing Categories
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Normal Rate:</span>
                        <span className="font-medium">
                          ${category.rateNormal}/hr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Special Rate:</span>
                        <span className="font-medium text-orange-600">
                          ${category.rateSpecial}/hr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Zones:</span>
                        <span className="font-medium">
                          {pricingData.zonesByCategory[category.id]?.length ||
                            0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zones Pricing Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Zone Pricing Details ({filteredZones.length} zones)
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
                      Current Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Normal Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Special Rate
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
                  {filteredZones.map((zone) => {
                    const category = getCategoryInfo(zone.categoryId);
                    const currentRate = zone.rateNormal;

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
                          <div className="text-sm text-gray-900">
                            {category?.name || zone.categoryId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category?.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-bold text-gray-900`}>
                            ${currentRate}/hr
                          </div>
                          {/* Special Rate indicator removed */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${zone.rateNormal}/hr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                          —
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              zone.open
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {zone.open ? "Open" : "Closed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => router.push(`/zones/${zone.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
