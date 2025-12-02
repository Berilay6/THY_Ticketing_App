import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [basket, setBasket] = useState([]); // holds flight search results added to basket

  const addToBasket = (flight) => {
    setBasket((prev) => [...prev, flight]);
  };

  const removeFromBasket = (flightId, seatNumber) => {
    setBasket((prev) =>
      prev.filter(
        (f) =>
          !((f.flightId ?? f.id) === flightId && f.seatNumber === seatNumber)
      )
    );
  };

  const clearBasket = () => setBasket([]);

  const completePayment = () => {
    clearBasket();
  };

  return (
    <BookingContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        clearBasket,
        completePayment,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
