package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.FlightRepository;

@Service
@RequiredArgsConstructor
public class FlightService {
    
    public final FlightRepository flightRepository;
}
