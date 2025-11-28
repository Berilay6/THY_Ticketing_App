package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.repository.SeatRepository;

@Service
@RequiredArgsConstructor
public class SeatService {
    
    public final SeatRepository seatRepository;
}
