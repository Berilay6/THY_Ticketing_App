package thy.dto;

import lombok.Data;

@Data
public class AirportRequestDTO {
    private String iataCode;
    private String name;
    private String city;
    private String country;
    private String timezone;
}