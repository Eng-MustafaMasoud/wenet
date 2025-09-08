"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import MainLayout from "@/components/layout/MainLayout";
import { useCheckout, useTicket } from "@/hooks/useApi";
import { Ticket, CheckoutResponse, BreakdownItem } from "@/types/api";
import { Formik, Form } from "formik";
import { checkoutSchema } from "@/utils/validation";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import {
  Search,
  CreditCard,
  Car,
  CheckCircle,
  AlertCircle,
  Receipt,
} from "lucide-react";

export default function CheckpointPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState<Ticket | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(
    null
  );

  const checkoutMutation = useCheckout();
  const { data: ticket, refetch: refetchTicket } = useTicket(ticketId);

  const handleSearchTicket = async (values: { ticketId: string }) => {
    setTicketId(values.ticketId);
    setTicketData(null);
    setCheckoutResult(null);

    if (values.ticketId) {
      try {
        const result = await refetchTicket();
        if (result.data) {
          setTicketData(result.data);
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
      }
    }
  };

  const handleCheckout = async (values: {
    ticketId: string;
    forceConvertToVisitor?: boolean;
  }) => {
    try {
      const result = await checkoutMutation.mutateAsync({
        ticketId: values.ticketId,
        forceConvertToVisitor: values.forceConvertToVisitor || false,
      });
      setCheckoutResult(result);
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <MainLayout title="Checkpoint - Checkout">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Checkout Station
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome, {user?.username}! Process vehicle checkouts here.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Ticket */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <Search className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Ticket
                </h2>
              </div>

              <Formik
                initialValues={{ ticketId: "" }}
                validationSchema={checkoutSchema}
                onSubmit={handleSearchTicket}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <FormField
                      name="ticketId"
                      label="Ticket ID"
                      type="text"
                      required
                      placeholder="Enter ticket ID or scan barcode"
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Searching..." : "Search Ticket"}
                    </Button>
                  </Form>
                )}
              </Formik>

              {/* Ticket Details */}
              {ticketLoading && (
                <div className="mt-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {ticketData && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Ticket Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket ID:</span>
                      <span className="font-medium">{ticketData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {ticketData.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Time:</span>
                      <span className="font-medium">
                        {formatTime(ticketData.checkinAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-medium">{ticketData.zoneId}</span>
                    </div>
                    {ticketData.subscriptionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subscription:</span>
                        <span className="font-medium">
                          {ticketData.subscriptionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Process */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Process Checkout
                </h2>
              </div>

              {ticketData ? (
                <Formik
                  initialValues={{
                    ticketId: ticketData.id,
                    forceConvertToVisitor: false,
                  }}
                  onSubmit={handleCheckout}
                >
                  {({
                    isSubmitting,
                    values,
                    setFieldValue,
                  }: {
                    isSubmitting: boolean;
                    values: {
                      ticketId: string;
                      forceConvertToVisitor?: boolean;
                    };
                    setFieldValue: (field: string, value: boolean) => void;
                  }) => (
                    <Form className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Ticket Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Processing checkout for ticket{" "}
                          <span className="font-mono font-medium">
                            {ticketData.id}
                          </span>
                        </p>
                      </div>

                      {ticketData.type === "subscriber" && (
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800">
                                Subscriber Ticket
                              </h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                This is a subscriber ticket. If there&apos;s a
                                mismatch, you can convert it to visitor pricing.
                              </p>
                              <label className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  checked={values.forceConvertToVisitor}
                                  onChange={(e) =>
                                    setFieldValue(
                                      "forceConvertToVisitor",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Convert to visitor pricing
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Process Checkout"}
                      </Button>
                    </Form>
                  )}
                </Formik>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Search for a ticket to begin checkout
                  </p>
                </div>
              )}

              {/* Checkout Result */}
              {checkoutResult && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-green-900">
                      Checkout Complete
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="text-sm text-gray-600">
                        Total Amount:
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${checkoutResult.amount}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formatDuration(checkoutResult.durationHours)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">
                        {formatTime(checkoutResult.checkinAt)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">
                        {formatTime(checkoutResult.checkoutAt)}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  {checkoutResult.breakdown &&
                    checkoutResult.breakdown.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Rate Breakdown
                        </h4>
                        <div className="space-y-2">
                          {checkoutResult.breakdown.map(
                            (item: BreakdownItem, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs bg-white p-2 rounded border"
                              >
                                <div>
                                  <span className="font-medium">
                                    {item.rateMode} rate
                                  </span>
                                  <br />
                                  <span className="text-gray-500">
                                    {formatTime(item.from)} -{" "}
                                    {formatTime(item.to)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">
                                    ${item.amount}
                                  </span>
                                  <br />
                                  <span className="text-gray-500">
                                    {formatDuration(item.hours)} @ ${item.rate}
                                    /hr
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      setTicketData(null);
                      setCheckoutResult(null);
                      setTicketId("");
                    }}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Process Another Ticket
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
