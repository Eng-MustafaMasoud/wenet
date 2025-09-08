'use client';

import { useState } from 'react';
import { useCheckout, useTicket, useSubscription } from '@/hooks/useApi';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/slices/uiSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatDateTime, formatDuration, formatCurrency } from '@/utils/helpers';
import { Search, AlertCircle, CheckCircle, Car, Clock, DollarSign } from 'lucide-react';
import { BreakdownItem } from '@/types/api';

interface CheckoutPanelProps {
  onCheckoutComplete: () => void;
}

export default function CheckoutPanel({ onCheckoutComplete }: CheckoutPanelProps) {
  const dispatch = useDispatch();
  const checkoutMutation = useCheckout();
  
  const [ticketId, setTicketId] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [forceConvertToVisitor, setForceConvertToVisitor] = useState(false);
  const [plateMatch, setPlateMatch] = useState<boolean | null>(null);

  const { data: ticketData } = useTicket(ticketId);
  const { data: subscriptionData } = useSubscription(
    ticketData?.subscriptionId || ''
  );

  const handleTicketIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketId(e.target.value);
  };

  const handleLookupTicket = async () => {
    if (!ticketId.trim()) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please enter a ticket ID',
      }));
      return;
    }

    try {
      const response = await checkoutMutation.mutateAsync({
        ticketId: ticketId.trim(),
        forceConvertToVisitor: false,
      });
      
      setCheckoutData(response);
      setShowCheckoutModal(true);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to process checkout',
      }));
    }
  };

  const handleForceCheckout = async () => {
    if (!ticketId.trim()) return;

    try {
      const response = await checkoutMutation.mutateAsync({
        ticketId: ticketId.trim(),
        forceConvertToVisitor: true,
      });
      
      setCheckoutData(response);
      setShowCheckoutModal(true);
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to process checkout',
      }));
    }
  };

  const handleConfirmCheckout = () => {
    setShowCheckoutModal(false);
    setTicketId('');
    setCheckoutData(null);
    setForceConvertToVisitor(false);
    setPlateMatch(null);
    onCheckoutComplete();
    
    dispatch(addNotification({
      type: 'success',
      message: 'Checkout completed successfully!',
    }));
  };

  const isSubscriberTicket = ticketData?.type === 'subscriber';
  const hasSubscriptionData = subscriptionData && subscriptionData.active;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Checkout System
          </h2>
          <p className="text-gray-600">
            Enter ticket ID to process checkout
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Ticket ID"
            value={ticketId}
            onChange={handleTicketIdChange}
            placeholder="Scan or enter ticket ID"
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLookupTicket();
              }
            }}
          />

          <Button
            onClick={handleLookupTicket}
            loading={checkoutMutation.isPending}
            disabled={!ticketId.trim() || checkoutMutation.isPending}
            fullWidth
            size="lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Process Checkout
          </Button>
        </div>

        {/* Ticket Preview */}
        {ticketData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ticket Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket ID:</span>
                <span className="font-mono font-semibold">{ticketData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{ticketData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Time:</span>
                <span className="font-semibold">{formatDateTime(ticketData.checkinAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Zone:</span>
                <span className="font-semibold">{ticketData.zoneId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details for Subscriber Tickets */}
        {isSubscriberTicket && hasSubscriptionData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Subscription Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subscriber:</span>
                <span className="font-semibold">{subscriptionData.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold">{subscriptionData.category}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Registered Cars:</p>
              <div className="space-y-1">
                {subscriptionData.cars.map((car, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="font-mono">{car.plate}</span>
                    <span className="text-gray-500">-</span>
                    <span>{car.brand} {car.model}</span>
                    <span className="text-gray-500">({car.color})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Employee Action Required:</strong> Please verify that the car plate matches one of the registered vehicles above.
              </p>
              <div className="mt-2 flex space-x-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => setPlateMatch(true)}
                  className={plateMatch === true ? 'ring-2 ring-green-500' : ''}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Plate Matches
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setPlateMatch(false)}
                  className={plateMatch === false ? 'ring-2 ring-red-500' : ''}
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Plate Mismatch
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Force Convert Option */}
        {isSubscriberTicket && plateMatch === false && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  Plate Mismatch Detected
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  The car plate doesn't match the subscription. You can convert this to a visitor ticket.
                </p>
                <Button
                  onClick={handleForceCheckout}
                  variant="danger"
                  size="sm"
                  className="mt-2"
                >
                  Convert to Visitor & Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Results Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Checkout Complete"
        size="lg"
      >
        {checkoutData && (
          <div className="space-y-6">
            {/* Ticket Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ticket Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ticket ID:</span>
                  <p className="font-mono font-semibold">{checkoutData.ticketId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-semibold">{formatDuration(checkoutData.durationHours)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Check-in:</span>
                  <p className="font-semibold">{formatDateTime(checkoutData.checkinAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Check-out:</span>
                  <p className="font-semibold">{formatDateTime(checkoutData.checkoutAt)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Rate Breakdown</h3>
              <div className="space-y-2">
                {checkoutData.breakdown.map((item: BreakdownItem, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatDateTime(item.from)} - {formatDateTime(item.to)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDuration(item.hours)} • {item.rateMode} rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(item.rate)}/hr × {formatDuration(item.hours)}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(checkoutData.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfirmCheckout} size="lg">
                Complete Checkout
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
