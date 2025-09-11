"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useTicket, useCheckout } from "@/hooks/useApi";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ClientTime from "@/components/ui/ClientTime";
import { useTicketPrinter } from "@/components/ui/PrintableTicket";
import {
  Scan,
  Clock,
  AlertCircle,
  CheckCircle,
  Receipt,
  Users,
} from "lucide-react";

interface BreakdownItem {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
}

interface CheckoutResult {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: BreakdownItem[];
  amount: number;
  zoneState?: any;
}

export default function CheckpointPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { printTicket, TicketModal } = useTicketPrinter();

  const [ticketId, setTicketId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
    null
  );
  const [error, setError] = useState("");
  const [showConvertOption, setShowConvertOption] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // API hooks
  const { mutate: checkout } = useCheckout();
  const { data: ticketData, refetch: refetchTicket } = useTicket(ticketId);

  const handleTicketIdSubmit = async () => {
    if (!ticketId.trim()) {
      setError("Please enter a ticket ID");
      return;
    }

    setIsProcessing(true);
    setError("");
    setCheckoutResult(null);
    setShowConvertOption(false);
    setSubscriptionData(null);

    try {
      // First, let's fetch the ticket to see if it's a subscriber ticket
      await refetchTicket();

      // Process the checkout
      checkout(
        { ticketId: ticketId.trim(), forceConvertToVisitor: false },
        {
          onSuccess: (data) => {
            setCheckoutResult(data);
            setIsProcessing(false);

            // If this is a subscriber ticket, fetch subscription details for plate comparison
            if (ticketData?.subscriptionId) {
              // Note: This would need to be implemented in the API hooks
              console.log(
                "Subscriber ticket detected, fetching subscription details..."
              );
            }
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || "Checkout failed";
            setError(errorMessage);
            setIsProcessing(false);

            // If error suggests subscription/plate mismatch, show convert option
            if (
              errorMessage.includes("plate") ||
              errorMessage.includes("subscription")
            ) {
              setShowConvertOption(true);
            }
          },
        }
      );
    } catch {
      setError("Failed to process ticket");
      setIsProcessing(false);
    }
  };

  const handleConvertToVisitor = () => {
    if (!ticketId.trim()) return;

    setIsProcessing(true);
    setError("");

    checkout(
      { ticketId: ticketId.trim(), forceConvertToVisitor: true },
      {
        onSuccess: (data) => {
          setCheckoutResult(data);
          setShowConvertOption(false);
          setIsProcessing(false);
        },
        onError: (error: any) => {
          setError(
            error.response?.data?.message || "Convert to visitor failed"
          );
          setIsProcessing(false);
        },
      }
    );
  };

  const handleNewTicket = () => {
    setTicketId("");
    setCheckoutResult(null);
    setError("");
    setShowConvertOption(false);
    setSubscriptionData(null);
  };

  const handlePrint = () => {
    if (checkoutResult) {
      // Get vehicle information from subscription data if available
      let vehiclePlate = "N/A";
      let vehicleType = "Visitor";
      
      if (subscriptionData && subscriptionData.cars && subscriptionData.cars.length > 0) {
        vehiclePlate = subscriptionData.cars[0].plate || "N/A";
        vehicleType = "Subscriber";
      }
      
      // Convert checkout result to ticket data format
      const printableTicketData = {
        id: checkoutResult.ticketId,
        type: "exit" as const,
        vehiclePlate: vehiclePlate,
        vehicleType: vehicleType,
        zone: `Zone ${ticketData?.zoneId || "N/A"}`,
        entryTime: checkoutResult.checkinAt,
        exitTime: checkoutResult.checkoutAt,
        duration: `${checkoutResult.durationHours.toFixed(2)} hours`,
        amount: checkoutResult.amount,
        paymentMethod: "Cash",
        gateName: `Gate ${ticketData?.gateId || "N/A"}`,
        attendant: user?.username || "N/A",
        barcode: checkoutResult.ticketId,
      };
      
      printTicket(printableTicketData);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (hours: number) => {
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  if (typeof window === "undefined") {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute requiredRole="employee">
      <MainLayout title="Checkpoint - ParkFlow">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white shadow-sm border-b mb-6">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Checkout Station
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Employee: {user?.username}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <ClientTime />
                  </div>
                </div>
              </div>
            </div>

            {!checkoutResult ? (
              // Ticket Input Section
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Scan className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Scan or Enter Ticket ID
                  </h2>
                </div>

                <div className="max-w-md">
                  <Input
                    label="Ticket ID"
                    placeholder="Enter or paste ticket ID"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    disabled={isProcessing}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleTicketIdSubmit();
                      }
                    }}
                  />

                  <Button
                    onClick={handleTicketIdSubmit}
                    disabled={!ticketId.trim() || isProcessing}
                    className="mt-4 w-full"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Receipt className="h-5 w-5" />
                        <span>Process Checkout</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>

                    {/* Convert to Visitor Option */}
                    {showConvertOption && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">
                          Subscription/Plate Mismatch Detected
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          The vehicle plate may not match the subscription.
                          Convert to visitor rate?
                        </p>
                        <Button
                          onClick={handleConvertToVisitor}
                          disabled={isProcessing}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Convert to Visitor Rate
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Subscription Details (if applicable) */}
                {subscriptionData && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-blue-800">
                        Subscription Details
                      </h4>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p>
                        <span className="font-medium">Subscriber:</span>{" "}
                        {subscriptionData.userName}
                      </p>
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {subscriptionData.category}
                      </p>
                      {subscriptionData.cars &&
                        subscriptionData.cars.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Registered Vehicles:</p>
                            {subscriptionData.cars.map(
                              (car: any, index: number) => (
                                <p key={index} className="ml-2">
                                  {car.plate} - {car.brand} {car.model} (
                                  {car.color})
                                </p>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Checkout Result Section
              <div className="space-y-6">
                {/* Success Header */}
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Checkout Successful
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Ticket {checkoutResult.ticketId} has been processed
                        successfully.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Details */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Checkout Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Ticket Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Ticket ID:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {checkoutResult.ticketId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Check-in:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(checkoutResult.checkinAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Check-out:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(checkoutResult.checkoutAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Duration:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDuration(checkoutResult.durationHours)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Payment Summary
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-medium text-gray-900">
                            Total Amount:
                          </span>
                          <span className="font-bold text-green-600">
                            ${checkoutResult.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rate Breakdown */}
                  {checkoutResult.breakdown &&
                    checkoutResult.breakdown.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          Rate Breakdown
                        </h3>
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Period
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Hours
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rate Mode
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rate
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {checkoutResult.breakdown.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {new Date(item.from).toLocaleTimeString()} -{" "}
                                    {new Date(item.to).toLocaleTimeString()}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.hours.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.rateMode === "special"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {item.rateMode}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    ${item.rate.toFixed(2)}/hr
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    ${item.amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="mt-6 flex space-x-4">
                    <Button
                      onClick={handleNewTicket}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Process Another Ticket
                    </Button>

                    <Button
                      onClick={handlePrint}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Print Receipt
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
      
      {/* Ticket Print Modal */}
      {TicketModal}
    </ProtectedRoute>
  );
}
