package thy.repository;

import thy.entity.Plane;
import thy.entity.Plane.PlaneStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaneRepository extends JpaRepository<Plane, Long> {

	Optional<Plane> findByPlaneId(Long planeId);
	
    List<Plane> findByStatus(PlaneStatus status);
    
    List<Plane> findByAirportAirportId(Long airportId);
}
