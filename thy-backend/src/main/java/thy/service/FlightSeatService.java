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
        List<FlightSeat> flightSeats = flightSeatRepository.findByFlightId(flightId);
        if (flightSeats == null || flightSeats.isEmpty()) return Collections.emptyList();

        Long planeId = null;
        if (flightSeats.get(0).getFlight() != null && flightSeats.get(0).getFlight().getPlane() != null) {
            planeId = flightSeats.get(0).getFlight().getPlane().getPlaneId();
        }

        List<Seat> seats = planeId != null ? seatRepository.findByPlaneId(planeId) : Collections.emptyList();
        Map<String, Seat> seatMap = seats.stream().collect(Collectors.toMap(Seat::getSeatNumber, s -> s));

        List<SeatDTO> result = new ArrayList<>();
        for (FlightSeat fs : flightSeats) {
            SeatDTO dto = new SeatDTO();
            dto.setSeatNumber(fs.getSeatNumber());
            Seat seat = seatMap.get(fs.getSeatNumber());
            dto.setType(seat != null && seat.getType() != null ? seat.getType().name() : null);
            dto.setStatus(seat != null && seat.getStatus() != null ? seat.getStatus().name() : null);
            dto.setAvailability(fs.getAvailability() != null ? fs.getAvailability().name() : null);
            if (fs.getFlight() != null && fs.getFlight().getPrice() != null) {
                dto.setPrice(fs.getFlight().getPrice().doubleValue());
            } else {
                dto.setPrice(null);
            }
            result.add(dto);
        }

        return result;
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
        if (fs.getFlight() != null && fs.getFlight().getPrice() != null) dto.setPrice(fs.getFlight().getPrice().doubleValue());
        else dto.setPrice(null);

        return dto;
    }
}
