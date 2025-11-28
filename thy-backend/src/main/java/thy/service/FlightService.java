package thy.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.dto.FlightSearchRequestDTO;
import thy.dto.FlightSearchResultDTO;
import thy.repository.FlightRepository;

@Service
@RequiredArgsConstructor
public class FlightService {
    
    private final FlightRepository flightRepository;

    // flight searching service
    public List<FlightSearchResultDTO> searchFlights(FlightSearchRequestDTO flightSearchRequestDTO) {
        
        LocalDateTime startOfDay = flightSearchRequestDTO.getDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return flightRepository.searchFlights(
            flightSearchRequestDTO.getOrigin(),
            flightSearchRequestDTO.getDestination(),
            startOfDay,
            endOfDay
            ).stream()
            .map(flight -> new FlightSearchResultDTO(
                flight.getFlightId(),
                flight.getOriginAirport().getIataCode(),
                flight.getDestinationAirport().getIataCode(),
                flight.getOriginAirport().getName(),
                flight.getDestinationAirport().getName(),
                flight.getDepartureTime(),
                flight.getArrivalTime(),
                flight.getPlane().getModelType(),
                flight.getPrice()
            )).toList();
    }
    
}
