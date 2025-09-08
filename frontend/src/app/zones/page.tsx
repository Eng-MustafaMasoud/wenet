'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminZones, useParkingState } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import ClientTime from '@/components/ui/ClientTime';
import {
  MapPin,
  Car,
  Users,
  Clock,
  Activity,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  TrendingUp,
  Wifi,
  WifiOff,
  Star,
  Lock,
  Unlock
} from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  specialActive?: boolean;
}

export default function ZonesPage() {
  const router = useRouter();
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'occupancy' | 'availability'>('name');
  
  // API hooks
  const { data: zones, isLoading: zonesLoading } = useAdminZones();
  const { data: parkingState, isLoading: stateLoading } = useParkingState();
  const { connectionState } = useWebSocket();

  const isLoading = zonesLoading || stateLoading;

  // Combine zones with parking state data
  const enrichedZones = zones?.map(zone => {
    const state = parkingState?.find(state => state.id === zone.id);
    return state ? { ...zone, ...state } : zone;
  }) || [];

  // Sort zones
  const sortedZones = [...enrichedZones].sort((a, b) => {
    switch (sortBy) {
      case 'occupancy':
        return (b.occupied / b.totalSlots) - (a.occupied / a.totalSlots);
      case 'availability':
        return b.availableForVisitors - a.availableForVisitors;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Calculate summary statistics
  const totalSlots = enrichedZones.reduce((sum, zone) => sum + zone.totalSlots, 0);
  const totalOccupied = enrichedZones.reduce((sum, zone) => sum + zone.occupied, 0);
  const totalFree = enrichedZones.reduce((sum, zone) => sum + zone.free, 0);
  const totalReserved = enrichedZones.reduce((sum, zone) => sum + zone.reserved, 0);
  const occupancyRate = totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0;

  const handleZoneClick = (zoneId: string) => {
    router.push(`/zones/${zoneId}`);
  };

  if (isLoading) {
    return (
      <MainLayout title="Zones - ParkFlow">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Zones - ParkFlow">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Parking Zones</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Monitor and manage all parking zones
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Connection Status */}
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm ${
                    connectionState === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {connectionState === 'open' ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                    <span>{connectionState === 'open' ? 'Live' : 'Offline'}</span>
                  </div>

                  {/* Current Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <ClientTime />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOccupied}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFree}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'occupancy' | 'availability')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="name">Name</option>
                    <option value="occupancy">Occupancy</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => router.push('/zones/availability')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Availability
                </Button>
                <Button
                  onClick={() => router.push('/zones/pricing')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Pricing
                </Button>
              </div>
            </div>
          </div>

          {/* Zones Grid */}
          {sortedZones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedZones.map((zone) => {
                const occupancyRate = zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0;
                const currentRate = zone.specialActive ? zone.rateSpecial : zone.rateNormal;
                
                return (
                  <div
                    key={zone.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleZoneClick(zone.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                          <p className="text-sm text-gray-500">Category: {zone.categoryId}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {zone.specialActive && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3" />
                              <span>Special</span>
                            </div>
                          )}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            zone.open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {zone.open ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{zone.open ? 'Open' : 'Closed'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Occupied</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {zone.occupied}/{zone.totalSlots}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Available</p>
                          <p className="text-lg font-semibold text-green-600">
                            {zone.availableForVisitors}
                          </p>
                        </div>
                      </div>

                      {/* Occupancy Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Occupancy</span>
                          <span>{occupancyRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              occupancyRate > 90 ? 'bg-red-500' :
                              occupancyRate > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Rate and Gates */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Rate: </span>
                          <span className={`font-medium ${zone.specialActive ? 'text-orange-600' : 'text-gray-900'}`}>
                            ${currentRate}/hr
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gates: </span>
                          <span className="font-medium text-gray-900">
                            {zone.gateIds?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No zones found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No parking zones are currently configured.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
