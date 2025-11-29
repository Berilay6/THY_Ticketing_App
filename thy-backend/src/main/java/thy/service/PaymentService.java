package thy.service;

import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import thy.dto.PaymentRequestDTO;
import thy.dto.PaymentResultDTO;
import thy.dto.TicketSummaryDTO;
import thy.entity.Payment;
import thy.repository.PaymentRepository;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;

    // User's payment history retrieval service
    public List<PaymentResultDTO> userPaymentHistory(Long userId) {
        
        return paymentRepository.findByUserId(userId).stream()
            .map(this::convertToPaymentResultDTO).toList();
    }

    @Transactional
    public List<PaymentResultDTO> createPayment(PaymentRequestDTO paymentRequestDTO) {
        // Payment creation logic would go here
        // For now, we will return an empty list as a placeholder
        return List.of();
    }
    

    private PaymentResultDTO convertToPaymentResultDTO(Payment payment) {
        return new PaymentResultDTO(
            payment.getUser().getUserId(),
            payment.getTickets().stream()
                .map(ticket -> new TicketSummaryDTO(
                    ticket.getTicketId(),
                    ticket.getFlight().getFlightId(),
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
            null,
            null
            // is cardNum and holderName neccessary ?
        );
    }
}
