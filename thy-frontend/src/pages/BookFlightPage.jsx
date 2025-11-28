// src/pages/BookFlightPage.jsx
import "../styles/bookFlight.css";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import flightService from "../services/flightService";

export default function BookFlightPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addToBasket } = useBooking();
  const navigate = useNavigate();

  const formatDateTime = (dt) => {
    if (!dt) return { date: "", time: "" };
    const s = typeof dt === "string" ? dt : dt.toString();
    const parts = s.includes("T") ? s.split("T") : s.split(" ");
    const datePart = parts[0] || "";
    const timePart = (parts[1] || "").slice(0, 5);
    return { date: datePart, time: timePart };
  };
  const handleSearch = () => {
    setLoading(true);
    setError("");

    flightService
      .searchFlights({ origin, destination, date })
      .then((data) => {
        setResults(data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Flights could not be loaded. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAddToBasket = (flight) => {
    // FlightSearchResultDTO → basket formatına çeviriyoruz
    // Backend DTO alan adları: origin, destination, originAirportName, destinationAirportName, departureTime
    const { date: fDate, time: fTime } = formatDateTime(flight.departureTime);

    addToBasket({
      id: flight.flightId,
      code: `${flight.origin}-${flight.destination}`,
      route: `${flight.origin} → ${flight.destination}`,
      date: fDate,
      time: fTime,
      price: flight.price || 1500,
      raw: flight,
    });
  };

  return (
    <Box className="page-root book-wrapper">
      <Typography variant="h5" gutterBottom>
        Book a flight
      </Typography>

      <Paper elevation={0} className="card book-search-card">
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="From"
              placeholder="IST"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              fullWidth
            />
            <TextField
              label="To"
              placeholder="ESB"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            disabled={!origin || !destination || !date || loading}
          >
            {loading ? "Searching..." : "Search flights"}
          </Button>

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>

      {results.length > 0 && (
        <>
          <Typography className="book-results-header">
            Available flights
          </Typography>

          <div className="book-flight-list">
            {results.map((flight) => {
              const { date: fDate, time: fTime } = formatDateTime(
                flight.departureTime
              );

              return (
                <Paper
                  key={flight.flightId}
                  elevation={0}
                  className="card book-flight-item"
                >
                  <Box>
                    <div className="book-flight-info-main">
                      {flight.origin} → {flight.destination}
                    </div>
                    <div className="book-flight-info-sub">
                      {flight.originAirportName} →{" "}
                      {flight.destinationAirportName} • {fDate} {fTime}
                    </div>
                    <div className="book-flight-price">
                      <strong>
                        {(flight.price || 1500).toLocaleString()} TL
                      </strong>
                    </div>
                  </Box>
                  <Stack spacing={1} alignItems="flex-end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddToBasket(flight)}
                    >
                      Select & add to basket
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
            <Button
              size="small"
              variant="text"
              onClick={() => navigate("/basket")}
            >
              Go to basket
            </Button>
          </div>
        </>
      )}
    </Box>
  );
}
