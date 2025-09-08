"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useParkingState,
  useAdminZones,
  useAdminCategories,
  useTickets,
  useSubscriptions,
} from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import MainLayout from "@/components/layout/MainLayout";
import DashboardOverview from "@/components/admin/DashboardOverview";
import Button from "@/components/ui/Button";
import {
  Car,
  Users,
  Settings,
  Shield,
  Clock,
  BarChart3,
  Zap,
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MapPin,
  UserCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { connectionState } = useWebSocket();

  // API hooks for dashboard data
  const { data: parkingState, isLoading: parkingLoading } = useParkingState();
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: categories, isLoading: categoriesLoading } =
    useAdminCategories();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();

  const isDataLoading =
    parkingLoading ||
    zonesLoading ||
    categoriesLoading ||
    ticketsLoading ||
    subscriptionsLoading;

  // Show loading state while hydrating auth state
  if (isLoading) {
    return (
      <MainLayout title="Dashboard - ParkFlow">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  const handleGateAccess = (gateId: string) => {
    router.push(`/gate/${gateId}`);
  };

  const handleAdminAccess = () => {
    router.push("/admin");
  };

  const handleCheckpointAccess = () => {
    router.push("/checkpoint");
  };

  // Calculate dashboard metrics
  const totalSlots =
    zones?.reduce((sum, zone) => sum + zone.totalSlots, 0) || 0;
  const totalOccupied =
    parkingState?.reduce((sum, zone) => sum + zone.occupied, 0) || 0;
  const totalFree =
    parkingState?.reduce((sum, zone) => sum + zone.free, 0) || 0;
  const occupancyRate = totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;
  const activeSubscriptions =
    subscriptions?.filter((sub) => sub.active).length || 0;
  const activeTickets =
    tickets?.filter((ticket) => !ticket.checkoutAt).length || 0;

  return (
    <MainLayout title="Dashboard - ParkFlow">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back{user ? `, ${user.username}` : ""}!
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
                    {connectionState === "open" ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Dashboard Overview with Charts */}
          <DashboardOverview />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 mt-8">
            {/* Gate Access */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">
                  Gate Access
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Access parking gates for visitor and subscriber check-ins with
                real-time availability.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => handleGateAccess("gate_1")}
                  fullWidth
                  className="btn btn-primary"
                >
                  <Car className="w-4 h-4 mr-2" />
                  Gate 1 - Main Entrance
                </Button>
                <Button
                  onClick={() => handleGateAccess("gate_2")}
                  fullWidth
                  className="btn btn-outline"
                >
                  <Car className="w-4 h-4 mr-2" />
                  Gate 2 - Secondary Entrance
                </Button>
              </div>
            </div>

            {/* Checkpoint */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">
                  Checkout Station
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Employee checkout station for processing parking tickets with
                real-time calculations.
              </p>
              <Button
                onClick={handleCheckpointAccess}
                fullWidth
                className="btn btn-success"
                disabled={!isAuthenticated || user?.role !== "employee"}
              >
                <Clock className="w-4 h-4 mr-2" />
                Access Checkout
              </Button>
              {(!isAuthenticated || user?.role !== "employee") && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Employee login required
                </p>
              )}
            </div>

            {/* Admin Dashboard */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">
                  Admin Panel
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Advanced administrative controls for zones, categories, and
                system management.
              </p>
              <Button
                onClick={handleAdminAccess}
                fullWidth
                className="btn btn-secondary"
                disabled={!isAuthenticated || user?.role !== "admin"}
              >
                <Shield className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
              {(!isAuthenticated || user?.role !== "admin") && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Admin login required
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
