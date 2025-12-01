package thy.repository;

import thy.entity.Ticket;
import thy.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Kullanıcıya göre ticket (via payment)
    List<Ticket> findByPaymentUserUserId(Long userId);

    // Kullanıcıya göre ticket (direct)
    List<Ticket> findByUserUserId(Long userId);

    // Belirli uçuşa ait tüm biletler 
    List<Ticket> findByFlightId(Long flightId);

    long countByFlightIdAndStatus(Long flightId, TicketStatus status);
}

