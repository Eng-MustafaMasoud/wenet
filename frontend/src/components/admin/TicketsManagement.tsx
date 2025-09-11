"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Car,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminApi, masterApi, Ticket, Zone, Gate } from "@/services/api";
import { useNotifications } from "@/components/ui/NotificationSystem";
import { useLoading } from "@/components/ui/LoadingStateManager";
import { FormField, SelectField } from "@/components/ui/AccessibleForm";
import LoadingButton from "@/components/ui/EnhancedLoadingButton";
import Modal from "@/components/ui/Modal";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ButtonGroup,
} from "@/components/layout/AppProviders";

const TICKET_STATUSES = [
  { value: "", label: "All Status" },
  { value: "checkedin", label: "Checked In" },
  { value: "checkedout", label: "Checked Out" },
];

const TICKET_TYPES = [
  { value: "", label: "All Types" },
  { value: "visitor", label: "Visitor" },
  { value: "subscriber", label: "Subscriber" },
];

export default function TicketsManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const notifications = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // Load data
  const loadData = async () => {
    try {
      startLoading("tickets-load", "Loading tickets...", "admin");
      const [ticketsData, zonesData, gatesData] = await Promise.all([
        adminApi.getTickets(),
        adminApi.getZones(),
        masterApi.getGates(),
      ]);
      setTickets(ticketsData);
      setZones(zonesData);
      setGates(gatesData);
    } catch (error: any) {
      notifications.showError("Failed to load data", error.message);
    } finally {
      stopLoading("tickets-load");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      !filters.status ||
      (filters.status === "checkedin" && !ticket.checkoutAt) ||
      (filters.status === "checkedout" && ticket.checkoutAt);

    const matchesType = !filters.type || ticket.type === filters.type;

    const matchesSearch =
      !filters.search ||
      ticket.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.zoneId.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.gateId.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  // Get zone name
  const getZoneName = (zoneId: string) => {
    return zones.find((zone) => zone.id === zoneId)?.name || zoneId;
  };

  // Get gate name
  const getGateName = (gateId: string) => {
    return gates.find((gate) => gate.id === gateId)?.name || gateId;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate duration
  const calculateDuration = (checkinAt: string, checkoutAt?: string) => {
    const start = new Date(checkinAt);
    const end = checkoutAt ? new Date(checkoutAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  // Get ticket status
  const getTicketStatus = (ticket: Ticket) => {
    return ticket.checkoutAt ? "checkedout" : "checkedin";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return status === "checkedin" ? "text-green-600" : "text-gray-600";
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    return status === "checkedin" ? CheckCircle : XCircle;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Tickets Management
          </h2>
          <p className="text-gray-600">View and manage parking tickets</p>
        </div>
        <ButtonGroup>
          <LoadingButton onClick={loadData} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </LoadingButton>
        </ButtonGroup>
      </div>

      {/* Filters */}
      <ResponsiveCard title="Filters">
        <ResponsiveGrid cols={4} gap="md">
          <FormField
            label="Search"
            name="search"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search by ID, zone, or gate..."
            icon={<Search className="w-4 h-4" />}
          />

          <SelectField
            label="Status"
            name="status"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            options={TICKET_STATUSES}
          />

          <SelectField
            label="Type"
            name="type"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
            options={TICKET_TYPES}
          />

          <div className="flex items-end">
            <LoadingButton
              onClick={() => setFilters({ status: "", type: "", search: "" })}
              variant="secondary"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </LoadingButton>
          </div>
        </ResponsiveGrid>
      </ResponsiveCard>

      {/* Tickets List */}
      <ResponsiveCard title={`Tickets (${filteredTickets.length})`}>
        {isLoading("tickets-load") ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600">
              No tickets match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => {
                  const status = getTicketStatus(ticket);
                  const StatusIcon = getStatusIcon(status);

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.id}
                        </div>
                        {ticket.subscriptionId && (
                          <div className="text-xs text-gray-500">
                            Sub: {ticket.subscriptionId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.type === "subscriber"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.type === "subscriber" ? (
                            <User className="w-3 h-3 mr-1" />
                          ) : (
                            <Car className="w-3 h-3 mr-1" />
                          )}
                          {ticket.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            {getZoneName(ticket.zoneId)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Gate: {getGateName(ticket.gateId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-green-600" />
                            {formatDate(ticket.checkinAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.checkoutAt ? (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-red-600" />
                              {formatDate(ticket.checkoutAt)}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calculateDuration(
                            ticket.checkinAt,
                            ticket.checkoutAt
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon
                            className={`w-4 h-4 mr-2 ${getStatusColor(status)}`}
                          />
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              status
                            )}`}
                          >
                            {status === "checkedin" ? "Active" : "Completed"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ButtonGroup>
                          <LoadingButton
                            onClick={() => setSelectedTicket(ticket)}
                            variant="secondary"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </LoadingButton>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ResponsiveCard>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Ticket Details"
        size="xl"
      >
        <div className="p-6 space-y-4">
          <ResponsiveGrid cols={2} gap="md">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket ID
              </label>
              <p className="text-sm text-gray-900">{selectedTicket?.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <p className="text-sm text-gray-900 capitalize">
                {selectedTicket?.type}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zone
              </label>
              <p className="text-sm text-gray-900">
                {selectedTicket?.zoneId
                  ? getZoneName(selectedTicket.zoneId)
                  : "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gate
              </label>
              <p className="text-sm text-gray-900">
                {selectedTicket?.gateId
                  ? getGateName(selectedTicket.gateId)
                  : "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Check-in Time
              </label>
              <p className="text-sm text-gray-900">
                {selectedTicket?.checkinAt
                  ? formatDate(selectedTicket.checkinAt)
                  : "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Check-out Time
              </label>
              <p className="text-sm text-gray-900">
                {selectedTicket?.checkoutAt
                  ? formatDate(selectedTicket.checkoutAt)
                  : "Still active"}
              </p>
            </div>

            {selectedTicket?.subscriptionId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subscription ID
                </label>
                <p className="text-sm text-gray-900">
                  {selectedTicket?.subscriptionId}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <p className="text-sm text-gray-900">
                {selectedTicket?.checkinAt
                  ? calculateDuration(
                      selectedTicket.checkinAt,
                      selectedTicket.checkoutAt
                    )
                  : "N/A"}
              </p>
            </div>
          </ResponsiveGrid>
        </div>

        <div className="flex justify-end p-6 border-t">
          <LoadingButton
            onClick={() => setSelectedTicket(null)}
            variant="secondary"
          >
            Close
          </LoadingButton>
        </div>
      </Modal>
    </div>
  );
}
