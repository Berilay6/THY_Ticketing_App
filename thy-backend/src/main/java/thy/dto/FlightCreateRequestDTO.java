package thy.dto;

import lombok.Data;
import thy.entity.Flight;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class FlightCreateRequestDTO {
    private Long originAirportId;
    private Long destinationAirportId;
    private Long planeId;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    // Admin sadece "Saatlik Baz Fiyatı" girer.
    // Örn: 1000 TL. (2 saatlik uçuşta ekonomi 2000 TL olur)
    private BigDecimal basePricePerHour;
    private Flight.FlightStatus status;
}