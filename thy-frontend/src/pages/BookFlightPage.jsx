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
import { flightApi } from "../api/apiClient";
import "../styles/bookFlight.css";

export default function BookFlightPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToBasket } = useBooking();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!from || !to || !date) return;

    setLoading(true);
    const req = {
      origin: from,
      destination: to,
      date: date,
    };
    flightApi
      .searchFlights(req)
      .then((flights) => {
        setResults(flights || []);
      })
      .catch((err) => {
        console.error("Flight search failed:", err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  };

  const handleAddToBasket = (flight) => {
    // İleride burada seat selection adımı eklenebilir
    addToBasket(flight);
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
              placeholder="Istanbul (IST)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              fullWidth
            />
            <TextField
              label="To"
              placeholder="Ankara (ESB)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
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
            disabled={!from || !to || !date || loading}
          >
            {loading ? "Searching..." : "Search flights"}
          </Button>
        </Stack>
      </Paper>

      {results.length > 0 && (
        <>
          <Typography className="book-results-header">
            Available flights
          </Typography>

          <div className="book-flight-list">
            {results.map((flight) => (
              <Paper
                key={flight.flightId}
                elevation={0}
                className="card book-flight-item"
              >
                <Box>
                  <div className="book-flight-info-main">
                    {flight.flightCode}
                  </div>
                  <div className="book-flight-info-sub">
                    {flight.origin} → {flight.destination} •{" "}
                    {flight.departureTime}
                  </div>
                  <div className="book-flight-price">
                    <strong>{flight.price?.toFixed(2)} TL</strong>
                  </div>
                </Box>
                <Stack spacing={1} alignItems="flex-end">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => addToBasket(flight)}
                  >
                    Select & add to basket
                  </Button>
                </Stack>
              </Paper>
            ))}
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
