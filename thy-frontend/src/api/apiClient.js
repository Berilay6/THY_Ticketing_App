import endpoints from "./apiEndpoints";

function fetchJson(url, options = {}) {
  const token = localStorage.getItem("authToken");
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(url, Object.assign({}, options, { headers })).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        let payload = text;
        try {
          payload = JSON.parse(text);
        } catch (e) {}
        const err = new Error(res.statusText || "Request failed");
        err.status = res.status;
        err.payload = payload;
        throw err;
      });
    }
    if (res.status === 204) return null;
    return res.json();
  });
}

export const flightApi = {
  searchFlights: (req) =>
    fetchJson(endpoints.flights.search, {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getSeats: (flightId) => fetchJson(endpoints.flights.seats(flightId)),
  getSeatStatus: (flightId, seatNumber) =>
    fetchJson(endpoints.flights.seatStatus(flightId, seatNumber)),
};

export const userApi = {
  getByEmailOrPhone: (emailOrPhone) =>
    fetchJson(endpoints.users.byEmailOrPhone(emailOrPhone)),
  update: (userId, payload) =>
    fetchJson(endpoints.users.update(userId), {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (userId) =>
    fetchJson(endpoints.users.delete(userId), { method: "DELETE" }),
  getCreditCards: (userId) => fetchJson(endpoints.users.creditCards(userId)),
  addCreditCard: (userId, card) =>
    fetchJson(endpoints.users.creditCards(userId), {
      method: "POST",
      body: JSON.stringify(card),
    }),
  deleteCreditCard: (userId, cardNum) =>
    fetchJson(
      `${endpoints.users.creditCards(userId)}/${encodeURIComponent(cardNum)}`,
      { method: "DELETE" }
    ),
};

export const paymentApi = {
  createPayment: (paymentReq) =>
    fetchJson(endpoints.payments.create, {
      method: "POST",
      body: JSON.stringify(paymentReq),
    }),
  getUserPayments: (userId) =>
    fetchJson(endpoints.payments.userHistory(userId)),
};

export const ticketApi = {
  getUserTickets: (userId) => fetchJson(endpoints.tickets.userTickets(userId)),
  cancelTicket: (ticketId) =>
    fetchJson(endpoints.tickets.cancel(ticketId), { method: "POST" }),
  checkInTicket: (ticketId) =>
    fetchJson(endpoints.tickets.checkin(ticketId), { method: "POST" }),
};

export default { flightApi, userApi, paymentApi, ticketApi };
