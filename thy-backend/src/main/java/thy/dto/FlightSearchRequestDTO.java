package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchRequestDTO {

    private String origin;    // Örn: "IST", "ESB"
    private String destination;
    private LocalDate date;     // "2025-11-30" gibi bir tarih (sadece gün bazında)
}
