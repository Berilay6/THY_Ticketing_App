import { Box, Typography, Paper, Button, Chip, Stack } from "@mui/material";
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
  const userId = localStorage.getItem("userId");

  const calculateTicketTotal = (ticket) => {
    let total = ticket.price || 0;
    if (ticket.hasExtraBaggage) total += EXTRA_BAGGAGE_PRICE;
    if (ticket.hasMealService) total += MEAL_SERVICE_PRICE;
    return total;
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

  return (
    <Box className="page-root myflights-wrapper">
      <Typography variant="h5" gutterBottom>
        My Flights
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Loading tickets...
        </Typography>
      ) : tickets.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          You don’t have any tickets yet. Book a flight to see it here.
        </Typography>
      ) : (
        <div className="myflights-list">
          {tickets.map((t) => (
            <Paper
              key={t.ticketId}
              elevation={0}
              className="card myflights-item"
            >
              <Box>
                <Typography sx={{ fontWeight: 500 }}>
                  {t.origin} → {t.destination}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                  {t.departureTime?.replace("T", " ")} • Seat: {t.seatNumber}
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
