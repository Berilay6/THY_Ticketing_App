package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    private Long userId;
    private Long flightId;
    private String seatNumber;
    private String method;    // "card", "mile", "cash"

    // Kartla ödemeyse doldurulacak alanlar:
    private String cardNum;
    private String cvv;
    private String expiryTime; // "12/27" gibi
    private String holderName;
}
