package thy.util;

import thy.dto.*;
import thy.entity.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Centralized mapper for converting entities to DTOs
 */
public class DTOMapper {

    /**
     * Convert Ticket entity to TicketSummaryDTO
     */
    public static TicketSummaryDTO toTicketSummaryDTO(Ticket ticket) {
        return new TicketSummaryDTO(
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
        );
    }

    /**
     * Convert Payment entity to PaymentResultDTO
     */
    public static PaymentResultDTO toPaymentResultDTO(Payment payment) {
        List<TicketSummaryDTO> ticketSummaries = new ArrayList<>();
        
        if (payment.getTickets() != null) {
            ticketSummaries = payment.getTickets().stream()
                .map(DTOMapper::toTicketSummaryDTO)
                .toList();
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
     * Convert CreditCard entity to CreditCardResultDTO
     */
    public static CreditCardResultDTO toCreditCardResultDTO(CreditCard creditCard) {
        String last4Digits = creditCard.getCardNum() != null && creditCard.getCardNum().length() >= 4
            ? creditCard.getCardNum().substring(creditCard.getCardNum().length() - 4)
            : "****";
        
        return new CreditCardResultDTO(
            creditCard.getCardId(),
            last4Digits,
            creditCard.getHolderName(),
            creditCard.getExpiryTime()
        );
    }

    /**
     * Convert User entity to UserDTO
     */
    public static UserDTO toUserDTO(User user) {
        return new UserDTO(
            user.getUserId(),
            user.getFirstName(),
            user.getMiddleName(),
            user.getLastName(),
            user.getDateOfBirth(),
            user.getGender() != null ? user.getGender().name() : null,
            user.getNationality(),
            user.getEmail(),
            user.getPhoneNum(),
            user.getUserType() != null ? user.getUserType().name() : null,
            user.getMile()
        );
    }

    /**
     * Convert Flight entity to FlightSearchResultDTO
     */
    public static FlightSearchResultDTO toFlightSearchResultDTO(Flight flight) {
        return new FlightSearchResultDTO(
            flight.getFlightId(),
            flight.getOriginAirport() != null ? flight.getOriginAirport().getIataCode() : null,
            flight.getDestinationAirport() != null ? flight.getDestinationAirport().getIataCode() : null,
            flight.getOriginAirport() != null ? flight.getOriginAirport().getName() : null,
            flight.getDestinationAirport() != null ? flight.getDestinationAirport().getName() : null,
            flight.getDepartureTime(),
            flight.getArrivalTime(),
            flight.getPlane() != null ? flight.getPlane().getModelType() : null
        );
    }

    /**
     * Convert FlightSeat entity to SeatDTO
     */
    public static SeatDTO toSeatDTO(FlightSeat flightSeat) {
        String seatType = null;
        String seatStatus = null;
        
        if (flightSeat.getFlight() != null && flightSeat.getFlight().getPlane() != null) {
            Seat seat = flightSeat.getFlight().getPlane().getSeats().stream()
                .filter(s -> s.getSeatNumber().equals(flightSeat.getSeatNumber()))
                .findFirst()
                .orElse(null);
            if (seat != null) {
                if (seat.getType() != null) {
                    seatType = seat.getType().name();
                }
                if (seat.getStatus() != null) {
                    seatStatus = seat.getStatus().name();
                }
            }
        }
        
        return new SeatDTO(
            flightSeat.getSeatNumber(),
            seatType,
            seatStatus,
            flightSeat.getAvailability() != null ? flightSeat.getAvailability().name() : null,
            flightSeat.getPrice()
        );
    }
}
