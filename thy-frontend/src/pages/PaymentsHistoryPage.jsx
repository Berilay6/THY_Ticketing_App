import { Box, Typography, Paper, Chip, Stack } from "@mui/material";
import LuggageIcon from "@mui/icons-material/Luggage";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useState, useEffect } from "react";
import { paymentApi } from "../api/apiClient";

const EXTRA_BAGGAGE_PRICE = 150;
const MEAL_SERVICE_PRICE = 75;

export default function PaymentsHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const calculatePaymentTotal = (payment) => {
    if (!payment.tickets || payment.tickets.length === 0) {
      return payment.totalAmount || 0;
    }
    return payment.tickets.reduce(
      (sum, ticket) => sum + calculateTicketTotal(ticket),
      0
    );
  };

  useEffect(() => {
    if (userId) {
      loadPayments();
    }
  }, [userId]);

  const loadPayments = () => {
    setLoading(true);
    paymentApi
      .getUserPayments(userId)
      .then((data) => {
        setPayments(data || []);
      })
      .catch((err) => {
        console.error("Failed to load payments:", err);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box className="page-root">
      <Typography variant="h5" gutterBottom>
        Payments
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Loading payments...
        </Typography>
      ) : payments.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          You don’t have any payments yet.
        </Typography>
      ) : (
        payments.map((p) => (
          <Paper key={p.paymentId} elevation={0} className="card">
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>
                  {p.status === "refunded" ? "Refund" : "Payment"} • {p.method}
                </Typography>
                {p.status === "refunded" && (
                  <Chip label="Refunded" size="small" color="warning" />
                )}
              </Stack>

              {p.tickets && p.tickets.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {p.tickets.map((ticket, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb: 0.5,
                        pl: 1,
                        borderLeft: "2px solid var(--border)",
                      }}
                    >
                      <Typography variant="body2">
                        {ticket.origin} → {ticket.destination} •{" "}
                        {ticket.seatNumber}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "var(--text-muted)",
                          display: "block",
                          mt: 0.3,
                        }}
                      >
                        {formatDateTime(
                          ticket.departureTime,
                          ticket.originTimezone
                        )}{" "}
                        →{" "}
                        {formatDateTime(
                          ticket.arrivalTime,
                          ticket.destinationTimezone
                        )}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {ticket.hasExtraBaggage && (
                          <Chip
                            icon={<LuggageIcon />}
                            label="+150 TL"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {ticket.hasMealService && (
                          <Chip
                            icon={<RestaurantIcon />}
                            label="+75 TL"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color:
                    p.status === "refunded" ? "var(--error)" : "var(--primary)",
                  mt: 1,
                }}
              >
                {p.status === "refunded" ? "Refund: " : "Total: "}
                {p.status === "refunded" && p.totalAmount < 0
                  ? Math.abs(calculatePaymentTotal(p))
                  : calculatePaymentTotal(p)}{" "}
                TL
              </Typography>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}
