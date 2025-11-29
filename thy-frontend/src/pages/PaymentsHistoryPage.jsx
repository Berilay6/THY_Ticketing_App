import { Box, Typography, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { paymentApi } from "../api/apiClient";

export default function PaymentsHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

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
            <Typography sx={{ fontWeight: 500 }}>
              {p.totalAmount} {p.currency} • {p.method}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
              Tickets: {p.tickets?.length || 0}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
}
