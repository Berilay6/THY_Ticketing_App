package thy.service;

import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import thy.dto.PaymentRequestDTO;
import thy.dto.PaymentResultDTO;
import thy.dto.TicketSummaryDTO;
import thy.entity.Payment;
import thy.entity.Ticket;
import thy.entity.Flight;
import thy.entity.User;
import thy.repository.PaymentRepository;
import thy.repository.TicketRepository;
import thy.repository.FlightRepository;
import thy.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;

    // User's payment history retrieval service
    public List<PaymentResultDTO> userPaymentHistory(Long userId) {
        
        return paymentRepository.findByUserUserId(userId).stream()
            .map(this::convertToPaymentResultDTO).toList();
    }

    @Transactional
    public List<PaymentResultDTO> createPayment(PaymentRequestDTO paymentRequestDTO) {
        User user = userRepository.findById(paymentRequestDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate total from flights
        BigDecimal total = BigDecimal.ZERO;
        List<Ticket> toCreate = new ArrayList<>();
        for (TicketSummaryDTO t : paymentRequestDTO.getTickets()) {
            Flight flight = flightRepository.findById(t.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found: " + t.getFlightId()));
            if (flight.getPrice() != null) {
                total = total.add(flight.getPrice());
            }
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMethod(Payment.PaymentMethod.valueOf(paymentRequestDTO.getMethod()));
        payment.setTotalAmount(total);
        payment.setCurrency("TRY");
        payment.setStatus(Payment.PaymentStatus.paid);
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Create tickets linked to payment
        for (TicketSummaryDTO t : paymentRequestDTO.getTickets()) {
            Ticket ticket = new Ticket();
            ticket.setPayment(saved);
            ticket.setIssueTime(LocalDateTime.now());
            ticket.setFlightId(t.getFlightId());
            ticket.setSeatNumber(t.getSeatNumber() != null ? t.getSeatNumber() : "1A");
            ticket.setStatus(Ticket.TicketStatus.booked);
            ticket.setHasExtraBaggage(Boolean.TRUE.equals(t.getHasExtraBaggage()));
            ticket.setHasMealService(Boolean.TRUE.equals(t.getHasMealService()));
            toCreate.add(ticket);
        }

        ticketRepository.saveAll(toCreate);

        // Return latest payments for the user (including this one)
        return userPaymentHistory(user.getUserId());
    }
    

    private PaymentResultDTO convertToPaymentResultDTO(Payment payment) {
        return new PaymentResultDTO(
            payment.getUser().getUserId(),
            payment.getTickets().stream()
                .map(ticket -> new TicketSummaryDTO(
                    ticket.getTicketId(),
                    ticket.getFlightId(),
                    ticket.getFlight().getOriginAirport().getIataCode(),
                    ticket.getFlight().getDestinationAirport().getIataCode(),
                    ticket.getFlight().getDepartureTime(),
                    ticket.getFlight().getArrivalTime(),
                    ticket.getSeatNumber(),
                    ticket.getStatus().name(),
                    ticket.getHasExtraBaggage(),
                    ticket.getHasMealService()
                )).toList(),
            payment.getMethod().name(),
            payment.getTotalAmount(),
            payment.getCurrency(),
            null,
            null
        );
    }
}
