import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <FlightTakeoffIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      {flight.planeModel}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    <Chip
                      label={flight.origin}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography color="text.secondary">→</Typography>
                    <Chip
                      label={flight.destination}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(flight.departureTime).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(flight.arrivalTime).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    mt={1}
                    display="block"
                  >
                    {flight.originAirportName} - {flight.destinationAirportName}
                  </Typography>
                </Box>
                <Stack spacing={1} alignItems="flex-end">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/select-seat/${flight.flightId}`)}
                  >
                    Select Seat
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
