import { Box, Typography, Paper, IconButton, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import "../styles/basket.css";

export default function BasketPage() {
  const { basket, removeFromBasket, clearBasket } = useBooking();
  const navigate = useNavigate();

  const total = basket.reduce((sum, f) => sum + (f.price || 0), 0);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className="page-root basket-wrapper">
      <Typography variant="h5" gutterBottom>
        Basket
      </Typography>

      {basket.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Your basket is empty. Add a flight from “Book Flight”.
        </Typography>
      ) : (
        <>
          <div className="basket-list">
            {basket.map((f) => (
              <Paper
                key={f.flightId ?? f.id}
                elevation={0}
                className="card basket-item"
              >
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    {f.origin} → {f.destination}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-muted)" }}
                  >
                    {formatDateTime(f.departureTime)}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: "0.25rem" }}>
                    {f.price} TL
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => removeFromBasket(f.flightId ?? f.id)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Paper>
            ))}
          </div>

          <Paper elevation={0} className="card basket-summary">
            <Typography variant="subtitle1" sx={{ marginBottom: "0.5rem" }}>
              Summary
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: "1rem" }}>
              Total: <strong>{total} TL</strong>
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/payment")}
              >
                Go to payment
              </Button>
              <Button variant="text" color="error" onClick={clearBasket}>
                Clear
              </Button>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
