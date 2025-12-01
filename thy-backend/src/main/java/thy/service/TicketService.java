package thy.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import thy.dto.TicketSummaryDTO;
import thy.entity.Ticket;
import thy.entity.Payment;
import thy.entity.FlightSeat;
import thy.entity.User;
import thy.repository.TicketRepository;
import thy.repository.PaymentRepository;
import thy.repository.FlightSeatRepository;
import thy.repository.UserRepository;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    
    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;
    private final FlightSeatRepository flightSeatRepository;
    private final UserRepository userRepository;

    public List<TicketSummaryDTO> getUserTickets(Long userId) {
        return ticketRepository.findByUserUserId(userId).stream()
                .map(this::convertToSummary)
                .toList();
    }

    @Transactional
    public TicketSummaryDTO cancelTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        // Check if ticket is already cancelled
        if (ticket.getStatus() == Ticket.TicketStatus.cancelled) {
            throw new RuntimeException("Ticket is already cancelled");
        }
        
        // Check if ticket can be cancelled (booked or pending)
        if (ticket.getStatus() != Ticket.TicketStatus.booked && 
            ticket.getStatus() != Ticket.TicketStatus.pending) {
            throw new RuntimeException("Ticket cannot be cancelled");
        }
        
        // Get the FlightSeat and calculate refund amount
        FlightSeat flightSeat = flightSeatRepository.findByFlightIdAndSeatNumber(
            ticket.getFlightId(), 
            ticket.getSeatNumber()
        ).orElseThrow(() -> new RuntimeException("FlightSeat not found"));
        
        BigDecimal refundAmount = flightSeat.getPrice();
        
        // Mark seat as available again
        flightSeat.setAvailability(FlightSeat.Availability.available);
        flightSeatRepository.save(flightSeat);
        
        // Update ticket status to cancelled
        ticket.setStatus(Ticket.TicketStatus.cancelled);
        ticketRepository.save(ticket);
        
        // If user paid with miles, add them back
        if (ticket.getPayment().getMethod() == Payment.PaymentMethod.mile) {
            User user = ticket.getUser();
            user.setMile(
                (user.getMile() != null ? user.getMile() : 0) + refundAmount.intValue()
            );
            userRepository.save(user);
        }
        
        // Create refund payment record
        Payment refundPayment = new Payment();
        refundPayment.setUser(ticket.getUser());
        refundPayment.setMethod(ticket.getPayment().getMethod());
        refundPayment.setTotalAmount(refundAmount.negate()); // Negative amount for refund
        refundPayment.setStatus(Payment.PaymentStatus.refunded);
        refundPayment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(refundPayment);
        
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
