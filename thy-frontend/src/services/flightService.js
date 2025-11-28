// src/services/flightService.js
import { post, get } from "../api/httpClient";

// Flight arama
export function searchFlights({ origin, destination, date }) {
  return post("/flights/search", {
    origin,
    destination,
    date,
  });
}

// Hepsini tek obje halinde default export edelim
const flightService = {
  searchFlights,
};

export default flightService;
