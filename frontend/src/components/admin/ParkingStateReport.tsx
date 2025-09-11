"use client";

import { useParkingState } from "@/hooks/useApi";
import { formatCurrency } from "@/utils/helpers";
import { Car, Users, Lock, Unlock, AlertCircle } from "lucide-react";

export default function ParkingStateReport() {
  const { data: report, isLoading, error } = useParkingState();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Error loading report
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {(error as any)?.response?.data?.message ||
              "Failed to load parking state"}
          </p>
        </div>
      </div>
    );
  }

  if (!report || report.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No parking data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Parking State Report
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {report.map((zone, index) => (
          <div
            key={`${(zone as any)?.id ?? "zone"}-${index}`}
            className="bg-white rounded-lg shadow p-6"
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
              <div className="flex items-center space-x-1">
                {zone.open ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    zone.open ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {zone.open ? "Open" : "Closed"}
                </span>
              </div>
            </div>

            {/* Occupancy Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {zone.occupied}
                </div>
                <div className="text-xs text-gray-500">Occupied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {zone.free}
                </div>
                <div className="text-xs text-gray-500">Free</div>
              </div>
            </div>

            {/* Availability Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available for Visitors:</span>
                <span
                  className={`font-semibold ${
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
                  className={`font-semibold ${
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
                <span className="font-semibold text-orange-600">
                  {zone.reserved}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subscriber Count:</span>
                <span className="font-semibold text-blue-600">
                  {(zone as any).subscriberCount || 0}
                </span>
              </div>
            </div>

            {/* Rate Information */}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rates:</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCurrency(zone.rateNormal)}/hr
                  </div>
                  {zone.rateSpecial !== zone.rateNormal && (
                    <div className="text-xs text-gray-500">
                      Special: {formatCurrency(zone.rateSpecial)}/hr
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Occupancy Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Occupancy</span>
                <span>
                  {Math.round((zone.occupied / zone.totalSlots) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    zone.occupied / zone.totalSlots > 0.9
                      ? "bg-red-500"
                      : zone.occupied / zone.totalSlots > 0.7
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (zone.occupied / zone.totalSlots) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {report.reduce((sum, zone) => sum + zone.occupied, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {report.reduce((sum, zone) => sum + zone.free, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Free</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {report.reduce((sum, zone) => sum + zone.reserved, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Reserved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {report.reduce(
                (sum, zone) => sum + (zone as any).subscriberCount || 0,
                0
              )}
            </div>
            <div className="text-sm text-gray-500">Total Subscribers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
