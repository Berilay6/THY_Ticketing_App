package thy.dto;

import lombok.Data;

@Data
public class PlaneRequestDTO {
    private String modelType; // Örn: "Boeing 737-800"
    private Long airportId;   // Hangi havalimanında? (Boş ise Storage'a gider)
}