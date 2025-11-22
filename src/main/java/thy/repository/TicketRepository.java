package thy.repository;

import thy.entity.Ticket;
import thy.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Kullanıcıya göre ticket 
    List<Ticket> findByPaymentUserUserId(Long userId);

    // Belirli uçuşa ait tüm biletler 
    List<Ticket> findByFlightId(Long flightId);

    long countByFlightIdAndStatus(Long flightId, TicketStatus status);
}

