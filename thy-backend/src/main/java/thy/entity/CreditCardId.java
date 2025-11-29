package thy.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor

// after adding many-to-many relationship in User and CreditCard entities we dont need this class anymore ???

public class CreditCardId implements Serializable {
    private Long userId;
    private String cardNum;
}
