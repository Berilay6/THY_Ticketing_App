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
import "../styles/bookFlight.css";

export default function BookFlightPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);

  const { addToBasket } = useBooking();
  const navigate = useNavigate();

  const handleSearch = () => {
    const mockFlights = [
      {
        id: "TK215-1",
        code: "TK215",
        route: `${from || "IST"} → ${to || "ESB"}`,
        date: date || "2025-12-05",
        time: "08:30",
        price: 1450,
      },
      {
        id: "TK217-2",
        code: "TK217",
        route: `${from || "IST"} → ${to || "ESB"}`,
        date: date || "2025-12-05",
        time: "15:45",
        price: 1650,
      },
    ];
    setResults(mockFlights);
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
            disabled={!from || !to || !date}
          >
            Search flights
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
                key={flight.id}
                elevation={0}
                className="card book-flight-item"
              >
                <Box>
                  <div className="book-flight-info-main">{flight.code}</div>
                  <div className="book-flight-info-sub">
                    {flight.route} • {flight.date} • {flight.time}
                  </div>
                  <div className="book-flight-price">
                    <strong>{flight.price} TL</strong>
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
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => navigate("/basket")}
                  >
                    Go to basket
                  </Button>
                </Stack>
              </Paper>
            ))}
          </div>
        </>
      )}
    </Box>
  );
}
