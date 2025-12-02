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
              <Typography sx={{ fontWeight: 500, mb: 1 }}>
                Payment • {p.method}
              </Typography>

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
                sx={{ fontWeight: 600, color: "var(--primary)", mt: 1 }}
              >
                Total: {calculatePaymentTotal(p)} TL
              </Typography>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}
