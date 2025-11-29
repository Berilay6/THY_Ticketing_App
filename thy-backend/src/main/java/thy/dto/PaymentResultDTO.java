package thy.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResultDTO {

    private Long userId;
    private List<TicketSummaryDTO> tickets;
    private String method;    // "card", "mile", "cash"

    // Kartla ödemeyse doldurulacak alanlar:
    private String cardNum;     // last 4 digits
    private String holderName;  // masked name
}
