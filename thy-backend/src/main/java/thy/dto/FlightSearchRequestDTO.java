package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchRequestDTO {

    @NotBlank
    private String origin;    // Örn: "IST", "ESB"
    @NotBlank
    private String destination;
    private LocalDate date;     // "2025-11-30" gibi bir tarih (sadece gün bazında)
}
