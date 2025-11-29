package thy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardResultDTO {

    private String cardNumLast4digit;   // masked card number
    private String holderNameInit;      // holder name initials
}