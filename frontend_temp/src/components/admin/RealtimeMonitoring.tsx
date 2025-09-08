"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useTickets,
  useSubscriptions,
} from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function RealtimeMonitoring() {
  const [timeRange, setTimeRange] = useState("1h");
  const [liveData, setLiveData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const { connectionState } = useWebSocket();
  const { data: parkingState, isLoading: parkingLoading } = useParkingState();
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();

  const isLoading =
    parkingLoading ||
    zonesLoading ||
    categoriesLoading ||
    ticketsLoading ||
    subscriptionsLoading;

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint = {
        timestamp: now.toISOString(),
        time: now.toLocaleTimeString(),
        occupancy: Math.floor(Math.random() * 20) + 40 + Math.random() * 20,
        revenue: Math.floor(Math.random() * 500) + 200,
        checkins: Math.floor(Math.random() * 5) + 1,
        checkouts: Math.floor(Math.random() * 3) + 1,
        activeUsers: Math.floor(Math.random() * 50) + 20,
      };

      setLiveData((prev) => {
        const newData = [...prev, newDataPoint];
        // Keep only last 60 data points (1 hour at 1-minute intervals)
        return newData.slice(-60);
      });

      // Generate random alerts
      if (Math.random() < 0.1) {
        // 10% chance every minute
        const alertTypes = [
          {
            type: "high_occupancy",
            message: "Zone A occupancy above 90%",
            severity: "warning",
          },
          {
            type: "low_revenue",
            message: "Revenue below expected threshold",
            severity: "info",
          },
          {
            type: "system_error",
            message: "Gate 1 connection lost",
            severity: "error",
          },
          {
            type: "maintenance",
            message: "Zone B requires maintenance",
            severity: "info",
          },
        ];

        const randomAlert =
          alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
          id: Date.now(),
          ...randomAlert,
          timestamp: now.toISOString(),
          time: now.toLocaleTimeString(),
        };

        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Calculate real-time metrics
  const realtimeMetrics = useMemo(() => {
    if (!parkingState || !zones || !tickets || !subscriptions) {
      return {
        totalOccupancy: 0,
        totalRevenue: 0,
        activeCheckins: 0,
        systemHealth: "unknown",
        responseTime: 0,
      };
    }

    const totalSlots = zones.reduce((sum, zone) => sum + zone.totalSlots, 0);
    const totalOccupied = parkingState.reduce(
      (sum, zone) => sum + zone.occupied,
      0
    );
    const occupancyRate =
      totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;

    // Mock revenue calculation
    const totalRevenue = tickets.length * 15; // Mock $15 per ticket

    const activeCheckins = tickets.filter(
      (ticket) => !ticket.checkoutAt
    ).length;

    const systemHealth = connectionState === "open" ? "healthy" : "unhealthy";
    const responseTime = Math.floor(Math.random() * 50) + 10; // Mock response time

    return {
      totalOccupancy: occupancyRate,
      totalRevenue,
      activeCheckins,
      systemHealth,
      responseTime,
    };
  }, [parkingState, zones, tickets, subscriptions, connectionState]);

  // Zone status with real-time updates
  const zoneStatus = useMemo(() => {
    if (!parkingState || !zones) return [];

    return parkingState.map((zone) => {
      const zoneInfo = zones.find((z) => z.id === zone.id);
      const occupancyRate =
        zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0;

      return {
        id: zone.id,
        name: zone.name,
        occupied: zone.occupied,
        free: zone.free,
        total: zone.totalSlots,
        occupancyRate,
        status:
          occupancyRate > 90
            ? "critical"
            : occupancyRate > 70
            ? "warning"
            : "normal",
        lastUpdate: new Date().toISOString(),
      };
    });
  }, [parkingState, zones]);

  // Recent activity (mock data)
  const recentActivity = useMemo(() => {
    const activities = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const time = new Date(now.getTime() - i * 60000); // Every minute
      activities.push({
        id: i,
        time: time.toLocaleTimeString(),
        type: Math.random() > 0.5 ? "checkin" : "checkout",
        user: `User ${Math.floor(Math.random() * 100) + 1}`,
        zone: `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
        amount: Math.floor(Math.random() * 50) + 10,
      });
    }

    return activities;
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
          <h2 className="text-2xl font-bold text-gray-900">
            Real-time Monitoring
          </h2>
          <p className="text-gray-600">Live system monitoring and alerts</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
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
              {connectionState === "open" ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p
                className={`text-2xl font-bold ${
                  realtimeMetrics.systemHealth === "healthy"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {realtimeMetrics.systemHealth === "healthy"
                  ? "Healthy"
                  : "Unhealthy"}
              </p>
              <p className="text-xs text-gray-500">
                Response: {realtimeMetrics.responseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Occupancy Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {realtimeMetrics.totalOccupancy.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Live data</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${realtimeMetrics.totalRevenue}
              </p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Check-ins
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {realtimeMetrics.activeCheckins}
              </p>
              <p className="text-xs text-gray-500">Currently parked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Occupancy Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Occupancy Trend
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Occupancy"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Revenue Stream */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Revenue Stream
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value}`, "Revenue"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Status Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Zone Status Overview
            </h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Occupancy"]}
                  labelFormatter={(label) => `Zone: ${label}`}
                />
                <Bar
                  dataKey="occupancyRate"
                  fill={(entry) => {
                    if (entry.occupancyRate > 90) return "#EF4444";
                    if (entry.occupancyRate > 70) return "#F59E0B";
                    return "#10B981";
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              System Activity
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="checkins"
                  stroke="#3B82F6"
                  name="Check-ins"
                />
                <Line
                  type="monotone"
                  dataKey="checkouts"
                  stroke="#EF4444"
                  name="Check-outs"
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#10B981"
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Alerts */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Live Alerts
              </h3>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {alerts.length} active
                </span>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Alerts
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  System running smoothly
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 ${
                          alert.severity === "error"
                            ? "text-red-500"
                            : alert.severity === "warning"
                            ? "text-yellow-500"
                            : "text-blue-500"
                        }`}
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-2 h-2 rounded-full mr-3 ${
                          activity.type === "checkin"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}{" "}
                          {activity.type === "checkin"
                            ? "checked in"
                            : "checked out"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.zone} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${activity.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Status Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Live Zone Status
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zoneStatus.map((zone) => (
                <tr key={zone.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {zone.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        zone.status === "critical"
                          ? "bg-red-100 text-red-800"
                          : zone.status === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {zone.status === "critical"
                        ? "Critical"
                        : zone.status === "warning"
                        ? "Warning"
                        : "Normal"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            zone.status === "critical"
                              ? "bg-red-500"
                              : zone.status === "warning"
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(zone.lastUpdate).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
