import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const { basket, completePayment } = useBooking();
  const navigate = useNavigate();

  const total = basket.reduce((sum, f) => sum + (f.price || 0), 0);

  const handlePay = () => {
    completePayment(); // basket → myFlights + payments
    navigate("/my-flights"); // sonra My Flights’e
  };

  return (
    <Box className="page-root" style={{ maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Payment
      </Typography>

      {basket.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Your basket is empty. Please add a flight first.
        </Typography>
      ) : (
        <>
          <Paper elevation={0} className="card">
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Card information
            </Typography>
            <Stack spacing={2}>
              <TextField label="Card holder" fullWidth />
              <TextField label="Card number" fullWidth />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Expiry (MM/YY)" fullWidth />
                <TextField label="CVV" fullWidth />
              </Stack>
            </Stack>
          </Paper>

          <Paper elevation={0} className="card" style={{ marginTop: "1rem" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Order summary
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {basket.length} flight(s) • Total: <strong>{total} TL</strong>
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePay}
            >
              Pay and complete booking
            </Button>
          </Paper>
        </>
      )}
    </Box>
  );
}
