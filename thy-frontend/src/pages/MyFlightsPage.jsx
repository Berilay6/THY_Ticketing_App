import { Box, Typography, Paper, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";
import { ticketApi } from "../api/apiClient";
import "../styles/myFlights.css";

export default function MyFlightsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

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
        setTickets(tickets.filter((t) => t.ticketId !== ticketId));
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
                  {t.departureTime} • Seat: {t.seatNumber}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "var(--text-muted)" }}
                >
                  Status: {t.status}
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <div className="myflights-status-chip">{t.status}</div>
                {t.status === "booked" && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    sx={{ marginTop: "0.25rem" }}
                    onClick={() => handleCancelTicket(t.ticketId)}
                  >
                    Cancel ticket
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </div>
      )}
    </Box>
  );
}
