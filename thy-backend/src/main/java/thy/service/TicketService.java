package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.dto.TicketSummaryDTO;
import thy.entity.Ticket;
import thy.repository.TicketRepository;

import jakarta.transaction.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    
    private final TicketRepository ticketRepository;

    public List<TicketSummaryDTO> getUserTickets(Long userId) {
        return ticketRepository.findByUserUserId(userId).stream()
                .map(this::convertToSummary)
                .toList();
    }

    @Transactional
    public TicketSummaryDTO cancelTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) return null;
        ticket.setStatus(Ticket.TicketStatus.cancelled);
        ticketRepository.save(ticket);
        return convertToSummary(ticket);
    }

    @Transactional
    public TicketSummaryDTO checkInTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) return null;
        ticket.setStatus(Ticket.TicketStatus.checked_in);
        ticketRepository.save(ticket);
        return convertToSummary(ticket);
    }

    private TicketSummaryDTO convertToSummary(Ticket t) {
        return new TicketSummaryDTO(
                t.getTicketId(),
                t.getFlightId(),
                t.getFlight() != null && t.getFlight().getOriginAirport() != null ? t.getFlight().getOriginAirport().getIataCode() : null,
                t.getFlight() != null && t.getFlight().getDestinationAirport() != null ? t.getFlight().getDestinationAirport().getIataCode() : null,
                t.getFlight() != null ? t.getFlight().getDepartureTime() : null,
                t.getFlight() != null ? t.getFlight().getArrivalTime() : null,
                t.getSeatNumber(),
                t.getStatus() != null ? t.getStatus().name() : null,
                t.getHasExtraBaggage(),
                t.getHasMealService()
        );
    }
}
