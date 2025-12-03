package thy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thy.dto.FlightSearchRequestDTO;
import thy.dto.FlightSearchResultDTO;
import thy.dto.SeatDTO;
import thy.service.FlightSeatService;
import thy.service.FlightService;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;
    private final FlightSeatService flightSeatService;

    @PostMapping("/search")
    public ResponseEntity<List<FlightSearchResultDTO>> searchFlights(@RequestBody FlightSearchRequestDTO req) {
        List<FlightSearchResultDTO> flights = flightService.searchFlights(req);
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/{flightId}/seats")
    public ResponseEntity<List<SeatDTO>> getFlightSeats(@PathVariable Long flightId) {
        List<SeatDTO> seats = flightSeatService.getFlightSeats(flightId);
        return ResponseEntity.ok(seats);
    }

    @GetMapping("/{flightId}/seats/{seatNumber}")
    public ResponseEntity<SeatDTO> getSeatStatus(@PathVariable Long flightId, @PathVariable String seatNumber) {
        SeatDTO seat = flightSeatService.getFlightSeatStatus(flightId, seatNumber);
        if (seat == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(seat);
    }

    @GetMapping("/{flightId}")
    public ResponseEntity<thy.dto.FlightDetailDTO> getFlightDetail(@PathVariable Long flightId) {
        try {
            thy.dto.FlightDetailDTO flight = flightService.getFlightDetail(flightId);
            return ResponseEntity.ok(flight);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
