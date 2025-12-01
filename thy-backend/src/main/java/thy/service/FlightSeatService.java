package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.dto.SeatDTO;
import thy.entity.FlightSeat;
import thy.entity.Seat;
import thy.repository.FlightSeatRepository;
import thy.repository.SeatRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightSeatService {
    
    private final FlightSeatRepository flightSeatRepository;
    private final SeatRepository seatRepository;

    public List<SeatDTO> getFlightSeats(Long flightId) {
        try {
            List<FlightSeat> flightSeats = flightSeatRepository.findByFlightId(flightId);
            if (flightSeats == null || flightSeats.isEmpty()) {
                return Collections.emptyList();
            }

            // Get plane ID from the first FlightSeat's Flight
            Long planeId = null;
            for (FlightSeat fs : flightSeats) {
                if (fs.getFlight() != null && fs.getFlight().getPlane() != null) {
                    planeId = fs.getFlight().getPlane().getPlaneId();
                    break;
                }
            }

            // Get seat types from Seat table
            Map<String, Seat> seatMap = Collections.emptyMap();
            if (planeId != null) {
                List<Seat> seats = seatRepository.findByPlaneId(planeId);
                seatMap = seats.stream()
                    .collect(Collectors.toMap(Seat::getSeatNumber, s -> s, (a, b) -> a));
            }

            // Build result DTOs
            List<SeatDTO> result = new ArrayList<>();
            for (FlightSeat fs : flightSeats) {
                SeatDTO dto = new SeatDTO();
                dto.setSeatNumber(fs.getSeatNumber());
                
                Seat seat = seatMap.get(fs.getSeatNumber());
                dto.setType(seat != null && seat.getType() != null ? seat.getType().name() : "economy");
                dto.setStatus(seat != null && seat.getStatus() != null ? seat.getStatus().name() : "active");
                dto.setAvailability(fs.getAvailability() != null ? fs.getAvailability().name() : "available");
                dto.setPrice(fs.getPrice());
                
                result.add(dto);
            }

            return result;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error loading flight seats: " + e.getMessage(), e);
        }
    }

    public SeatDTO getFlightSeatStatus(Long flightId, String seatNumber) {
        Optional<FlightSeat> maybe = flightSeatRepository.findByFlightIdAndSeatNumber(flightId, seatNumber);
        if (maybe.isEmpty()) return null;
        FlightSeat fs = maybe.get();

        SeatDTO dto = new SeatDTO();
        dto.setSeatNumber(fs.getSeatNumber());

        Long planeId = null;
        if (fs.getFlight() != null && fs.getFlight().getPlane() != null) {
            planeId = fs.getFlight().getPlane().getPlaneId();
        }

        Seat seat = null;
        if (planeId != null) {
            List<Seat> seats = seatRepository.findByPlaneId(planeId);
            for (Seat s : seats) {
                if (s.getSeatNumber() != null && s.getSeatNumber().equals(fs.getSeatNumber())) {
                    seat = s;
                    break;
                }
            }
        }

        dto.setType(seat != null && seat.getType() != null ? seat.getType().name() : null);
        dto.setStatus(seat != null && seat.getStatus() != null ? seat.getStatus().name() : null);
        dto.setAvailability(fs.getAvailability() != null ? fs.getAvailability().name() : null);
        dto.setPrice(fs.getPrice());

        return dto;
    }
}
