"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { CardSkeleton, TableSkeleton } from "@/components/ui/SkeletonLoader";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useAdminGates,
  useTickets,
  useSubscriptions,
  useUsers,
  useRushHours,
  useVacations,
} from "@/hooks/useApi";
import DashboardOverview from "@/components/admin/DashboardOverview";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import SubscriptionAnalytics from "@/components/admin/SubscriptionAnalytics";
import RealtimeMonitoring from "@/components/admin/RealtimeMonitoring";
import ZoneControl from "@/components/admin/ZoneControl";
import CategoryManagement from "@/components/admin/CategoryManagement";
import GateManagement from "@/components/admin/GateManagement";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import ParkingStateReport from "@/components/admin/ParkingStateReport";
import {
  Home,
  DollarSign,
  Users,
  Activity,
  MapPin,
  Tag,
  Car,
  Shield,
  BarChart,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { classNames } from "@/utils/helpers";

function AdminDashboardContent() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (
      tab &&
      [
        "overview",
        "revenue",
        "subscriptions",
        "monitoring",
        "zones",
        "categories",
        "gates",
        "employees",
        "parking-state",
        "rush-hours",
        "vacations",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  // API hooks for data
  const { isLoading: parkingLoading } = useParkingState();
  const { isLoading: zonesLoading } = useAdminZones();
  const { isLoading: categoriesLoading } = useAdminCategories();
  const { isLoading: gatesLoading } = useAdminGates();
  const { isLoading: ticketsLoading } = useTickets();
  const { isLoading: subscriptionsLoading } = useSubscriptions();
  const { isLoading: usersLoading } = useUsers();
  const { data: rushHours, isLoading: rushHoursLoading } = useRushHours();
  const { data: vacations, isLoading: vacationsLoading } = useVacations();

  const isDataLoading =
    parkingLoading ||
    zonesLoading ||
    categoriesLoading ||
    gatesLoading ||
    ticketsLoading ||
    subscriptionsLoading ||
    usersLoading ||
    rushHoursLoading ||
    vacationsLoading;

  // Navigation tabs
  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: Home,
      description: "System overview and key metrics",
    },
    {
      id: "revenue",
      name: "Revenue",
      icon: DollarSign,
      description: "Revenue analytics and reports",
    },
    {
      id: "subscriptions",
      name: "Subscriptions",
      icon: Users,
      description: "Manage user subscriptions",
    },
    {
      id: "monitoring",
      name: "Monitoring",
      icon: Activity,
      description: "Real-time system monitoring",
    },
    {
      id: "zones",
      name: "Zones",
      icon: MapPin,
      description: "Manage parking zones",
    },
    {
      id: "categories",
      name: "Categories",
      icon: Tag,
      description: "Manage zone categories",
    },
    {
      id: "gates",
      name: "Gates",
      icon: Car,
      description: "Manage parking gates",
    },
    {
      id: "employees",
      name: "Employees",
      icon: Shield,
      description: "Manage employees and users",
    },
    {
      id: "parking-state",
      name: "Parking State",
      icon: BarChart,
      description: "Current parking state report",
    },
    {
      id: "rush-hours",
      name: "Rush Hours",
      icon: Clock,
      description: "Manage rush hour pricing",
    },
    {
      id: "vacations",
      name: "Vacations",
      icon: TrendingUp,
      description: "Manage vacation periods",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview />;
      case "revenue":
        return <RevenueAnalytics />;
      case "subscriptions":
        return <SubscriptionAnalytics />;
      case "monitoring":
        return <RealtimeMonitoring />;
      case "zones":
        return <ZoneControl />;
      case "categories":
        return <CategoryManagement />;
      case "gates":
        return <GateManagement />;
      case "employees":
        return <EmployeeManagement />;
      case "parking-state":
        return <ParkingStateReport />;
      case "rush-hours":
        return <RushHoursManagement />;
      case "vacations":
        return <VacationsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  // Rush Hours Management Component
  function RushHoursManagement() {
    if (rushHoursLoading) {
      return <TableSkeleton />;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Rush Hours</h3>
            <p className="text-sm text-gray-500">
              Manage rush hour periods and pricing
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Rush Hour
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900">
              Current Rush Hours
            </h4>
          </div>
          <div className="">
            {rushHours && rushHours.length > 0 ? (
              <div className="space-y-4">
                {rushHours.map((rushHour: any) => (
                  <div
                    key={rushHour.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {rushHour.weekDay === 0
                          ? "Sunday"
                          : rushHour.weekDay === 1
                          ? "Monday"
                          : rushHour.weekDay === 2
                          ? "Tuesday"
                          : rushHour.weekDay === 3
                          ? "Wednesday"
                          : rushHour.weekDay === 4
                          ? "Thursday"
                          : rushHour.weekDay === 5
                          ? "Friday"
                          : "Saturday"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rushHour.from} - {rushHour.to}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Rush Hours
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by adding your first rush hour period
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rush Hour
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vacations Management Component
  function VacationsManagement() {
    if (vacationsLoading) {
      return <TableSkeleton />;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Vacations</h3>
            <p className="text-sm text-gray-500">
              Manage vacation periods and special pricing
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Vacation
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900">
              Current Vacations
            </h4>
          </div>
          <div className="p-6">
            {vacations && vacations.length > 0 ? (
              <div className="space-y-4">
                {vacations.map((vacation: any) => (
                  <div
                    key={vacation.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {vacation.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(vacation.from).toLocaleDateString()} -{" "}
                        {new Date(vacation.to).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Vacations
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by adding your first vacation period
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vacation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <MainLayout title="Admin - ParkFlow">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You need admin privileges to access this page.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout title="Admin Dashboard - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-600">
                      Welcome back, {user?.username}! Manage your parking
                      system.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Admin Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar Navigation */}
              <div className="w-64 bg-white shadow-sm border-r min-h-screen">
                <nav className="p-4 space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={classNames(
                          "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          activeTab === tab.id
                            ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div>{tab.name}</div>
                          <div className="text-xs text-gray-500">
                            {tab.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                {isDataLoading ? (
                  <div className="space-y-6">
                    <CardSkeleton />
                    <TableSkeleton />
                    <CardSkeleton />
                  </div>
                ) : (
                  <div className="space-y-6">{renderTabContent()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <MainLayout title="Admin - ParkFlow">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </MainLayout>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
