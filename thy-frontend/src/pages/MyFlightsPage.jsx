import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import LuggageIcon from "@mui/icons-material/Luggage";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";
import { ticketApi } from "../api/apiClient";
import "../styles/myFlights.css";

const EXTRA_BAGGAGE_PRICE = 150;
const MEAL_SERVICE_PRICE = 75;

export default function MyFlightsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active"); // "active" shows booked & pending, excludes cancelled
  const userId = localStorage.getItem("userId");

  const calculateTicketTotal = (ticket) => {
    let total = ticket.price || 0;
    if (ticket.hasExtraBaggage) total += EXTRA_BAGGAGE_PRICE;
    if (ticket.hasMealService) total += MEAL_SERVICE_PRICE;
    return total;
  };

  const formatDateTime = (dateTime, timezone) => {
    if (!dateTime || !timezone) return "";
    const date = new Date(dateTime);

    // Parse timezone string like "UTC+03:00" or "UTC-08:00"
    const match = timezone.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!match) return date.toLocaleString();

    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2]);
    const minutes = parseInt(match[3]);
    const offsetMinutes = sign * (hours * 60 + minutes);

    // Calculate local time with offset
    const utcTime = date.getTime();
    const localTime = new Date(utcTime + offsetMinutes * 60000);

    const timeStr = localTime.toLocaleString("en-US", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${timeStr} (${timezone})`;
  };

  useEffect(() => {
    if (userId) {
      loadUserTickets();
    }
  }, [userId]);

  const loadUserTickets = () => {
    setLoading(true);
    ticketApi
      .getUserTickets(userId)
      .then((data) => {
        setTickets(data || []);
      })
      .catch((err) => {
        console.error("Failed to load tickets:", err);
        setTickets([]);
      })
      .finally(() => setLoading(false));
  };

  const handleCancelTicket = (ticketId) => {
    ticketApi
      .cancelTicket(ticketId)
      .then(() => {
        loadUserTickets();
      })
      .catch((err) => {
        console.error("Failed to cancel ticket:", err);
      });
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const status = ticket.status?.toLowerCase();
    if (statusFilter === "active") {
      return status === "booked" || status === "pending";
    } else if (statusFilter === "all") {
      return true;
    } else {
      return status === statusFilter;
    }
  });

  return (
    <Box className="page-root myflights-wrapper">
      <Typography variant="h5" gutterBottom>
        My Flights
      </Typography>

      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={handleFilterChange}
        aria-label="ticket status filter"
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="active" aria-label="active tickets">
          Active
        </ToggleButton>
        <ToggleButton value="booked" aria-label="booked tickets">
          Booked
        </ToggleButton>
        <ToggleButton value="pending" aria-label="pending tickets">
          Pending
        </ToggleButton>
        <ToggleButton value="cancelled" aria-label="cancelled tickets">
          Cancelled
        </ToggleButton>
        <ToggleButton value="all" aria-label="all tickets">
          All
        </ToggleButton>
      </ToggleButtonGroup>

      {loading ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Loading tickets...
        </Typography>
      ) : filteredTickets.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          {statusFilter === "active"
            ? "You don't have any active tickets yet. Book a flight to see it here."
            : `No ${statusFilter} tickets found.`}
        </Typography>
      ) : (
        <div className="myflights-list">
          {filteredTickets.map((t) => (
            <Paper
              key={t.ticketId}
              elevation={0}
              className="card myflights-item"
            >
              <Box>
                <Typography sx={{ fontWeight: 500 }}>
                  {t.origin} → {t.destination}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--text-muted)", mb: 0.5 }}
                >
                  Departure: {formatDateTime(t.departureTime, t.originTimezone)}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                  Arrival:{" "}
                  {formatDateTime(t.arrivalTime, t.destinationTimezone)} • Seat:{" "}
                  {t.seatNumber}
                </Typography>

                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                  {t.hasExtraBaggage && (
                    <Chip
                      icon={<LuggageIcon />}
                      label="Extra Baggage"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {t.hasMealService && (
                    <Chip
                      icon={<RestaurantIcon />}
                      label="Meal"
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mt: 1.5, color: "var(--primary)" }}
                >
                  Total: {calculateTicketTotal(t)} TL
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: "var(--text-muted)", display: "block", mt: 0.5 }}
                >
                  Status: {t.status}
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <div className="myflights-status-chip">{t.status}</div>
                {(t.status === "booked" || t.status === "pending") && (
                  <div>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      sx={{ marginTop: "0.5rem" }}
                      onClick={() => handleCancelTicket(t.ticketId)}
                    >
                      Cancel ticket
                    </Button>
                  </div>
                )}
              </Box>
            </Paper>
          ))}
        </div>
      )}
    </Box>
  );
}
