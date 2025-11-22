package thy.repository;

import thy.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface AirportRepository extends JpaRepository<Airport, Long> {

    Optional<Airport> findByIataCode(String iataCode);

    List<Airport> findByCityIgnoreCase(String city);
    
    List<Airport> findByCountryIgnoreCase(String country);
}
