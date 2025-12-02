import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import { paymentApi, userApi } from "../api/apiClient";

export default function PaymentPage() {
  const { basket, completePayment } = useBooking();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [useExistingCard, setUseExistingCard] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [userMiles, setUserMiles] = useState(0);

  const [cardHolder, setCardHolder] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleCardNumChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 16) {
      setCardNum(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      if (value.length >= 2) {
        setExpiry(value.slice(0, 2) + "/" + value.slice(2));
      } else {
        setExpiry(value);
      }
    }
  };
  const [loading, setLoading] = useState(false);

  const EXTRA_BAGGAGE_PRICE = 150;
  const MEAL_SERVICE_PRICE = 75;

  const calculateItemTotal = (item) => {
    let itemTotal = item.price || 0;
    if (item.hasExtraBaggage) itemTotal += EXTRA_BAGGAGE_PRICE;
    if (item.hasMealService) itemTotal += MEAL_SERVICE_PRICE;
    return itemTotal;
  };

  const total = basket.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (userId) {
      // Load saved credit cards
      userApi
        .getCreditCards(userId)
        .then((cards) => {
          setSavedCards(cards || []);
        })
        .catch((err) => {
          console.error("Failed to load saved cards:", err);
        });

      // Load user miles
      if (userEmail) {
        userApi
          .getByEmailOrPhone(userEmail)
          .then((user) => {
            setUserMiles(user?.mile || 0);
          })
          .catch((err) => {
            console.error("Failed to load user miles:", err);
          });
      }
    }
  }, [userId, userEmail]);

  const handlePay = () => {
    if (!userId || basket.length === 0) return;

    setLoading(true);

    let paymentReq = {
      userId,
      tickets: basket.map((item) => ({
        flightId: item.flightId,
        seatNumber: item.seatNumber,
        hasExtraBaggage: item.hasExtraBaggage || false,
        hasMealService: item.hasMealService || false,
      })),
      method: paymentMethod,
    };

    // Add card info based on payment method and selection
    if (paymentMethod === "card") {
      if (useExistingCard && selectedCardId) {
        paymentReq.cardInfo = { cardId: selectedCardId };
      } else {
        paymentReq.cardInfo = {
          cardNum,
          holderName: cardHolder,
          expiryTime: expiry,
          cvv,
        };
      }
    }

    paymentApi
      .createPayment(paymentReq)
      .then((result) => {
        if (result) {
          completePayment();
          alert("Payment successful! Your tickets have been booked.");
          navigate("/my-flights");
        }
      })
      .catch((err) => {
        console.error("Payment failed:", err);
        const errorMessage =
          err.payload?.message ||
          err.message ||
          "Payment failed. Please try again.";
        alert(errorMessage);

        // If seat is already booked, clear basket and redirect to book flight
        if (
          errorMessage.includes("already booked") ||
          errorMessage.includes("Seat")
        ) {
          completePayment(); // This clears the basket
          alert(
            "Some seats are no longer available. Please select your seats again."
          );
          navigate("/book-flight");
        }
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
              Payment Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label="Credit/Debit Card"
                />
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label="Cash"
                />
                <FormControlLabel
                  value="mile"
                  control={<Radio />}
                  label={`Miles (Available: ${userMiles})`}
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          {paymentMethod === "card" && (
            <Paper elevation={0} className="card" sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Card Information
              </Typography>

              {savedCards.length > 0 && (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <FormControl fullWidth>
                    <RadioGroup
                      value={useExistingCard ? "existing" : "new"}
                      onChange={(e) =>
                        setUseExistingCard(e.target.value === "existing")
                      }
                    >
                      <FormControlLabel
                        value="existing"
                        control={<Radio />}
                        label="Use saved card"
                      />
                      {useExistingCard && (
                        <FormControl fullWidth sx={{ ml: 4, mt: 1 }}>
                          <InputLabel>Select Card</InputLabel>
                          <Select
                            value={selectedCardId}
                            onChange={(e) => setSelectedCardId(e.target.value)}
                            label="Select Card"
                          >
                            {savedCards.map((card) => (
                              <MenuItem key={card.cardId} value={card.cardId}>
                                **** **** **** {card.cardNumLast4digit} -{" "}
                                {card.holderName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      <FormControlLabel
                        value="new"
                        control={<Radio />}
                        label="Use new card"
                      />
                    </RadioGroup>
                  </FormControl>
                </Stack>
              )}

              {!useExistingCard && (
                <Stack spacing={2}>
                  <TextField
                    label="Card holder"
                    fullWidth
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                  <TextField
                    label="Card number"
                    fullWidth
                    value={cardNum}
                    onChange={handleCardNumChange}
                    slotProps={{
                      htmlInput: { maxLength: 16, inputMode: "numeric" },
                    }}
                    helperText="16 digits"
                    required
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Expiry (MM/YY)"
                      fullWidth
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="12/25"
                      slotProps={{
                        htmlInput: { maxLength: 5, inputMode: "numeric" },
                      }}
                      required
                    />
                    <TextField
                      label="CVV"
                      fullWidth
                      value={cvv}
                      onChange={handleCvvChange}
                      slotProps={{
                        htmlInput: { maxLength: 3, inputMode: "numeric" },
                      }}
                      helperText="3 digits"
                      required
                    />
                  </Stack>
                </Stack>
              )}
            </Paper>
          )}

          {paymentMethod === "cash" && (
            <Paper elevation={0} className="card" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                You have selected cash payment. Please pay at the airport
                counter before your flight.
              </Typography>
            </Paper>
          )}

          {paymentMethod === "mile" && (
            <Paper elevation={0} className="card" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total miles required: <strong>{total}</strong>
                <br />
                {userMiles >= total
                  ? "You have enough miles for this purchase."
                  : `You need ${total - userMiles} more miles.`}
              </Typography>
            </Paper>
          )}

          <Paper elevation={0} className="card" style={{ marginTop: "1rem" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Order Summary
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {basket.length} seat(s) • Total:{" "}
              <strong>
                {total.toFixed(2)} {paymentMethod === "mile" ? "Miles" : "TL"}
              </strong>
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePay}
              disabled={
                loading ||
                (paymentMethod === "card" &&
                  !useExistingCard &&
                  (!cardHolder || !cardNum || !expiry || !cvv)) ||
                (paymentMethod === "card" &&
                  useExistingCard &&
                  !selectedCardId) ||
                (paymentMethod === "mile" && userMiles < total)
              }
            >
              {loading
                ? "Processing..."
                : `Pay ${total.toFixed(2)} ${
                    paymentMethod === "mile" ? "Miles" : "TL"
                  }`}
            </Button>
          </Paper>
        </>
      )}
    </Box>
  );
}
