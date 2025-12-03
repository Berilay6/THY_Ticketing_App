package thy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class PlaneDTO {
    private Long planeId;
    private String modelType;
    private String status;
    private String airportName;
    private Long currentAirportId;
    private String currentAirportIata;
}
