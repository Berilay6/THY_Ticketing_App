package thy.repository;

import thy.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    // kalkış-varış havalimanı ID'si ile
    List<Flight> findByOriginAirportAirportIdAndDestinationAirportAirportId(
            Long originAirportId,
            Long destinationAirportId
    );

    // Belirli bir zaman aralığında uçuşlar
    List<Flight> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);

    // IATA + tarih ile uçuş arama
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
            @Param("date") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}