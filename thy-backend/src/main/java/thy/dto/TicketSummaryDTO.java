package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryDTO {

	//Ticket, Flight, Airport entitylerinden ve FlightSeatten dolduracağız.
    private Long ticketId;
    private Long flightId;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String seatNumber;
    private String status; // booked/cancelled/checked_in/completed
    private Boolean hasExtraBaggage;
    private Boolean hasMealService;
    private BigDecimal price; // Base seat price
}
