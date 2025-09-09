"use client";

import { useState } from "react";
import { X, Printer, Download, CheckCircle, DollarSign } from "lucide-react";
import { Ticket, Gate, Zone } from "@/types/api";
import Button from "@/components/ui/Button";

interface TicketModalProps {
  ticket: Ticket;
  gate: Gate | null | undefined;
  zone: Zone | null | undefined;
  onClose: () => void;
}

export default function TicketModal({
  ticket,
  gate,
  zone,
  onClose,
}: TicketModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownload = () => {
    // Create a simple text version for download
    const ticketText = `
PARKFLOW PARKING TICKET
========================

Ticket ID: ${ticket.id}
Type: ${ticket.type.toUpperCase()}
Gate: ${gate?.name || ticket.gateId}
Zone: ${zone?.name || ticket.zoneId}
Check-in Time: ${new Date(ticket.checkinAt).toLocaleString()}

${
  ticket.type === "visitor"
    ? `
RATES:
Normal: $${zone?.rateNormal || 0}/hour
Special: $${zone?.rateSpecial || 0}/hour
${(zone as any)?.specialActive ? "(Special rate currently active)" : ""}
`
    : `
SUBSCRIPTION TICKET
No additional charges
`
}

Thank you for using ParkFlow!
    `.trim();

    const blob = new Blob([ticketText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parkflow-ticket-${ticket.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b no-print">
          <h2 className="text-xl font-semibold text-gray-900">
            Parking Ticket
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-6 ticket-print">
          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold">🅿️ PARKFLOW</h1>
            <p className="text-lg font-semibold">PARKING TICKET</p>
            <p className="text-sm text-gray-600">Keep this ticket with you</p>
          </div>

          {/* Success Message */}
          <div className="text-center print:hidden">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check-in Successful!
            </h3>
            <p className="text-gray-600">
              Your parking ticket has been generated
            </p>
          </div>

          {/* Ticket Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket ID:</span>
              <span className="font-mono font-medium text-gray-900">
                {ticket.id}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.type === "visitor"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {ticket.type.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Gate:</span>
              <span className="font-medium text-gray-900">
                {gate?.name || ticket.gateId}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Zone:</span>
              <span className="font-medium text-gray-900">
                {zone?.name || ticket.zoneId}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Check-in Time:</span>
              <span className="font-medium text-gray-900">
                {new Date(ticket.checkinAt).toLocaleString()}
              </span>
            </div>

            {gate?.location && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">
                  {gate.location}
                </span>
              </div>
            )}
          </div>

          {/* Rates (for visitors) */}
          {ticket.type === "visitor" && zone && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Parking Rates
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Normal Rate:</span>
                  <span className="font-medium text-gray-900">
                    ${zone.rateNormal}/hour
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Special Rate:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      ${zone.rateSpecial}/hour
                    </span>
                    {(zone as any).specialActive && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Currently Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">
              Important Instructions:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Keep this ticket with you at all times</li>
              <li>• Present this ticket when exiting</li>
              <li>
                •{" "}
                {ticket.type === "visitor"
                  ? "Payment will be calculated at checkout"
                  : "No additional charges for subscribers"}
              </li>
              <li>• Contact staff if you lose this ticket</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t bg-gray-50 no-print">
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? "Printing..." : "Print Ticket"}
          </Button>

          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          .ticket-print,
          .ticket-print * {
            visibility: visible;
          }

          .ticket-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
            font-family: "Arial", sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }

          .no-print,
          .print\\:hidden {
            display: none !important;
          }

          .hidden.print\\:block {
            display: block !important;
          }

          .ticket-print h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .ticket-print h3 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
          }

          .ticket-print .bg-gray-50,
          .ticket-print .bg-blue-50,
          .ticket-print .bg-yellow-50 {
            background: #f9f9f9 !important;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 10px 0;
          }

          .ticket-print .text-center {
            text-align: center;
          }

          .ticket-print .font-mono {
            font-family: "Courier New", monospace;
          }

          .ticket-print .space-y-3 > * + * {
            margin-top: 8px;
          }

          .ticket-print .space-y-6 > * + * {
            margin-top: 15px;
          }

          .ticket-print .flex {
            display: flex;
          }

          .ticket-print .justify-between {
            justify-content: space-between;
          }

          .ticket-print .border-b {
            border-bottom: 1px solid #ddd;
          }

          .ticket-print .pb-4 {
            padding-bottom: 16px;
          }

          .ticket-print .mb-6 {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
}
