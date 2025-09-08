"use client";

import { useState, useMemo } from "react";
import ClientTime from "@/components/ui/ClientTime";
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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useAdminGates,
  useSubscriptions,
  useTickets,
  useUsers,
} from "@/hooks/useApi";
import {
  Car,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  MapPin,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function DashboardOverview() {
  const [timeRange, setTimeRange] = useState("24h");

  const { data: parkingState, isLoading: parkingLoading } = useParkingState();
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();
  const { data: gates, isLoading: gatesLoading } = useAdminGates();
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading =
    parkingLoading ||
    zonesLoading ||
    categoriesLoading ||
    gatesLoading ||
    subscriptionsLoading ||
    ticketsLoading ||
    usersLoading;

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!parkingState || !zones || !subscriptions || !tickets) {
      return {
        totalSlots: 0,
        totalOccupied: 0,
        totalFree: 0,
        totalReserved: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        totalUsers: 0,
        occupancyRate: 0,
        revenueToday: 0,
        avgTicketValue: 0,
      };
    }

    const totalSlots = zones.reduce((sum, zone) => sum + zone.totalSlots, 0);
    const totalOccupied = parkingState.reduce(
      (sum, zone) => sum + zone.occupied,
      0
    );
    const totalFree = parkingState.reduce((sum, zone) => sum + zone.free, 0);
    const totalReserved = parkingState.reduce(
      (sum, zone) => sum + zone.reserved,
      0
    );
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.active
    ).length;
    const totalUsers = users?.length || 0;
    const occupancyRate =
      totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;

    // Calculate revenue (simplified - in real app, this would come from actual transaction data)
    const revenueToday =
      tickets?.reduce((sum, ticket) => {
        // This is a mock calculation - in reality, you'd have actual payment data
        const hours = 2; // Mock hours
        const rate = zones.find((z) => z.id === ticket.zoneId)?.rateNormal || 5;
        return sum + hours * rate;
      }, 0) || 0;

    const avgTicketValue =
      tickets?.length > 0 ? revenueToday / tickets.length : 0;

    return {
      totalSlots,
      totalOccupied,
      totalFree,
      totalReserved,
      totalRevenue: revenueToday,
      activeSubscriptions,
      totalUsers,
      occupancyRate,
      revenueToday,
      avgTicketValue,
    };
  }, [parkingState, zones, subscriptions, tickets, users]);

  // Zone occupancy data for charts
  const zoneOccupancyData = useMemo(() => {
    if (!parkingState || !zones) return [];

    return parkingState.map((zone) => {
      const zoneInfo = zones.find((z) => z.id === zone.id);
      return {
        name: zone.name,
        occupied: zone.occupied,
        free: zone.free,
        reserved: zone.reserved,
        total: zone.totalSlots,
        occupancyRate:
          zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0,
        category: zoneInfo?.categoryId || "Unknown",
      };
    });
  }, [parkingState, zones]);

  // Category distribution data
  const categoryData = useMemo(() => {
    if (!categories || !zones) return [];

    return categories.map((category) => {
      const categoryZones = zones.filter(
        (zone) => zone.categoryId === category.id
      );
      const totalSlots = categoryZones.reduce(
        (sum, zone) => sum + zone.totalSlots,
        0
      );
      const occupied =
        parkingState
          ?.filter((zone) => categoryZones.some((cz) => cz.id === zone.id))
          .reduce((sum, zone) => sum + zone.occupied, 0) || 0;

      return {
        name: category.name,
        value: totalSlots,
        occupied,
        rate: category.rateNormal,
        color: COLORS[categories.indexOf(category) % COLORS.length],
      };
    });
  }, [categories, zones, parkingState]);

  // Revenue by category (mock data)
  const revenueData = useMemo(() => {
    if (!categories) return [];

    return categories.map((category) => ({
      name: category.name,
      revenue: Math.random() * 1000 + 500, // Mock revenue data
      normalRate: category.rateNormal,
      specialRate: category.rateSpecial,
    }));
  }, [categories]);

  // Time-based occupancy (mock data for demonstration)
  const occupancyTrendData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((hour) => ({
      hour: `${hour}:00`,
      occupancy:
        Math.floor(Math.random() * 40) + 30 + (hour > 8 && hour < 18 ? 20 : 0),
      revenue: Math.floor(Math.random() * 200) + 100,
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
          <p className="text-gray-600">
            Complete parking system analytics and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Slots</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalSlots}
              </p>
              <p className="text-xs text-gray-500">
                {metrics.occupancyRate.toFixed(1)}% occupied
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalUsers}
              </p>
              <p className="text-xs text-gray-500">
                {metrics.activeSubscriptions} subscribers
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-gray-900">
                ${metrics.revenueToday.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Avg: ${metrics.avgTicketValue.toFixed(2)}/ticket
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
                Occupancy Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.occupancyRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                {metrics.totalOccupied} of {metrics.totalSlots} slots
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zone Occupancy Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Zone Occupancy
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#3B82F6" name="Occupied" />
                <Bar dataKey="free" fill="#10B981" name="Free" />
                <Bar dataKey="reserved" fill="#F59E0B" name="Reserved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Category Distribution
            </h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              24h Occupancy Trend
            </h3>
            <LineChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="Occupancy %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue by Category
            </h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone Status Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Zone Status Details
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zoneOccupancyData.map((zone) => (
                <tr key={zone.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {zone.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{zone.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        zone.occupancyRate > 90
                          ? "bg-red-100 text-red-800"
                          : zone.occupancyRate > 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {zone.occupancyRate > 90
                        ? "Full"
                        : zone.occupancyRate > 70
                        ? "Busy"
                        : "Available"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            zone.occupancyRate > 90
                              ? "bg-red-500"
                              : zone.occupancyRate > 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(zone.occupancyRate, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">
                        {zone.occupancyRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {zone.free} / {zone.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $
                    {(() => {
                      const zoneInfo = zones?.find((z) => z.name === zone.name);
                      return zoneInfo?.rateNormal ?? 0;
                    })()}
                    /hr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                System Status
              </h4>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Active Gates
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {gates?.length || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Last Update</h4>
              <p className="text-sm font-bold text-gray-900">
                <ClientTime />
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
