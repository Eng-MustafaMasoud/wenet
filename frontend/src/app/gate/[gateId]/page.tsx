"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useZones,
  useGates,
  useCheckin,
  useSubscription,
} from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Ticket } from "@/types/api";
import MainLayout from "@/components/layout/MainLayout";
import ClientTime from "@/components/ui/ClientTime";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TicketModal from "@/components/gate/TicketModal";
import {
  Car,
  Users,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { motion } from "framer-motion";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

type TabType = "visitor" | "subscriber";

// All interfaces are imported from types

export default function GatePage() {
  const params = useParams();
  const gateId = params?.gateId as string;

  const [activeTab, setActiveTab] = useState<TabType>("visitor");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGateAnimation, setShowGateAnimation] = useState(false);

  // API hooks
  const { data: gates, error: gatesError } = useGates();
  const {
    data: zones,
    isLoading: zonesLoading,
    error: zonesError,
    refetch: refetchZones,
  } = useZones(gateId);
  const { data: subscription, isLoading: subscriptionLoading } =
    useSubscription(subscriptionId);
  const { mutate: checkin } = useCheckin();
  const { connectionState } = useWebSocket(gateId);

  // Find current gate
  const currentGate = gates?.find((gate) => gate.id === gateId);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    if (gateId && connectionState === "open") {
      console.log(`Subscribed to gate updates for ${gateId}`);
    }
  }, [gateId, connectionState]);

  // Filter zones for this gate
  const gateZones = useMemo(() => {
    if (!zones) return [];
    return zones.filter((zone) => zone.gateIds.includes(gateId));
  }, [zones, gateId]);

  // Check if subscription is valid for selected zone
  const isSubscriptionValid = useMemo(() => {
    if (!subscription || !selectedZone || !gateZones.length) return false;

    const selectedZoneData = gateZones.find((z) => z.id === selectedZone);
    if (!selectedZoneData) return false;

    return (
      subscription.active &&
      subscription.category === selectedZoneData.categoryId &&
      new Date(subscription.expiresAt) > new Date()
    );
  }, [subscription, selectedZone, gateZones]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    setError("");
  };

  const handleVisitorCheckin = () => {
    if (!selectedZone) {
      setError("Please select a zone");
      return;
    }

    const selectedZoneData = gateZones.find((z) => z.id === selectedZone);
    if (!selectedZoneData) {
      setError("Selected zone not found");
      return;
    }

    if (!selectedZoneData.open) {
      setError("Selected zone is currently closed");
      return;
    }

    if (selectedZoneData.availableForVisitors <= 0) {
      setError("No available slots for visitors in this zone");
      return;
    }

    setIsProcessing(true);
    checkin(
      {
        gateId,
        zoneId: selectedZone,
        type: "visitor",
      },
      {
        onSuccess: (data) => {
          setCurrentTicket(data.ticket);
          setShowTicketModal(true);
          setSelectedZone("");
          setError("");
          setIsProcessing(false);
          setShowGateAnimation(true);
          setTimeout(() => setShowGateAnimation(false), 3000);
          refetchZones();
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          setError(apiError?.response?.data?.message || "Check-in failed");
          setIsProcessing(false);
        },
      }
    );
  };

  const handleSubscriberCheckin = () => {
    if (!selectedZone) {
      setError("Please select a zone");
      return;
    }

    if (!subscriptionId.trim()) {
      setError("Please enter subscription ID");
      return;
    }

    if (!isSubscriptionValid) {
      setError("Invalid subscription or not allowed for this zone");
      return;
    }

    setIsProcessing(true);
    checkin(
      {
        gateId,
        zoneId: selectedZone,
        type: "subscriber",
        subscriptionId: subscriptionId.trim(),
      },
      {
        onSuccess: (data) => {
          setCurrentTicket(data.ticket);
          setShowTicketModal(true);
          setSelectedZone("");
          setSubscriptionId("");
          setError("");
          setIsProcessing(false);
          setShowGateAnimation(true);
          setTimeout(() => setShowGateAnimation(false), 3000);
          refetchZones();
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          setError(apiError?.response?.data?.message || "Check-in failed");
          setIsProcessing(false);
        },
      }
    );
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setCurrentTicket(null);
  };

  // Handle errors
  if (gatesError || zonesError) {
    const error = gatesError || zonesError;
    const is404Error = (error as any)?.response?.status === 404;

    if (is404Error) {
      return (
        <MainLayout title={`Gate ${gateId} - ParkFlow`}>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚧 Under Construction
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gate check-in system is currently being developed. This feature
                will be available soon with visitor and subscriber check-in
                capabilities.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Coming Soon:</strong> Real-time zone availability,
                  visitor check-in, subscriber verification, and ticket
                  generation.
                </p>
              </div>
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
      <MainLayout title={`Gate ${gateId} - ParkFlow`}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Gate Data
            </h2>
            <p className="text-gray-600 mb-4">
              {(error as any)?.message || "Failed to load gate information"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (zonesLoading) {
    return (
      <MainLayout title={`Gate ${gateId} - ParkFlow`}>
        <LoadingOverlay
          isLoading={true}
          message="Loading gate data..."
          showProgress={true}
          progress={75}
          className="z-[9999]"
        />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Gate Status Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Zones Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${currentGate?.name || `Gate ${gateId}`} - ParkFlow`}>
      <motion.div
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentGate?.name || `Gate ${gateId}`}
                  </h1>
                  {currentGate?.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentGate.location}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  {/* Connection Status */}
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

                  {/* Current Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <ClientTime />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab("visitor");
                    setSelectedZone("");
                    setSubscriptionId("");
                    setError("");
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "visitor"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>Visitor</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("subscriber");
                    setSelectedZone("");
                    setSubscriptionId("");
                    setError("");
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "subscriber"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Subscriber</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Subscriber Subscription Input */}
          {activeTab === "subscriber" && (
            <div className="mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Subscription Verification
                </h3>
                <div className="max-w-md">
                  <Input
                    label="Subscription ID"
                    placeholder="Enter subscription ID"
                    value={subscriptionId}
                    onChange={(e) => setSubscriptionId(e.target.value)}
                    disabled={isProcessing}
                  />
                  {subscriptionLoading && (
                    <p className="text-sm text-gray-500 mt-2">
                      Verifying subscription...
                    </p>
                  )}
                  {subscription && !subscriptionLoading && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Subscription verified for {subscription.userName}
                          </p>
                          <p className="text-sm text-green-700">
                            Category: {subscription.category} | Expires:{" "}
                            {new Date(
                              subscription.expiresAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Zone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {gateZones.map((zone) => {
              const isSelected = selectedZone === zone.id;
              const isDisabled =
                !zone.open ||
                (activeTab === "visitor" && zone.availableForVisitors <= 0) ||
                (activeTab === "subscriber" &&
                  zone.availableForSubscribers <= 0);

              return (
                <div
                  key={zone.id}
                  onClick={() => !isDisabled && handleZoneSelect(zone.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : isDisabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {zone.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Category: {zone.categoryId}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {zone.open ? (
                        <Unlock className="h-5 w-5 text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-red-500" />
                      )}
                      {(zone as any).specialActive && (
                        <Zap className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  {/* Occupancy Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {zone.occupied}
                      </p>
                      <p className="text-xs text-gray-600">Occupied</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {zone.free}
                      </p>
                      <p className="text-xs text-gray-600">Free</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Available for Visitors:
                      </span>
                      <span
                        className={`font-medium ${
                          zone.availableForVisitors > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {zone.availableForVisitors}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Available for Subscribers:
                      </span>
                      <span
                        className={`font-medium ${
                          zone.availableForSubscribers > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {zone.availableForSubscribers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reserved:</span>
                      <span className="font-medium text-orange-600">
                        {zone.reserved}
                      </span>
                    </div>
                  </div>

                  {/* Rates */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Normal Rate:
                      </span>
                      <span className="font-medium text-gray-900">
                        ${zone.rateNormal}/hr
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Special Rate:
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900">
                          ${zone.rateSpecial}/hr
                        </span>
                        {(zone as any).specialActive && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {selectedZone && (
            <div className="flex justify-center">
              <Button
                onClick={
                  activeTab === "visitor"
                    ? handleVisitorCheckin
                    : handleSubscriberCheckin
                }
                disabled={
                  isProcessing ||
                  (activeTab === "subscriber" && !isSubscriptionValid)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Go - Check In</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Gate Animation */}
          {showGateAnimation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg text-center">
                <div className="animate-bounce mb-4">
                  <Unlock className="h-16 w-16 text-green-500 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Gate Opening
                </h3>
                <p className="text-gray-600">Please proceed through the gate</p>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Modal */}
        {showTicketModal && currentTicket && (
          <TicketModal
            ticket={currentTicket}
            gate={currentGate || null}
            zone={gateZones.find((z) => z.id === currentTicket.zoneId) || null}
            onClose={handleCloseTicketModal}
          />
        )}
      </motion.div>
    </MainLayout>
  );
}
