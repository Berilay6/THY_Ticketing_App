package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightDetailDTO {
    private Long flightId;
    private String originAirport;
    private String destinationAirport;
    private String departureTime;
    private String arrivalTime;
    private String planeInfo;
    private String status;
    private Long planeId;
    private String originIata;
    private String destinationIata;
}
