package thy.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import thy.entity.Flight;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    @Query("""
        SELECT f
        FROM Flight f
        WHERE f.originAirport.iataCode = :origin
          AND f.destinationAirport.iataCode = :destination
          AND f.departureTime BETWEEN :start AND :end
        """)
    List<Flight> searchFlights(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
