const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

export const endpoints = {
  auth: {
    login: `${BASE}/auth/login`,
    signup: `${BASE}/auth/signup`,
  },
  flights: {
    search: `${BASE}/flights/search`,
    seats: (flightId) => `${BASE}/flights/${flightId}/seats`,
    seatStatus: (flightId, seatNumber) =>
      `${BASE}/flights/${flightId}/seats/${seatNumber}`,
  },
  users: {
    byEmailOrPhone: (emailOrPhone) =>
      `${BASE}/users/${encodeURIComponent(emailOrPhone)}`,
    update: (userId) => `${BASE}/users/${userId}`,
    delete: (userId) => `${BASE}/users/${userId}`,
    creditCards: (userId) => `${BASE}/users/${userId}/credit-cards`,
    changePassword: (userId) => `${BASE}/users/${userId}/change-password`,
  },
  payments: {
    create: `${BASE}/payments`,
    userHistory: (userId) => `${BASE}/payments/user/${userId}`,
  },
  tickets: {
    userTickets: (userId) => `${BASE}/tickets/user/${userId}`,
    cancel: (ticketId) => `${BASE}/tickets/${ticketId}/cancel`,
    checkin: (ticketId) => `${BASE}/tickets/${ticketId}/checkin`,
  },
};

export default endpoints;
