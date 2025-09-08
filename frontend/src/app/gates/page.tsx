'use client';

import { useRouter } from 'next/navigation';
import { useGates } from '@/hooks/useApi';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import {
  Car,
  MapPin,
  ArrowRight,
  Users,
  Clock,
  Activity
} from 'lucide-react';

export default function GatesPage() {
  const router = useRouter();
  const { data: gates, isLoading } = useGates();

  const handleGateAccess = (gateId: string) => {
    router.push(`/gate/${gateId}`);
  };

  if (isLoading) {
    return (
      <MainLayout title="Gates - ParkFlow">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gates - ParkFlow">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gate Access</h1>
            <p className="text-gray-600 mt-2">
              Select a gate to access the parking zones and manage check-ins
            </p>
          </div>

          {/* Gates Grid */}
          {gates && gates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gates.map((gate) => (
                <div key={gate.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">{gate.name}</h3>
                          <p className="text-sm text-gray-500">ID: {gate.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Activity className="h-3 w-3" />
                        <span>Active</span>
                      </div>
                    </div>

                    {/* Location */}
                    {gate.location && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{gate.location}</span>
                      </div>
                    )}

                    {/* Zone Information */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Connected Zones:</span>
                        <span className="font-medium text-gray-900">
                          {gate.zoneIds ? gate.zoneIds.length : 0} zones
                        </span>
                      </div>
                      
                      {gate.zoneIds && gate.zoneIds.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {gate.zoneIds.slice(0, 3).map((zoneId) => (
                              <span
                                key={zoneId}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {zoneId}
                              </span>
                            ))}
                            {gate.zoneIds.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{gate.zoneIds.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleGateAccess(gate.id)}
                      fullWidth
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <div className="flex items-center justify-center">
                        <Car className="h-4 w-4 mr-2" />
                        <span>Access Gate</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No gates available</h3>
              <p className="mt-1 text-sm text-gray-500">
                No parking gates are currently configured in the system.
              </p>
            </div>
          )}

          {/* Quick Access Section */}
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/gate/gate_1')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              >
                <Car className="h-4 w-4 mr-2" />
                Main Entrance
              </Button>
              
              <Button
                onClick={() => router.push('/gate/gate_2')}
                className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
              >
                <Car className="h-4 w-4 mr-2" />
                Secondary Gate
              </Button>
              
              <Button
                onClick={() => router.push('/checkpoint')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Checkout Station
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
