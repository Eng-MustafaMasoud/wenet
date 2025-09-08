"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setCurrentGate,
  setZones,
  setSelectedZone,
  setCheckinType,
  setCurrentTicket,
  clearGateState,
} from "@/store/slices/gateSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { useGates, useZones, useCheckin } from "@/hooks/useApi";
import { Zone } from "@/types/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import MainLayout from "@/components/layout/MainLayout";
import ZoneCard from "@/components/gate/ZoneCard";
import TicketModal from "@/components/gate/TicketModal";
import SubscriptionVerification from "@/components/gate/SubscriptionVerification";
import Button from "@/components/ui/Button";
import { Users, UserCheck, AlertCircle } from "lucide-react";

export default function GatePage() {
  const params = useParams();
  const gateId = params.gateId as string;
  const dispatch = useDispatch();

  const {
    currentGate,
    zones,
    selectedZone,
    checkinType,
    currentTicket,
    subscription,
    subscriptionError,
  } = useSelector((state: RootState) => state.gate);

  const { connectionState } = useWebSocket(gateId);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState("");

  // API hooks
  const { data: gates, isLoading: gatesLoading } = useGates();
  const { data: zonesData, isLoading: zonesLoading } = useZones(gateId);
  const checkinMutation = useCheckin();

  // Initialize gate and zones data
  useEffect(() => {
    if (gates && !currentGate) {
      const gate = gates.find((g) => g.id === gateId);
      if (gate) {
        dispatch(setCurrentGate(gate));
      }
    }
  }, [gates, currentGate, gateId, dispatch]);

  useEffect(() => {
    if (zonesData && !zones) {
      dispatch(setZones(zonesData));
    }
  }, [zonesData, zones, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearGateState());
    };
  }, [dispatch]);

  const handleZoneSelect = (zone: Zone) => {
    dispatch(setSelectedZone(zone));
  };

  const handleCheckinTypeChange = (type: "visitor" | "subscriber") => {
    dispatch(setCheckinType(type));
    dispatch(setSelectedZone(null));
  };

  const handleCheckin = async () => {
    if (!selectedZone) return;

    try {
      const checkinData = {
        gateId,
        zoneId: selectedZone.id,
        type: checkinType,
        ...(checkinType === "subscriber" &&
          subscription && { subscriptionId: subscription.id }),
      };

      const result = await checkinMutation.mutateAsync(checkinData);
      dispatch(setCurrentTicket(result.ticket));
      setShowTicketModal(true);

      dispatch(
        addNotification({
          type: "success",
          message: "Check-in successful!",
        })
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message || "Check-in failed"
          : "Check-in failed";
      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    }
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    dispatch(setCurrentTicket(null));
    dispatch(setSelectedZone(null));
  };

  const handleSubscriptionVerify = async (id: string) => {
    setSubscriptionId(id);
  };

  if (gatesLoading || zonesLoading) {
    return (
      <MainLayout title="Loading..." showConnectionStatus gateId={gateId}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!currentGate || !zones) {
    return (
      <MainLayout title="Gate Not Found" showConnectionStatus gateId={gateId}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gate Not Found
            </h2>
            <p className="text-gray-600">
              The requested gate could not be found.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`${currentGate.name} - Gate ${gateId}`}
      showConnectionStatus
      gateId={gateId}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Check-in Type Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleCheckinTypeChange("visitor")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    checkinType === "visitor"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Visitor Check-in
                </button>
                <button
                  onClick={() => handleCheckinTypeChange("subscriber")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    checkinType === "subscriber"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <UserCheck className="w-4 h-4 inline mr-2" />
                  Subscriber Check-in
                </button>
              </nav>
            </div>
          </div>

          {/* Subscription Verification for Subscriber Check-in */}
          {checkinType === "subscriber" && (
            <div className="mb-8">
              <SubscriptionVerification
                onSubscriptionVerified={handleSubscriptionVerify}
                subscription={subscription}
                error={subscriptionError}
              />
            </div>
          )}

          {/* Zone Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Parking Zone
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZone?.id === zone.id}
                  onSelect={handleZoneSelect}
                  checkinType={checkinType}
                  disabled={checkinType === "subscriber" && !subscription}
                />
              ))}
            </div>
          </div>

          {/* Check-in Button */}
          {selectedZone && (
            <div className="flex justify-center">
              <Button
                onClick={handleCheckin}
                disabled={checkinMutation.isPending}
                loading={checkinMutation.isPending}
                size="lg"
                className="px-8"
              >
                {checkinMutation.isPending
                  ? "Processing..."
                  : `Check-in to ${selectedZone.name}`}
              </Button>
            </div>
          )}

          {/* Connection Status */}
          {connectionState !== "connected" && (
            <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md shadow-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {connectionState === "connecting"
                    ? "Connecting..."
                    : "Connection lost"}
                </span>
              </div>
            </div>
          )}

          {/* Ticket Modal */}
          <TicketModal
            isOpen={showTicketModal}
            onClose={handleCloseTicketModal}
            ticket={currentTicket}
            zone={selectedZone}
            gate={currentGate}
          />
        </div>
      </div>
    </MainLayout>
  );
}
