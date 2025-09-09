"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { EnhancedLoadingButton } from "@/components/ui/EnhancedLoadingButton";

interface TicketLookupProps {
  onLookup: (ticketId: string) => void;
  isLoading: boolean;
  error: string;
}

const TicketLookup = forwardRef<HTMLInputElement, TicketLookupProps>(
  ({ onLookup, isLoading, error }, ref) => {
    const [ticketId, setTicketId] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (ticketId.trim()) {
        onLookup(ticketId.trim());
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      const pastedText = e.clipboardData.getData("text");
      if (pastedText) {
        setTicketId(pastedText.trim());
        // Auto-submit after paste (simulating QR scan)
        setTimeout(() => {
          if (pastedText.trim()) {
            onLookup(pastedText.trim());
          }
        }, 100);
      }
    };

    const simulateQRScan = (sampleTicketId: string) => {
      setTicketId(sampleTicketId);
      onLookup(sampleTicketId);
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Scan or Enter Ticket ID
            </h2>
            <p className="text-gray-600">
              Scan the QR code or manually enter the ticket ID to begin checkout
            </p>
          </div>

          {/* Ticket ID Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="ticketId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ticket ID
              </label>
              <input
                ref={inputRef}
                id="ticketId"
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste ticket ID here or scan QR code"
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 text-center font-mono"
                autoFocus
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                💡 Use Ctrl+V to paste a scanned ticket ID
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <EnhancedLoadingButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!ticketId.trim() || isLoading}
              loadingMessage="Looking up ticket..."
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            >
              Look Up Ticket
            </EnhancedLoadingButton>
          </form>

          {/* Demo/Testing Section */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-3">
              🧪 Demo Tickets (for testing):
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => simulateQRScan("TICKET-001")}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <span className="font-mono text-blue-700">TICKET-001</span>
                <span className="text-blue-600 ml-2">(Visitor ticket)</span>
              </button>
              <button
                onClick={() => simulateQRScan("TICKET-002")}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <span className="font-mono text-blue-700">TICKET-002</span>
                <span className="text-blue-600 ml-2">(Subscriber ticket)</span>
              </button>
              <button
                onClick={() => simulateQRScan("TICKET-003")}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <span className="font-mono text-blue-700">TICKET-003</span>
                <span className="text-blue-600 ml-2">(Long stay ticket)</span>
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              Click any demo ticket to simulate QR code scanning
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-2">
              How to use:
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Scan the QR code on the customer's ticket</li>
              <li>• Or ask customer to show you the ticket ID</li>
              <li>• Paste or type the ticket ID in the field above</li>
              <li>• Click "Look Up Ticket" to begin checkout process</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
);

TicketLookup.displayName = "TicketLookup";

export default TicketLookup;
