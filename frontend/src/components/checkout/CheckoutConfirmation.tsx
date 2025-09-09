"use client";

import React from "react";
import { EnhancedLoadingButton } from "@/components/ui/EnhancedLoadingButton";

interface Ticket {
  id: string;
  checkinAt: string;
  zoneId: string;
  gateId: string;
  type: "visitor" | "subscriber";
  subscriptionId?: string;
  vehiclePlate?: string;
  status?: "active" | "completed";
}

interface CheckoutConfirmationProps {
  ticket: Ticket;
  result: any; // Checkout result from server
  onNewCheckout: () => void;
}

export default function CheckoutConfirmation({
  ticket,
  result,
  onNewCheckout,
}: CheckoutConfirmationProps) {
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? "s" : ""}`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  };

  const printReceipt = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      const receiptContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>ParkFlow Receipt</title>
            <meta charset="utf-8">
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                line-height: 1.4;
                max-width: 600px;
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h2 {
                margin: 0;
                font-size: 24px;
                color: #333;
              }
              .header h3 {
                margin: 5px 0;
                font-size: 18px;
                color: #666;
              }
              .receipt-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
              }
              .receipt-table th, .receipt-table td { 
                padding: 12px 8px; 
                text-align: left; 
                border-bottom: 1px solid #ddd; 
              }
              .receipt-table th {
                font-weight: bold;
                color: #333;
                width: 40%;
              }
              .receipt-table td {
                color: #555;
              }
              .total { 
                font-weight: bold; 
                font-size: 1.3em; 
                border-top: 2px solid #333;
                border-bottom: 2px solid #333;
              }
              .total th, .total td {
                padding: 15px 8px;
                color: #333;
              }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 0.9em; 
                color: #666; 
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              .print-button {
                margin: 20px auto;
                display: block;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
              }
              .print-button:hover {
                background: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>🅿️ ParkFlow</h2>
              <h3>Parking Receipt</h3>
              <p>Transaction Date: ${new Date().toLocaleString()}</p>
            </div>
            
            <table class="receipt-table">
              <tr><th>Ticket ID:</th><td>${ticket.id}</td></tr>
              <tr><th>Check-in:</th><td>${new Date(ticket.checkinAt).toLocaleString()}</td></tr>
              <tr><th>Check-out:</th><td>${new Date().toLocaleString()}</td></tr>
              <tr><th>Duration:</th><td>${formatDuration(result.durationHours || 0)}</td></tr>
              <tr><th>Type:</th><td>${ticket.type}</td></tr>
              ${ticket.vehiclePlate ? `<tr><th>Vehicle:</th><td>${ticket.vehiclePlate}</td></tr>` : ""}
              <tr class="total"><th>Total Amount:</th><td>${formatCurrency(result.amount || 0)}</td></tr>
            </table>
            
            <div class="footer">
              <p>Thank you for using ParkFlow!</p>
              <p>Keep this receipt for your records</p>
            </div>

            <button class="print-button no-print" onclick="window.print()">Print Receipt</button>
            
            <script>
              // Auto-print after a short delay to ensure content is loaded
              window.addEventListener('load', function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              });
              
              // Close window after printing
              window.addEventListener('afterprint', function() {
                setTimeout(function() {
                  window.close();
                }, 1000);
              });
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      
      // Fallback: if auto-print doesn't work, focus the window
      printWindow.focus();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout Completed!
          </h2>
          <p className="text-gray-600 text-lg">
            The parking session has been successfully closed
          </p>
        </div>

        {/* Receipt Summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            Transaction Summary
          </h3>

          <div className="space-y-3 text-left">
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-green-700 font-medium">Ticket ID:</span>
              <span className="font-mono text-green-900">{ticket.id}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-green-700 font-medium">Check-in Time:</span>
              <span className="text-green-900">
                {new Date(ticket.checkinAt).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-green-700 font-medium">
                Check-out Time:
              </span>
              <span className="text-green-900">
                {new Date().toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-green-700 font-medium">Duration:</span>
              <span className="text-green-900 font-semibold">
                {formatDuration(result.durationHours || 0)}
              </span>
            </div>

            {ticket.vehiclePlate && (
              <div className="flex justify-between py-2 border-b border-green-200">
                <span className="text-green-700 font-medium">Vehicle:</span>
                <span className="font-mono text-green-900 bg-white px-2 py-1 rounded border">
                  {ticket.vehiclePlate}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 text-xl font-bold">
              <span className="text-green-900">Total Paid:</span>
              <span className="text-green-900">
                {formatCurrency(result.amount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Zone Update Notification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-blue-700 text-sm">
              Zone occupancy has been updated and space is now available for new
              customers
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <EnhancedLoadingButton
            variant="secondary"
            size="lg"
            onClick={printReceipt}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            }
          >
            Print Receipt
          </EnhancedLoadingButton>

          <EnhancedLoadingButton
            variant="primary"
            size="lg"
            onClick={onNewCheckout}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            New Checkout
          </EnhancedLoadingButton>
        </div>

        {/* Additional Instructions */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Next Steps:
          </h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Customer can now exit the parking facility</li>
            <li>
              • Gate will open automatically or manually raise the barrier
            </li>
            <li>• Receipt can be printed for customer records</li>
            <li>• Ready to process the next checkout</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
