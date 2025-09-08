'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useZones, useGates, useCheckin } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import MainLayout from '@/components/layout/MainLayout';
import ZoneCard from '@/components/gate/ZoneCard';
import TicketModal from '@/components/gate/TicketModal';
import SubscriptionVerification from '@/components/gate/SubscriptionVerification';
import ClientTime from '@/components/ui/ClientTime';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Car,
  Users,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

type TabType = 'visitor' | 'subscriber';

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

interface Ticket {
  id: string;
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
}

export default function GatePage() {
  const params = useParams();
  const gateId = params?.gateId as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('visitor');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // API hooks
  const { data: gates } = useGates();
  const { data: zones, isLoading: zonesLoading, refetch: refetchZones } = useZones(gateId);
  const { mutate: checkin } = useCheckin();
  const { connectionState } = useWebSocket();

  // Find current gate
  const currentGate = gates?.find(gate => gate.id === gateId);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    if (gateId && connectionState === 'open') {
      // Subscribe to gate updates - this should be handled by useWebSocket hook
      console.log(`Subscribing to gate updates for ${gateId}`);
    }
  }, [gateId, connectionState]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    setError('');
  };

  const handleVisitorCheckin = () => {
    if (!selectedZone) {
      setError('Please select a zone');
      return;
    }

    setIsProcessing(true);
    checkin(
      {
        gateId,
        zoneId: selectedZone,
        type: 'visitor'
      },
      {
        onSuccess: (data) => {
          setCurrentTicket(data.ticket);
          setShowTicketModal(true);
          setSelectedZone('');
          setError('');
          setIsProcessing(false);
          // Refetch zones to get updated availability
          refetchZones();
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { data?: { message?: string } } };
          setError(apiError?.response?.data?.message || 'Check-in failed');
          setIsProcessing(false);
        }
      }
    );
  };

  const handleSubscriberCheckin = () => {
    if (!selectedZone) {
      setError('Please select a zone');
      return;
    }

    if (!subscriptionId.trim()) {
      setError('Please enter a subscription ID');
      return;
    }

    setIsProcessing(true);
    checkin(
      {
        gateId,
        zoneId: selectedZone,
        type: 'subscriber',
        subscriptionId: subscriptionId.trim()
      },
      {
        onSuccess: (data) => {
          setCurrentTicket(data.ticket);
          setShowTicketModal(true);
          setSelectedZone('');
          setSubscriptionId('');
          setError('');
          setIsProcessing(false);
          // Refetch zones to get updated availability
          refetchZones();
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { data?: { message?: string } } };
          setError(apiError?.response?.data?.message || 'Check-in failed');
          setIsProcessing(false);
        }
      }
    );
  };


  if (zonesLoading) {
    return (
      <MainLayout title={`Gate ${gateId} - ParkFlow`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${currentGate?.name || `Gate ${gateId}`} - ParkFlow`}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentGate?.name || `Gate ${gateId}`}
                  </h1>
                  {currentGate?.location && (
                    <p className="text-sm text-gray-600 mt-1">{currentGate.location}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-6">
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
                    <span>{connectionState === 'open' ? 'Connected' : 'Disconnected'}</span>
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

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab('visitor');
                    setSelectedZone('');
                    setSubscriptionId('');
                    setError('');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'visitor'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>Visitor</span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('subscriber');
                    setSelectedZone('');
                    setSubscriptionId('');
                    setError('');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'subscriber'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Subscriber</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Subscriber ID Input (only for subscriber tab) */}
          {activeTab === 'subscriber' && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Verification</h3>
              <div className="max-w-md">
                <Input
                  label="Subscription ID"
                  placeholder="Enter subscription ID"
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              {subscriptionId && (
                <SubscriptionVerification 
                  onVerified={(subscriptionId) => {
                    // Subscription is verified, user can now select zones
                    console.log('Subscription verified:', subscriptionId);
                  }}
                />
              )}
            </div>
          )}

          {/* Zone Cards */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Available Zones ({activeTab === 'visitor' ? 'Visitors' : 'Subscribers'})
            </h3>
            
            {zones && zones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zones.map((zone) => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZone === zone.id}
                    onSelect={(zone) => handleZoneSelect(zone.id)}
                    checkinType={activeTab}
                    disabled={!zone.open || (
                      activeTab === 'visitor' 
                        ? zone.availableForVisitors <= 0 
                        : zone.availableForSubscribers <= 0
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No zones available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no zones available for {activeTab}s at this gate.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {selectedZone && (
            <div className="mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Ready to Check In</h4>
                    <p className="text-sm text-gray-600">
                      Selected zone: {zones?.find(z => z.id === selectedZone)?.name}
                    </p>
                  </div>
                  
                  <Button
                    onClick={activeTab === 'visitor' ? handleVisitorCheckin : handleSubscriberCheckin}
                    disabled={isProcessing || (activeTab === 'subscriber' && !subscriptionId.trim())}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Check In</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Modal */}
          <TicketModal
            isOpen={showTicketModal}
            ticket={currentTicket}
            gate={currentGate || null}
            zone={zones?.find(z => z.id === currentTicket?.zoneId) || null}
            onClose={() => {
              setShowTicketModal(false);
              setCurrentTicket(null);
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}