package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardRequestDTO {

    private String cardNum;
    private String cvv;
    private String expiryTime;
    private String holderName;
}
