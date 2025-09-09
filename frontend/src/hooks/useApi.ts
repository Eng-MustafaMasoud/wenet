import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  authApi,
  masterApi,
  adminApi,
  subscriptionApi,
  ticketApi,
  CheckinRequest,
  CheckoutRequest,
  Category,
  Zone,
  Gate,
  RushHour,
  Vacation,
  User,
  Subscription,
  Ticket,
} from "@/services/api";

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

// Master data hooks
export const useGates = () => {
  return useQuery({
    queryKey: ["gates"],
    queryFn: masterApi.getGates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useZones = (gateId: string) => {
  return useQuery({
    queryKey: ["zones", gateId],
    queryFn: () => masterApi.getZones(gateId),
    enabled: !!gateId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAllZones = () => {
  return useQuery({
    queryKey: ["zones", "all"],
    queryFn: () => api.get("/master/zones").then((res) => res.data),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: masterApi.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Admin hooks
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: adminApi.getCategories,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useAdminZones = () => {
  return useQuery({
    queryKey: ["admin", "zones"],
    queryFn: adminApi.getZones,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Zone> }) =>
      adminApi.updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};

export const useUpdateZoneOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, open }: { id: string; open: boolean }) =>
      adminApi.updateZoneOpen(id, open),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};

export const useAdminGates = () => {
  return useQuery({
    queryKey: ["admin", "gates"],
    queryFn: adminApi.getGates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createGate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["gates"] });
    },
  });
};

export const useUpdateGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Gate> }) =>
      adminApi.updateGate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["gates"] });
    },
  });
};

export const useDeleteGate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteGate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gates"] });
      queryClient.invalidateQueries({ queryKey: ["gates"] });
    },
  });
};

export const useRushHours = () => {
  return useQuery({
    queryKey: ["admin", "rush-hours"],
    queryFn: adminApi.getRushHours,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createRushHour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useUpdateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RushHour> }) =>
      adminApi.updateRushHour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useDeleteRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteRushHour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useVacations = () => {
  return useQuery({
    queryKey: ["admin", "vacations"],
    queryFn: adminApi.getVacations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createVacation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useUpdateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vacation> }) =>
      adminApi.updateVacation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useDeleteVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteVacation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: adminApi.getSubscriptions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subscription> }) =>
      adminApi.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export const useParkingState = () => {
  return useQuery({
    queryKey: ["admin", "parking-state"],
    queryFn: adminApi.getParkingState,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useTickets = (status?: string) => {
  return useQuery({
    queryKey: ["admin", "tickets", status],
    queryFn: () => adminApi.getTickets(status),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Subscription hooks
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ["subscription", id],
    queryFn: () => subscriptionApi.getSubscription(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Ticket hooks
export const useCheckin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckinRequest) => ticketApi.checkin(data),
    onSuccess: (data, variables) => {
      // Invalidate zones for the specific gate
      queryClient.invalidateQueries({ queryKey: ["zones", variables.gateId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "parking-state"] });
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutRequest) => ticketApi.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "parking-state"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketApi.getTicket(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
