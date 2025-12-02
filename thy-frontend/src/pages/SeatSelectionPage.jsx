import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { flightApi } from "../api/apiClient";
import { useBooking } from "../context/BookingContext";

export default function SeatSelectionPage() {
  const { flightId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [flightInfo, setFlightInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasExtraBaggage, setHasExtraBaggage] = useState(false);
  const [hasMealService, setHasMealService] = useState(false);
  const { addToBasket } = useBooking();
  const navigate = useNavigate();

  // Extra service pricing
  const EXTRA_BAGGAGE_PRICE = 150;
  const MEAL_SERVICE_PRICE = 75;

  useEffect(() => {
    if (flightId) {
      loadSeats();
    }
  }, [flightId]);

  const loadSeats = () => {
    setLoading(true);
    console.log("Loading seats for flightId:", flightId);
    flightApi
      .getSeats(flightId)
      .then((data) => {
        console.log("Seats response:", data);
        setSeats(data || []);
      })
      .catch((err) => {
        console.error("Failed to load seats:", err);
        console.error("Error details:", err.status, err.payload);
        setSeats([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSeatSelect = (seat) => {
    if (seat.availability === "available") {
      setSelectedSeat(seat);
    }
  };

  const handleAddToBasket = () => {
    if (!selectedSeat || !flightId) return;

    const basketItem = {
      flightId: parseInt(flightId),
      seatNumber: selectedSeat.seatNumber,
      price: selectedSeat.price,
      type: selectedSeat.type,
      hasExtraBaggage: hasExtraBaggage,
      hasMealService: hasMealService,
    };

    const added = addToBasket(basketItem);
    if (added) {
      navigate("/basket");
    } else {
      alert("This seat is already in your basket!");
    }
  };

  const getSeatColor = (seat) => {
    if (seat.availability === "sold") return "#e57373";
    if (seat.availability === "reserved") return "#ffb74d";
    if (selectedSeat?.seatNumber === seat.seatNumber) return "#4caf50";
    return "#90caf9";
  };

  return (
    <Box className="page-root" sx={{ maxWidth: 900 }}>
      <Typography variant="h5" gutterBottom>
        Select Your Seat
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Loading seats...
        </Typography>
      ) : seats.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          No seats available for this flight.
        </Typography>
      ) : (
        <>
          <Paper elevation={0} className="card" sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Chip
                label="Available"
                sx={{ bgcolor: "#90caf9", color: "#fff" }}
              />
              <Chip
                label="Reserved"
                sx={{ bgcolor: "#ffb74d", color: "#fff" }}
              />
              <Chip label="Sold" sx={{ bgcolor: "#e57373", color: "#fff" }} />
              <Chip
                label="Selected"
                sx={{ bgcolor: "#4caf50", color: "#fff" }}
              />
            </Box>
          </Paper>

          <Paper elevation={0} className="card" sx={{ mb: 2 }}>
            <Grid container spacing={1}>
              {seats.map((seat) => (
                <Grid item xs={2} sm={1.5} key={seat.seatNumber}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={seat.availability !== "available"}
                    onClick={() => handleSeatSelect(seat)}
                    sx={{
                      minWidth: 0,
                      bgcolor: getSeatColor(seat),
                      color: "#fff",
                      "&:hover": {
                        bgcolor:
                          seat.availability === "available"
                            ? "#4caf50"
                            : getSeatColor(seat),
                      },
                      "&.Mui-disabled": {
                        bgcolor: getSeatColor(seat),
                        color: "#fff",
                        opacity: 0.7,
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                      {seat.seatNumber}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {selectedSeat && (
            <Paper elevation={0} className="card" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Seat
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Seat:</strong> {selectedSeat.seatNumber} •{" "}
                <strong>Type:</strong> {selectedSeat.type}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Base Price:</strong> {selectedSeat.price} TL
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Extra Services
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasExtraBaggage}
                    onChange={(e) => setHasExtraBaggage(e.target.checked)}
                  />
                }
                label={`Extra Baggage (+${EXTRA_BAGGAGE_PRICE} TL)`}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasMealService}
                    onChange={(e) => setHasMealService(e.target.checked)}
                  />
                }
                label={`Meal Service (+${MEAL_SERVICE_PRICE} TL)`}
              />

              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                <strong>Total Price:</strong>{" "}
                {selectedSeat.price +
                  (hasExtraBaggage ? EXTRA_BAGGAGE_PRICE : 0) +
                  (hasMealService ? MEAL_SERVICE_PRICE : 0)}{" "}
                TL
              </Typography>

              <Button variant="contained" fullWidth onClick={handleAddToBasket}>
                Add to Basket
              </Button>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
