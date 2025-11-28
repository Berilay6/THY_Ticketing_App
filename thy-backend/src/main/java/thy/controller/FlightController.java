package thy.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import thy.dto.FlightSearchRequestDTO;
import thy.dto.FlightSearchResultDTO;
import thy.service.FlightService;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Vite dev server
public class FlightController {

    private final FlightService flightService;

    @PostMapping("/search")
    public List<FlightSearchResultDTO> searchFlights(
            @RequestBody FlightSearchRequestDTO request
    ) {
        return flightService.searchFlights(request);
    }
}
