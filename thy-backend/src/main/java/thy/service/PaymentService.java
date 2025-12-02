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
import thy.entity.FlightSeat;
import thy.entity.User;
import thy.entity.CreditCard;
import thy.entity.Seat;
import thy.repository.PaymentRepository;
import thy.repository.TicketRepository;
import thy.repository.FlightSeatRepository;
import thy.repository.UserRepository;
import thy.repository.CreditCardRepository;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final FlightSeatRepository flightSeatRepository;
    private final UserRepository userRepository;
    private final CreditCardRepository creditCardRepository;

    // User's payment history retrieval service
    @Transactional
    public List<PaymentResultDTO> userPaymentHistory(Long userId) {
        return paymentRepository.findByUserUserIdOrderByPaidAtDesc(userId).stream()
            .map(this::convertToPaymentResultDTO)
            .toList();
    }
    
    @Transactional
    public List<PaymentResultDTO> createPayment(PaymentRequestDTO paymentRequestDTO) {
        User user = userRepository.findById(paymentRequestDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String method = paymentRequestDTO.getMethod().toLowerCase();
        
        // Calculate total from FlightSeat prices (in TL or Miles based on method)
        BigDecimal total = BigDecimal.ZERO;
        List<FlightSeat> seatsToUpdate = new ArrayList<>();
        
        for (TicketSummaryDTO t : paymentRequestDTO.getTickets()) {
            FlightSeat flightSeat = flightSeatRepository.findByFlightIdAndSeatNumber(
                t.getFlightId(), 
                t.getSeatNumber() != null ? t.getSeatNumber() : "1A"
            ).orElseThrow(() -> new RuntimeException("FlightSeat not found for flight " + 
                t.getFlightId() + " and seat " + t.getSeatNumber()));
            
            // Check if seat is already booked
            if (FlightSeat.Availability.sold.equals(flightSeat.getAvailability())) {
                throw new RuntimeException("Seat " + t.getSeatNumber() + " is already booked");
            }
            
            if (flightSeat.getPrice() != null) {
                total = total.add(flightSeat.getPrice());
            }
            
            seatsToUpdate.add(flightSeat);
        }
        
        // Handle payment method-specific logic
        if ("card".equals(method)) {
            // Handle card payment - save new card if provided
            if (paymentRequestDTO.getCardInfo() != null) {
                CreditCard card = null;
                
                // Check if using existing card by cardId
                if (paymentRequestDTO.getCardInfo().getCardId() != null) {
                    card = creditCardRepository.findById(paymentRequestDTO.getCardInfo().getCardId())
                        .orElseThrow(() -> new RuntimeException("Card not found with id: " + paymentRequestDTO.getCardInfo().getCardId()));
                } 
                // Otherwise, use or create card by cardNum
                else if (paymentRequestDTO.getCardInfo().getCardNum() != null &&
                         !paymentRequestDTO.getCardInfo().getCardNum().isEmpty()) {
                    card = creditCardRepository.findByCardNum(paymentRequestDTO.getCardInfo().getCardNum())
                        .orElseGet(() -> {
                            CreditCard newCard = new CreditCard();
                            newCard.setCardNum(paymentRequestDTO.getCardInfo().getCardNum());
                            newCard.setHolderName(paymentRequestDTO.getCardInfo().getHolderName());
                            newCard.setExpiryTime(paymentRequestDTO.getCardInfo().getExpiryTime());
                            newCard.setCvv(paymentRequestDTO.getCardInfo().getCvv());
                            return creditCardRepository.save(newCard);
                        });
                }
                
                // Link card to user if not already linked
                if (card != null) {
                    if (!card.getUsers().contains(user)) {
                        card.getUsers().add(user);
                    }
                    if (!user.getCreditCards().contains(card)) {
                        user.getCreditCards().add(card);
                    }
                }
            }
            // Mark seats as sold for card payments
            for (FlightSeat fs : seatsToUpdate) {
                fs.setAvailability(FlightSeat.Availability.sold);
            }
            // Award miles to user based on seat type
            awardMilesForSeats(user, seatsToUpdate);
        } else if ("mile".equals(method)) {
            // Check if user has enough miles
            Integer userMiles = user.getMile() != null ? user.getMile() : 0;
            if (userMiles < total.intValue()) {
                throw new RuntimeException("Insufficient miles. Required: " + total.intValue() + 
                    ", Available: " + userMiles);
            }
            // Deduct miles
            user.setMile(userMiles - total.intValue());
            userRepository.save(user);
            // Mark seats as sold for mile payments
            for (FlightSeat fs : seatsToUpdate) {
                fs.setAvailability(FlightSeat.Availability.sold);
            }
            // Award miles to user based on seat type (even for mile payments)
            awardMilesForSeats(user, seatsToUpdate);
        } else if ("cash".equals(method)) {
            // Mark seats as reserved for cash payments (pending)
            for (FlightSeat fs : seatsToUpdate) {
                fs.setAvailability(FlightSeat.Availability.reserved);
            }
        }

        // Update all seats
        flightSeatRepository.saveAll(seatsToUpdate);

        // Create payment record
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setMethod(Payment.PaymentMethod.valueOf(method));
        payment.setTotalAmount(total);
        payment.setStatus("cash".equals(method) ? Payment.PaymentStatus.pending : Payment.PaymentStatus.paid);
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Create tickets linked to payment
        List<Ticket> toCreate = new ArrayList<>();
        for (TicketSummaryDTO t : paymentRequestDTO.getTickets()) {
            Ticket ticket = new Ticket();
            ticket.setPayment(saved);
            ticket.setUser(user);
            ticket.setIssueTime(LocalDateTime.now());
            ticket.setFlightId(t.getFlightId());
            ticket.setSeatNumber(t.getSeatNumber() != null ? t.getSeatNumber() : "1A");
            ticket.setStatus("cash".equals(method) ? Ticket.TicketStatus.pending : Ticket.TicketStatus.booked);
            ticket.setHasExtraBaggage(Boolean.TRUE.equals(t.getHasExtraBaggage()));
            ticket.setHasMealService(Boolean.TRUE.equals(t.getHasMealService()));
            toCreate.add(ticket);
        }

        ticketRepository.saveAll(toCreate);

        // Return latest payments for the user (including this one)
        return userPaymentHistory(user.getUserId());
    }
    

    private PaymentResultDTO convertToPaymentResultDTO(Payment payment) {
        List<TicketSummaryDTO> ticketSummaries = new ArrayList<>();
        
        if (payment.getTickets() != null) {
            ticketSummaries = payment.getTickets().stream()
                .map(ticket -> new TicketSummaryDTO(
                    ticket.getTicketId(),
                    ticket.getFlightId(),
                    ticket.getFlight() != null && ticket.getFlight().getOriginAirport() != null 
                        ? ticket.getFlight().getOriginAirport().getIataCode() : null,
                    ticket.getFlight() != null && ticket.getFlight().getDestinationAirport() != null
                        ? ticket.getFlight().getDestinationAirport().getIataCode() : null,
                    ticket.getFlight() != null ? ticket.getFlight().getDepartureTime() : null,
                    ticket.getFlight() != null ? ticket.getFlight().getArrivalTime() : null,
                    ticket.getSeatNumber(),
                    ticket.getStatus() != null ? ticket.getStatus().name() : null,
                    ticket.getHasExtraBaggage(),
                    ticket.getHasMealService()
                )).toList();
        }
        
        return new PaymentResultDTO(
            payment.getUser().getUserId(),
            ticketSummaries,
            payment.getMethod().name(),
            payment.getTotalAmount(),
            null,
            null
        );
    }

    /**
     * Award miles to user based on seat types and prices
     * Formula: price * statusMultiplier / 100
     */
    private void awardMilesForSeats(User user, List<FlightSeat> seats) {
        int totalMilesToAward = 0;
        
        for (FlightSeat fs : seats) {
            if (fs.getPrice() != null && fs.getFlight() != null && 
                fs.getFlight().getPlane() != null) {
                
                // Get seat info from Plane's seats
                Seat seat = fs.getFlight().getPlane().getSeats().stream()
                    .filter(s -> s.getSeatNumber().equals(fs.getSeatNumber()))
                    .findFirst()
                    .orElse(null);
                
                if (seat != null && seat.getType() != null) {
                    double price = fs.getPrice().doubleValue();
                    int statusMultiplier = getStatusMultiplier(seat.getType());
                    int milesForThisSeat = (int) Math.round((price * statusMultiplier) / 100.0);
                    totalMilesToAward += milesForThisSeat;
                }
            }
        }
        
        if (totalMilesToAward > 0) {
            Integer currentMiles = user.getMile() != null ? user.getMile() : 0;
            user.setMile(currentMiles + totalMilesToAward);
            userRepository.save(user);
        }
    }

    /**
     * Get status multiplier based on seat type
     * economy: 10
     * premium_economy: 25
     * business: 50
     * first: 100
     */
    private int getStatusMultiplier(Seat.SeatType seatType) {
        return switch (seatType) {
            case economy -> 5;
            case premium_economy -> 10;
            case business -> 15;
            case first -> 20;
        };
    }
}
