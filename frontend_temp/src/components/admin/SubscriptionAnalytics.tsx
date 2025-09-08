"use client";

import { useState, useMemo } from "react";
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
  useSubscriptions,
  useAdminCategories,
  useAdminZones,
  useUsers,
} from "@/hooks/useApi";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function SubscriptionAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading =
    subscriptionsLoading || categoriesLoading || zonesLoading || usersLoading;

  // Subscription metrics
  const subscriptionMetrics = useMemo(() => {
    if (!subscriptions || !categories) {
      return {
        total: 0,
        active: 0,
        expired: 0,
        expiringSoon: 0,
        renewalRate: 0,
        avgDuration: 0,
      };
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const total = subscriptions.length;
    const active = subscriptions.filter((sub) => sub.active).length;
    const expired = subscriptions.filter(
      (sub) => new Date(sub.expiresAt) < now
    ).length;
    const expiringSoon = subscriptions.filter((sub) => {
      const expiry = new Date(sub.expiresAt);
      return expiry > now && expiry <= thirtyDaysFromNow;
    }).length;

    // Calculate average duration in days
    const avgDuration =
      subscriptions.reduce((sum, sub) => {
        const start = new Date(sub.startsAt);
        const end = new Date(sub.expiresAt);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / total;

    return {
      total,
      active,
      expired,
      expiringSoon,
      renewalRate: total > 0 ? (active / total) * 100 : 0,
      avgDuration: Math.round(avgDuration),
    };
  }, [subscriptions]);

  // Subscription distribution by category
  const categoryDistribution = useMemo(() => {
    if (!subscriptions || !categories) return [];

    return categories.map((category) => {
      const categorySubscriptions = subscriptions.filter(
        (sub) => sub.category === category.id
      );
      const activeSubscriptions = categorySubscriptions.filter(
        (sub) => sub.active
      );

      return {
        name: category.name,
        total: categorySubscriptions.length,
        active: activeSubscriptions.length,
        expired: categorySubscriptions.length - activeSubscriptions.length,
        color: COLORS[categories.indexOf(category) % COLORS.length],
      };
    });
  }, [subscriptions, categories]);

  // Monthly subscription trends (mock data)
  const monthlyTrends = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        newSubscriptions: Math.floor(Math.random() * 20) + 5,
        renewals: Math.floor(Math.random() * 15) + 3,
        cancellations: Math.floor(Math.random() * 8) + 1,
        active: Math.floor(Math.random() * 50) + 20,
      };
    });
    return months;
  }, []);

  // Subscription status breakdown
  const statusData = useMemo(() => {
    if (!subscriptions) return [];

    const statusCounts = subscriptions.reduce(
      (acc, sub) => {
        const now = new Date();
        const expiry = new Date(sub.expiresAt);
        const thirtyDaysFromNow = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        if (!sub.active) {
          acc.expired++;
        } else if (expiry <= thirtyDaysFromNow) {
          acc.expiringSoon++;
        } else {
          acc.active++;
        }

        return acc;
      },
      { active: 0, expiringSoon: 0, expired: 0 }
    );

    return [
      { name: "Active", value: statusCounts.active, color: "#10B981" },
      {
        name: "Expiring Soon",
        value: statusCounts.expiringSoon,
        color: "#F59E0B",
      },
      { name: "Expired", value: statusCounts.expired, color: "#EF4444" },
    ];
  }, [subscriptions]);

  // Revenue from subscriptions (mock calculation)
  const subscriptionRevenue = useMemo(() => {
    if (!subscriptions || !categories) return 0;

    return subscriptions
      .filter((sub) => sub.active)
      .reduce((total, sub) => {
        const category = categories.find((cat) => cat.id === sub.category);
        if (!category) return total;

        // Mock monthly revenue calculation
        const monthlyRate = category.rateNormal * 24 * 30; // Assuming 24/7 usage
        return total + monthlyRate;
      }, 0);
  }, [subscriptions, categories]);

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
            Subscription Analytics
          </h2>
          <p className="text-gray-600">
            Subscription management and user insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Subscription Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Subscriptions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptionMetrics.total}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Subscriptions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptionMetrics.active}
              </p>
              <p className="text-xs text-gray-500">
                {subscriptionMetrics.renewalRate.toFixed(1)}% renewal rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptionMetrics.expiringSoon}
              </p>
              <p className="text-xs text-gray-500">Next 30 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${subscriptionRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">From subscriptions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Status
            </h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscriptions by Category
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#10B981" name="Active" />
                <Bar dataKey="expired" fill="#EF4444" name="Expired" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Subscription Trends
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newSubscriptions"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  name="New"
                />
                <Area
                  type="monotone"
                  dataKey="renewals"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  name="Renewals"
                />
                <Area
                  type="monotone"
                  dataKey="cancellations"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  name="Cancellations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Subscriptions Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Subscriptions Over Time
            </h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  name="Active Subscriptions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subscription Details Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Subscriptions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cars
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-ins
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions?.slice(0, 10).map((subscription) => {
                const category = categories?.find(
                  (cat) => cat.id === subscription.category
                );
                const isExpired = new Date(subscription.expiresAt) < new Date();
                const isExpiringSoon =
                  new Date(subscription.expiresAt) <=
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !subscription.active || isExpired
                            ? "bg-red-100 text-red-800"
                            : isExpiringSoon
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {!subscription.active || isExpired
                          ? "Expired"
                          : isExpiringSoon
                          ? "Expiring Soon"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subscription.startsAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subscription.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.cars.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.currentCheckins.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Average Duration
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {subscriptionMetrics.avgDuration} days
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Renewal Rate
              </h4>
              <p className="text-2xl font-bold text-green-600">
                {subscriptionMetrics.renewalRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Users</h4>
              <p className="text-2xl font-bold text-purple-600">
                {users?.length || 0}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
