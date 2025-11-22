package thy.repository;

import thy.entity.FlightSeat;
import thy.entity.FlightSeatId;
import thy.entity.FlightSeat.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FlightSeatRepository extends JpaRepository<FlightSeat, FlightSeatId> {

    List<FlightSeat> findByFlightId(Long flightId);

    List<FlightSeat> findByFlightIdAndAvailability(Long flightId, Availability availability);

    Optional<FlightSeat> findByFlightIdAndSeatNumber(Long flightId, String seatNumber);

    long countByFlightIdAndAvailability(Long flightId, Availability availability);
}
