"use client";

import { useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useTickets,
  useSubscriptions,
  useAdminGates,
} from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import ClientTime from "@/components/ui/ClientTime";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import {
  CardSkeleton,
  ChartSkeleton,
  MetricCardSkeleton,
} from "@/components/ui/SkeletonLoader";
import { usePerformanceMonitor } from "@/hooks/usePerformance";
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
  ComposedChart,
  Line,
} from "recharts";
import {
  Car,
  Users,
  Settings,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle,
  MapPin,
  Wifi,
  WifiOff,
  ArrowRight,
} from "lucide-react";

// Memoized components for better performance
const MetricCard = memo(function MetricCard({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: any;
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
});

const ZoneChart = memo(function ZoneChart({ data }: { data: any[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="occupied" fill="#EF4444" name="Occupied" />
          <Bar dataKey="free" fill="#10B981" name="Available" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const StatusPieChart = memo(function StatusPieChart({ data }: { data: any[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

function DashboardPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    isLoading: authLoading,
  } = useSelector((state: RootState) => state.auth);
  const { connectionState } = useWebSocket();

  // Performance monitoring
  usePerformanceMonitor("DashboardPage");

  // API hooks for dashboard data
  const { data: parkingState, isLoading: parkingLoading } = useParkingState();
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();
  const { data: gates, isLoading: gatesLoading } = useAdminGates();

  const isDataLoading =
    parkingLoading ||
    zonesLoading ||
    categoriesLoading ||
    ticketsLoading ||
    subscriptionsLoading ||
    gatesLoading;

  // Calculate dashboard metrics
  const dashboardStats = useMemo(() => {
    if (!zones || !parkingState || !tickets || !subscriptions || !gates) {
      return {
        totalSlots: 0,
        totalOccupied: 0,
        totalFree: 0,
        totalReserved: 0,
        occupancyRate: 0,
        activeSubscriptions: 0,
        activeTickets: 0,
        totalGates: 0,
        totalZones: 0,
        totalCategories: 0,
        revenueToday: 0,
        avgOccupancyRate: 0,
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
    const occupancyRate =
      totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.active
    ).length;
    const activeTickets = tickets.filter((ticket) => !ticket.checkoutAt).length;
    const totalGates = gates.length;
    const totalZones = zones.length;
    const totalCategories = categories?.length || 0;

    // Calculate revenue for today (simplified calculation)
    // Ticket entity does not include amount; revenue comes from checkout responses
    // For now, show 0 to avoid type errors and misleading sums
    const revenueToday = 0;

    // Calculate average occupancy rate across zones
    const avgOccupancyRate =
      parkingState.length > 0
        ? parkingState.reduce((sum, zone) => {
            const zoneInfo = zones.find((z) => z.id === zone.id);
            return (
              sum + (zoneInfo ? (zone.occupied / zoneInfo.totalSlots) * 100 : 0)
            );
          }, 0) / parkingState.length
        : 0;

    return {
      totalSlots,
      totalOccupied,
      totalFree,
      totalReserved,
      occupancyRate,
      activeSubscriptions,
      activeTickets,
      totalGates,
      totalZones,
      totalCategories,
      revenueToday,
      avgOccupancyRate,
    };
  }, [zones, parkingState, tickets, subscriptions, gates, categories]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!zones || !parkingState) return [];

    return zones
      .map((zone) => {
        const state = parkingState.find((s) => s.id === zone.id);
        if (!state) return null;

        const occupancyRate =
          zone.totalSlots > 0 ? (state.occupied / zone.totalSlots) * 100 : 0;
        const category = categories?.find((cat) => cat.id === zone.categoryId);

        return {
          name: zone.name,
          occupied: state.occupied,
          free: state.free,
          reserved: state.reserved,
          total: zone.totalSlots,
          occupancyRate: Math.round(occupancyRate),
          category: category?.name || zone.categoryId,
          availableVisitors: state.availableForVisitors,
          availableSubscribers: state.availableForSubscribers,
          rateNormal: zone.rateNormal,
          rateSpecial: zone.rateSpecial,
          open: zone.open,
        };
      })
      .filter(Boolean);
  }, [zones, parkingState, categories]);

  // Zone status distribution
  const zoneStatusData = useMemo(() => {
    if (!parkingState) return [];

    const available = parkingState.filter(
      (z) => z.open && z.availableForVisitors > 0
    ).length;
    const full = parkingState.filter(
      (z) => z.open && z.availableForVisitors === 0
    ).length;
    const closed = parkingState.filter((z) => !z.open).length;

    return [
      { name: "Available", value: available, color: "#10B981" },
      { name: "Full", value: full, color: "#EF4444" },
      { name: "Closed", value: closed, color: "#6B7280" },
    ];
  }, [parkingState]);

  // Recent activity data (simplified)
  const recentActivity = useMemo(() => {
    if (!tickets) return [];

    return tickets
      .filter((ticket) => ticket.checkinAt)
      .sort(
        (a, b) =>
          new Date(b.checkinAt).getTime() - new Date(a.checkinAt).getTime()
      )
      .slice(0, 5)
      .map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        zoneId: ticket.zoneId,
        checkinAt: new Date(ticket.checkinAt).toLocaleString(),
        duration: ticket.checkoutAt
          ? Math.round(
              ((new Date(ticket.checkoutAt).getTime() -
                new Date(ticket.checkinAt).getTime()) /
                (1000 * 60 * 60)) *
                10
            ) / 10
          : null,
      }));
  }, [tickets]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "gates":
        router.push("/gates");
        break;
      case "zones":
        router.push("/zones");
        break;
      case "admin":
        router.push("/admin");
        break;
      case "checkpoint":
        router.push("/checkpoint");
        break;
    }
  };

  // Show loading state while hydrating auth state or loading data
  if (authLoading || isDataLoading) {
    return (
      <MainLayout title="Dashboard - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>

            {/* System Overview Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>

            {/* Zone Performance Skeleton */}
            <ChartSkeleton />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout title="Dashboard - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome to ParkFlow{user ? `, ${user.username}` : ""}!
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Here's what's happening with your parking system today.
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
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <ClientTime />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={Car}
                title="Total Slots"
                value={dashboardStats.totalSlots}
                color="bg-blue-100"
              />
              <MetricCard
                icon={Users}
                title="Occupied"
                value={dashboardStats.totalOccupied}
                color="bg-red-100"
              />
              <MetricCard
                icon={CheckCircle}
                title="Available"
                value={dashboardStats.totalFree}
                color="bg-green-100"
              />
              <MetricCard
                icon={TrendingUp}
                title="Occupancy Rate"
                value={`${dashboardStats.occupancyRate.toFixed(1)}%`}
                color="bg-purple-100"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Zone Occupancy Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Zone Occupancy
                </h3>
                <ZoneChart data={chartData} />
              </div>

              {/* Zone Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Zone Status Distribution
                </h3>
                <StatusPieChart data={zoneStatusData} />
              </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* System Stats */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Gates</span>
                    <span className="font-semibold">
                      {dashboardStats.totalGates}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Zones</span>
                    <span className="font-semibold">
                      {dashboardStats.totalZones}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-semibold">
                      {dashboardStats.totalCategories}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Subscriptions</span>
                    <span className="font-semibold text-green-600">
                      {dashboardStats.activeSubscriptions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Tickets</span>
                    <span className="font-semibold text-blue-600">
                      {dashboardStats.activeTickets}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Today</span>
                    <span className="font-semibold text-green-600">
                      ${dashboardStats.revenueToday.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.type === "subscriber"
                              ? "Subscriber"
                              : "Visitor"}{" "}
                            Check-in
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.zoneId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {activity.checkinAt}
                          </div>
                          {activity.duration && (
                            <div className="text-xs text-gray-400">
                              {activity.duration}h
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleQuickAction("gates")}
                    fullWidth
                    className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    View Gates
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button
                    onClick={() => handleQuickAction("zones")}
                    fullWidth
                    className="bg-green-600 hover:bg-green-700 text-white justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Zones
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                  {isAuthenticated && user?.role === "employee" && (
                    <Button
                      onClick={() => handleQuickAction("checkpoint")}
                      fullWidth
                      className="bg-orange-600 hover:bg-orange-700 text-white justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Checkpoint
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  )}
                  {isAuthenticated && user?.role === "admin" && (
                    <Button
                      onClick={() => handleQuickAction("admin")}
                      fullWidth
                      className="bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Zone Performance Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Zone Performance Overview
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="occupied"
                      fill="#EF4444"
                      name="Occupied"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="free"
                      fill="#10B981"
                      name="Available"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="occupancyRate"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Occupancy %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default memo(DashboardPage);
