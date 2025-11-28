import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [basket, setBasket] = useState([]); // [{id, code, route, date, time, price}]
  const [myFlights, setMyFlights] = useState([]); // satın alınan biletler
  const [payments, setPayments] = useState([]); // ödeme geçmişi

  const addToBasket = (flight) => {
    setBasket((prev) => [...prev, flight]);
  };

  const removeFromBasket = (id) => {
    setBasket((prev) => prev.filter((f) => f.id !== id));
  };

  const clearBasket = () => setBasket([]);

  const completePayment = () => {
    if (basket.length === 0) return;

    const now = new Date().toISOString();

    setMyFlights((prev) => [
      ...prev,
      ...basket.map((f) => ({ ...f, purchasedAt: now })),
    ]);

    setPayments((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        date: now,
        amount: basket.reduce((sum, f) => sum + (f.price || 0), 0),
        flights: basket.map((f) => f.code).join(", "),
      },
    ]);

    clearBasket();
  };

  const cancelFlight = (id) => {
    setMyFlights((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <BookingContext.Provider
      value={{
        basket,
        myFlights,
        payments,
        addToBasket,
        removeFromBasket,
        clearBasket,
        completePayment,
        cancelFlight,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
