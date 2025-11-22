package thy.repository;

import thy.entity.Seat;
import thy.entity.SeatId;
import thy.entity.Seat.SeatStatus;
import thy.entity.Seat.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, SeatId> {

    List<Seat> findByPlaneId(Long planeId);

    List<Seat> findByPlaneIdAndStatus(Long planeId, SeatStatus status);

    List<Seat> findByPlaneIdAndType(Long planeId, SeatType type);
}