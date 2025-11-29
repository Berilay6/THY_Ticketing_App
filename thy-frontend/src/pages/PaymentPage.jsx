import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import { paymentApi } from "../api/apiClient";

export default function PaymentPage() {
  const { basket, completePayment } = useBooking();
  const navigate = useNavigate();
  const [cardHolder, setCardHolder] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const total = basket.reduce((sum, f) => sum + (f.price || 0), 0);
  const userId = localStorage.getItem("userId");

  const handlePay = () => {
    if (!userId || basket.length === 0) return;

    setLoading(true);
    const paymentReq = {
      userId,
      tickets: basket.map((f) => ({
        flightId: f.flightId,
        seatNumber: "1A",
      })),
      method: "card",
      cardInfo: {
        cardNum,
        holderName: cardHolder,
        expiryTime: expiry,
        cvv,
      },
    };

    paymentApi
      .createPayment(paymentReq)
      .then((result) => {
        if (result) {
          completePayment();
          navigate("/my-flights");
        }
      })
      .catch((err) => {
        console.error("Payment failed:", err);
      })
      .finally(() => setLoading(false));
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
              <TextField
                label="Card holder"
                fullWidth
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />
              <TextField
                label="Card number"
                fullWidth
                value={cardNum}
                onChange={(e) => setCardNum(e.target.value)}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Expiry (MM/YY)"
                  fullWidth
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
                <TextField
                  label="CVV"
                  fullWidth
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
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
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay and complete booking"}
            </Button>
          </Paper>
        </>
      )}
    </Box>
  );
}
