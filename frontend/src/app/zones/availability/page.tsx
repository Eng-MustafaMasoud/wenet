'use client';

import { useState, useMemo } from 'react';
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
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Wifi,
  WifiOff,
  Filter,
  Eye
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
}

export default function ZonesAvailabilityPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'available' | 'full' | 'closed'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // API hooks
  const { data: zones, isLoading: zonesLoading, refetch } = useAdminZones();
  const { data: parkingState, isLoading: stateLoading } = useParkingState();
  const { connectionState } = useWebSocket();

  const isLoading = zonesLoading || stateLoading;

  // Combine zones with parking state data
  const enrichedZones = useMemo(() => {
    return zones?.map(zone => {
      const state = parkingState?.find(state => state.id === zone.id);
      return state ? { ...zone, ...state } : zone;
    }) || [];
  }, [zones, parkingState]);

  // Filter zones based on availability
  const filteredZones = useMemo(() => {
    return enrichedZones.filter(zone => {
      switch (filter) {
        case 'available':
          return zone.open && zone.availableForVisitors > 0;
        case 'full':
          return zone.open && zone.availableForVisitors === 0;
        case 'closed':
          return !zone.open;
        default:
          return true;
      }
    });
  }, [enrichedZones, filter]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = enrichedZones.length;
    const available = enrichedZones.filter(z => z.open && z.availableForVisitors > 0).length;
    const full = enrichedZones.filter(z => z.open && z.availableForVisitors === 0).length;
    const closed = enrichedZones.filter(z => !z.open).length;
    
    return { total, available, full, closed };
  }, [enrichedZones]);

  const handleRefresh = () => {
    refetch();
  };

  const getAvailabilityStatus = (zone: Zone) => {
    if (!zone.open) return { label: 'Closed', color: 'text-red-600 bg-red-100', icon: AlertCircle };
    if (zone.availableForVisitors === 0) return { label: 'Full', color: 'text-red-600 bg-red-100', icon: AlertCircle };
    if (zone.availableForVisitors <= 5) return { label: 'Limited', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle };
    return { label: 'Available', color: 'text-green-600 bg-green-100', icon: CheckCircle };
  };

  if (isLoading) {
    return (
      <MainLayout title="Zone Availability - ParkFlow">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Zone Availability - ParkFlow">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => router.back()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Zone Availability</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Real-time availability monitoring
                    </p>
                  </div>
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

                  {/* Refresh Button */}
                  <Button
                    onClick={handleRefresh}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>

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
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Zones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Full</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.full}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Activity className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All', count: stats.total },
                    { value: 'available', label: 'Available', count: stats.available },
                    { value: 'full', label: 'Full', count: stats.full },
                    { value: 'closed', label: 'Closed', count: stats.closed }
                  ].map(({ value, label, count }) => (
                    <button
                      key={value}
                      onClick={() => setFilter(value as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === value
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Zones Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Zone Availability Status ({filteredZones.length} zones)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredZones.map((zone) => {
                    const status = getAvailabilityStatus(zone);
                    const occupancyRate = zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0;
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={zone.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.categoryId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {zone.occupied}/{zone.totalSlots}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${
                                    occupancyRate > 90 ? 'bg-red-500' :
                                    occupancyRate > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                />
                              </div>
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {occupancyRate.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Visitors: <span className="font-medium">{zone.availableForVisitors}</span></div>
                            <div>Subscribers: <span className="font-medium">{zone.availableForSubscribers}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {zone.reserved}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => router.push(`/zones/${zone.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
