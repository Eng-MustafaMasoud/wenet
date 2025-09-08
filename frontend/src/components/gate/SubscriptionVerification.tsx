"use client";

import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setSubscription,
  setSubscriptionError,
} from "@/store/slices/gateSlice";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Search, AlertCircle, CheckCircle, Car } from "lucide-react";
import { formatDate } from "@/utils/helpers";

interface SubscriptionVerificationProps {
  onVerified: (subscriptionId: string) => void;
}

export default function SubscriptionVerification({
  onVerified,
}: SubscriptionVerificationProps) {
  const dispatch = useDispatch();
  const { subscriptionId, subscription, subscriptionError } = useSelector(
    (state: RootState) => state.gate
  );

  const [inputValue, setInputValue] = useState(subscriptionId);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useSubscription(subscriptionId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear previous errors when user types
    if (subscriptionError) {
      dispatch(setSubscriptionError(null));
    }
  };

  const handleVerify = async () => {
    if (!inputValue.trim()) {
      dispatch(setSubscriptionError("Please enter a subscription ID"));
      return;
    }

    setIsVerifying(true);

    // The useSubscription hook will handle the API call
    // We'll handle the result in useEffect below
  };

  // Handle subscription data changes
  useEffect(() => {
    if (subscriptionData) {
      if (subscriptionData.active) {
        dispatch(setSubscription(subscriptionData));
        dispatch(setSubscriptionError(null));
        onVerified(subscriptionId);
      } else {
        dispatch(setSubscription(null));
        dispatch(setSubscriptionError("Subscription is not active"));
      }
    } else if (error) {
      dispatch(setSubscription(null));
      dispatch(setSubscriptionError("Subscription not found or invalid"));
    }

    setIsVerifying(false);
  }, [subscriptionData, error, subscriptionId, dispatch, onVerified]);

  const isSubscriptionValid = subscription && subscription.active;
  const hasError = subscriptionError || error;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Verify Subscription
        </h3>
        <p className="text-sm text-gray-600">
          Enter your subscription ID to verify and proceed with check-in.
        </p>
      </div>

      <div className="flex space-x-2">
        <Input
          label="Subscription ID"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter subscription ID"
          error={
            hasError ? subscriptionError || "Subscription not found" : undefined
          }
          className="flex-1"
        />
        <Button
          onClick={handleVerify}
          loading={isLoading || isVerifying}
          disabled={!inputValue.trim() || isLoading || isVerifying}
          className="self-end"
        >
          <Search className="w-4 h-4 mr-2" />
          Verify
        </Button>
      </div>

      {/* Subscription Details */}
      {isSubscriptionValid && subscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800">
                Subscription Verified
              </h4>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Subscriber:</span>
                  <span className="font-medium">{subscription.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{subscription.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-medium">
                    {formatDate(subscription.expiresAt)}
                  </span>
                </div>
              </div>

              {/* Cars */}
              <div className="mt-3">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Registered Cars:
                </p>
                <div className="space-y-1">
                  {subscription.cars.map((car, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm text-green-700"
                    >
                      <Car className="w-4 h-4" />
                      <span className="font-mono">{car.plate}</span>
                      <span className="text-gray-500">-</span>
                      <span>
                        {car.brand} {car.model}
                      </span>
                      <span className="text-gray-500">({car.color})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isSubscriptionValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Verification Failed
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {subscriptionError || "Subscription not found or invalid"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
