"use client";

import { useState, useMemo } from "react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useTickets,
} from "@/hooks/useApi";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [viewType, setViewType] = useState("revenue");

  const { data: parkingState } = useParkingState();
  const { data: zones } = useAdminZones();
  const { data: categories } = useAdminCategories();
  const { data: tickets } = useTickets();

  // Mock revenue data - in a real app, this would come from actual transaction data
  const revenueData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Mock revenue calculation based on tickets and zones
      const dailyRevenue = tickets?.length
        ? Math.random() * 2000 +
          500 +
          Math.random() * 1000 * (i % 3 === 0 ? 1.5 : 1)
        : 0;

      data.push({
        date: date.toISOString().split("T")[0],
        revenue: dailyRevenue,
        visitors: Math.floor(Math.random() * 50) + 20,
        subscribers: Math.floor(Math.random() * 30) + 10,
        avgTicketValue: dailyRevenue / (Math.floor(Math.random() * 50) + 20),
      });
    }

    return data;
  }, [timeRange, tickets]);

  // Revenue by category
  const categoryRevenueData = useMemo(() => {
    if (!categories || !zones) return [];

    return categories.map((category) => {
      const categoryZones = zones.filter(
        (zone) => zone.categoryId === category.id
      );
      const baseRevenue = Math.random() * 5000 + 1000;

      return {
        name: category.name,
        revenue: baseRevenue,
        normalRate: category.rateNormal,
        specialRate: category.rateSpecial,
        zones: categoryZones.length,
        color: COLORS[categories.indexOf(category) % COLORS.length],
      };
    });
  }, [categories, zones]);

  // Hourly revenue pattern (mock data)
  const hourlyRevenueData = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      revenue:
        Math.floor(Math.random() * 200) +
        50 +
        (hour >= 8 && hour <= 18 ? 100 : 0) +
        (hour >= 12 && hour <= 14 ? 50 : 0),
      visitors: Math.floor(Math.random() * 20) + 5,
      subscribers: Math.floor(Math.random() * 15) + 3,
    }));
  }, []);

  // Revenue trends
  const revenueTrends = useMemo(() => {
    if (revenueData.length < 2) return { trend: 0, percentage: 0 };

    const current = revenueData[revenueData.length - 1].revenue;
    const previous = revenueData[revenueData.length - 2].revenue;
    const percentage = ((current - previous) / previous) * 100;

    return {
      trend: current > previous ? 1 : -1,
      percentage: Math.abs(percentage),
    };
  }, [revenueData]);

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailyRevenue = totalRevenue / revenueData.length;
  const totalTickets = revenueData.reduce(
    (sum, day) => sum + day.visitors + day.subscribers,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Revenue Analytics
          </h2>
          <p className="text-gray-600">
            Financial performance and revenue insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="revenue">Revenue</option>
            <option value="tickets">Tickets</option>
            <option value="rates">Rates</option>
          </select>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRevenue.toFixed(2)}
              </p>
              <div className="flex items-center text-xs">
                {revenueTrends.trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span
                  className={
                    revenueTrends.trend > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {revenueTrends.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Daily Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${avgDailyRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Per day</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              <p className="text-xs text-gray-500">This period</p>
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
                Avg Ticket Value
              </p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {totalTickets > 0
                  ? (totalRevenue / totalTickets).toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-xs text-gray-500">Per ticket</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
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
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, revenue }) =>
                    `${name}: $${revenue.toFixed(0)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Revenue Pattern */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              24h Revenue Pattern
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Volume vs Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ticket Volume vs Revenue
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="visitors"
                  stroke="#10B981"
                  name="Visitors"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="subscribers"
                  stroke="#F59E0B"
                  name="Subscribers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Revenue Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Revenue by Category Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Special Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryRevenueData.map((category) => (
                <tr key={category.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ${category.revenue.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${category.normalRate}/hr
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${category.specialRate}/hr
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {category.zones}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${Math.min(
                              (category.revenue /
                                Math.max(
                                  ...categoryRevenueData.map((c) => c.revenue)
                                )) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">
                        {((category.revenue / totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
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
