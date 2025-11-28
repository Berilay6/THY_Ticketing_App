package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchResultDTO {

    private Long flightId;
    private String origin;    // Kısa kodlar (IST, ESB)
    private String destination;
    private String originAirportName;    // Havalimanı isimleri 
    private String destinationAirportName;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String planeModel;    // Plane.modelType mesela: "Boeing 737-800"
    private BigDecimal price;
}