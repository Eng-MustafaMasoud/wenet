"use client";

import React, { useState } from "react";
import { EnhancedLoadingButton } from "@/components/ui/EnhancedLoadingButton";

interface Ticket {
  id: string;
  checkinAt: string;
  zoneId: string;
  gateId: string;
  type: "visitor" | "subscriber";
  subscriptionId?: string;
  vehiclePlate?: string;
  status?: "active" | "completed";
}

interface CheckoutBreakdown {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: Array<{
    from: string;
    to: string;
    rateMode: string;
    rate: number;
    amount: number;
  }>;
  amount: number;
  zoneState?: any;
}

interface Subscription {
  id: string;
  name?: string;
  userName?: string;
  vehicles?: Array<{
    plate: string;
    model?: string;
    color?: string;
  }>;
  cars?: Array<{
    plate: string;
    brand?: string;
    model?: string;
    color?: string;
  }>;
}

interface CheckoutSummaryProps {
  ticket: Ticket;
  breakdown: CheckoutBreakdown;
  subscription?: Subscription | null;
  onCheckout: (forceConvertToVisitor?: boolean) => void;
  onBack: () => void;
  error: string;
}

export default function CheckoutSummary({
  ticket,
  breakdown,
  subscription,
  onCheckout,
  onBack,
  error,
}: CheckoutSummaryProps) {
  const [showConvertOptions, setShowConvertOptions] = useState(false);

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? "s" : ""}`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleConvertToVisitor = () => {
    onCheckout(true);
  };

  const handleRegularCheckout = () => {
    onCheckout(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Checkout Summary
          </h2>
          <p className="text-gray-600">
            Review the parking charges and complete the checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              Parking Session
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Ticket ID:</span>
                <span className="font-mono text-blue-900">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Type:</span>
                <span className="capitalize bg-blue-100 px-2 py-1 rounded text-blue-900 text-sm">
                  {ticket.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Check-in:</span>
                <span className="text-blue-900">
                  {new Date(ticket.checkinAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Duration:</span>
                <span className="text-blue-900 font-semibold">
                  {formatDuration(breakdown.durationHours)}
                </span>
              </div>
              {ticket.vehiclePlate && (
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Vehicle:</span>
                  <span className="font-mono text-blue-900 bg-white px-2 py-1 rounded border">
                    {ticket.vehiclePlate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Rate Breakdown */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Billing Breakdown
            </h3>
            <div className="space-y-3">
              {breakdown.breakdown.map((segment, index) => (
                <div
                  key={index}
                  className="bg-white border border-green-300 rounded-lg p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-700 font-medium capitalize">
                      {segment.rateMode} Rate
                    </span>
                    <span className="text-green-900 font-semibold">
                      {formatCurrency(segment.amount)}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 flex justify-between">
                    <span>
                      {segment.from} - {segment.to}
                    </span>
                    <span>@ {formatCurrency(segment.rate)}/hour</span>
                  </div>
                </div>
              ))}

              <div className="border-t border-green-300 pt-3 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-green-900">Total Amount:</span>
                  <span className="text-green-900 text-2xl">
                    {formatCurrency(breakdown.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info (if applicable) */}
        {subscription && (
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3"
                />
              </svg>
              Subscription Details
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-900 font-medium">
                  {subscription.name || subscription.userName || "Subscription"}
                </p>
                <p className="text-purple-700 text-sm">ID: {subscription.id}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-900 font-medium">Verified</p>
                <p className="text-purple-700 text-sm">Vehicle plate matches</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Convert to Visitor Section (if subscription with mismatch) */}
        {ticket.type === "subscriber" && !showConvertOptions && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-medium text-yellow-900 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Vehicle Verification Options
            </h4>
            <p className="text-yellow-800 mb-4">
              If the vehicle license plate doesn't match the subscription
              records, you can convert this checkout to visitor rates.
            </p>
            <button
              onClick={() => setShowConvertOptions(true)}
              className="text-yellow-900 font-medium hover:underline"
            >
              → Need to convert to visitor rates?
            </button>
          </div>
        )}

        {/* Convert Options */}
        {showConvertOptions && (
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h4 className="text-lg font-medium text-orange-900 mb-4">
              Convert to Visitor Checkout
            </h4>
            <p className="text-orange-800 mb-4">
              This will charge visitor rates instead of subscription rates. The
              amount shown above will be recalculated based on visitor pricing.
            </p>
            <div className="flex space-x-4">
              <EnhancedLoadingButton
                variant="warning"
                onClick={handleConvertToVisitor}
                loadingMessage="Converting to visitor..."
                successMessage="Converted successfully!"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                }
              >
                Convert to Visitor & Checkout
              </EnhancedLoadingButton>
              <button
                onClick={() => setShowConvertOptions(false)}
                className="px-4 py-2 text-orange-700 hover:text-orange-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <EnhancedLoadingButton
            variant="secondary"
            size="lg"
            onClick={onBack}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            Back
          </EnhancedLoadingButton>

          {!showConvertOptions && (
            <EnhancedLoadingButton
              variant="success"
              size="lg"
              onClick={handleRegularCheckout}
              loadingMessage="Processing checkout..."
              successMessage="Checkout completed!"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
            >
              Complete Checkout - {formatCurrency(breakdown.amount)}
            </EnhancedLoadingButton>
          )}
        </div>
      </div>
    </div>
  );
}
