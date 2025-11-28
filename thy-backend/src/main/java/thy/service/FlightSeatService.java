package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.FlightSeatRepository;

@Service
@RequiredArgsConstructor
public class FlightSeatService {
    
    public final FlightSeatRepository flightSeatRepository;
}
