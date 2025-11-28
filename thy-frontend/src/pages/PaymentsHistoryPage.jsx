import { Box, Typography, Paper } from "@mui/material";
import { useBooking } from "../context/BookingContext";

export default function PaymentsHistoryPage() {
  const { payments } = useBooking();

  return (
    <Box className="page-root">
      <Typography variant="h5" gutterBottom>
        Payments
      </Typography>

      {payments.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          You don’t have any payments yet.
        </Typography>
      ) : (
        payments.map((p) => (
          <Paper key={p.id} elevation={0} className="card">
            <Typography sx={{ fontWeight: 500 }}>
              {p.amount} TL • {p.date.slice(0, 10)} {p.date.slice(11, 16)}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
              Flights: {p.flights}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
}
