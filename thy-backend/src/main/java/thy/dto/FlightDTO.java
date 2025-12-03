package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightDTO {
    private Long flightId;
    private String route;
    private String departureTime;
    private String arrivalTime;
    private String planeInfo;
    private String status;
}
