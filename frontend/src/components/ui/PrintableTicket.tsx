"use client";

import React, { useRef } from "react";
import { Printer, Download, X } from "lucide-react";
import Modal from "./Modal";

interface TicketData {
  id: string;
  type: "entry" | "exit" | "payment";
  customerName?: string;
  vehiclePlate: string;
  vehicleType: string;
  zone: string;
  entryTime: string;
  exitTime?: string;
  duration?: string;
  amount?: number;
  paymentMethod?: string;
  gateName: string;
  attendant?: string;
  barcode?: string;
  qrCode?: string;
}

interface PrintableTicketProps {
  ticket: TicketData;
  onClose?: () => void;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    website?: string;
  };
}

export default function PrintableTicket({
  ticket,
  onClose,
  companyInfo = {
    name: "ParkFlow Management System",
    address: "123 Parking Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    website: "www.parkflow.com",
  },
}: PrintableTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Prefer printing via a new window to avoid app styles interfering
    if (ticketRef.current) {
      const printWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!printWindow) {
        window.print();
        return;
      }

      const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>Ticket ${ticket.id}</title>
    <style>
      @page { size: auto; margin: 10mm; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      .ticket-print { width: 3.5in; min-height: 5in; padding: 0.25in; border: 1px solid #000; }
      .ticket-title { font-size: 14px; font-weight: 700; text-align: center; }
      .ticket-subtitle { font-size: 12px; text-align: center; }
      .ticket-row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
    </style>
  </head>
  <body>
    ${ticketRef.current.outerHTML}
    <script>window.focus(); setTimeout(() => { window.print(); window.close(); }, 100);</script>
  </body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    // Convert to PDF or image - this would require additional libraries
    // For now, just trigger print
    handlePrint();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getTicketTitle = () => {
    switch (ticket.type) {
      case "entry":
        return "ENTRY TICKET";
      case "exit":
        return "EXIT TICKET";
      case "payment":
        return "PAYMENT RECEIPT";
      default:
        return "PARKING TICKET";
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose || (() => {})}
      title="Parking Ticket"
      size="md"
      className="no-print"
    >
      <div className="flex items-center gap-2 p-4 border-b">
        <button
          onClick={handleDownload}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 focus-ring"
          aria-label="Download ticket"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={handlePrint}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 focus-ring"
          aria-label="Print ticket"
        >
          <Printer className="w-5 h-5" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 focus-ring"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ticket Preview */}
      <div className="p-4">
        <div className="border border-gray-300 rounded bg-gray-50 p-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            Print Preview - This is how your ticket will look when printed
          </div>

          {/* Actual Ticket Content */}
          <div
            ref={ticketRef}
            className="ticket-print bg-white border border-gray-300 mx-auto"
            style={{ width: "3.5in", minHeight: "5in", padding: "0.25in" }}
          >
            <TicketContent ticket={ticket} companyInfo={companyInfo} />
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus-ring"
          >
            <Printer className="w-4 h-4 inline mr-2" />
            Print Ticket
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus-ring"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Hidden Print Version */}
      <div
        className="ticket-print fixed left-[-9999px] top-0"
        aria-hidden="true"
      >
        <TicketContent ticket={ticket} companyInfo={companyInfo} />
      </div>
    </Modal>
  );
}

function TicketContent({
  ticket,
  companyInfo,
}: {
  ticket: TicketData;
  companyInfo: any;
}) {
  const getTicketTitle = () => {
    switch (ticket.type) {
      case "entry":
        return "ENTRY TICKET";
      case "exit":
        return "EXIT TICKET";
      case "payment":
        return "PAYMENT RECEIPT";
      default:
        return "PARKING TICKET";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <div className="ticket-content">
      {/* Header */}
      <div className="ticket-header">
        <div className="ticket-title">{getTicketTitle()}</div>
        <div className="ticket-subtitle">{companyInfo.name}</div>
        <div style={{ fontSize: "10px", marginTop: "0.25rem" }}>
          {companyInfo.address}
        </div>
        <div style={{ fontSize: "10px" }}>
          {companyInfo.phone} • {companyInfo.website}
        </div>
      </div>

      {/* Ticket Body */}
      <div className="ticket-body">
        <div className="ticket-row">
          <span>Ticket ID:</span>
          <span style={{ fontWeight: "bold" }}>{ticket.id}</span>
        </div>

        <div className="ticket-row">
          <span>Vehicle:</span>
          <span>{ticket.vehiclePlate}</span>
        </div>

        <div className="ticket-row">
          <span>Type:</span>
          <span>{ticket.vehicleType}</span>
        </div>

        <div className="ticket-row">
          <span>Zone:</span>
          <span>{ticket.zone}</span>
        </div>

        <div className="ticket-row">
          <span>Gate:</span>
          <span>{ticket.gateName}</span>
        </div>

        {ticket.customerName && (
          <div className="ticket-row">
            <span>Customer:</span>
            <span>{ticket.customerName}</span>
          </div>
        )}

        <div className="ticket-row">
          <span>Entry Time:</span>
          <span>{formatDateTime(ticket.entryTime)}</span>
        </div>

        {ticket.exitTime && (
          <div className="ticket-row">
            <span>Exit Time:</span>
            <span>{formatDateTime(ticket.exitTime)}</span>
          </div>
        )}

        {ticket.duration && (
          <div className="ticket-row">
            <span>Duration:</span>
            <span>{ticket.duration}</span>
          </div>
        )}

        {ticket.amount !== undefined && (
          <div
            className="ticket-row"
            style={{ fontWeight: "bold", borderBottom: "2px solid #000" }}
          >
            <span>Amount:</span>
            <span>{formatCurrency(ticket.amount)}</span>
          </div>
        )}

        {ticket.paymentMethod && (
          <div className="ticket-row">
            <span>Payment:</span>
            <span>{ticket.paymentMethod}</span>
          </div>
        )}

        {ticket.attendant && (
          <div className="ticket-row">
            <span>Attendant:</span>
            <span>{ticket.attendant}</span>
          </div>
        )}
      </div>

      {/* QR Code / Barcode */}
      {(ticket.qrCode || ticket.barcode) && (
        <div className="ticket-qr">
          {ticket.barcode && (
            <div className="ticket-barcode" style={{ marginBottom: "0.5rem" }}>
              {ticket.barcode}
            </div>
          )}
          {ticket.qrCode && (
            <div
              style={{
                fontSize: "8px",
                wordBreak: "break-all",
                padding: "0.25rem",
                border: "1px solid #000",
              }}
            >
              {ticket.qrCode}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="ticket-footer">
        <div>Thank you for using our parking facility!</div>
        <div style={{ marginTop: "0.25rem" }}>
          Please keep this ticket for your records
        </div>
        <div style={{ marginTop: "0.25rem", fontSize: "8px" }}>
          Printed on: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// Hook for creating and managing tickets
export function useTicketPrinter() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentTicket, setCurrentTicket] = React.useState<TicketData | null>(
    null
  );

  const openTicket = React.useCallback((ticket: TicketData) => {
    setCurrentTicket(ticket);
    setIsOpen(true);
  }, []);

  const closeTicket = React.useCallback(() => {
    setIsOpen(false);
    setCurrentTicket(null);
  }, []);

  const printTicket = React.useCallback(
    (ticket: TicketData) => {
      openTicket(ticket);
      // Auto-print after a brief delay to allow modal to open
      setTimeout(() => {
        window.print();
      }, 100);
    },
    [openTicket]
  );

  return {
    isOpen,
    currentTicket,
    openTicket,
    closeTicket,
    printTicket,
    TicketModal: currentTicket ? (
      <PrintableTicket ticket={currentTicket} onClose={closeTicket} />
    ) : null,
  };
}
