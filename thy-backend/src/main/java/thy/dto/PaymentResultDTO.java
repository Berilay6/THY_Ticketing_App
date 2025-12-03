package thy.dto;

import java.util.List;
import java.math.BigDecimal;

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
    private BigDecimal totalAmount;
    private String status;    // "completed", "refunded"

    // Kartla ödemeyse doldurulacak alanlar:
    private String cardNum;     // last 4 digits
    private String holderName;  // masked name
}
