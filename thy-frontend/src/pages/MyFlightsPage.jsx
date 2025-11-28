import { Box, Typography, Paper, Button } from "@mui/material";
import { useBooking } from "../context/BookingContext";
import "../styles/myFlights.css";

export default function MyFlightsPage() {
  const { myFlights, cancelFlight } = useBooking();

  return (
    <Box className="page-root myflights-wrapper">
      <Typography variant="h5" gutterBottom>
        My Flights
      </Typography>

      {myFlights.length === 0 ? (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          You don’t have any tickets yet. Book a flight to see it here.
        </Typography>
      ) : (
        <div className="myflights-list">
          {myFlights.map((f) => (
            <Paper key={f.id} elevation={0} className="card myflights-item">
              <Box>
                <Typography sx={{ fontWeight: 500 }}>{f.code}</Typography>
                <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                  {f.route} • {f.date} • {f.time}
                </Typography>
                {f.purchasedAt && (
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--text-muted)" }}
                  >
                    Purchased at: {f.purchasedAt.slice(0, 10)}{" "}
                    {f.purchasedAt.slice(11, 16)}
                  </Typography>
                )}
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <div className="myflights-status-chip">Upcoming</div>
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  sx={{ marginTop: "0.25rem" }}
                  onClick={() => cancelFlight(f.id)}
                >
                  Cancel ticket
                </Button>
              </Box>
            </Paper>
          ))}
        </div>
      )}
    </Box>
  );
}
