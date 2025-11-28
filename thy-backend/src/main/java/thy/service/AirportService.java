package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.AirportRepository;

@Service
@RequiredArgsConstructor
public class AirportService {

    private final AirportRepository airportRepository;
}
