"use client";

import React, { useState, useRef } from "react";
import { useAsyncOperation } from "@/hooks/useLoadingApi";
import {
  ticketApi,
  subscriptionApi,
  CheckoutRequest,
  Ticket as ApiTicket,
  Subscription as ApiSubscription,
} from "@/services/api";
import { EnhancedLoadingButton } from "@/components/ui/EnhancedLoadingButton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import TicketLookup from "./TicketLookup";
import CheckoutSummary from "./CheckoutSummary";
import SubscriptionVerification from "./SubscriptionVerification";
import CheckoutConfirmation from "./CheckoutConfirmation";

interface Ticket extends ApiTicket {
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

interface Subscription extends ApiSubscription {
  name?: string;
  vehicles?: Array<{
    plate: string;
    model?: string;
    color?: string;
  }>;
}

type CheckoutStep = "lookup" | "verification" | "summary" | "confirmation";

export default function CheckoutInterface() {
  const { execute } = useAsyncOperation();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("lookup");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [breakdown, setBreakdown] = useState<CheckoutBreakdown | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const ticketInputRef = useRef<HTMLInputElement>(null);

  const handleTicketLookup = async (ticketId: string) => {
    setError("");
    setIsLoading(true);

    try {
      await execute(
        async () => {
          // First, try to get ticket details
          let ticketData: Ticket;
          try {
            ticketData = await ticketApi.getTicket(ticketId);
          } catch (ticketError) {
            // If ticket lookup fails, proceed with checkout anyway
            console.warn("Ticket lookup failed, proceeding with checkout");
            ticketData = { id: ticketId } as Ticket;
          }

          // Get checkout breakdown
          const checkoutData = await ticketApi.checkout({ ticketId });

          setTicket(ticketData);
          setBreakdown(checkoutData);

          // If it's a subscriber ticket with subscription ID, get subscription details
          if (ticketData.type === "subscriber" && ticketData.subscriptionId) {
            try {
              const subscriptionData = await subscriptionApi.getSubscription(
                ticketData.subscriptionId
              );
              setSubscription(subscriptionData);
              setCurrentStep("verification");
            } catch (subError) {
              console.warn("Subscription lookup failed");
              setCurrentStep("summary");
            }
          } else {
            setCurrentStep("summary");
          }

          return checkoutData;
        },
        {
          loadingMessage: "Looking up ticket...",
          onError: (error) => {
            setError(error.message);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      // Error handled by execute
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionVerification = (plateMatches: boolean) => {
    if (plateMatches) {
      setCurrentStep("summary");
    } else {
      // Will need to convert to visitor
      setCurrentStep("summary");
    }
  };

  const handleCheckout = async (forceConvertToVisitor: boolean = false) => {
    if (!ticket) return;

    setError("");

    try {
      await execute(
        async () => {
          const checkoutData: CheckoutRequest = {
            ticketId: ticket.id,
            ...(forceConvertToVisitor && { forceConvertToVisitor: true }),
          };

          const result = await ticketApi.checkout(checkoutData);

          setCheckoutResult(result);
          setCurrentStep("confirmation");

          return result;
        },
        {
          loadingMessage: forceConvertToVisitor
            ? "Converting to visitor and processing checkout..."
            : "Processing checkout...",
          successMessage: "Checkout completed successfully!",
          onError: (error) => {
            setError(error.message);
          },
        }
      );
    } catch (error) {
      // Error handled by execute
    }
  };

  const handleReset = () => {
    setCurrentStep("lookup");
    setTicket(null);
    setBreakdown(null);
    setSubscription(null);
    setCheckoutResult(null);
    setError("");

    // Focus the input for quick next scan
    setTimeout(() => {
      ticketInputRef.current?.focus();
    }, 100);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "lookup":
        return (
          <TicketLookup
            ref={ticketInputRef}
            onLookup={handleTicketLookup}
            isLoading={isLoading}
            error={error}
          />
        );

      case "verification":
        return (
          <SubscriptionVerification
            ticket={ticket!}
            subscription={subscription!}
            onVerification={handleSubscriptionVerification}
            onBack={() => setCurrentStep("lookup")}
          />
        );

      case "summary":
        return (
          <CheckoutSummary
            ticket={ticket!}
            breakdown={breakdown!}
            subscription={subscription}
            onCheckout={handleCheckout}
            onBack={() =>
              setCurrentStep(subscription ? "verification" : "lookup")
            }
            error={error}
          />
        );

      case "confirmation":
        return (
          <CheckoutConfirmation
            ticket={ticket!}
            result={checkoutResult}
            onNewCheckout={handleReset}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Step indicators */}
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                currentStep === "lookup"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="text-sm font-medium">Ticket Lookup</span>
            </div>

            {subscription && (
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentStep === "verification"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span className="text-sm font-medium">Verification</span>
              </div>
            )}

            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                currentStep === "summary"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="text-sm font-medium">Summary</span>
            </div>

            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                currentStep === "confirmation"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>

          {currentStep !== "lookup" && currentStep !== "confirmation" && (
            <EnhancedLoadingButton
              variant="secondary"
              size="sm"
              onClick={handleReset}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            >
              Start Over
            </EnhancedLoadingButton>
          )}
        </div>
      </div>

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
}
