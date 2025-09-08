'use client';

import { Ticket, Zone, Gate } from '@/types/api';
import { formatDateTime, formatCurrency } from '@/utils/helpers';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Printer, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  zone: Zone | null;
  gate: Gate | null;
  onPrint?: () => void;
}

export default function TicketModal({ 
  isOpen, 
  onClose, 
  ticket, 
  zone, 
  gate,
  onPrint 
}: TicketModalProps) {
  const [copied, setCopied] = useState(false);

  if (!ticket || !zone || !gate) {
    return null;
  }

  const handleCopyTicketId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy ticket ID:', error);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check-in Successful"
      size="md"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Welcome to {zone.name}!
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Your parking ticket has been generated successfully.
        </p>

        {/* Ticket Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-gray-900">PARKING TICKET</h4>
              <p className="text-sm text-gray-600">{gate.name}</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket ID:</span>
                <span className="font-mono font-semibold">{ticket.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Zone:</span>
                <span className="font-semibold">{zone.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{ticket.type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Time:</span>
                <span className="font-semibold">{formatDateTime(ticket.checkinAt)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Rate:</span>
                <span className="font-semibold">
                  {formatCurrency(zone.rateNormal)}/hr
                  {zone.rateSpecial !== zone.rateNormal && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Special: {formatCurrency(zone.rateSpecial)}/hr)
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-500 text-center">
                Please keep this ticket safe. You'll need it for checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 justify-center">
          <Button
            variant="outline"
            onClick={handleCopyTicketId}
            className="flex items-center space-x-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy ID</span>
              </>
            )}
          </Button>
          
          <Button
            variant="primary"
            onClick={handlePrint}
            className="flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ticket</span>
          </Button>
        </div>

        <div className="mt-6">
          <Button
            variant="success"
            onClick={onClose}
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
