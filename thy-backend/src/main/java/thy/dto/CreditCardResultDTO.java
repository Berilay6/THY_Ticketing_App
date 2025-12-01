package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardResultDTO {

    private Long cardId;                // card ID for operations (delete)
    private String cardNumLast4digit;   // masked card number for display
    private String holderName;          // full holder name
    private String expiryTime;          // MM/YY
}