package thy.repository;

import thy.entity.Ticket;
import thy.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Kullanıcıya göre ticket (via payment)
    List<Ticket> findByPaymentUserUserId(Long userId);

    // Kullanıcıya göre ticket (direct with joins)
    @Query("SELECT t FROM Ticket t " +
           "LEFT JOIN FETCH t.flight f " +
           "LEFT JOIN FETCH f.originAirport " +
           "LEFT JOIN FETCH f.destinationAirport " +
           "LEFT JOIN FETCH t.payment " +
           "LEFT JOIN FETCH t.user " +
           "WHERE t.user.userId = :userId " +
           "ORDER BY t.issueTime DESC")
    List<Ticket> findByUserUserId(@Param("userId") Long userId);

    // Find ticket with all relationships
    @Query("SELECT t FROM Ticket t " +
           "LEFT JOIN FETCH t.flight f " +
           "LEFT JOIN FETCH f.originAirport " +
           "LEFT JOIN FETCH f.destinationAirport " +
           "LEFT JOIN FETCH t.payment p " +
           "LEFT JOIN FETCH t.user " +
           "WHERE t.ticketId = :ticketId")
    Optional<Ticket> findByIdWithDetails(@Param("ticketId") Long ticketId);

    // Belirli uçuşa ait tüm biletler 
    List<Ticket> findByFlightId(Long flightId);

    long countByFlightIdAndStatus(Long flightId, TicketStatus status);
}

