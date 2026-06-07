import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { mockFacilities, HEALTHCARE_STATS, mockPractitioners, mockAppointments, mockHealthAlerts } from '../mock';

const USE_MOCK = true;
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function applyFacilityFilters(items, filters = {}) {
  return items.filter((item) => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.lgaId && item.jurisdiction?.lgaId !== filters.lgaId) return false;
    if (filters.acceptsNHIS && !item.acceptsNHIS) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.location.address.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function useFacilities(filters = {}) {
  return useQuery(
    ['healthcare-facilities', filters],
    async () => {
      if (USE_MOCK) {
        await delay(700);
        const filtered = applyFacilityFilters(mockFacilities, filters);
        return { data: { facilities: filtered, stats: HEALTHCARE_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useFacilityDetail(facilityId) {
  return useQuery(
    ['healthcare-facility', facilityId],
    async () => {
      if (USE_MOCK) {
        await delay(450);
        const facility = mockFacilities.find((f) => f.id === facilityId) || mockFacilities[0];
        const practitioners = mockPractitioners.filter((p) => p.facilityId === facilityId);
        return { data: { facility, practitioners } };
      }
    },
    { enabled: Boolean(facilityId), staleTime: 3 * 60 * 1000 }
  );
}

export function useMyAppointments() {
  return useQuery(
    ['healthcare-my-appointments'],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: { appointments: mockAppointments } };
      }
    },
    { staleTime: 2 * 60 * 1000 }
  );
}

export function useAppointmentDetail(appointmentId) {
  return useQuery(
    ['healthcare-appointment', appointmentId],
    async () => {
      if (USE_MOCK) {
        await delay(350);
        const appointment = mockAppointments.find((a) => a.id === appointmentId) || mockAppointments[0];
        const facility = mockFacilities.find((f) => f.id === appointment.facilityId);
        const practitioner = mockPractitioners.find((p) => p.id === appointment.practitionerId);
        return { data: { appointment, facility, practitioner } };
      }
    },
    { enabled: Boolean(appointmentId), staleTime: 5 * 60 * 1000 }
  );
}

export function useHealthAlerts() {
  return useQuery(
    ['healthcare-alerts'],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        return { data: { alerts: mockHealthAlerts.filter((a) => a.active) } };
      }
    },
    { staleTime: 5 * 60 * 1000 }
  );
}

export function useBookConsultation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1400);
        return {
          data: {
            success: true,
            appointmentId: `appt_${Date.now()}`,
            referenceCode: `APT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`,
            message: 'Appointment booked successfully. You will receive a confirmation via SMS.',
          },
        };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message || 'Appointment booked!');
          queryClient.invalidateQueries(['healthcare-my-appointments']);
        }
      },
      onError: () => toast.error('Could not book appointment. Please try again.'),
    }
  );
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation(
    async (appointmentId) => {
      if (USE_MOCK) {
        await delay(800);
        return { data: { success: true, message: 'Appointment cancelled successfully.' } };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message);
          queryClient.invalidateQueries(['healthcare-my-appointments']);
        }
      },
      onError: () => toast.error('Could not cancel appointment.'),
    }
  );
}
