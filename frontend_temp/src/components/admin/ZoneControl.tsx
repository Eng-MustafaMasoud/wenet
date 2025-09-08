'use client';

import { useState } from 'react';
import { useAdminZones, useUpdateZoneOpen } from '@/hooks/useApi';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/slices/uiSlice';
import Button from '@/components/ui/Button';
import { Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function ZoneControl() {
  const dispatch = useDispatch();
  const { data: zones, isLoading } = useAdminZones();
  const updateZoneOpenMutation = useUpdateZoneOpen();

  const handleToggleZone = async (zoneId: string, currentOpen: boolean) => {
    try {
      await updateZoneOpenMutation.mutateAsync({
        id: zoneId,
        open: !currentOpen,
      });
      
      dispatch(addNotification({
        type: 'success',
        message: `Zone ${!currentOpen ? 'opened' : 'closed'} successfully`,
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to update zone',
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Zone Control</h2>
        <p className="text-sm text-gray-600">
          Open or close parking zones. Closed zones will not accept new check-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones?.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                <p className="text-sm text-gray-600">Category: {zone.categoryId}</p>
              </div>
              <div className="flex items-center space-x-1">
                {zone.open ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-medium ${
                  zone.open ? 'text-green-600' : 'text-red-600'
                }`}>
                  {zone.open ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>

            {/* Zone Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{zone.occupied}</div>
                <div className="text-xs text-gray-500">Occupied</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{zone.free}</div>
                <div className="text-xs text-gray-500">Free</div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-1 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Available for Visitors:</span>
                <span className={`font-semibold ${
                  zone.availableForVisitors > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {zone.availableForVisitors}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available for Subscribers:</span>
                <span className={`font-semibold ${
                  zone.availableForSubscribers > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {zone.availableForSubscribers}
                </span>
              </div>
            </div>

            {/* Rate Info */}
            <div className="border-t pt-3 mb-4">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Normal Rate:</span>
                  <span className="font-semibold">{formatCurrency(zone.rateNormal)}/hr</span>
                </div>
                {zone.rateSpecial !== zone.rateNormal && (
                  <div className="flex justify-between">
                    <span>Special Rate:</span>
                    <span className="font-semibold">{formatCurrency(zone.rateSpecial)}/hr</span>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Button */}
            <Button
              onClick={() => handleToggleZone(zone.id, zone.open)}
              loading={updateZoneOpenMutation.isPending}
              variant={zone.open ? 'danger' : 'success'}
              fullWidth
              className="flex items-center justify-center space-x-2"
            >
              {zone.open ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Close Zone</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Open Zone</span>
                </>
              )}
            </Button>

            {/* Warning for occupied zones */}
            {!zone.open && zone.occupied > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                <strong>Warning:</strong> Zone is closed but has {zone.occupied} occupied spaces.
              </div>
            )}
          </div>
        ))}
      </div>

      {zones?.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No zones found</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no zones configured in the system.
          </p>
        </div>
      )}
    </div>
  );
}
