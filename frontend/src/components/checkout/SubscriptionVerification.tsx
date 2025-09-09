"use client";

import React from "react";
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

interface SubscriptionVerificationProps {
  ticket: Ticket;
  subscription: Subscription;
  onVerification: (plateMatches: boolean) => void;
  onBack: () => void;
}

export default function SubscriptionVerification({
  ticket,
  subscription,
  onVerification,
  onBack,
}: SubscriptionVerificationProps) {
  const handlePlateMatch = (matches: boolean) => {
    onVerification(matches);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Subscription Vehicle
          </h2>
          <p className="text-gray-600">
            Compare the vehicle's license plate with the registered subscription
            vehicles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket Information */}
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
              Current Ticket
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
              {ticket.vehiclePlate && (
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">
                    Plate (from ticket):
                  </span>
                  <span className="font-mono text-lg font-bold text-blue-900 bg-white px-3 py-1 rounded border-2 border-blue-300">
                    {ticket.vehiclePlate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information */}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3"
                />
              </svg>
              Subscription:{" "}
              {subscription.name || subscription.userName || "Subscription"}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700 font-medium">
                  Subscription ID:
                </span>
                <span className="font-mono text-green-900">
                  {subscription.id}
                </span>
              </div>
              <div>
                <span className="text-green-700 font-medium mb-2 block">
                  Registered Vehicles:
                </span>
                <div className="space-y-2">
                  {(subscription.vehicles || subscription.cars || []).map(
                    (vehicle, index) => (
                      <div
                        key={index}
                        className="bg-white border border-green-300 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-mono text-lg font-bold text-green-900">
                            {vehicle.plate}
                          </div>
                          {(vehicle.model || vehicle.color) && (
                            <div className="text-sm text-green-700">
                              {vehicle.color} {vehicle.model}
                            </div>
                          )}
                        </div>
                        {ticket.vehiclePlate &&
                          ticket.vehiclePlate.toUpperCase() ===
                            vehicle.plate.toUpperCase() && (
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              MATCH
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Instructions */}
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
            Employee Verification Required
          </h4>
          <div className="text-yellow-800 space-y-2">
            <p>
              <strong>Please check:</strong> Look at the customer's vehicle and
              verify that the license plate matches one of the registered
              vehicles shown above.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Compare the physical license plate with the subscription records
              </li>
              <li>If the plate matches exactly, click "Plate Matches"</li>
              <li>
                If the plate doesn't match or is different, click "Plate Doesn't
                Match"
              </li>
              <li>
                When in doubt, ask the customer to show their vehicle
                registration
              </li>
            </ul>
          </div>
        </div>

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

          <EnhancedLoadingButton
            variant="danger"
            size="lg"
            onClick={() => handlePlateMatch(false)}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Plate Doesn't Match
          </EnhancedLoadingButton>

          <EnhancedLoadingButton
            variant="success"
            size="lg"
            onClick={() => handlePlateMatch(true)}
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
            Plate Matches
          </EnhancedLoadingButton>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Ask your supervisor or check the vehicle registration
            documents.
          </p>
        </div>
      </div>
    </div>
  );
}
