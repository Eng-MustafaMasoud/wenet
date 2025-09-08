"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useAdminGates,
} from "@/hooks/useApi";
import DashboardOverview from "@/components/admin/DashboardOverview";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import SubscriptionAnalytics from "@/components/admin/SubscriptionAnalytics";
import RealtimeMonitoring from "@/components/admin/RealtimeMonitoring";
import ParkingStateReport from "@/components/admin/ParkingStateReport";
import ZoneControl from "@/components/admin/ZoneControl";
import CategoryManagement from "@/components/admin/CategoryManagement";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import {
  BarChart3,
  Users,
  Car,
  Settings,
  DollarSign,
  UserCheck,
  Activity,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { classNames } from "@/utils/helpers";

export default function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "revenue", "subscriptions", "monitoring", "zones", "categories", "gates", "employees", "parking-state"].includes(tab)) {
      setActiveTab(tab);
    } else {
      // Default to overview if no tab specified
      setActiveTab("overview");
    }
  }, [searchParams]);

  const { data: parkingState, isLoading: parkingLoading } = useParkingState();
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();
  const { data: gates, isLoading: gatesLoading } = useAdminGates();

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "revenue", name: "Revenue", icon: DollarSign },
    { id: "subscriptions", name: "Subscriptions", icon: UserCheck },
    { id: "monitoring", name: "Live Monitor", icon: Activity },
    { id: "zones", name: "Zones", icon: Car },
    { id: "categories", name: "Categories", icon: Settings },
    { id: "gates", name: "Gates", icon: Users },
    { id: "employees", name: "Employees", icon: UserCheck },
    { id: "parking-state", name: "Parking State", icon: Activity },
  ];

  if (parkingLoading || zonesLoading || categoriesLoading || gatesLoading) {
    return (
      <MainLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Dashboard">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.username}! Manage your parking system.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={classNames(
                      "flex items-center py-2 px-1 border-b-2 font-medium text-sm",
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {activeTab === "overview" && <DashboardOverview />}
              {activeTab === "revenue" && <RevenueAnalytics />}
              {activeTab === "subscriptions" && <SubscriptionAnalytics />}
              {activeTab === "monitoring" && <RealtimeMonitoring />}
              {activeTab === "zones" && <ZoneControl />}
              {activeTab === "categories" && <CategoryManagement />}
              {activeTab === "gates" && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Gates Management
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Gate management interface coming soon.
                  </p>
                </div>
              )}
              {activeTab === "employees" && <EmployeeManagement />}
              {activeTab === "parking-state" && <ParkingStateReport />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
