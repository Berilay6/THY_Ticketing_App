import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LuggageIcon from "@mui/icons-material/Luggage";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import "../styles/basket.css";

export default function BasketPage() {
  const { basket, removeFromBasket, clearBasket } = useBooking();
  const navigate = useNavigate();

  const EXTRA_BAGGAGE_PRICE = 150;
  const MEAL_SERVICE_PRICE = 75;

  const calculateItemTotal = (item) => {
    let itemTotal = item.price || 0;
    if (item.hasExtraBaggage) itemTotal += EXTRA_BAGGAGE_PRICE;
    if (item.hasMealService) itemTotal += MEAL_SERVICE_PRICE;
    return itemTotal;
  };

  const total = basket.reduce((sum, item) => sum + calculateItemTotal(item), 0);

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
            {basket.map((item, index) => (
              <Paper
                key={`${item.flightId}-${item.seatNumber}-${index}`}
                elevation={0}
                className="card basket-item"
              >
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    Flight {item.flightId} • Seat {item.seatNumber}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-muted)" }}
                  >
                    Type: {item.type}
                  </Typography>

                  <Stack direction="row" spacing={0.5} sx={{ mt: 1, mb: 1 }}>
                    {item.hasExtraBaggage && (
                      <Chip
                        icon={<LuggageIcon />}
                        label="Extra Baggage"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {item.hasMealService && (
                      <Chip
                        icon={<RestaurantIcon />}
                        label="Meal Service"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Typography variant="body2" sx={{ marginTop: "0.25rem" }}>
                    {calculateItemTotal(item)} TL
                  </Typography>
                </Box>
                <IconButton
                  onClick={() =>
                    removeFromBasket(item.flightId ?? item.id, item.seatNumber)
                  }
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
